ALTER TABLE "equipments" ADD COLUMN "image_url" TEXT;
CREATE UNIQUE INDEX "loans_one_open_per_equipment"
  ON "loans" ("tenant_id", "equipment_id") WHERE "returned_at" IS NULL;

CREATE OR REPLACE FUNCTION public.current_tenant_ids()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.tenant_id FROM public.memberships m
  JOIN public.users u ON u.id = m.user_id WHERE u.auth_user_id = auth.uid()::text
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tenant_uuid UUID;
DECLARE profile_uuid UUID;
BEGIN
  SELECT id INTO tenant_uuid FROM public.tenants WHERE slug = 'suporte_ti';
  IF tenant_uuid IS NULL THEN RAISE EXCEPTION 'Tenant suporte_ti não foi semeado'; END IF;
  INSERT INTO public.users (id, auth_user_id, name, email, created_at, updated_at)
  VALUES (gen_random_uuid(), NEW.id::text,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    NEW.email, now(), now())
  ON CONFLICT (auth_user_id) DO UPDATE SET email = EXCLUDED.email, updated_at = now()
  RETURNING id INTO profile_uuid;
  INSERT INTO public.memberships (id, user_id, tenant_id, role, created_at)
  VALUES (gen_random_uuid(), profile_uuid, tenant_uuid, 'MEMBER', now())
  ON CONFLICT (user_id, tenant_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE POLICY "tenant_member_reads_own_tenant" ON "tenants"
  FOR SELECT TO authenticated USING (id IN (SELECT public.current_tenant_ids()));
CREATE POLICY "user_reads_own_profile" ON "users"
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid()::text);
CREATE POLICY "user_reads_own_memberships" ON "memberships"
  FOR SELECT TO authenticated USING (user_id IN
    (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::text));
CREATE POLICY "members_read_tenant_equipment" ON "equipments"
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT public.current_tenant_ids()));
CREATE POLICY "users_read_own_loans" ON "loans"
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT public.current_tenant_ids()) AND
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()::text));
GRANT SELECT ON "tenants", "users", "memberships", "equipments", "loans" TO authenticated;

CREATE OR REPLACE FUNCTION public.catalogo_equipamentos()
RETURNS TABLE (id UUID, name TEXT, category equipment_category, patrimony TEXT,
  status equipment_status, image_url TEXT, location TEXT, is_loaned BOOLEAN, due_date TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.id, e.name, e.category, e.patrimony, e.status, e.image_url, e.location,
    (l.id IS NOT NULL), l.due_date
  FROM public.equipments e
  LEFT JOIN public.loans l ON l.equipment_id = e.id AND l.tenant_id = e.tenant_id AND l.returned_at IS NULL
  WHERE e.tenant_id IN (SELECT public.current_tenant_ids())
    AND e.status <> 'OUT_OF_SERVICE'::equipment_status
  ORDER BY e.patrimony
$$;
REVOKE ALL ON FUNCTION public.catalogo_equipamentos() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.catalogo_equipamentos() TO authenticated;

CREATE OR REPLACE FUNCTION public.solicitar_emprestimo(p_equipment_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE actor_uuid UUID;
DECLARE tenant_uuid UUID;
DECLARE equipment_row public.equipments%ROWTYPE;
DECLARE open_count INTEGER;
DECLARE new_loan UUID;
BEGIN
  SELECT u.id, m.tenant_id INTO actor_uuid, tenant_uuid
  FROM public.users u JOIN public.memberships m ON m.user_id = u.id
  WHERE u.auth_user_id = auth.uid()::text ORDER BY m.created_at LIMIT 1 FOR UPDATE OF m;
  IF actor_uuid IS NULL THEN RAISE EXCEPTION 'PERFIL_NAO_ENCONTRADO'; END IF;
  SELECT count(*) INTO open_count FROM public.loans
    WHERE tenant_id = tenant_uuid AND user_id = actor_uuid AND returned_at IS NULL;
  IF open_count >= 5 THEN RAISE EXCEPTION 'LIMITE_DE_5_EMPRESTIMOS'; END IF;
  IF EXISTS (SELECT 1 FROM public.loans WHERE tenant_id = tenant_uuid AND user_id = actor_uuid
      AND returned_at IS NULL AND due_date < now()) THEN RAISE EXCEPTION 'DEVOLUCAO_EM_ATRASO'; END IF;
  SELECT * INTO equipment_row FROM public.equipments
    WHERE id = p_equipment_id AND tenant_id = tenant_uuid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'EQUIPAMENTO_NAO_ENCONTRADO'; END IF;
  IF equipment_row.status <> 'AVAILABLE' THEN RAISE EXCEPTION 'EQUIPAMENTO_INDISPONIVEL'; END IF;
  IF EXISTS (SELECT 1 FROM public.loans WHERE tenant_id = tenant_uuid
      AND equipment_id = p_equipment_id AND returned_at IS NULL) THEN RAISE EXCEPTION 'EQUIPAMENTO_JA_EMPRESTADO'; END IF;
  new_loan := gen_random_uuid();
  INSERT INTO public.loans (id, tenant_id, equipment_id, user_id, borrowed_at, due_date, created_at, updated_at)
  VALUES (new_loan, tenant_uuid, p_equipment_id, actor_uuid, now(), now() + interval '14 days', now(), now());
  RETURN new_loan;
END;
$$;
REVOKE ALL ON FUNCTION public.solicitar_emprestimo(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.solicitar_emprestimo(UUID) TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('equipamentos', 'equipamentos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "public_read_equipment_images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'equipamentos');

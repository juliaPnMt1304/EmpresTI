\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.users (id,auth_user_id,name,email,created_at,updated_at)
VALUES ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','Teste transitorio','temporary@example.invalid',now(),now());
INSERT INTO public.memberships (id,user_id,tenant_id,role,created_at)
SELECT '33333333-3333-4333-8333-333333333333',u.id,t.id,'MEMBER',now()
FROM public.users u CROSS JOIN public.tenants t
WHERE u.auth_user_id='22222222-2222-4222-8222-222222222222' AND t.slug='suporte_ti';
INSERT INTO public.users (id,auth_user_id,name,email,created_at,updated_at) VALUES
 ('44444444-4444-4444-8444-444444444444','55555555-5555-4555-8555-555555555555','Teste atraso','late@example.invalid',now(),now()),
 ('66666666-6666-4666-8666-666666666666','77777777-7777-4777-8777-777777777777','Teste manutenção','maintenance@example.invalid',now(),now());
INSERT INTO public.memberships (id,user_id,tenant_id,role,created_at)
SELECT gen_random_uuid(),u.id,t.id,'MEMBER',now() FROM public.users u CROSS JOIN public.tenants t
WHERE u.auth_user_id IN ('55555555-5555-4555-8555-555555555555','77777777-7777-4777-8777-777777777777') AND t.slug='suporte_ti';
INSERT INTO public.tenants (id,slug,name,created_at,updated_at)
VALUES ('88888888-8888-4888-8888-888888888888','test_tenant','Isolamento teste',now(),now());
INSERT INTO public.equipments (id,tenant_id,name,category,patrimony,status,created_at,updated_at)
VALUES ('99999999-9999-4999-8999-999999999999','88888888-8888-4888-8888-888888888888','Equipamento tenant B','NOTEBOOK','TI-9999','AVAILABLE',now(),now());
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SET LOCAL ROLE authenticated;
DO $$
DECLARE target UUID;
BEGIN
  SELECT id INTO target FROM public.equipments WHERE status='AVAILABLE' ORDER BY patrimony LIMIT 1;
  PERFORM public.solicitar_emprestimo(target);
  IF NOT EXISTS (SELECT 1 FROM public.loans WHERE user_id='11111111-1111-4111-8111-111111111111'
      AND due_date - borrowed_at = interval '14 days' AND returned_at IS NULL) THEN
    RAISE EXCEPTION 'test_ca_01_prazo_14_corridos falhou';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.catalogo_equipamentos() WHERE id=target AND is_loaned) THEN
    RAISE EXCEPTION 'test_ca_01_removeu_do_disponivel_falhou';
  END IF;
  IF (SELECT count(*) FROM public.catalogo_equipamentos() WHERE status='MAINTENANCE') <> 3 THEN
    RAISE EXCEPTION 'test_ca_04_manutencao falhou';
  END IF;
  IF (SELECT count(*) FROM public.loans WHERE user_id='11111111-1111-4111-8111-111111111111' AND returned_at IS NULL) <> 1 THEN
    RAISE EXCEPTION 'test_ca_24_meus_emprestimos falhou';
  END IF;
  IF EXISTS (SELECT 1 FROM public.loans WHERE user_id='44444444-4444-4444-8444-444444444444') THEN
    RAISE EXCEPTION 'test_ca_26_isolamento_usuario_falhou';
  END IF;
  IF EXISTS (SELECT 1 FROM public.catalogo_equipamentos() WHERE id IN
      (SELECT id FROM public.equipments WHERE tenant_id='88888888-8888-4888-8888-888888888888')) THEN
    RAISE EXCEPTION 'test_ca_26_isolamento_tenant_falhou';
  END IF;
END $$;
\echo test_ca_20_solicitacao_prazo_e_disponibilidade: passou
\echo test_ca_24_meus_emprestimos_com_prazo: passou
\echo test_ca_26_rls_usuario_e_tenant: passou
RESET ROLE;
DO $$
DECLARE target UUID;
BEGIN
  SELECT equipment_id INTO target FROM public.loans WHERE user_id='11111111-1111-4111-8111-111111111111' AND returned_at IS NULL;
  BEGIN
    INSERT INTO public.loans (id,tenant_id,equipment_id,user_id,borrowed_at,due_date,created_at,updated_at)
    SELECT gen_random_uuid(),tenant_id,target,'44444444-4444-4444-8444-444444444444',now(),now()+interval '14 days',now(),now()
    FROM public.equipments WHERE id=target;
    RAISE EXCEPTION 'test_ca_25_indice_nao_bloqueou';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;
\echo test_ca_25_unico_emprestimo_aberto: passou
INSERT INTO public.loans (id,tenant_id,equipment_id,user_id,borrowed_at,due_date,created_at,updated_at)
SELECT gen_random_uuid(),e.tenant_id,e.id,'44444444-4444-4444-8444-444444444444',now()-interval '15 days',now()-interval '1 day',now(),now()
FROM public.equipments e WHERE e.status='AVAILABLE' AND NOT EXISTS
 (SELECT 1 FROM public.loans l WHERE l.equipment_id=e.id AND l.returned_at IS NULL) ORDER BY e.patrimony LIMIT 1;
SET LOCAL request.jwt.claim.sub = '55555555-5555-4555-8555-555555555555';
SET LOCAL ROLE authenticated;
DO $$
DECLARE target UUID;
BEGIN
  SELECT e.id INTO target FROM public.equipments e WHERE e.status='AVAILABLE' AND NOT EXISTS
    (SELECT 1 FROM public.loans l WHERE l.equipment_id=e.id AND l.returned_at IS NULL) ORDER BY e.patrimony LIMIT 1;
  BEGIN
    PERFORM public.solicitar_emprestimo(target);
    RAISE EXCEPTION 'test_ca_23_atraso_nao_bloqueou';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%DEVOLUCAO_EM_ATRASO%' THEN RAISE; END IF;
  END;
END $$;
\echo test_ca_23_atraso_bloqueado: passou
RESET ROLE;
SET LOCAL request.jwt.claim.sub = '77777777-7777-4777-8777-777777777777';
SET LOCAL ROLE authenticated;
DO $$
DECLARE target UUID;
BEGIN
  SELECT id INTO target FROM public.equipments WHERE status='MAINTENANCE' ORDER BY patrimony LIMIT 1;
  BEGIN
    PERFORM public.solicitar_emprestimo(target);
    RAISE EXCEPTION 'test_ca_21_manutencao_nao_bloqueou';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%EQUIPAMENTO_INDISPONIVEL%' THEN RAISE; END IF;
  END;
END $$;
\echo test_ca_21_manutencao_bloqueada: passou
RESET ROLE;
INSERT INTO public.loans (id,tenant_id,equipment_id,user_id,borrowed_at,due_date,created_at,updated_at)
SELECT gen_random_uuid(),e.tenant_id,e.id,'11111111-1111-4111-8111-111111111111',now(),now()+interval '14 days',now(),now()
FROM public.equipments e
WHERE e.status='AVAILABLE' AND NOT EXISTS (SELECT 1 FROM public.loans l WHERE l.equipment_id=e.id AND l.returned_at IS NULL)
ORDER BY e.patrimony LIMIT 4;
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SET LOCAL ROLE authenticated;
DO $$
DECLARE target UUID;
BEGIN
  SELECT e.id INTO target FROM public.equipments e WHERE e.status='AVAILABLE'
    AND NOT EXISTS (SELECT 1 FROM public.loans l WHERE l.equipment_id=e.id AND l.returned_at IS NULL)
    ORDER BY e.patrimony LIMIT 1;
  BEGIN
    PERFORM public.solicitar_emprestimo(target);
    RAISE EXCEPTION 'test_ca_02_limite_5_nao_bloqueou';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%LIMITE_DE_5_EMPRESTIMOS%' THEN RAISE; END IF;
  END;
END $$;
\echo test_ca_22_limite_de_cinco: passou
RESET ROLE;
ROLLBACK;
\echo Fixture de verificação revertida; nenhuma conta/empréstimo de teste persistiu.

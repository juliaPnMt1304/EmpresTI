---
name: typescript-best-practices
description: Use ao ler ou escrever TypeScript (.ts, .tsx, tsconfig.json) neste projeto — tipos estritos, Zod, Prisma e tRPC conforme rules/arquitetura.md. Não use para decidir arquitetura, stack ou processo de teste (isso é de docs/adr/ e rules/), nem para HTML/CSS do protótipo em front/prototipo.
paths: "**/*.ts, **/*.tsx, tsconfig.json"
metadata:
  origem: https://github.com/0xBigBoss/claude-code (skills/typescript-best-practices)
  licenca: Apache-2.0 (texto em LICENSE-APACHE-2.0.txt)
  adaptada-em: 2026-11-05 (metadata e precedência registradas; a seção "Neste projeto" já havia sido escrita para o EmpresTI)
  mudancas: acrescentada a seção "Neste projeto"; referências trocadas de restrictions.md/checks.md para rules/arquitetura.md e rules/checks.md; description reescrita para não disparar fora de TypeScript; auditoria em docs/auditorias/skill-typescript-best-practices.md
---

## Precedência
Esta skill orienta; não decide. Em conflito, valem `rules/` e `docs/adr/`. Pare e avise.

# TypeScript Best Practices

Idiomas de TypeScript para este projeto. As regras de arquitetura vivem em `rules/arquitetura.md` (e `rules/restrictions.md`); a verificação final, em `rules/checks.md`. Esta skill cobre só a linguagem.

## Make Illegal States Unrepresentable

Use the type system to prevent invalid states at compile time.

**Discriminated unions for mutually exclusive states:**
```ts
// Good: only valid combinations possible
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Bad: allows invalid combinations like { loading: true, error: Error }
type RequestState<T> = {
  loading: boolean;
  data?: T;
  error?: Error;
};
```

**Branded types for domain primitives:**
```ts
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

// Compiler prevents passing OrderId where UserId expected
function getUser(id: UserId): Promise<User> { /* ... */ }
```

**Const assertions for literal unions:**
```ts
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'user' | 'guest'

// Array and type stay in sync automatically
function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}
```

**Exhaustive switch with never check:**
```ts
type Status = "active" | "inactive";

function processStatus(status: Status): string {
  switch (status) {
    case "active":
      return "processing";
    case "inactive":
      return "skipped";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unhandled status: ${_exhaustive}`);
    }
  }
}
```

## Runtime Validation with Zod

- Define schemas as single source of truth; infer TypeScript types with `z.infer<>`. Avoid duplicating types and schemas.
- Use `safeParse` for user input where failure is expected; use `parse` at trust boundaries where invalid data is a bug.
- Compose schemas with `.extend()`, `.pick()`, `.omit()`, `.merge()` for DRY definitions.
- Add `.transform()` for data normalization at parse time (trim strings, parse dates).

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  createdAt: z.string().transform((s) => new Date(s)),
});

type User = z.infer<typeof UserSchema>;

// Strict parsing at trust boundaries — throws if API contract violated.
// Ilustrativo, para API EXTERNA: dado interno deste projeto passa por tRPC, não por fetch/REST.
export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`https://servico-externo.example/users/${id}`);
  if (!response.ok) {
    throw new Error(`fetch user ${id} failed: ${response.status}`);
  }
  return UserSchema.parse(await response.json());
}

// Caller handles both success and error from user input
const result = UserSchema.safeParse(formData);
if (!result.success) {
  setErrors(result.error.flatten().fieldErrors);
  return;
}
```

## Utilitários de tipo

`type-fest` (`Opaque`, `PartialDeep`, `ReadonlyDeep`…) **não está no ADR-001**: não instale sem
proposta aprovada (`rules/restrictions.md`, Autoridade). Os mesmos padrões saem de tipos nativos
(`& { readonly __brand: 'X' }`, `Partial`, `Readonly`).

## Neste projeto (EmpresTI)

Stack: Next.js (App Router) + tRPC + Prisma + Zod + Supabase. Arquitetura, tenant, Prisma, env e
Zod nos procedimentos: `rules/arquitetura.md` e `docs/adr/001-stack.md` (esta skill não repete).
Verificação final: `rules/checks.md`.

Só o que é da linguagem:
- `tsconfig` em `strict` com `noUncheckedIndexedAccess`; quem impõe é `npm run typecheck`. Nunca relaxe para fazer compilar.
- Evite `any` e `as` para silenciar erro; use `unknown` + Zod no limite do sistema.
- Enums do Prisma (`EquipmentStatus`, `MembershipRole`…) são a fonte dos literais; não redeclare união de strings equivalente.
- Datas: `Date` via superjson; não converta para string manualmente.
- Estado derivado (emprestado, em atraso) é calculado por consulta, não armazenado (ver `prisma/schema.prisma`).

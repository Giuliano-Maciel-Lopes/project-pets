# Infraestrutura de Testes

Este documento descreve como a infraestrutura de testes funciona e o que deve ser atualizado aqui quando qualquer peça for alterada. **Qualquer mudança nas pastas abaixo obriga a atualizar este arquivo.**

---

## Estrutura

```
src/test/
├── setup-e2e.ts          ← ponto central dos testes e2e (leia abaixo)
├── cryptography/          ← implementações fake de hash e token
├── factories/             ← criação de entidades para testes
├── repositories/          ← repositórios in-memory para testes unitários
├── police/                ← utilitário de contexto para testes de policies
└── utils/                 ← helpers compartilhados entre testes e2e
```

---

## Isolamento dos testes e2e

Cada arquivo `.e2e-spec.ts` roda em um **worker isolado** (processo separado) com seu próprio schema PostgreSQL criado dinamicamente:

```
test_3f2a1b4c_... (UUID sem hífens)
```

**Ciclo de vida por arquivo e2e:**

```
beforeAll
  ├── pg.Client abre conexão com o banco
  ├── CREATE SCHEMA "test_<uuid>"
  ├── SET search_path TO "test_<uuid>"
  ├── executa prisma/migrations/*/migration.sql em ordem
  └── pg.Client fecha conexão

  → NestJS sobe com DATABASE_URL apontando para "test_<uuid>"
  → PrismaService lê o schema da URL e opera isolado

afterAll
  ├── pg.Client abre conexão
  ├── DROP SCHEMA "test_<uuid>" CASCADE
  └── pg.Client fecha conexão
```

**Por que `pg.Client` direto e não `prisma migrate deploy`:**
Cada invocação da CLI custava ~1-3s (spawn Node.js + Prisma engine + advisory lock global). Com muitos arquivos em série, o custo acumulado causava timeout. Com `pg.Client` direto, o setup leva ~15ms por arquivo — executa os SQLs de migration inline, sem spawn de processo, sem lock.

**Paralelismo e conexões (`vitest.config.e2e.ts`):**
Os workers rodam em processos separados (pool `forks` — padrão do Vitest v4), então não há race condition em `process.env`. Cada arquivo e2e sobe um NestJS completo com pool de conexões. O número de workers paralelos é `min(cpuCount, 12)` por padrão. Risco: `N workers × pool_size_por_app` pode esgotar `max_connections` do PostgreSQL.

Se aparecer erro `"sorry, too many clients already"`, a correção é adicionar ao `vitest.config.e2e.ts`:
```ts
poolOptions: { forks: { maxForks: 4 } }
```
E configurar PostgreSQL com `max_connections >= 4 × pool_size + folga`.

> **Escala futura (300+ arquivos):** o gargalo será o boot do NestJS (~2-5s por arquivo). Com `maxForks: 4`, 300 arquivos caem de ~25min sequencial para ~6-7min. Não limite para `maxForks: 1` (equivale a `fileParallelism: false`) sem necessidade — perde paralelismo sem ganho.

---

## `setup-e2e.ts` — quando mexer aqui

**Obrigatório atualizar se:**

| Situação | O que mudar |
|---|---|
| Adicionar nova migration com DDL que não cabe em transaction (ex: `CREATE INDEX CONCURRENTLY`) | Mover esse statement para fora do `BEGIN/COMMIT` ou executar separadamente |
| Trocar o driver de banco (ex: sair do `pg` puro) | Substituir `pg.Client` pelo novo cliente e verificar suporte a multiple statements e transactions |
| Mudar o formato da `DATABASE_URL` no `.env` | Revisar a lógica de extração de `baseUrl` e `schemaUrl` |
| Adicionar suporte a múltiplos schemas por teste | Generalizar o `schemaId` para array e criar/dropar todos no lifecycle |
| Aumentar paralelismo (tirar `fileParallelism: false`) | Configurar `maxForks` + aumentar `max_connections` no PostgreSQL |

**Nunca adicionar aqui:**
- Lógica de negócio ou factories — ficam em `factories/`
- Configuração do app NestJS — fica em `utils/setup-test-app.ts`
- Autenticação de teste — fica em `utils/login-and-get-cookie.ts`

---

## Repositórios in-memory (`repositories/`)

Implementam as classes abstratas de repositório do domínio usando um array em memória. Usados exclusivamente nos **testes unitários** — nunca nos e2e.

**Padrão:**
```typescript
export class InMemoryRepositoriesUser implements RepositoriesUser {
  public items: User[] = [];

  async findByEmail(email: string) {
    return this.items.find(u => u.email === email) ?? null;
  }
}
```

**Obrigatório atualizar se:**
- O repositório abstrato do domínio ganhar um novo método → implementar o método no in-memory correspondente
- Uma nova entidade for criada com repositório abstrato → criar o `in-memory-<entidade>.ts` correspondente

---

## Factories (`factories/`)

Cada factory tem duas formas:

| Função | Uso | Cria onde |
|---|---|---|
| `make<Entidade>()` | testes unitários | só em memória (entidade de domínio) |
| `<Entidade>Factory.makePrisma<Entidade>()` | testes e2e | persiste no banco via `PrismaService` |

A classe `Factory` é `@Injectable()` e precisa ser registrada em `providers` no módulo de teste do e2e:
```typescript
const module = await Test.createTestingModule({
  imports: [AppModule, DataBaseModule],
  providers: [UserFactory, PetFactory], // ← aqui
}).compile();
```

**Obrigatório atualizar se:**
- Nova entidade criada → criar `make<Entidade>.ts` com as duas formas
- Props de uma entidade mudarem → atualizar os defaults na factory correspondente
- Um mapper Prisma mudar → a factory `makePrisma*` pode quebrar silenciosamente — validar

---

## Cryptography (`cryptography/`)

Implementações fake das interfaces de criptografia do domínio.

| Arquivo | Interface implementada | Comportamento |
|---|---|---|
| `fakehash.ts` | `HashGenerator` / `HashComparer` | retorna `hashed-<valor>`, compara prefixo |
| `fakeToken.ts` | `EncrypterToken` | retorna JSON stringify do payload |

**Obrigatório atualizar se:**
- A interface `HashGenerator`, `HashComparer` ou `EncrypterToken` ganhar novos métodos

---

## Utils (`utils/`)

| Arquivo | Responsabilidade |
|---|---|
| `setup-test-app.ts` | Adiciona middleware de parse de cookies no app NestJS de teste |
| `login-and-get-cookie.ts` | Cria usuário no banco e retorna `request.agent` autenticado (cookie persistente) |
| `get-cookie.ts` | Extrai cookie de uma resposta HTTP |
| `wait-for.ts` | Polling assíncrono para aguardar condição em testes de eventos |

**`setupTestApp` é obrigatório** em todo e2e que usa autenticação via cookie. Sem ele, `req.cookies` não é populado e o guard JWT falha.

**`loginAsAdmin` / `loginAsAdopter`** retornam um agente Supertest que mantém o cookie entre requisições. Use um único agente por role no `beforeAll` do e2e — não recrie por teste.

**Obrigatório atualizar se:**
- O mecanismo de autenticação mudar (ex: de cookie para header Bearer) → reescrever `login-and-get-cookie.ts` e `get-cookie.ts`
- Novos roles forem adicionados em `Role` → adicionar `loginAs<NovoRole>` em `login-and-get-cookie.ts`

---

## Police (`police/`)

`makePoliceContext.ts` cria um contexto fake para testar policies isoladas. Se `PolicyContextEntity` (em `src/domain/adoption/police/`) ganhar novos campos obrigatórios, atualizar o factory aqui.

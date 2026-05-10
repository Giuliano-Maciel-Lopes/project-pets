# Prisma 7 — Decisões de implementação e isolamento de schema em testes

## Por que o `PrismaService` foi escrito assim?

```typescript
constructor() {
  const connectionString = process.env.DATABASE_URL!;
  const url = new URL(connectionString);
  const schema = url.searchParams.get('schema') ?? 'public';

  const adapter = new PrismaPg(
    { connectionString },
    { schema },
  );

  super({ adapter, log: [...] });
}
```

A resposta está em como o Prisma 7 funciona internamente — ele mudou de forma fundamental em relação ao Prisma 5/6.

---

## O que mudou no Prisma 7

### 1. Motor de query em WASM (não mais binário nativo)

No Prisma 5/6, havia um binário nativo (`query-engine`) que o Prisma baixava e executava. Ele era responsável por conectar ao banco e executar queries.

No Prisma 7, esse binário foi substituído por um módulo **WebAssembly** (WASM). O Prisma 7 compila o motor de queries para WASM e o executa dentro do próprio processo Node.js. Isso elimina o binário nativo e torna o Prisma portável para qualquer ambiente (Edge, Cloudflare Workers, Deno, etc.).

```
Prisma 5/6:
  App → PrismaClient (JS) → query-engine (binário nativo) → PostgreSQL

Prisma 7:
  App → PrismaClient (JS) → WASM engine (no processo) → Driver Adapter → PostgreSQL
```

### 2. Driver Adapters são obrigatórios para uso com pg

Para o WASM engine conseguir falar com o banco, ele precisa de um **Driver Adapter** — uma ponte JavaScript entre o engine e o driver do banco. Para PostgreSQL, o adapter é o `PrismaPg` do pacote `@prisma/adapter-pg`.

O `PrismaPg` encapsula um `pg.Pool` (node-postgres) e expõe a interface que o WASM engine entende.

### 3. O `datasource db` sem `url`

```prisma
datasource db {
  provider = "postgresql"
}
```

Quando se usa driver adapter, o Prisma Client não precisa de `url` no datasource — a conexão é gerenciada inteiramente pelo adapter passado no construtor. O `url` no datasource só é necessário para o **Prisma CLI** (migrations, studio, etc.).

---

## O problema central: `getConnectionInfo()` e o `schemaName`

O WASM engine precisa saber **em qual schema do PostgreSQL** ele deve prefixar as tabelas. Para isso, ele chama o método `getConnectionInfo()` no adapter:

```javascript
// Dentro do @prisma/adapter-pg (código compilado)
getConnectionInfo() {
  return {
    schemaName: this.pgOptions?.schema,  // ← CRÍTICO
    supportsRelationJoins: true
  };
}
```

O `schemaName` retornado aqui é usado pelo engine para **prefixar todas as queries** com o schema correto:

```sql
-- Com schemaName = 'public':
INSERT INTO "public"."users" (id, name) VALUES (...)

-- Com schemaName = 'test_abc_123':
INSERT INTO "test_abc_123"."users" (id, name) VALUES (...)
```

**Se `schemaName` for `undefined`** (segundo argumento não passado), o Prisma usa `public` por padrão — sem exceção. O `search_path` da conexão PostgreSQL é **completamente ignorado** pelo engine.

### Por que o `search_path` não basta

Uma tentativa comum é setar o `search_path` via `options=-c search_path=xxx` na connection string:

```typescript
// ❌ NÃO funciona para isolamento no Prisma 7
const adapter = new PrismaPg({
  connectionString: 'postgresql://...?options=-c search_path=test_schema'
});
```

Isso até seta o `search_path` na conexão PostgreSQL, mas o WASM engine **ignora o search_path** — ele já sabe o schema pelo `getConnectionInfo()` e gera queries fully-qualified. Se `getConnectionInfo()` retorna `schemaName: undefined`, as queries vão para `public`, independente do `search_path`.

### A solução: passar `{ schema }` como segundo argumento

```typescript
// ✅ Funciona corretamente
const adapter = new PrismaPg(
  { connectionString },
  { schema: 'nome_do_schema' }  // ← segundo argumento
);
```

`PrismaPg(poolOrConfig, options)` — o segundo argumento é o `options` (tipado como `PrismaPgOptions`). Esse objeto vai para `pgOptions` no adapter interno, e `pgOptions.schema` é o que `getConnectionInfo()` retorna.

---

## Como o `PrismaService` extrai o schema da URL

O `DATABASE_URL` do projeto já tem o schema embutido no parâmetro `?schema=`:

```
postgresql://giuliano:giuliano1@localhost:5432/giuliano?schema=public
```

O `PrismaService` simplesmente lê esse parâmetro:

```typescript
const url = new URL(connectionString);
const schema = url.searchParams.get('schema') ?? 'public';
```

Isso funciona tanto para produção (`?schema=public`) quanto para testes (quando o `setup-e2e.ts` muda o URL para `?schema=test_uuid_xxx`).

---

## Isolamento de schema nos testes E2E

### O problema antes do fix

O `setup-e2e.ts` original apenas mudava o `DATABASE_URL` para incluir `?schema=test_uuid`:

```typescript
// ❌ Não funcionava
process.env.DATABASE_URL = '...?schema=test_uuid_xxx';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// schemaName = undefined → queries vão para "public" de qualquer jeito
```

Resultado: todos os dados de teste iam para o schema `public` (banco de produção).

### A solução atual

```typescript
// setup-e2e.ts
const schemaId = `test_${randomUUID().replace(/-/g, '_')}`;

const url = new URL(process.env.DATABASE_URL!);
url.searchParams.set('schema', schemaId);
process.env.DATABASE_URL = url.toString();
// → DATABASE_URL agora tem ?schema=test_uuid_xxx

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  { schema: schemaId },  // ← informa o schema para o WASM engine
);
```

E o `PrismaService`, que lê `DATABASE_URL` no construtor, extrai o `schema` do URL e passa para o adapter:

```typescript
// PrismaService
const schema = url.searchParams.get('schema') ?? 'public';
// schema = 'test_uuid_xxx' (lido do DATABASE_URL modificado pelo setup-e2e.ts)

const adapter = new PrismaPg({ connectionString }, { schema });
// getConnectionInfo() → { schemaName: 'test_uuid_xxx' }
// Todas as queries usam "test_uuid_xxx"."tableName"
```

### Fluxo completo de isolamento por arquivo de teste

```
1. Vitest cria um processo filho por arquivo de teste

2. setup-e2e.ts executa (código de módulo, antes dos beforeAll):
   - Gera schemaId = 'test_abc_123_def_456'
   - Seta DATABASE_URL → '...?schema=test_abc_123_def_456'
   - Cria PrismaClient (adapter com schema=test_abc_123_def_456) para o afterAll

3. beforeAll do setup-e2e.ts:
   - execSync('npx prisma migrate deploy')
     → Prisma CLI lê DATABASE_URL com ?schema=test_abc_123_def_456
     → Cria schema PostgreSQL 'test_abc_123_def_456'
     → Cria todas as tabelas dentro desse schema

4. beforeAll do arquivo de teste:
   - Test.createTestingModule({ imports: [AppModule, DataBaseModule] }).compile()
   - PrismaService é instanciado:
     → Lê DATABASE_URL (que tem ?schema=test_abc_123_def_456)
     → schema = 'test_abc_123_def_456'
     → PrismaPg criado com { schema: 'test_abc_123_def_456' }
   - Todas as queries do teste vão para 'test_abc_123_def_456'

5. Testes rodam → dados em 'test_abc_123_def_456' (isolados do public)

6. afterAll do setup-e2e.ts:
   - DROP SCHEMA IF EXISTS "test_abc_123_def_456" CASCADE
   - Schema e todos os dados são deletados
```

---

## Por que o nome do schema usa underscores?

```typescript
const schemaId = `test_${randomUUID().replace(/-/g, '_')}`;
// Exemplo: test_550e8400_e29b_41d4_a716_446655440000
```

UUIDs têm hífens (ex: `550e8400-e29b-41d4-a716-446655440000`). Hífens não são caracteres válidos em identificadores PostgreSQL sem aspas. Embora o `DROP SCHEMA IF EXISTS "..."` use aspas e funcione com hífens, o parâmetro `?schema=` do Prisma CLI é passado como identificador. Para evitar qualquer problema de parsing, os hífens são trocados por underscores.

---

## Por que cada arquivo de teste tem seu schema próprio

O Vitest com `pool: 'forks'` (padrão no v4) cria um **processo filho separado** por arquivo de teste. Cada processo:
- Roda o `setup-e2e.ts` do zero
- Gera um UUID diferente → schema diferente
- Não compartilha `process.env` com outros processos

Isso garante que dois arquivos de teste rodando em paralelo não colidam no banco.

> **Dentro do mesmo arquivo**, todos os `it()` compartilham o mesmo schema (não há isolamento por test case). Por isso factories como `makeUnit` devem gerar valores únicos (ex: `randomUUID()` no nome) para evitar colisão de constraints únicas entre test cases.

---

## Referências

- [Prisma 7 — Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Prisma 7 — prisma-client generator](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#generator)
- [`@prisma/adapter-pg` — npm](https://www.npmjs.com/package/@prisma/adapter-pg)
- [PostgreSQL — search_path](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)

# CLAUDE.md — project-pets

## Visão Geral

API REST de adoção de pets construída com NestJS. Permite cadastrar unidades de abrigo, gerenciar pets disponíveis para adoção, processar candidatos a adotantes e controlar o fluxo completo de adoção com regras de negócio validadas por policies.

### Stack completa

| Tecnologia | Versão |
|---|---|
| Node.js | ≥ 20 (LTS) |
| TypeScript | ^5.7.3 |
| NestJS | ^11.0.1 |
| Prisma | ^7.2.0 |
| PostgreSQL | (via Docker) |
| Zod | ^4.3.5 |
| JWT (RS256) | @nestjs/jwt ^11.0.2 |
| bcryptjs | ^3.0.3 |
| Vitest | ^4.0.16 |
| Supertest | ^7.2.2 |
| SWC | unplugin-swc ^1.5.9 |

---

## Arquitetura DDD

O projeto segue Domain-Driven Design estrito com separação em quatro camadas. O alias `@/*` mapeia para `src/*`.

```
src/
├── core/                          # Primitivos compartilhados (sem regra de negócio)
│   ├── entities/                  # Entity, AggregateRoot, UniqueEntityId, WatchedList
│   ├── either.ts                  # Either<L, R> — padrão de retorno de erros
│   ├── erros/                     # Interface UseCaseError
│   ├── events/                    # DomainEvents dispatcher, InterfaceDomainEvent
│   ├── police/                    # Policy interface, PolicyRunner, EntityMustExistPolicy
│   ├── types/optional.ts          # Optional<T, K> — utilitário de tipos
│   └── value-objects/             # Slug
│
├── domain/                        # Domínio puro — zero dependências de framework
│   ├── account/
│   │   ├── enterprise/entities/   # Entidades: User
│   │   ├── application/
│   │   │   ├── repositories/      # Interfaces abstratas: RepositoriesUser
│   │   │   ├── services/          # Use cases: ServiceCreateUser, ServiceAuthenticateUser…
│   │   │   └── encryption/        # Interfaces: HashComparer, HashGenerator, EncrypterToken
│   │   └── erros/                 # WrongCredentialsError, ExisistyUserwithEmail
│   │
│   ├── adoption/
│   │   ├── enterprise/
│   │   │   ├── entities/          # Adoption (AggregateRoot), AdoptionCandidate (AggregateRoot)
│   │   │   ├── events/            # CreateAdoptionEvent, SetStatusEvent
│   │   │   └── entities/value-objects/  # CPF
│   │   ├── application/
│   │   │   ├── repositories/      # RepositoriesAdoption, RepositoriesAdoptionCandidate
│   │   │   └── service/           # ServiceCreateAdoption, status, list, findById…
│   │   ├── police/                # CantidadeIsBannedPolicy, PetUnavailblePolicy, UnitAndPetDestinctsPolicy
│   │   └── errro/                 # candidateBannedError, petUnavaliableError, unitAndPetError
│   │
│   ├── pets/
│   │   ├── enterprise/entity/     # Pets (AggregateRoot), PetAttachmentlist (WatchedList)
│   │   └── application/
│   │       ├── repositories/      # RepositoriesPets, RepositoryPetAttachments
│   │       └── services/          # ServiceCreatePets, ServiceUpdatePets, list, findById…
│   │
│   ├── companyUnits/
│   │   ├── enterprise/entity/     # Unit (Entity)
│   │   └── application/
│   │       ├── repositories/      # RepositoriesUnits
│   │       └── services/          # ServiceCreateUnit, ServiceUpdateUnit…
│   │
│   └── Attachment/
│       ├── enterprise/entities/   # Attachment (Entity)
│       └── application/
│           ├── repositories/      # AttachmentRepository
│           ├── services/          # ServiceCreateAttachment
│           └── storage/           # Uploader (classe abstrata)
│
├── infra/                         # Implementações concretas (NestJS, Prisma, JWT…)
│   ├── auth/                      # JwtStrategy, JwtAuthGuard, RolesGuard, @Public(), @Roles()
│   ├── cryptography/              # BcryptHasher, JwtEncrypter — implementam interfaces do domain
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts
│   │   │   ├── mappers/           # MapperPrismaUser, MapperPrismaUnit… (toDomain / toPrisma)
│   │   │   └── repositories.ts/   # PrismaRepositoriesUser, PrismaRepositoriesPets…
│   │   └── database.module.ts     # Liga interfaces do domain às implementações Prisma
│   ├── env/                       # EnvSchema (Zod), EnvService — variáveis tipadas
│   ├── storage/                   # LocalStorage implementa Uploader
│   └── http/
│       ├── http.module.ts         # Agrega UserModule, UnitModule, PetsModule, AttachmentsModule
│       ├── pipes/zod-pipes.ts     # ZodValidationPipe
│       ├── schemas/               # uuid-param.schema.ts (compartilhado)
│       └── {user,unit,pets,attachments}/
│           ├── controller/        # Controllers NestJS
│           ├── presenters/        # Conversão Entity → HTTP response
│           └── schemas/           # Schemas Zod por rota
│
└── test/                          # Infraestrutura de teste (unit e e2e)
    ├── cryptography/              # FakeHash, FakeToken
    ├── factories/                 # makeUser, makePet, makeUnit… + *Factory (para e2e com Prisma)
    ├── repositories/              # InMemory* implementam interfaces do domain
    ├── police/                    # makePoliceContext
    └── utils/                     # setupTestApp, loginAndGetCookie, getCookie, waitFor
```

### Onde ficam os artefatos principais (caminhos reais)

| Artefato | Caminho real |
|---|---|
| Entity base | `src/core/entities/entitty.ts` |
| AggregateRoot base | `src/core/entities/aggregate-root.ts` |
| Entidade de domínio | `src/domain/account/enterprise/entities/users.ts` |
| Aggregate com eventos | `src/domain/adoption/enterprise/entities/adoption.ts` |
| Value Object | `src/core/value-objects/slug.ts`, `src/domain/adoption/enterprise/entities/value-objects/cpf.ts` |
| Interface de repositório | `src/domain/account/application/repositories/repositoriesUser.ts` |
| Implementação Prisma | `src/infra/database/prisma/repositories.ts/prisma-rep-user.ts` |
| Mapper Prisma ↔ Domain | `src/infra/database/prisma/mappers/user-mappers.ts` |
| Use case / service | `src/domain/account/application/services/authenticate-service.ts` |
| Controller HTTP | `src/infra/http/user/controller/authenticate.controller.ts` |
| Presenter | `src/infra/http/user/presenters/user-presenter.ts` |
| Schema Zod | `src/infra/http/user/schemas/authenticate-schema.ts` |
| Policy de negócio | `src/domain/adoption/police/petUnavaliable.ts` |
| Evento de domínio | `src/domain/adoption/enterprise/events/create-adoption.ts` |
| Storage abstrato | `src/domain/Attachment/application/storage/uploader.ts` |
| Storage concreto | `src/infra/storage/local-storage.ts` |

---

## Padrões de Código

### Entidades

- Construtor é **sempre `protected`** — herdado de `Entity<Props>`.
- Instanciação é feita exclusivamente via **método estático `create()`**.
- Campos opcionais usam `Optional<Props, 'campo1' | 'campo2'>` para tornar seletivo no `create()`.
- Todas as propriedades ficam em `protected props: Props`; acesso externo apenas via **getters**.
- Mutação sempre passa por métodos nomeados (`touch()`, `setStatus()`, `update()`, `banned()`).

```typescript
// src/domain/account/enterprise/entities/users.ts
export class User extends Entity<UserProps> {
  static create(props: Optional<UserProps, 'createdAt' | 'role'>, id?: UniqueEntityId) {
    return new User({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      role: props.role ?? Role.ADOPTER,
    }, id);
  }

  private touch() { this.props.updatedAt = new Date(); }
  get name() { return this.props.name; }
}
```

### Aggregates com Domain Events

Aggregates estendem `AggregateRoot<Props>`. Eventos são adicionados com `this.addDomainEvent(new EventClass(this))` dentro dos métodos de mutação.

```typescript
// src/domain/adoption/enterprise/entities/adoption.ts
export class Adoption extends AggregateRoot<AdoptionProps> {
  static create(props, id?) {
    const adoption = new Adoption({ ...props, status: props.status ?? AdoptionStatus.PENDING }, id);
    if (!id) adoption.addDomainEvent(new CreateAdoptionEvent(adoption)); // só para novos
    return adoption;
  }
  setStatus(status: AdoptionStatus) {
    this.props.status = status;
    this.touch();
    this.addDomainEvent(new SetStatusEvent(this));
  }
}
```

### Repositórios

- A **interface** fica em `domain/<bounded-context>/application/repositories/` como **classe abstrata** (não `interface` TypeScript — necessário para injeção de dependência do NestJS).
- A **implementação Prisma** fica em `src/infra/database/prisma/repositories.ts/`.
- A ligação acontece no `DataBaseModule` via `{ provide: RepositoriesUser, useClass: PrismaRepositoriesUser }`.
- O mapper (`MapperPrisma*`) tem dois métodos: `toDomain(raw)` e `toPrisma(entity)`.

```typescript
// domain (interface via classe abstrata)
export abstract class RepositoriesUser {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(user: User): Promise<void>;
}

// infra (implementação)
@Injectable()
export class PrismaRepositoriesUser implements RepositoriesUser {
  constructor(private prisma: PrismaService) {}
  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? MapperPrismaUser.toDomain(raw) : null;
  }
}
```

### Use Cases / Services

- Nomeados como `Service<Ação><Entidade>` (ex: `ServiceCreateUser`, `ServiceAuthenticateUser`).
- Decorados com `@Injectable()`.
- Sempre definem um tipo `Request` (interface local) e um tipo `Response` (alias de `Either<Erro, Dado>`).
- Método único: `async execute(request): Promise<Response>`.
- Retornam `left(new ErroClass())` para falha, `right({ dado })` para sucesso.
- **Nunca lançam exceptions** — quem lança é o controller.

```typescript
type AuthenticateUserServiceResponse = Either<WrongCredentialsError, { accesToken: string }>;

@Injectable()
export class ServiceAuthenticateUser {
  constructor(
    private repositorieUser: RepositoriesUser,
    private hashcomparer: HashComparer,
    private encrypterToken: EncrypterToken,
  ) {}

  async execute({ email, password }): Promise<AuthenticateUserServiceResponse> {
    const user = await this.repositorieUser.findByEmail(email);
    if (!user || !(await this.hashcomparer.compare(password, user.password))) {
      return left(new WrongCredentialsError());
    }
    const accesToken = await this.encrypterToken.encryptToken({ sub: user.id.toString(), role: user.role });
    return right({ accesToken });
  }
}
```

### Erros de Use Case

- Ficam em `src/domain/<bounded-context>/erros/` (nota: pasta pode estar nomeada `erros` ou `errro`).
- São classes que estendem `Error` e implementam `UseCaseError` (`{ message: string }`).
- O controller verifica `result.isLeft()` e lança a exception NestJS correta.

```typescript
// domain error
export class WrongCredentialsError extends Error implements UseCaseError {
  constructor() { super('email ou senha invalido!!.'); }
}

// controller mapeando para HTTP
if (result.isLeft()) throw new UnauthorizedException(result.value.message);
```

### Policies (Regras de Negócio Complexas)

- Interface `Policy<TContext, E extends Error>` em `src/core/police/policy.ts`.
- Cada policy implementa `validate(context): Either<E, void>`.
- `PolicyRunner.run(policies[], context)` executa em sequência e para no primeiro erro.
- Usado quando um use case tem múltiplas pré-condições (ex: criação de adoção verifica candidato não banido, pet disponível, unidade ≠ unidade do pet).

```typescript
// src/domain/adoption/police/petUnavaliable.ts
export class PetUnavailblePolicy implements Policy<PolicyContextEntity, petUnavaliableError> {
  validate(context: PolicyContextEntity): Either<petUnavaliableError, void> {
    if (context.pet?.status !== PetStatus.AVAILABLE) return left(new petUnavaliableError());
    return right(undefined);
  }
}

// uso no service
const policyResult = await PolicyRunner.run([
  new EntityMustExistPolicy('Candidate', (ctx) => ctx.candidate),
  new PetUnavailblePolicy(),
  new UnitAndPetDistincsPolicy(),
], context);
if (policyResult.isLeft()) return left(policyResult.value);
```

### Controllers

- Nomeados como `Controller<Ação><Entidade>` (ex: `ControllerAuthenticate`, `ControllerCreatePet`).
- Validam o body via `ZodValidationPipe` passado para `@UsePipes()` ou `@Body(new ZodValidationPipe(schema))`.
- Verificam `result.isLeft()` e lançam a exception NestJS adequada.
- Mapeiam a resposta via Presenter (`PetPresenter.toHTTP(result.value.pet)`).
- Rotas protegidas com `@Roles(Role.ADMIN)`, rotas públicas com `@Public()`.

### Autenticação

- JWT RS256 com token em **cookie httpOnly** `access_token`.
- Guard global: `JwtAuthGuard` (todas as rotas são protegidas por padrão).
- `@Public()` desativa o guard para a rota específica.
- `@Roles(Role.ADMIN)` ativa o `RolesGuard` para restringir ao papel.

### Schemas de Validação (Zod)

- Um arquivo por rota em `src/infra/http/<módulo>/schemas/<ação>-schema.ts`.
- Exporta o schema (`const xyzSchema`) e o tipo inferido (`type XyzInput = z.infer<typeof xyzSchema>`).
- O `ZodValidationPipe` (`src/infra/http/pipes/zod-pipes.ts`) usa `fromZodError` para formatar erros.

### Presenters

- Ficam em `src/infra/http/<módulo>/presenters/<entidade>-presenter.ts`.
- Método estático `toHTTP(entity)` — converte entidade de domínio para objeto HTTP.
- **Nunca expõem** a entidade de domínio diretamente na resposta.

---

## Comandos Essenciais

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento (watch mode)
npm run start:dev

# Build de produção
npm run build

# Rodar todos os testes unitários
npx vitest run

# Rodar testes unitários em watch
npm run test:watch

# Rodar testes de um arquivo específico
npx vitest run src/domain/account/application/services/crate-user-services.spec.ts

# Rodar todos os testes e2e
npm run test:e2e

# Rodar testes e2e em watch
npm run test:e2e:watch

# Verificar e corrigir lint
npm run lint

# Migrations Prisma (development)
npx prisma migrate dev

# Aplicar migrations (deploy / CI)
npx prisma migrate deploy

# Gerar client Prisma
npx prisma generate

# Subir banco de dados
docker-compose up -d
```

---

## Testes Unitários

### Onde ficam

- **Unit tests**: junto ao código, no mesmo diretório do arquivo testado.  
  Exemplo: `src/domain/account/application/services/crate-user-services.spec.ts`
- **E2E tests**: junto ao controller, mesmo diretório.  
  Exemplo: `src/infra/http/unit/controller/create-unit.e2e-spec.ts`

### Padrão de nome

- Unit: `<nome-do-arquivo>.spec.ts`
- E2E: `<nome-do-controller>.e2e-spec.ts`
- Vitest usa `globals: true` — `describe`, `it`, `expect`, `beforeEach`, `beforeAll`, `afterAll` sem importar.

### Mocks (unit tests)

Nunca se usa `jest.mock` ou `vi.mock`. O padrão é:

1. **In-Memory Repositories** — implementam a classe abstrata do domain, armazenam em array `public items: T[]`.  
   Ficam em `src/test/repositories/in-memory-*.ts`.

2. **Fake Implementations** — para interfaces de serviços externos (hash, token).  
   Ficam em `src/test/cryptography/`.

3. **Factory functions** — criam entidades com dados padrão + override.  
   Ficam em `src/test/factories/make*.ts`.

```typescript
// Estrutura real de um teste unitário
// src/domain/account/application/services/crate-user-services.spec.ts

let inMemoryRepositoriesUser: InMemoryRepositoriesUser;
let sut: ServiceCreateUser;
let fakeHash: FakeHash;

describe('User Service', () => {
  beforeEach(() => {
    inMemoryRepositoriesUser = new InMemoryRepositoriesUser();
    fakeHash = new FakeHash();
    sut = new ServiceCreateUser(inMemoryRepositoriesUser, fakeHash);
  });

  it('deve criar um usuario corretamente', async () => {
    const result = await sut.execute({ name: 'Giuliano', email: 'test@test.com', password: 'senha' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(inMemoryRepositoriesUser.items[0]).toEqual(result.value.user);
    }
  });
});
```

### E2E Tests

- Usam `AppModule` + `DataBaseModule` reais.
- O `setup-e2e.ts` cria um schema PostgreSQL isolado por uuid para cada run e o destrói no `afterAll`.
- Factories com sufixo `Factory` são `@Injectable()` e recebem `PrismaService` para criar registros no banco.
- `setupTestApp(app)` adiciona middleware de parse de cookies (necessário para auth via cookie).
- `loginAsAdmin` / `loginAsAdopter` retornam um `request.agent` já autenticado (cookie persistente).

```typescript
// Estrutura real de um teste e2e
describe('ControllerCreateUnit (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);
    await app.init();
    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(() => app.close());

  it('POST /units — deve criar uma unidade', async () => {
    const manager = await userFactory.makePrismaUser();
    const res = await adminAgent.post('/units').send({ name: 'Unidade Centro', ... });
    expect(res.statusCode).toBe(201);
  });
});
```

---

## Regras de Ouro

1. **Nunca importar NestJS (`@nestjs/*`) no domínio.** A pasta `src/domain/` deve ter zero dependências de framework. A única exceção é `@Injectable()` nos services — mas services de domínio podem ser instanciados diretamente nos testes sem container NestJS.

2. **Nunca instanciar entidades com `new` fora da própria classe.** Sempre usar o método estático `create()`. Isso garante invariantes como `createdAt` e valores padrão.

3. **Nunca lançar exceptions dentro de use cases/services.** O retorno é sempre `Either<Erro, Sucesso>`. Quem converte para `HttpException` é o controller, após verificar `result.isLeft()`.

4. **Nunca expor a entidade de domínio diretamente no response HTTP.** Sempre passar pelo Presenter (`XyzPresenter.toHTTP(entity)`). Isso evita vazar campos sensíveis (ex: `password`) e desacopla o shape HTTP do modelo interno.

5. **Nunca criar uma implementação de repositório sem a interface abstrata correspondente no domínio.** A interface (classe abstrata) é a fronteira: o domínio a define, a infra a implementa, e o `DataBaseModule` faz a ligação com o provider NestJS.

6. **Nunca usar `jest.mock` ou `vi.mock` nos testes unitários.** Usar sempre In-Memory Repositories e Fake Implementations — isso garante que os testes testam a lógica real sem mocks frágeis.

7. **Nunca adicionar um campo à resposta HTTP sem criar ou atualizar o Presenter correspondente.** Responses são contratos; o Presenter é onde esse contrato é definido.

---

## O que fazer antes de qualquer tarefa

1. **Identificar o bounded context correto** — a funcionalidade pertence a `account`, `adoption`, `pets`, `companyUnits` ou `Attachment`? Cada um tem sua própria pasta em `src/domain/`.

2. **Verificar se a entidade já existe** — ler `src/domain/<contexto>/enterprise/entities/` antes de criar algo novo.

3. **Verificar se o repositório já existe** — ler `src/domain/<contexto>/application/repositories/` e `src/infra/database/prisma/repositories.ts/`.

4. **Para nova feature, criar nesta ordem:**
   - Entidade / Value Object no `enterprise/` (se novo)
   - Interface de repositório em `application/repositories/` (se novo)
   - Use case em `application/services/`
   - In-Memory Repository em `src/test/repositories/` para os testes
   - Testes unitários do use case
   - Implementação Prisma em `src/infra/database/prisma/repositories.ts/`
   - Mapper em `src/infra/database/prisma/mappers/`
   - Schema Zod em `src/infra/http/<módulo>/schemas/`
   - Presenter em `src/infra/http/<módulo>/presenters/`
   - Controller em `src/infra/http/<módulo>/controller/`
   - Registrar no Module (`providers`, `controllers`, `imports`)
   - Teste e2e do controller

5. **Antes de registrar no Module**, checar se o serviço já está listado em `providers` e se os repositórios necessários já estão exportados pelo `DataBaseModule`.

6. **Para rotas protegidas por role**, adicionar `@Roles(Role.ADMIN)` no controller e garantir que o teste e2e cobre o caso 403 com um agente `loginAsAdopter`.

7. **Para qualquer nova Policy**, implementar a interface `Policy<TContext, E>`, escrever o `.spec.ts` correspondente, e registrá-la no índice `src/domain/<contexto>/police/index.ts`.

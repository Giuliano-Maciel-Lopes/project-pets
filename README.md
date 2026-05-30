# 🐾 PETSONG — API de Gestão para ONG de Adoção de Animais

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?logo=postgresql)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0.16-6E9F18?logo=vitest)](https://vitest.dev/)

> API REST para gerenciamento completo de ONGs de adoção de animais com suporte a múltiplas unidades, controle de pets, candidatos a adoção e fluxo de adoção com validação por políticas de negócio.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Stack e Versões](#stack-e-versões)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodando a Aplicação](#rodando-a-aplicação)
- [Testes](#testes)
- [Padrão de Erros](#padrão-de-erros)
- [Domínios da Aplicação](#domínios-da-aplicação)

---

## 🐶 Sobre o Projeto

O **PETSONG** é uma API REST construída para ONGs de proteção animal que precisam gerenciar:

- **Múltiplas unidades** de abrigo espalhadas por diferentes cidades
- **Pets disponíveis** para adoção com controle de status e fotos
- **Candidatos a adoção** com verificação de CPF, identidade e histórico de banimento
- **Processo de adoção** completo com validações de negócio (candidato ativo, pet disponível, unidade correta)
- **Autenticação JWT RS256** com dois papéis: `ADMIN` (funcionários da ONG) e `ADOPTER` (adotantes)

---

## 🏗️ Arquitetura

O projeto segue **Domain-Driven Design (DDD)** estrito, separando responsabilidades em quatro camadas que não se misturam:

```
src/
├── core/                          # Primitivos reutilizáveis (sem regra de negócio)
│   ├── entities/                  # Entity, AggregateRoot, UniqueEntityId, WatchedList
│   ├── either.ts                  # Either<L, R> — padrão funcional de retorno de erro
│   ├── erros/                     # Erros genéricos: NotFoundError, UnauthorizedError, DuplicateSlugNameError, UseCaseError
│   ├── events/                    # DomainEvents dispatcher
│   ├── police/                    # Policy interface, PolicyRunner, EntityMustExistPolicy, RequiredRolePolicy, SelfOrAdminPolicy
│   └── value-objects/             # Slug
│
├── domain/                        # Domínio puro — zero dependência de framework
│   ├── account/                   # Usuários e autenticação
│   ├── adoption/                  # Adoções e candidatos a adoção
│   ├── pets/                      # Pets
│   ├── companyUnits/              # Unidades da ONG
│   └── Attachment/                # Upload e armazenamento de arquivos
│
├── infra/                         # Implementações concretas (NestJS, Prisma, JWT)
│   ├── auth/                      # JwtStrategy, Guards, @Public(), @Roles()
│   ├── cryptography/              # BcryptHasher, JwtEncrypter
│   ├── database/prisma/           # Implementações Prisma + Mappers
│   ├── env/                       # Validação de variáveis de ambiente via Zod
│   ├── storage/                   # LocalStorage (implementa Uploader)
│   └── http/                      # Controllers, Presenters, Schemas Zod
│
└── test/                          # Infraestrutura de testes
    ├── repositories/              # InMemory* para testes unitários
    ├── factories/                 # Factories de entidades
    ├── cryptography/              # FakeHash, FakeToken
    └── utils/                     # setupTestApp, loginAsAdmin, loginAsAdopter
```

### Princípios arquiteturais

| Princípio | Implementação |
|---|---|
| **Either Pattern** | Todos os use cases retornam `Either<Erro, Sucesso>` — sem exceptions no domínio |
| **Repository Pattern** | Interfaces abstratas no domínio, implementações Prisma na infra |
| **Policy Pattern** | Regras de negócio complexas isoladas em classes `Policy<TContext, E>` |
| **Presenter Pattern** | Entidades de domínio nunca são expostas diretamente no HTTP |
| **Factory Methods** | Entidades só são criadas via `Entity.create()`, nunca com `new` diretamente |

---

## 🛠️ Stack e Versões

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | ≥ 20 (LTS) | Runtime |
| TypeScript | ^5.7.3 | Linguagem |
| NestJS | ^11.0.1 | Framework HTTP |
| Prisma | ^7.2.0 | ORM |
| PostgreSQL | 15 (Docker) | Banco de dados |
| Zod | ^4.3.5 | Validação de schemas |
| @nestjs/jwt | ^11.0.2 | JWT RS256 |
| bcryptjs | ^3.0.3 | Hash de senhas |
| Passport / passport-jwt | ^0.7.0 / ^4.0.1 | Estratégia JWT |
| cookie-parser | ^1.4.7 | Parse de cookies httpOnly |
| Vitest | ^4.0.16 | Testes unitários e E2E |
| Supertest | ^7.2.2 | Testes HTTP E2E |
| unplugin-swc | ^1.5.9 | Compilador SWC (mais rápido) |

---

## ✅ Pré-requisitos

Antes de começar, garanta que você tem instalado:

- **Node.js** ≥ 20 LTS ([download](https://nodejs.org/))
- **npm** ≥ 10 (vem com o Node)
- **Docker** e **Docker Compose** (para subir o PostgreSQL)
- **Chaves RSA** para JWT (veja a seção de variáveis de ambiente)

---

## 🚀 Instalação e Configuração

### 1. Clone o repositório e instale as dependências

```bash
git clone <url-do-repositorio>
cd project-pets
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o conteúdo abaixo (veja a seção de [Variáveis de Ambiente](#variáveis-de-ambiente) para detalhes):

```env
# Banco de dados
DATABASE_URL="postgresql://petsong:petsong@localhost:5432/petsong"

# Servidor
PORT=3333

# JWT — chaves RSA em base64
JWT_PRIVATE_KEY="<base64_da_chave_privada_RSA>"
JWT_PUBLIC_KEY="<base64_da_chave_publica_RSA>"

# Docker (usadas pelo docker-compose.yml)
POSTGRES_USER=petsong
POSTGRES_PASSWORD=petsong
POSTGRES_DB=petsong
```

#### Gerando as chaves RSA

```bash
# Gerar a chave privada
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048

# Extrair a chave pública
openssl rsa -pubout -in private.pem -out public.pem

# Converter para base64 (Linux/Mac)
base64 -w 0 private.pem   # cole como JWT_PRIVATE_KEY
base64 -w 0 public.pem    # cole como JWT_PUBLIC_KEY

# Converter para base64 (Windows PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("private.pem"))  # JWT_PRIVATE_KEY
[Convert]::ToBase64String([IO.File]::ReadAllBytes("public.pem"))   # JWT_PUBLIC_KEY
```

### 3. Suba o banco de dados

```bash
docker-compose up -d
```

### 4. Execute as migrations do Prisma

```bash
# Em desenvolvimento (cria e aplica migrations)
npx prisma migrate dev

# Gerar o client Prisma
npx prisma generate
```

---

## ▶️ Rodando a Aplicação

```bash
# Desenvolvimento com hot-reload
npm run start:dev

# Build de produção
npm run build

# Produção (após build)
npm run start:prod
```

A API estará disponível em `http://localhost:3333` (ou na porta configurada em `PORT`).

---

## 🧪 Testes

### Testes Unitários

Usam In-Memory Repositories e Fake Implementations — sem banco de dados real.

```bash
# Rodar todos os testes unitários
npx vitest run

# Modo watch
npm run test:watch

# Rodar um arquivo específico
npx vitest run src/domain/account/application/services/crate-user-services.spec.ts

# Cobertura
npm run test:cov
```

### Testes E2E

Usam banco de dados PostgreSQL real. Cada execução cria um schema isolado por UUID e o destrói ao final.

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Modo watch
npm run test:e2e:watch
```

> ⚠️ Os testes E2E requerem que o banco esteja rodando (`docker-compose up -d`) e que as migrations estejam aplicadas.

---

## ❌ Padrão de Erros

### Como os erros são gerados

Todos os use cases retornam `Either<Erro, Sucesso>`. Os erros de domínio são classes que estendem `Error` e implementam `UseCaseError`. O controller verifica `result.isLeft()` e converte o erro para a exception HTTP correspondente.

### Estrutura da resposta de erro

O NestJS serializa automaticamente as exceptions HTTP no formato:

```json
{
  "statusCode": 422,
  "message": "Pet banido para adoçao",
  "error": "Unprocessable Entity"
}
```

### Mapeamento de erros por HTTP status

| Status HTTP | Quando ocorre | Exemplo |
|---|---|---|
| `400 Bad Request` | Validação de schema falhou | Campo obrigatório ausente, formato inválido |
| `401 Unauthorized` | Token ausente, inválido ou credenciais erradas | `email ou senha invalido!!.` |
| `403 Forbidden` | Usuário não tem permissão | ADOPTER tentando acessar rota de ADMIN, e-mail divergente |
| `404 Not Found` | Recurso não encontrado | Pet, Unidade ou Candidato inexistente |
| `409 Conflict` | Registro duplicado | E-mail já cadastrado |
| `422 Unprocessable Entity` | Regra de negócio violada | Pet indisponível, candidato banido, pet/unidade divergentes |

### Erros do sistema

| Classe de Erro | Mensagem | HTTP |
|---|---|---|
| `WrongCredentialsError` | `email ou senha invalido!!.` | 401 |
| `ExystUserWitchEmailError` | `Já existe um usuario com esse email !! faça loguin` | 409 |
| `NotFoundError` | `<entidade> não encontrado` | 404 |
| `UnauthorizedError` | `Sem permissão para executar esta operação.` | 403 |
| `CandidateBannedError` | `O candidato encontra-se bloqueado para o processo de adoção.` | 403 |
| `petUnavaliableError` | `Pet banido para adoçao` | 422 |
| `UnitAndPetDistincsError` | `esse pet não pertence a essa unidade` | 422 |

---

## 🗂️ Domínios da Aplicação

Cada domínio tem seu próprio README com regras de negócio detalhadas e documentação das rotas:

| Domínio | Pasta | Responsabilidade |
|---|---|---|
| [Account](./src/domain/account/README.md) | `src/domain/account/` | Usuários, autenticação e autorização |
| [Pets](./src/domain/pets/README.md) | `src/domain/pets/` | Cadastro e gestão de pets disponíveis para adoção |
| [Company Units](./src/domain/companyUnits/README.md) | `src/domain/companyUnits/` | Unidades/abrigos da ONG |
| [Adoption](./src/domain/adoption/README.md) | `src/domain/adoption/` | Processo de adoção e candidatos |
| [Attachment](./src/domain/Attachment/README.md) | `src/domain/Attachment/` | Upload de fotos e documentos |

---

## 🔒 Autenticação

- **Algoritmo:** RS256 (RSA com SHA-256)
- **Armazenamento do token:** Cookie `httpOnly` chamado `access_token`
- **Expiração:** 7 dias
- **Payload do token:** `{ id, role }` — sem email (email é dado de negócio, não de autorização)
- **Papéis (roles):** `ADMIN` (funcionários da ONG) e `ADOPTER` (adotantes)
- **Rotas públicas:** `POST /users`, `POST /sessions`, `POST /users/logout`
- **Rotas autenticadas:** Todas as demais (requerem cookie ou header `Authorization: Bearer <token>`)
- **Autorização em duas camadas:** `@Roles(Role.ADMIN)` no controller (barreira de borda rápida) + `PolicyRunner + RequiredRolePolicy/SelfOrAdminPolicy` no service (fonte de verdade, vale em qualquer contexto de invocação)

> Consulte o [README para o time de frontend](./README-FRONTEND.md) para exemplos de requisição e integração.

---

## 📦 Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | URL de conexão PostgreSQL (formato Prisma) |
| `PORT` | ❌ | `3333` | Porta em que a API vai escutar |
| `JWT_PRIVATE_KEY` | ✅ | — | Chave privada RSA codificada em base64 (assinar tokens) |
| `JWT_PUBLIC_KEY` | ✅ | — | Chave pública RSA codificada em base64 (verificar tokens) |
| `POSTGRES_USER` | ✅* | — | Usuário do PostgreSQL (usado pelo docker-compose) |
| `POSTGRES_PASSWORD` | ✅* | — | Senha do PostgreSQL (usado pelo docker-compose) |
| `POSTGRES_DB` | ✅* | — | Nome do banco de dados (usado pelo docker-compose) |

> \* Obrigatório apenas ao usar o `docker-compose.yml` fornecido.

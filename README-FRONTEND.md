# 🖥️ PETSONG — Guia de Integração para o Time de Frontend

Este documento cobre tudo que o frontend precisa para consumir a API do PETSONG: autenticação, estrutura das rotas, formato dos dados e tratamento de erros.

---

## 📋 Sumário

- [Autenticação](#-autenticação)
- [Rotas públicas vs. protegidas](#-rotas-públicas-vs-protegidas)
- [Padrão de erros](#-padrão-de-erros)
- [Rotas — Account (Usuários)](#-rotas--account-usuários)
- [Rotas — Units (Unidades)](#-rotas--units-unidades)
- [Rotas — Pets](#-rotas--pets)
- [Rotas — Attachments (Upload)](#-rotas--attachments-upload)
- [Rotas — Adoptions (Adoções)](#-rotas--adoptions-adoções)
- [Rotas — Adoption Candidates (Candidatos)](#-rotas--adoption-candidates-candidatos)

---

## 🔐 Autenticação

### Como funciona

A API usa **JWT RS256** armazenado em **cookie `httpOnly`**. O frontend **não precisa manipular o token manualmente** — o navegador envia o cookie automaticamente em cada requisição, desde que `credentials: 'include'` esteja configurado.

### Login

```http
POST /sessions
Content-Type: application/json

{
  "email": "admin@petsong.com",
  "password": "minhasenha123"
}
```

Após o login bem-sucedido, o servidor define automaticamente o cookie:
```
Set-Cookie: access_token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/
```

O token expira em **7 dias**.

### Configuração do cliente HTTP

Para que o cookie seja enviado automaticamente em todas as requisições:

```javascript
// Fetch nativo
fetch('/api/pets', {
  credentials: 'include', // obrigatório para enviar cookies
})

// Axios
axios.defaults.withCredentials = true;
// ou por instância:
const api = axios.create({
  baseURL: 'http://localhost:3333',
  withCredentials: true,
})
```

### Logout

```http
POST /users/logout
```

Limpa o cookie `access_token` no servidor. Após isso, todas as requisições autenticadas retornarão `401`.

---

## 🔓 Rotas públicas vs. protegidas

### Rotas públicas (sem autenticação)

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/users` | Criar conta |
| `POST` | `/sessions` | Login |
| `POST` | `/users/logout` | Logout |

### Rotas protegidas (requerem cookie `access_token`)

Todas as demais rotas exigem autenticação. Se o cookie estiver ausente ou expirado, a API retorna `401 Unauthorized`.

### Rotas restritas a ADMIN

Marcadas com 🔒 nas tabelas abaixo. Se um usuário `ADOPTER` tentar acessar, recebe `403 Forbidden`.

---

## ❌ Padrão de erros

### Estrutura da resposta de erro

```json
{
  "statusCode": 422,
  "message": "Pet banido para adoçao",
  "error": "Unprocessable Entity"
}
```

### Tabela de status e como tratar

| Status | Quando ocorre | Como tratar no frontend |
|---|---|---|
| `400 Bad Request` | Campo inválido ou ausente (validação Zod) | Exibir `message` no formulário |
| `401 Unauthorized` | Token ausente ou expirado | Redirecionar para tela de login |
| `403 Forbidden` | Sem permissão (role ou ownership) | Exibir mensagem de acesso negado |
| `404 Not Found` | Recurso não encontrado | Exibir "não encontrado" |
| `409 Conflict` | Recurso já existe | Exibir `message` (ex: e-mail duplicado) |
| `422 Unprocessable Entity` | Regra de negócio violada | Exibir `message` específica |

### Mensagens de erro específicas

| `message` | Significado |
|---|---|
| `email ou senha invalido!!.` | Credenciais de login incorretas |
| `Já existe um usuario com esse email !! faça loguin` | E-mail já cadastrado |
| `Sem permissão para executar esta operação.` | Usuário sem permissão (role incorreta ou tentando acessar recurso de outro) |
| `O candidato encontra-se bloqueado para o processo de adoção.` | Candidato banido tentando adotar |
| `Pet banido para adoçao` | Pet não está disponível |
| `esse pet não pertence a essa unidade` | Unidade e pet não correspondem |
| `<entidade> não encontrado` | Recurso inexistente |

---

## 👤 Rotas — Account (Usuários)

### `POST /users` — Criar conta

```http
POST /users
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "minhasenha"
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `name` | `string` | Mínimo 3 caracteres |
| `email` | `string` | E-mail válido |
| `password` | `string` | Mínimo 6 caracteres |

**Sucesso `201`:**
```json
{ "message": "Usuário criado com sucesso" }
```

---

### `POST /sessions` — Login

```http
POST /sessions
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "minhasenha"
}
```

**Sucesso `200`:**
```json
{ "message": "Autenticado com sucesso" }
```

> Cookie `access_token` é definido automaticamente.

---

### `POST /users/logout` — Logout

```http
POST /users/logout
```

**Sucesso `200`:**
```json
{ "message": "Logout realizado com sucesso" }
```

---

### `GET /users/:id` — Buscar usuário por ID

> ADMIN pode buscar qualquer usuário. ADOPTER pode buscar apenas o próprio perfil (pelo seu próprio ID). Tentar buscar o perfil de outro usuário retorna `403`.

```http
GET /users/550e8400-e29b-41d4-a716-446655440000
```

**Sucesso `200`:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "ADOPTER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

---

### `GET /users/email/:email` — Buscar usuário por e-mail 🔒 ADMIN

```http
GET /users/email/joao@email.com
```

**Sucesso `200`:** Mesmo formato acima.

---

## 🏠 Rotas — Units (Unidades)

### `POST /units` — Criar unidade 🔒 ADMIN

```http
POST /units
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Unidade Centro",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "managerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `name` | `string` | Mínimo 2 caracteres |
| `address` | `string` | Mínimo 5 caracteres |
| `city` | `string` | Mínimo 2 caracteres |
| `state` | `string` | Exatamente 2 caracteres (UF) |
| `managerId` | `string` | UUID válido |

**Sucesso `201`:**
```json
{
  "unit": {
    "id": "uuid",
    "name": "Unidade Centro",
    "address": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "slug": "unidade-centro",
    "isPrincipal": false,
    "isActive": true,
    "managerId": "uuid",
    "attachments": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

---

### `GET /units` — Listar unidades

```http
GET /units?city=São Paulo&isActive=true&page=1&limit=25
```

**Query params (todos opcionais):**

| Parâmetro | Tipo | Exemplo |
|---|---|---|
| `name` | `string` | `?name=Centro` |
| `slug` | `string` | `?slug=unidade-centro` |
| `city` | `string` | `?city=São Paulo` |
| `state` | `string (2 chars)` | `?state=SP` |
| `isActive` | `"true" \| "false"` | `?isActive=true` |
| `isPrincipal` | `"true" \| "false"` | `?isPrincipal=true` |
| `managerId` | `uuid` | `?managerId=<uuid>` |
| `page` | `number` | `?page=2` (padrão: 1) |
| `limit` | `number` | `?limit=10` (padrão: 25, máx: 100) |

**Sucesso `200`:**
```json
{
  "units": [
    {
      "id": "uuid",
      "name": "Unidade Centro",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "slug": "unidade-centro",
      "isPrincipal": false,
      "isActive": true,
      "managerId": "uuid",
      "attachments": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 25
}
```

---

### `GET /units/:id` — Buscar unidade por ID

```http
GET /units/550e8400-e29b-41d4-a716-446655440000
```

**Sucesso `200`:**
```json
{ "unit": { /* mesmo formato da listagem */ } }
```

---

### `GET /units/slug/:slug` — Buscar unidade por slug

```http
GET /units/slug/unidade-centro
```

**Sucesso `200`:**
```json
{ "unit": { /* mesmo formato da listagem */ } }
```

---

### `PUT /units/:id` — Atualizar unidade 🔒 ADMIN

```http
PUT /units/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

**Body:** Mesmo formato do `POST /units`.

**Sucesso `200`:**
```json
{ "message": "Unidade atualizada com sucesso" }
```

---

### `DELETE /units/:id` — Remover unidade 🔒 ADMIN

```http
DELETE /units/550e8400-e29b-41d4-a716-446655440000
```

**Sucesso `204`:** Sem corpo na resposta.

---

### `PATCH /units/:id/active` — Ativar/desativar unidade 🔒 ADMIN

```http
PATCH /units/550e8400-e29b-41d4-a716-446655440000/active
Content-Type: application/json
```

**Body:**
```json
{ "isActive": false }
```

**Sucesso `200`:**
```json
{ "message": "Status da unidade atualizado com sucesso" }
```

---

## 🐾 Rotas — Pets

### `POST /pets` — Criar pet 🔒 ADMIN

```http
POST /pets
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Rex",
  "species": "Cachorro",
  "breed": "Labrador",
  "age": 3,
  "sex": "male",
  "unitId": "550e8400-e29b-41d4-a716-446655440000",
  "attachmentIds": ["uuid-foto-1"]
}
```

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `name` | `string` | ✅ | Mínimo 2 caracteres |
| `species` | `string` | ✅ | Mínimo 2 caracteres |
| `breed` | `string` | ✅ | Mínimo 2 caracteres |
| `age` | `number` | ❌ | Inteiro positivo |
| `sex` | `"male" \| "female"` | ❌ | Enum |
| `unitId` | `string` | ✅ | UUID válido |
| `attachmentIds` | `string[]` | ❌ | Array de UUIDs (padrão: `[]`) |

**Sucesso `201`:**
```json
{
  "pet": {
    "id": "uuid",
    "name": "Rex",
    "species": "Cachorro",
    "breed": "Labrador",
    "age": 3,
    "sex": "male",
    "status": "available",
    "isActive": true,
    "unitId": "uuid",
    "attachments": [
      {
        "id": "uuid",
        "title": "foto-rex.jpg",
        "link": "/uploads/foto-rex.jpg"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

---

### `GET /pets` — Listar pets

```http
GET /pets?species=Cachorro&status=available&page=1&limit=25
```

**Query params (todos opcionais):**

| Parâmetro | Tipo | Valores |
|---|---|---|
| `name` | `string` | Qualquer string |
| `species` | `string` | Qualquer string |
| `breed` | `string` | Qualquer string |
| `status` | `string` | `"available"`, `"unavailable"`, `"analysis"` |
| `sex` | `string` | `"male"`, `"female"` |
| `isActive` | `string` | `"true"`, `"false"` |
| `unitId` | `uuid` | UUID da unidade |
| `page` | `number` | Padrão: 1 |
| `limit` | `number` | Padrão: 25, máx: 100 |

**Sucesso `200`:**
```json
{
  "pets": [ /* array de pet */ ],
  "total": 50,
  "page": 1,
  "limit": 25
}
```

---

### `GET /pets/:id` — Buscar pet por ID

```http
GET /pets/550e8400-e29b-41d4-a716-446655440000
```

**Sucesso `200`:**
```json
{ "pet": { /* mesmo formato da criação */ } }
```

---

### `PUT /pets/:id` — Atualizar pet 🔒 ADMIN

```http
PUT /pets/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

**Body:** Mesmo formato do `POST /pets`.

**Sucesso `200`:**
```json
{ "pet": { /* pet atualizado */ } }
```

---

### `DELETE /pets/:id` — Remover pet 🔒 ADMIN

```http
DELETE /pets/550e8400-e29b-41d4-a716-446655440000
```

**Sucesso `204`:** Sem corpo na resposta.

---

### `PATCH /pets/:id/status` — Alterar status 🔒 ADMIN

```http
PATCH /pets/550e8400-e29b-41d4-a716-446655440000/status
Content-Type: application/json
```

**Body:**
```json
{ "status": "unavailable" }
```

Valores possíveis: `"available"`, `"unavailable"`, `"analysis"`.

**Sucesso `200`:**
```json
{ "message": "Status do pet atualizado com sucesso" }
```

---

### `PATCH /pets/:id/active` — Ativar/desativar pet 🔒 ADMIN

```http
PATCH /pets/550e8400-e29b-41d4-a716-446655440000/active
Content-Type: application/json
```

**Body:**
```json
{ "isActive": false }
```

**Sucesso `200`:**
```json
{ "message": "Status do pet atualizado com sucesso" }
```

---

## 📎 Rotas — Attachments (Upload)

### `POST /attachments` — Upload de imagem

```http
POST /attachments
Content-Type: multipart/form-data
```

**Campo:** `file` (arquivo de imagem)

**Tipos aceitos:** `image/jpeg`, `image/png`, `image/webp`

**Tamanho máximo:** 10 MB

**Exemplo com fetch:**
```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])

const response = await fetch('/attachments', {
  method: 'POST',
  credentials: 'include',
  body: formData,
  // NÃO definir Content-Type manualmente — o fetch define com o boundary correto
})
```

**Sucesso `201`:**
```json
{
  "attachment": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "foto-pet.jpg",
    "link": "/uploads/foto-pet.jpg"
  }
}
```

> Guarde o `id` retornado e passe-o no campo `attachmentIds` ao criar ou atualizar um pet.

---

## 🤝 Rotas — Adoptions (Adoções)

### `POST /adoptions` — Criar adoção

```http
POST /adoptions
Content-Type: application/json
```

**Body:**
```json
{
  "petId": "uuid-do-pet",
  "adopterId": "uuid-do-candidato",
  "unityId": "uuid-da-unidade"
}
```

> ⚠️ `adopterId` é o ID do **candidato** (`AdoptionCandidate`), não do usuário.
>
> Um `ADOPTER` só pode criar adoções em que o `adopterId` seja o ID do candidato vinculado a ele. ADMIN pode criar adoções para qualquer candidato.

**Sucesso `201`:**
```json
{
  "adoption": {
    "id": "uuid",
    "petId": "uuid",
    "adopterId": "uuid",
    "unityId": "uuid",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

**Erros possíveis:**

| Status | Mensagem | Causa |
|---|---|---|
| `403` | `Sem permissão para executar esta operação.` | ADOPTER tentando criar adoção para candidato de outro usuário |
| `403` | `O candidato encontra-se bloqueado para o processo de adoção.` | Candidato banido |
| `422` | `Pet banido para adoçao` | Pet não está `available` |
| `422` | `esse pet não pertence a essa unidade` | Pet/unidade não correspondem |
| `404` | `Candidate não encontrado` | `adopterId` inexistente |
| `404` | `Pet não encontrado` | `petId` inexistente |
| `404` | `Unit não encontrado` | `unityId` inexistente |

---

### `GET /adoptions` — Listar adoções

```http
GET /adoptions?status=PENDING&page=1&limit=25
```

> **Importante:** ADOPTER vê apenas suas próprias adoções (filtrado automaticamente pelo servidor). ADMIN vê todas.

**Query params (todos opcionais):**

| Parâmetro | Tipo | Valores |
|---|---|---|
| `status` | `string` | `"PENDING"`, `"APPROVED"`, `"REJECTED"` |
| `adopterId` | `uuid` | (apenas ADMIN pode filtrar por outro adotante) |
| `petId` | `uuid` | UUID do pet |
| `unityId` | `uuid` | UUID da unidade |
| `page` | `number` | Padrão: 1 |
| `limit` | `number` | Padrão: 25, máx: 100 |

**Sucesso `200`:**
```json
{
  "adoptions": [
    {
      "id": "uuid",
      "petId": "uuid",
      "adopterId": "uuid",
      "unityId": "uuid",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 25
}
```

---

### `GET /adoptions/:id` — Buscar adoção por ID 🔒 ADMIN

```http
GET /adoptions/550e8400-e29b-41d4-a716-446655440000
```

**Sucesso `200`:**
```json
{ "adoption": { /* mesmo formato da listagem */ } }
```

---

### `PATCH /adoptions/:id/status` — Alterar status da adoção 🔒 ADMIN

```http
PATCH /adoptions/550e8400-e29b-41d4-a716-446655440000/status
Content-Type: application/json
```

**Body:**
```json
{ "status": "APPROVED" }
```

Valores possíveis: `"PENDING"`, `"APPROVED"`, `"REJECTED"`.

**Sucesso `200`:**
```json
{ "adoption": { /* adoption atualizada */ } }
```

---

## 🙋 Rotas — Adoption Candidates (Candidatos)

### `POST /adoption-candidates` — Criar candidato

```http
POST /adoption-candidates
Content-Type: application/json
```

**Body:**
```json
{
  "email": "maria@email.com",
  "name": "Maria Oliveira",
  "cpf": "123.456.789-09",
  "phone": "11999998888",
  "identityUrl": "https://storage.example.com/rg-maria.jpg"
}
```

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `email` | `string` | ✅ | E-mail válido |
| `name` | `string` | ✅ | Mínimo 2 caracteres |
| `cpf` | `string` | ✅ | Formato `000.000.000-00` ou `00000000000` |
| `phone` | `string` | ✅ | Mínimo 10 caracteres |
| `identityUrl` | `string` | ✅ | URL válida da foto do documento |

**Sucesso `201`:**
```json
{
  "adoptionCandidate": {
    "id": "uuid",
    "name": "Maria Oliveira",
    "cpf": "12345678909",
    "phone": "11999998888",
    "identityUrl": "https://storage.example.com/rg-maria.jpg",
    "isBanned": false,
    "bannedReason": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

> O CPF é retornado somente com dígitos (sem pontos e traço).

---

### `GET /adoption-candidates` — Listar candidatos 🔒 ADMIN

```http
GET /adoption-candidates?isBanned=false&page=1&limit=25
```

**Query params (todos opcionais):**

| Parâmetro | Tipo | Valores |
|---|---|---|
| `name` | `string` | Qualquer string |
| `cpf` | `string` | Qualquer string |
| `isBanned` | `string` | `"true"`, `"false"` |
| `page` | `number` | Padrão: 1 |
| `limit` | `number` | Padrão: 25, máx: 100 |

**Sucesso `200`:**
```json
{
  "candidates": [
    {
      "id": "uuid",
      "name": "Maria Oliveira",
      "cpf": "12345678909",
      "phone": "11999998888",
      "identityUrl": "https://storage.example.com/rg-maria.jpg",
      "isBanned": false,
      "bannedReason": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 25
}
```

---

### `GET /adoption-candidates/:id` — Buscar candidato por ID

```http
GET /adoption-candidates/550e8400-e29b-41d4-a716-446655440000
```

> ADOPTER pode ver apenas o próprio cadastro. Se tentar ver o de outra pessoa, recebe `403`.

**Sucesso `200`:**
```json
{ "adoptionCandidate": { /* mesmo formato da listagem */ } }
```

---

### `PUT /adoption-candidates/:id` — Atualizar candidato

> ADMIN pode atualizar qualquer candidato. ADOPTER pode atualizar apenas o próprio cadastro. Tentar atualizar dados de outro candidato retorna `403`.

```http
PUT /adoption-candidates/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Maria Oliveira Santos",
  "phone": "11988887777",
  "identityUrl": "https://storage.example.com/rg-novo.jpg"
}
```

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `name` | `string` | ✅ | Mínimo 2 caracteres |
| `phone` | `string` | ✅ | Mínimo 10 caracteres |
| `identityUrl` | `string` | ✅ | URL válida |

**Sucesso `200`:**
```json
{ "adoptionCandidate": { /* candidato atualizado */ } }
```

---

### `PATCH /adoption-candidates/:id/ban` — Banir/desbanir candidato 🔒 ADMIN

```http
PATCH /adoption-candidates/550e8400-e29b-41d4-a716-446655440000/ban
Content-Type: application/json
```

**Body:**
```json
{
  "isBanned": true,
  "bannedReason": "Maus-tratos registrados em processo anterior."
}
```

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `isBanned` | `boolean` | ✅ | — |
| `bannedReason` | `string` | ✅ | Mínimo 5 caracteres |

**Sucesso `200`:**
```json
{ "adoptionCandidate": { /* candidato com isBanned: true */ } }
```

---

## 📌 Resumo rápido de todas as rotas

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/users` | Público | Criar conta |
| `POST` | `/sessions` | Público | Login |
| `POST` | `/users/logout` | Público | Logout |
| `GET` | `/users/:id` | Autenticado* | Buscar usuário por ID (ADMIN vê qualquer um; ADOPTER só o próprio) |
| `GET` | `/users/email/:email` | 🔒 ADMIN | Buscar usuário por e-mail |
| `POST` | `/units` | 🔒 ADMIN | Criar unidade |
| `GET` | `/units` | Autenticado | Listar unidades |
| `GET` | `/units/:id` | Autenticado | Buscar unidade por ID |
| `GET` | `/units/slug/:slug` | Autenticado | Buscar unidade por slug |
| `PUT` | `/units/:id` | 🔒 ADMIN | Atualizar unidade |
| `DELETE` | `/units/:id` | 🔒 ADMIN | Remover unidade |
| `PATCH` | `/units/:id/active` | 🔒 ADMIN | Ativar/desativar unidade |
| `POST` | `/pets` | 🔒 ADMIN | Criar pet |
| `GET` | `/pets` | Autenticado | Listar pets |
| `GET` | `/pets/:id` | Autenticado | Buscar pet por ID |
| `PUT` | `/pets/:id` | 🔒 ADMIN | Atualizar pet |
| `DELETE` | `/pets/:id` | 🔒 ADMIN | Remover pet |
| `PATCH` | `/pets/:id/status` | 🔒 ADMIN | Alterar status do pet |
| `PATCH` | `/pets/:id/active` | 🔒 ADMIN | Ativar/desativar pet |
| `POST` | `/attachments` | Autenticado | Upload de arquivo |
| `POST` | `/adoptions` | Autenticado* | Criar adoção |
| `GET` | `/adoptions` | Autenticado* | Listar adoções |
| `GET` | `/adoptions/:id` | 🔒 ADMIN | Buscar adoção por ID |
| `PATCH` | `/adoptions/:id/status` | 🔒 ADMIN | Alterar status da adoção |
| `POST` | `/adoption-candidates` | Autenticado* | Criar candidato |
| `GET` | `/adoption-candidates` | 🔒 ADMIN | Listar candidatos |
| `GET` | `/adoption-candidates/:id` | Autenticado* | Buscar candidato por ID (ADMIN vê qualquer um; ADOPTER só o próprio) |
| `PUT` | `/adoption-candidates/:id` | Autenticado* | Atualizar candidato (ADMIN qualquer; ADOPTER só o próprio) |
| `PATCH` | `/adoption-candidates/:id/ban` | 🔒 ADMIN | Banir/desbanir candidato |

> \* Autenticado com restrição de ownership — veja a documentação específica da rota.

# 📁 Domínio: Company Units (Unidades da ONG)

## Responsabilidade

Gerencia as unidades físicas (abrigos/filiais) da ONG. Cada unidade tem um responsável (`managerId`), endereço completo, um slug único gerado automaticamente a partir do nome, e flags de estado (`isActive`, `isPrincipal`). Pets e adoções são sempre vinculados a uma unidade.

---

## Entidades

### `Units`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `UUID` | Identificador único |
| `name` | `string` | Nome da unidade |
| `address` | `string` | Endereço completo |
| `city` | `string` | Cidade |
| `state` | `string` | UF (2 caracteres, ex: `SP`) |
| `slug` | `Slug` | Slug único gerado do nome (value object) |
| `isPrincipal` | `boolean` | Se é a unidade sede (padrão: `false`) |
| `isActive` | `boolean` | Se está ativa (padrão: `true`) |
| `managerId` | `UUID` | ID do usuário responsável |
| `attachments` | `Attachment[]` | Fotos da unidade |
| `createdAt` | `Date` | Data de criação |
| `updatedAt` | `Date` | Última atualização |

---

## Regras de Negócio

1. **Somente ADMIN** pode criar, atualizar, deletar ou alterar o status de uma unidade.
2. **Slug gerado automaticamente** a partir do nome da unidade — garantia de unicidade.
3. **Listagem pública** (para usuários autenticados) com filtros e paginação.
4. **Busca por slug** disponível para integração com URLs amigáveis.
5. **Toggle de ativo:** O campo `isActive` pode ser alternado independentemente de outros dados da unidade.

---

## Erros do Domínio

| Situação | Mensagem | HTTP |
|---|---|---|
| Unidade não encontrada | `<entidade> não encontrado` | 404 Not Found |
| Slug já existente | Mensagem de conflito | 409 Conflict |

---

## Rotas HTTP

### `POST /units` — Criar unidade
- **Acesso:** Somente `ADMIN`
- **Body:**

```json
{
  "name": "Unidade Centro",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "managerId": "uuid-do-usuario-responsavel"
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `name` | `string` | ✅ | Mínimo 2 caracteres |
| `address` | `string` | ✅ | Mínimo 5 caracteres |
| `city` | `string` | ✅ | Mínimo 2 caracteres |
| `state` | `string` | ✅ | Exatamente 2 caracteres (UF), convertido para maiúsculas |
| `managerId` | `string` | ✅ | UUID válido |

- **Resposta de sucesso (201):**

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
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### `GET /units` — Listar unidades
- **Acesso:** Qualquer usuário autenticado
- **Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `name` | `string` (opcional) | Filtrar por nome |
| `slug` | `string` (opcional) | Filtrar por slug |
| `city` | `string` (opcional) | Filtrar por cidade |
| `state` | `string` (opcional) | Filtrar por UF (2 chars) |
| `isActive` | `"true" \| "false"` (opcional) | Filtrar por status ativo |
| `isPrincipal` | `"true" \| "false"` (opcional) | Filtrar por unidade sede |
| `managerId` | `UUID` (opcional) | Filtrar por responsável |
| `page` | `number` (opcional) | Página (padrão: 1) |
| `limit` | `number` (opcional) | Itens por página (padrão: 25, máx: 100) |

- **Resposta de sucesso (200):**

```json
{
  "units": [ /* array de unidades */ ],
  "total": 42,
  "page": 1,
  "limit": 25
}
```

---

### `GET /units/:id` — Buscar unidade por ID
- **Acesso:** Qualquer usuário autenticado
- **Parâmetro:** `id` (UUID)
- **Resposta de sucesso (200):** Objeto `unit` com todos os campos

---

### `GET /units/slug/:slug` — Buscar unidade por slug
- **Acesso:** Qualquer usuário autenticado
- **Parâmetro:** `slug` (string)
- **Resposta de sucesso (200):** Objeto `unit` com todos os campos

---

### `PUT /units/:id` — Atualizar unidade
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Body:** Mesmo formato de `POST /units`
- **Resposta de sucesso (200):**

```json
{ "message": "Unidade atualizada com sucesso" }
```

---

### `DELETE /units/:id` — Deletar unidade
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Resposta de sucesso:** `204 No Content` (sem body)

---

### `PATCH /units/:id/active` — Ativar/desativar unidade
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Body:**

```json
{ "isActive": false }
```

| Campo | Tipo | Obrigatório |
|---|---|---|
| `isActive` | `boolean` | ✅ |

- **Resposta de sucesso (200):**

```json
{ "message": "Status da unidade atualizado com sucesso" }
```

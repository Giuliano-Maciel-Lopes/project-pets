# 📁 Domínio: Pets

## Responsabilidade

Gerencia o cadastro e ciclo de vida dos animais disponíveis para adoção na ONG. Cada pet é vinculado a uma unidade específica, pode ter fotos (attachments), e tem um status que controla sua disponibilidade no processo de adoção.

---

## Entidades

### `Pets`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `UUID` | Identificador único |
| `name` | `string` | Nome do animal |
| `species` | `string` | Espécie (ex: `Cachorro`, `Gato`) |
| `breed` | `string` | Raça |
| `age` | `number?` | Idade em anos (opcional) |
| `sex` | `MALE \| FEMALE \| null` | Sexo do animal (opcional) |
| `status` | `AVAILABLE \| UNAVAILABLE \| ANALYSIS` | Status de disponibilidade (padrão: `AVAILABLE`) |
| `isActive` | `boolean` | Se o pet está ativo no sistema (padrão: `true`) |
| `unitId` | `UUID` | Unidade à qual pertence |
| `attachments` | `PetAttachment[]` | Fotos do animal (WatchedList) |
| `createdAt` | `Date` | Data de criação |
| `updatedAt` | `Date` | Última atualização |

### Status do Pet

| Valor | Significado |
|---|---|
| `AVAILABLE` | Disponível para adoção |
| `UNAVAILABLE` | Indisponível (removido temporariamente ou não apto) |
| `ANALYSIS` | Em processo de adoção (candidato está sendo avaliado) |

---

## Regras de Negócio

1. **Somente ADMIN** pode criar, atualizar, deletar, ativar/desativar e alterar o status de um pet.
2. **Qualquer usuário autenticado** pode listar e buscar pets.
3. **Ao criar uma adoção**, o sistema automaticamente muda o status do pet para `ANALYSIS` — sinalizando que ele está em processo de avaliação.
4. **Attachments (fotos):** Ao criar ou atualizar um pet, é possível passar um array de `attachmentIds`. O sistema usa uma `WatchedList` para detectar fotos adicionadas e removidas, atualizando de forma incremental.
5. **Busca por ID:** O pet retornado inclui a lista completa de fotos com `id`, `title` e `link`.

---

## Erros do Domínio

| Situação | Mensagem | HTTP |
|---|---|---|
| Pet não encontrado | `<entidade> não encontrado` | 404 Not Found |

---

## Rotas HTTP

### `POST /pets` — Criar pet
- **Acesso:** Somente `ADMIN`
- **Body:**

```json
{
  "name": "Rex",
  "species": "Cachorro",
  "breed": "Labrador",
  "age": 3,
  "sex": "male",
  "unitId": "uuid-da-unidade",
  "attachmentIds": ["uuid-foto-1", "uuid-foto-2"]
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `name` | `string` | ✅ | Mínimo 2 caracteres |
| `species` | `string` | ✅ | Mínimo 2 caracteres |
| `breed` | `string` | ✅ | Mínimo 2 caracteres |
| `age` | `number` | ❌ | Inteiro positivo |
| `sex` | `"male" \| "female"` | ❌ | Enum |
| `unitId` | `string` | ✅ | UUID válido |
| `attachmentIds` | `string[]` | ❌ | Array de UUIDs (padrão: `[]`) |

- **Resposta de sucesso (201):**

```json
{
  "pet": {
    "id": "uuid",
    "name": "Rex",
    "species": "Cachorro",
    "breed": "Labrador",
    "age": 3,
    "sex": "MALE",
    "status": "AVAILABLE",
    "isActive": true,
    "unitId": "uuid",
    "attachments": [
      { "id": "uuid", "title": "foto-frente.jpg", "link": "/uploads/foto-frente.jpg" }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### `GET /pets` — Listar pets
- **Acesso:** Qualquer usuário autenticado
- **Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `name` | `string` (opcional) | Filtrar por nome |
| `species` | `string` (opcional) | Filtrar por espécie |
| `breed` | `string` (opcional) | Filtrar por raça |
| `status` | `"available" \| "unavailable" \| "analysis"` (opcional) | Filtrar por status |
| `sex` | `"male" \| "female"` (opcional) | Filtrar por sexo |
| `isActive` | `"true" \| "false"` (opcional) | Filtrar por ativo |
| `unitId` | `UUID` (opcional) | Filtrar por unidade |
| `page` | `number` (opcional) | Página (padrão: 1) |
| `limit` | `number` (opcional) | Itens por página (padrão: 25, máx: 100) |

- **Resposta de sucesso (200):**

```json
{
  "pets": [ /* array de pets */ ],
  "total": 10,
  "page": 1,
  "limit": 25
}
```

---

### `GET /pets/:id` — Buscar pet por ID
- **Acesso:** Qualquer usuário autenticado
- **Parâmetro:** `id` (UUID)
- **Resposta de sucesso (200):** Objeto `pet` com todos os campos

---

### `PUT /pets/:id` — Atualizar pet
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Body:** Mesmo formato de `POST /pets`
- **Resposta de sucesso (200):** Objeto `pet` atualizado

---

### `DELETE /pets/:id` — Deletar pet
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Resposta de sucesso:** `204 No Content` (sem body)

---

### `PATCH /pets/:id/status` — Alterar status do pet
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Body:**

```json
{ "status": "unavailable" }
```

| Campo | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `status` | `string` | ✅ | `"available"`, `"unavailable"`, `"analysis"` |

- **Resposta de sucesso (200):**

```json
{ "message": "Status do pet atualizado com sucesso" }
```

---

### `PATCH /pets/:id/active` — Ativar/desativar pet
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
{ "message": "Status do pet atualizado com sucesso" }
```

# 📁 Domínio: Adoption (Adoções e Candidatos)

## Responsabilidade

Gerencia o fluxo completo de adoção de animais: cadastro de candidatos a adotante, abertura de processos de adoção e controle de status. Implementa políticas de negócio rigorosas para garantir a integridade do processo (candidato não banido, pet disponível, unidade correta). Possui controles de visibilidade por role e por propriedade de dados.

---

## Entidades

### `Adoption`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `UUID` | Identificador único |
| `petId` | `UUID` | Pet solicitado para adoção |
| `adopterId` | `UUID` | ID do candidato (`AdoptionCandidate`) |
| `unityId` | `UUID` | Unidade onde ocorre a adoção |
| `status` | `PENDING \| APPROVED \| REJECTED` | Status do processo (padrão: `PENDING`) |
| `createdAt` | `Date` | Data de criação |
| `updatedAt` | `Date` | Última atualização |

### Status da Adoção

| Valor | Significado |
|---|---|
| `PENDING` | Aguardando avaliação |
| `APPROVED` | Adoção aprovada |
| `REJECTED` | Adoção rejeitada |

---

### `AdoptionCandidate`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `UUID` | Identificador único |
| `email` | `string` | E-mail único do candidato |
| `name` | `string` | Nome completo |
| `cpf` | `CPF` | CPF validado (value object) |
| `phone` | `string` | Telefone de contato |
| `identityUrl` | `string (URL)` | URL da foto do documento de identidade |
| `isBanned` | `boolean` | Se está banido do processo (padrão: `false`) |
| `bannedReason` | `string?` | Motivo do banimento (opcional) |
| `userId` | `UUID?` | Vínculo com o usuário autenticado (opcional) |
| `createdAt` | `Date` | Data de criação |
| `updatedAt` | `Date` | Última atualização |

---

## Políticas de Negócio (Adoção)

Ao criar uma adoção, o sistema executa todas as políticas em sequência:

| Política | O que valida | Erro retornado |
|---|---|---|
| `EntityMustExistPolicy('Candidate')` | Candidato com o `adopterId` informado existe | `404 Not Found` |
| `EntityMustExistPolicy('Pet')` | Pet com o `petId` informado existe | `404 Not Found` |
| `EntityMustExistPolicy('Unit')` | Unidade com o `unityId` informado existe | `404 Not Found` |
| `CandidateMustNotBeBannedPolicy` | Candidato não está banido | `422 Unprocessable Entity` |
| `PetUnavailblePolicy` | Pet está com status `AVAILABLE` | `422 Unprocessable Entity` |
| `UnitAndPetDistincsPolicy` | Pet pertence à unidade informada | `422 Unprocessable Entity` |

Após criação bem-sucedida, o pet é automaticamente movido para status `ANALYSIS`.

---

## Regras de Negócio

### Adoções

1. **Qualquer usuário autenticado** pode abrir um processo de adoção, desde que o e-mail do candidato informado seja o mesmo do usuário logado (ou seja ADMIN).
2. **ADMIN vê todas as adoções.** ADOPTER vê apenas as adoções vinculadas ao seu candidato (identificado pelo e-mail).
3. **Somente ADMIN** pode buscar uma adoção por ID ou atualizar o status.
4. **Ao criar a adoção**, o sistema valida as 6 políticas descritas acima antes de persistir.

### Candidatos a Adoção

1. **Qualquer usuário autenticado** pode criar um candidato, mas somente com seu próprio e-mail. ADMIN pode cadastrar com qualquer e-mail.
2. **ADOPTER** pode ver apenas seus próprios dados de candidato (verificação por e-mail). ADMIN pode ver qualquer candidato.
3. **Somente ADMIN** pode listar todos os candidatos, atualizar dados e aplicar/remover banimento.
4. **Banimento:** Um candidato banido não pode abrir novos processos de adoção.
5. **CPF:** Validado via value object — aceita formatos `000.000.000-00` ou `00000000000`.

---

## Erros do Domínio

| Classe | Mensagem | HTTP |
|---|---|---|
| `CandidateBannedError` | `O candidato encontra-se bloqueado para o processo de adoção.` | 422 |
| `petUnavaliableError` | `Pet banido para adoçao` | 422 |
| `UnitAndPetDistincsError` | `esse pet não pertence a essa unidade` | 422 |
| `UnauthorizedEmailError` | `Você só pode criar registros com seu próprio e-mail.` | 403 |
| `UnauthorizedOwnershipError` | `Você só pode visualizar seus próprios dados.` | 403 |
| `NotFoundError` | `<entidade> não encontrado` | 404 |

---

## Rotas HTTP — Adoções

### `POST /adoptions` — Criar adoção
- **Acesso:** Qualquer usuário autenticado (com restrição de ownership)
- **Body:**

```json
{
  "petId": "uuid-do-pet",
  "adopterId": "uuid-do-candidato",
  "unityId": "uuid-da-unidade"
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `petId` | `string` | ✅ | UUID válido |
| `adopterId` | `string` | ✅ | UUID válido |
| `unityId` | `string` | ✅ | UUID válido |

- **Resposta de sucesso (201):**

```json
{
  "adoption": {
    "id": "uuid",
    "petId": "uuid",
    "adopterId": "uuid",
    "unityId": "uuid",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### `GET /adoptions` — Listar adoções
- **Acesso:** Qualquer usuário autenticado (resultado filtrado por role)
- **Comportamento:** ADMIN recebe todas; ADOPTER recebe apenas as do seu candidato
- **Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | `PENDING \| APPROVED \| REJECTED` (opcional) | Filtrar por status |
| `adopterId` | `UUID` (opcional) | Filtrar por candidato (apenas ADMIN) |
| `petId` | `UUID` (opcional) | Filtrar por pet |
| `unityId` | `UUID` (opcional) | Filtrar por unidade |
| `page` | `number` (opcional) | Página (padrão: 1) |
| `limit` | `number` (opcional) | Itens por página (padrão: 25, máx: 100) |

- **Resposta de sucesso (200):**

```json
{
  "adoptions": [ /* array de adoções */ ],
  "total": 5,
  "page": 1,
  "limit": 25
}
```

---

### `GET /adoptions/:id` — Buscar adoção por ID
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Resposta de sucesso (200):** Objeto `adoption`

---

### `PATCH /adoptions/:id/status` — Atualizar status da adoção
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Body:**

```json
{ "status": "APPROVED" }
```

| Campo | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `status` | `string` | ✅ | `PENDING`, `APPROVED`, `REJECTED` |

- **Resposta de sucesso (200):** Objeto `adoption` atualizado

---

## Rotas HTTP — Candidatos a Adoção

### `POST /adoption-candidates` — Criar candidato
- **Acesso:** Qualquer usuário autenticado (com restrição de e-mail)
- **Body:**

```json
{
  "email": "candidato@example.com",
  "name": "Maria Oliveira",
  "cpf": "123.456.789-09",
  "phone": "11999998888",
  "identityUrl": "https://storage.example.com/rg-maria.jpg"
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `email` | `string` | ✅ | E-mail válido |
| `name` | `string` | ✅ | Mínimo 2 caracteres |
| `cpf` | `string` | ✅ | Formato `000.000.000-00` ou `00000000000` |
| `phone` | `string` | ✅ | Mínimo 10 caracteres |
| `identityUrl` | `string` | ✅ | URL válida |

- **Resposta de sucesso (201):**

```json
{
  "adoptionCandidate": {
    "id": "uuid",
    "name": "Maria Oliveira",
    "cpf": "123.456.789-09",
    "phone": "11999998888",
    "identityUrl": "https://storage.example.com/rg-maria.jpg",
    "isBanned": false,
    "bannedReason": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### `GET /adoption-candidates` — Listar candidatos
- **Acesso:** Somente `ADMIN`
- **Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `name` | `string` (opcional) | Filtrar por nome |
| `cpf` | `string` (opcional) | Filtrar por CPF |
| `isBanned` | `"true" \| "false"` (opcional) | Filtrar por banimento |
| `page` | `number` (opcional) | Página (padrão: 1) |
| `limit` | `number` (opcional) | Itens por página (padrão: 25, máx: 100) |

- **Resposta de sucesso (200):**

```json
{
  "candidates": [ /* array de candidatos */ ],
  "total": 20,
  "page": 1,
  "limit": 25
}
```

---

### `GET /adoption-candidates/:id` — Buscar candidato por ID
- **Acesso:** Usuário autenticado dono do cadastro **ou** ADMIN
- **Parâmetro:** `id` (UUID)
- **Resposta de sucesso (200):** Objeto `adoptionCandidate`

---

### `PUT /adoption-candidates/:id` — Atualizar candidato
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Body:**

```json
{
  "name": "Maria Oliveira Santos",
  "phone": "11988887777",
  "identityUrl": "https://storage.example.com/rg-novo.jpg"
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `name` | `string` | ✅ | Mínimo 2 caracteres |
| `phone` | `string` | ✅ | Mínimo 10 caracteres |
| `identityUrl` | `string` | ✅ | URL válida |

- **Resposta de sucesso (200):** Objeto `adoptionCandidate` atualizado

---

### `PATCH /adoption-candidates/:id/ban` — Banir/desbanir candidato
- **Acesso:** Somente `ADMIN`
- **Parâmetro:** `id` (UUID)
- **Body:**

```json
{
  "isBanned": true,
  "bannedReason": "Maus-tratos registrados no processo anterior."
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `isBanned` | `boolean` | ✅ | — |
| `bannedReason` | `string` | ✅ | Mínimo 5 caracteres |

- **Resposta de sucesso (200):** Objeto `adoptionCandidate` atualizado com `isBanned: true`

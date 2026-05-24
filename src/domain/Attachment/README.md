# 📁 Domínio: Attachment (Arquivos)

## Responsabilidade

Gerencia o upload e armazenamento de arquivos (fotos de pets e documentos de identidade de candidatos). Fornece um `attachmentId` que é referenciado ao criar ou atualizar pets e unidades.

---

## Entidades

### `Attachment`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `UUID` | Identificador único |
| `title` | `string` | Nome original do arquivo enviado |
| `link` | `string` | Caminho/URL de acesso ao arquivo |

---

## Regras de Negócio

1. **Qualquer usuário autenticado** pode realizar o upload de arquivos.
2. **Tipos permitidos:** `image/jpeg`, `image/png`, `image/webp`.
3. **Tamanho máximo:** 10 MB por arquivo.
4. **Formato do upload:** `multipart/form-data` com o campo `file`.
5. O `attachmentId` retornado deve ser passado no array `attachmentIds` ao criar/atualizar um pet ou unidade.

---

## Erros do Domínio

| Situação | Mensagem | HTTP |
|---|---|---|
| Arquivo não enviado | `Arquivo não enviado` | 400 Bad Request |
| Tipo de arquivo inválido | `Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.` | 400 Bad Request |
| Arquivo excede o tamanho máximo | Erro do Multer | 400 Bad Request |

---

## Rotas HTTP

### `POST /attachments` — Upload de arquivo
- **Acesso:** Qualquer usuário autenticado
- **Content-Type:** `multipart/form-data`
- **Campo do formulário:** `file`
- **Tipos aceitos:** `image/jpeg`, `image/png`, `image/webp`
- **Tamanho máximo:** 10 MB

**Exemplo de request (cURL):**

```bash
curl -X POST http://localhost:3333/attachments \
  -H "Cookie: access_token=<seu_token>" \
  -F "file=@/caminho/para/foto.jpg"
```

- **Resposta de sucesso (200):**

```json
{
  "attachment": {
    "id": "uuid-do-attachment",
    "title": "foto.jpg",
    "link": "/uploads/foto.jpg"
  }
}
```

> Use o `id` retornado no campo `attachmentIds` ao criar ou atualizar um pet.

---

## Fluxo de Uso Típico

```
1. ADMIN faz upload de foto → POST /attachments → recebe { attachment: { id, title, link } }
2. ADMIN usa o id no cadastro do pet → POST /pets com attachmentIds: ["uuid-retornado"]
3. Ao buscar o pet, a foto aparece no array attachments com id, title e link
```

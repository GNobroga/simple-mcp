# fastify-mcp

API simples em **Fastify** com um servidor **MCP** (Model Context Protocol) que permite a um agente de IA buscar os posts de um usuário.

## Tecnologias

- Node.js + TypeScript (rodando com `tsx`)
- Fastify + Zod
- Prisma + SQLite
- MCP SDK (`@modelcontextprotocol/sdk`)

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` na raiz:

   ```env
   DATABASE_URL="file:./dev.db"
   PORT=8080
   ```

3. Crie o banco e popule com dados de exemplo:

   ```bash
   npm run prisma -- generate
   npm run migrate:deploy
   npm run db:seed
   ```

   O seed cria o usuário `admin` (senha `admin`) com um post e um comentário.

4. Inicie o servidor:

   ```bash
   npm start
   ```

   O servidor sobe em `http://localhost:8080`.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/posts/users/:id` | Lista os posts do usuário |
| POST | `/mcp` | Endpoint do servidor MCP |

Exemplo:

```
http://localhost:8080/posts/users/1
```

## MCP

- **URL:** `http://localhost:8080/mcp`
- **Transporte:** Streamable HTTP (só aceita `POST`, por isso não abre no navegador)

### Tools disponíveis

| Tool | Parâmetros | Descrição |
|---|---|---|
| `get_posts` | `userId` (string) | Retorna os posts de um usuário |

### Conectando

O projeto já tem um arquivo `.mcp.json`:

```json
{
  "mcpServers": {
    "fastify-mcp": {
      "type": "http",
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

Para testar visualmente, use o MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

Escolha **Streamable HTTP** e informe `http://localhost:8080/mcp`.

> Depois de alterar o código, reinicie o servidor (`Ctrl+C` e `npm start`).

## Estrutura

```
prisma/              # schema, models e migrations
src/
  server.ts          # servidor Fastify + MCP
  config/env.ts      # validação das variáveis de ambiente
  database/          # cliente Prisma e seed
  lib/               # utilitários (hash de senha)
  generated/prisma/  # cliente Prisma gerado
```

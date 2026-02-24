# RAG API

API REST completa para RAG com **ChromaDB**, **LangChain** e **Ollama** — 100% local, sem depender de APIs externas.

## Stack

| Pacote | Versão |
|--------|--------|
| TypeScript | 5.9.3 |
| Express | 5.2.1 |
| chromadb | 3.3.1 |
| @langchain/community | 1.1.17 |
| @langchain/core | 1.1.27 |
| @langchain/ollama | 1.2.4 |
| langchain | 1.2.25 |
| zod | 4.6.3 |
| swagger-jsdoc | 6.2.8 |
| swagger-ui-express | 5.0.1 |
| uuid | 13.0.0 |

## Modelos Ollama padrão

| Função | Modelo | Alternativas |
|--------|--------|-------------|
| Embeddings | `nomic-embed-text` | `mxbai-embed-large`, `all-minilm` |
| LLM | `llama3.2` | `mistral`, `gemma2`, `phi4` |

## Setup

```bash
# 1. Subir ChromaDB + Ollama
docker compose up -d

# 2. Baixar os modelos (só na primeira vez)
docker exec -it rag-api-ollama-1 ollama pull nomic-embed-text
docker exec -it rag-api-ollama-1 ollama pull llama3.2

# 3. Instalar dependências
npm install

# 4. Configurar variáveis de ambiente
cp .env.example .env

# 5. Rodar em modo dev
npm run dev
```

Acesse a documentação interativa em **http://localhost:3000/docs**

---

## Endpoints

### Collections

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/collections` | Lista todas as collections |
| `POST` | `/collections` | Cria uma collection |
| `GET` | `/collections/:name` | Detalhes e contagem de documentos |
| `DELETE` | `/collections/:name` | Deleta a collection |

### Documents

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/collections/:name/documents` | Adiciona documentos com chunking automático |
| `GET` | `/collections/:name/documents/search?q=&k=` | Busca semântica por similaridade |
| `DELETE` | `/collections/:name/documents` | Deleta documentos por IDs |

### Chat

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/chat/sessions` | Inicia uma sessão de chat |
| `POST` | `/chat/sessions/:id/messages` | Envia mensagem e recebe resposta |
| `GET` | `/chat/sessions/:id/messages` | Histórico completo da sessão |
| `DELETE` | `/chat/sessions/:id` | Deleta sessão e histórico |

---

## Exemplos

### 1. Criar collection e indexar documentos

```bash
# Criar collection
curl -X POST http://localhost:3000/collections \
  -H "Content-Type: application/json" \
  -d '{ "name": "minha-base" }'

# Adicionar documentos
curl -X POST http://localhost:3000/collections/minha-base/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "O produto X possui garantia de 2 anos cobrindo defeitos de fabricação.",
        "metadata": { "source": "manual.pdf", "page": 5 }
      }
    ],
    "chunkSize": 500,
    "chunkOverlap": 100
  }'
```

### 2. Chat com contexto persistente

```bash
# Criar sessão
curl -X POST http://localhost:3000/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{ "collectionName": "minha-base" }'
# → { "sessionId": "uuid-aqui", "collectionName": "minha-base" }

# Enviar mensagem
curl -X POST http://localhost:3000/chat/sessions/uuid-aqui/messages \
  -H "Content-Type: application/json" \
  -d '{ "message": "Qual é a garantia do produto X?" }'

# Mensagem de follow-up (usa histórico)
curl -X POST http://localhost:3000/chat/sessions/uuid-aqui/messages \
  -H "Content-Type: application/json" \
  -d '{ "message": "E o que ela cobre exatamente?" }'

# Ver histórico completo
curl http://localhost:3000/chat/sessions/uuid-aqui/messages
```

---

## Como o contexto funciona

```
Mensagem do usuário
       ↓
[ChromaDB] busca os K chunks mais relevantes da collection
       ↓
[ChromaDB] recupera o histórico da sessão (chat_history)
       ↓
[Ollama] recebe: system prompt + contexto + histórico + pergunta
       ↓
[ChromaDB] persiste pergunta e resposta no histórico
       ↓
Resposta + fontes utilizadas
```

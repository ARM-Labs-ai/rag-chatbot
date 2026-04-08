# Análise arquitetural e sugestões de melhoria

## Visão geral
O repositório já possui uma estrutura inicial em camadas (`adapters`, `use-cases`, `infrastructure`, `config`), porém ainda há acoplamento forte entre HTTP, casos de uso e implementação concreta de persistência/embeddings.

## Pontos fortes
- Separação básica de responsabilidades entre rota HTTP, caso de uso e infraestrutura.
- Uso consistente de TypeScript em modo estrito.
- Testes de integração cobrindo fluxo principal de collections.

## Oportunidades de melhoria

### 1) Corrigir contrato de inicialização da aplicação
**Problema**: `src/index.ts` exporta o retorno de `.listen(...)`, que é um `Server`, não uma instância de `express.Application`. Isso torna os testes e composição da aplicação mais frágeis.

**Sugestão**:
- Criar `src/app.ts` com a configuração do Express e exportar `app` (sem `listen`).
- Manter `src/index.ts` apenas como bootstrap (`app.listen(...)`).
- Atualizar testes para importar `app` de `app.ts`.

**Ganho**: testabilidade, lifecycle claro e menor acoplamento com I/O de rede.

### 2) Introduzir portas (interfaces) para infraestrutura
**Problema**: casos de uso dependem diretamente de funções concretas de `@infra/chromadb/collections`.

**Sugestão**:
- Definir portas no domínio/aplicação, por exemplo:
  - `CollectionRepository` com `list/create/remove`
  - `EmbeddingProvider` se necessário
- Injetar implementação concreta no bootstrap (composition root).

**Ganho**: troca de backend (ChromaDB, pgvector, Qdrant) sem alterar caso de uso; melhor isolamento para testes unitários.

### 3) Validar input e padronizar erros HTTP
**Problema**: rotas aceitam `req.body.name` sem validação e não há middleware global de erro.

**Sugestão**:
- Adotar schema validation (Zod já está no projeto) para params/body/query.
- Criar classes de erro de aplicação (`ValidationError`, `NotFoundError`, `ConflictError`).
- Middleware único para mapear erros para status code e payload padronizado.

**Ganho**: contrato de API previsível e menos falhas em runtime.

### 4) Tratar idempotência e conflitos na criação de collection
**Problema**: `createCollection` pode falhar por nome duplicado dependendo do comportamento do cliente Chroma.

**Sugestão**:
- Decidir contrato explícito:
  - `POST /collections` retorna `409` se já existir, **ou**
  - `PUT /collections/:name` para operação idempotente.
- Documentar claramente no README e testes.

**Ganho**: semântica REST mais clara.

### 5) Reforçar tipagem de DTOs de entrada/saída
**Problema**: rotas retornam objetos da SDK (`Collection`) diretamente, inclusive campos internos (`_name`).

**Sugestão**:
- Definir DTOs públicos (`CollectionResponse`) desacoplados da SDK.
- Mapear entidades internas para DTO no adapter HTTP.

**Ganho**: API estável mesmo com mudanças de biblioteca.

### 6) Organizar observabilidade mínima
**Problema**: logs apenas via `console.log` no bootstrap.

**Sugestão**:
- Introduzir logger estruturado (pino/winston).
- Incluir `requestId` por request e latência básica.
- Expor endpoint de healthcheck (`/health`) e readiness (`/ready`).

**Ganho**: diagnóstico e operação em produção facilitados.

### 7) Melhorar estratégia de testes
**Problema**: testes de integração sobem contra serviços reais e não há cobertura unitária dos casos de uso.

**Sugestão**:
- Criar testes unitários para `use-cases` com repositórios fake.
- Manter integração para contrato HTTP + infraestrutura.
- Avaliar `testcontainers` para isolamento por suíte.

**Ganho**: feedback mais rápido e testes menos frágeis.

### 8) Versão da API e modularização por domínio
**Problema**: tudo está sob um único conjunto pequeno de rotas, mas README já prevê escopo maior (documents/chat).

**Sugestão**:
- Introduzir prefixo `/v1` desde já.
- Modularizar por bounded context:
  - `collections`
  - `documents`
  - `chat`
- Em cada módulo: `domain`, `application`, `infrastructure`, `adapters`.

**Ganho**: crescimento sustentável para próximos endpoints.

## Roadmap sugerido (ordem de implementação)
1. Separar `app` de `server` + middleware global de erro.
2. Validar entradas com Zod e definir DTOs HTTP.
3. Introduzir portas/repositórios e injeção de dependência simples.
4. Expandir testes unitários e estabilizar integração.
5. Adicionar observabilidade e health checks.

## Resultado esperado
Com essas mudanças, o projeto migra de uma arquitetura em camadas “estrutural” para uma arquitetura orientada a casos de uso e portas/adapters mais robusta, preparada para evolução de features RAG (documents/search/chat) sem acoplamento excessivo ao stack atual.

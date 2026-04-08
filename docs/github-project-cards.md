# GitHub Project: melhorias de arquitetura

Este repositório inclui um script para criar automaticamente um **Project v2** no GitHub e adicionar cards (draft issues) com as melhorias arquiteturais propostas.

## Pré-requisitos

- Token GitHub em `GITHUB_TOKEN` com permissões para Projects.
- Definir `GITHUB_OWNER` com login do usuário/organização que será dono do projeto.
- Node.js 18+.

## Execução

```bash
# Simulação (não cria nada)
DRY_RUN=1 GITHUB_OWNER=<owner> node scripts/create-github-project.mjs

# Criação real
GITHUB_TOKEN=<token> \
GITHUB_OWNER=<owner> \
GITHUB_OWNER_TYPE=USER \
PROJECT_TITLE="RAG API – Architecture Improvements" \
PROJECT_VISIBILITY=PRIVATE \
node scripts/create-github-project.mjs
```

## Cards criados automaticamente

1. Separar app de server
2. Introduzir portas e repositórios
3. Validação com Zod + middleware global de erro
4. Definir contrato REST para criação de collections
5. DTOs HTTP desacoplados da SDK
6. Observabilidade mínima
7. Evoluir estratégia de testes
8. Versionamento e modularização por domínio

## Observações

- O script usa a API GraphQL do GitHub (`createProjectV2`, `updateProjectV2`, `addProjectV2DraftIssue`).
- Se preferir, você pode transformar draft issues em issues reais depois, dentro do próprio Project.

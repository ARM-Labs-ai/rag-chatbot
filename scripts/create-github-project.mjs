#!/usr/bin/env node

/**
 * Create a GitHub Project (Projects v2) and add architecture-improvement cards as draft issues.
 *
 * Required env vars:
 * - GITHUB_TOKEN: GitHub personal access token with project scope
 * - GITHUB_OWNER: user or org login that will own the project
 *
 * Optional env vars:
 * - GITHUB_OWNER_TYPE: USER (default) or ORGANIZATION
 * - PROJECT_TITLE: defaults to "RAG API – Architecture Improvements"
 * - PROJECT_DESCRIPTION: defaults to a generated summary
 * - PROJECT_VISIBILITY: PRIVATE (default) | PUBLIC
 * - DRY_RUN: "1" to print payloads without calling GitHub API
 */

const API_URL = "https://api.github.com/graphql";

const CARDS = [
  {
    title: "Separar app de server",
    body: "Criar `src/app.ts` para configuração do Express e manter `src/index.ts` apenas como bootstrap (`listen`)."
  },
  {
    title: "Introduzir portas e repositórios",
    body: "Adicionar interfaces como `CollectionRepository` e injetar implementações concretas no composition root."
  },
  {
    title: "Validação com Zod + middleware global de erro",
    body: "Validar body/params/query e padronizar respostas de erro com tipos de erro de aplicação."
  },
  {
    title: "Definir contrato REST para criação de collections",
    body: "Escolher semântica explícita para conflitos/idempotência (`POST` com 409 ou `PUT` idempotente)."
  },
  {
    title: "DTOs HTTP desacoplados da SDK",
    body: "Mapear respostas para DTOs públicos e evitar expor campos internos da SDK (`_name`, etc.)."
  },
  {
    title: "Observabilidade mínima",
    body: "Adicionar logger estruturado, requestId, métricas básicas e endpoints `/health` e `/ready`."
  },
  {
    title: "Evoluir estratégia de testes",
    body: "Adicionar testes unitários de use-cases com fakes e manter integração para contrato HTTP + infra."
  },
  {
    title: "Versionamento e modularização por domínio",
    body: "Introduzir prefixo `/v1` e organizar módulos por contextos: collections, documents e chat."
  }
];

const env = process.env;
const token = env.GITHUB_TOKEN;
const ownerLogin = env.GITHUB_OWNER;
const ownerType = (env.GITHUB_OWNER_TYPE || "USER").toUpperCase();
const projectTitle = env.PROJECT_TITLE || "RAG API – Architecture Improvements";
const projectDescription = env.PROJECT_DESCRIPTION || "Roadmap de melhorias arquiteturais para evolução de collections, documents e chat.";
const projectVisibility = (env.PROJECT_VISIBILITY || "PRIVATE").toUpperCase();
const dryRun = env.DRY_RUN === "1";

if (!ownerLogin) {
  console.error("Missing GITHUB_OWNER env var.");
  process.exit(1);
}

if (!dryRun && !token) {
  console.error("Missing GITHUB_TOKEN env var (or use DRY_RUN=1).");
  process.exit(1);
}

async function graphql(query, variables = {}) {
  if (dryRun) {
    console.log("[DRY_RUN] GraphQL call:");
    console.log(JSON.stringify({ query, variables }, null, 2));
    return {};
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await response.json();

  if (!response.ok || json.errors) {
    console.error("GitHub GraphQL error:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  return json.data;
}

async function getOwnerId() {
  const query = ownerType === "ORGANIZATION"
    ? `query($login: String!) { organization(login: $login) { id login } }`
    : `query($login: String!) { user(login: $login) { id login } }`;

  const data = await graphql(query, { login: ownerLogin });

  if (dryRun) {
    return "DRY_RUN_OWNER_ID";
  }

  const owner = ownerType === "ORGANIZATION" ? data.organization : data.user;
  if (!owner?.id) {
    console.error(`Could not resolve owner id for ${ownerType} ${ownerLogin}`);
    process.exit(1);
  }

  return owner.id;
}

async function createProject(ownerId) {
  const mutation = `
    mutation($input: CreateProjectV2Input!) {
      createProjectV2(input: $input) {
        projectV2 {
          id
          title
          url
        }
      }
    }
  `;

  const data = await graphql(mutation, {
    input: {
      ownerId,
      title: projectTitle,
      repositoryId: null
    }
  });

  if (dryRun) {
    return { id: "DRY_RUN_PROJECT_ID", url: "https://github.com/orgs/OWNER/projects/0" };
  }

  const project = data.createProjectV2?.projectV2;
  if (!project?.id) {
    console.error("Failed to create project.");
    process.exit(1);
  }

  return project;
}

async function updateProject(projectId) {
  const mutation = `
    mutation($input: UpdateProjectV2Input!) {
      updateProjectV2(input: $input) {
        projectV2 {
          id
          title
          shortDescription
          public
        }
      }
    }
  `;

  await graphql(mutation, {
    input: {
      projectId,
      title: projectTitle,
      shortDescription: projectDescription,
      public: projectVisibility === "PUBLIC"
    }
  });
}

async function addDraftIssue(projectId, card) {
  const mutation = `
    mutation($input: AddProjectV2DraftIssueInput!) {
      addProjectV2DraftIssue(input: $input) {
        projectItem {
          id
        }
      }
    }
  `;

  await graphql(mutation, {
    input: {
      projectId,
      title: card.title,
      body: card.body
    }
  });
}

async function main() {
  const ownerId = await getOwnerId();
  const project = await createProject(ownerId);

  await updateProject(project.id);

  for (const card of CARDS) {
    await addDraftIssue(project.id, card);
  }

  console.log("Project created and cards added successfully.");
  console.log(`Project URL: ${project.url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

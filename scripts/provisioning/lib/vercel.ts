/**
 * Thin wrapper over the Vercel REST API for provisioning one project per
 * client, all linked to the same GitHub repo (RogerFounder/Nexis-drive) —
 * this is what makes the white-label model work: one codebase, N deployments
 * differentiated entirely by environment variables.
 */

const VERCEL_API_BASE = "https://api.vercel.com";
const GIT_REPO = "RogerFounder/Nexis-drive";
const GIT_ORG = "RogerFounder";
const GIT_REPO_NAME = "Nexis-drive";
const PRODUCTION_BRANCH = "main";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não está definida em .env.provisioning.`);
  return value;
}

async function vercelFetch(path: string, init: RequestInit): Promise<unknown> {
  const token = requireEnv("VERCEL_API_TOKEN");
  const response = await fetch(`${VERCEL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Vercel API ${path} falhou (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

/** Creates a new Vercel project linked to the shared repo. `name` must be a valid slug. */
export async function createVercelProject(name: string): Promise<{ projectId: string }> {
  const body = (await vercelFetch("/v11/projects", {
    method: "POST",
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: { type: "github", repo: GIT_REPO },
    }),
  })) as { id: string };

  return { projectId: body.id };
}

/** Sets one env var on both Production and Preview targets. */
export async function setVercelEnvVar(
  projectId: string,
  key: string,
  value: string,
  sensitive = true
): Promise<void> {
  await vercelFetch(`/v10/projects/${projectId}/env`, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      target: ["production", "preview"],
      type: sensitive ? "sensitive" : "plain",
    }),
  });
}

export async function setVercelEnvVars(
  projectId: string,
  vars: Record<string, string>
): Promise<void> {
  for (const [key, value] of Object.entries(vars)) {
    await setVercelEnvVar(projectId, key, value);
  }
}

/** Triggers a production deployment of the current `main` branch. */
export async function triggerVercelDeployment(
  projectId: string,
  projectName: string
): Promise<{ deploymentUrl: string }> {
  const body = (await vercelFetch("/v13/deployments", {
    method: "POST",
    body: JSON.stringify({
      name: projectName,
      project: projectId,
      target: "production",
      gitSource: {
        type: "github",
        ref: PRODUCTION_BRANCH,
        org: GIT_ORG,
        repo: GIT_REPO_NAME,
      },
    }),
  })) as { url: string };

  return { deploymentUrl: `https://${body.url}` };
}

/** Rollback helper — deletes a Vercel project if a later provisioning step fails. */
export async function deleteVercelProject(projectId: string): Promise<void> {
  await vercelFetch(`/v9/projects/${projectId}`, { method: "DELETE" });
}

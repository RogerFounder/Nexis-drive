/**
 * Thin wrapper over the Neon API (https://api-docs.neon.tech) for
 * provisioning one isolated Postgres project per client. Verified against
 * the live API on 2026-07-10 (created and deleted a real test project to
 * confirm the response shape — the docs don't spell out pooled vs. direct
 * connection string construction).
 */

const NEON_API_BASE = "https://console.neon.tech/api/v2";

interface NeonProjectResult {
  projectId: string;
  databaseUrl: string;
  directUrl: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não está definida em .env.provisioning.`);
  return value;
}

async function neonFetch(path: string, init: RequestInit): Promise<unknown> {
  const apiKey = requireEnv("NEON_API_KEY");
  const response = await fetch(`${NEON_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Neon API ${path} falhou (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

/** Creates a new Neon project (one Postgres database) for a client. */
export async function createNeonProject(name: string): Promise<NeonProjectResult> {
  const orgId = requireEnv("NEON_ORG_ID");

  const body = (await neonFetch("/projects", {
    method: "POST",
    body: JSON.stringify({
      project: {
        name,
        org_id: orgId,
        region_id: "aws-us-east-1",
        pg_version: 18,
      },
    }),
  })) as {
    project: { id: string };
    connection_uris: [
      {
        connection_parameters: {
          database: string;
          password: string;
          role: string;
          host: string;
          pooler_host: string;
        };
      },
    ];
  };

  const { database, password, role, host, pooler_host } = body.connection_uris[0].connection_parameters;

  return {
    projectId: body.project.id,
    databaseUrl: `postgresql://${role}:${password}@${pooler_host}/${database}?sslmode=require`,
    directUrl: `postgresql://${role}:${password}@${host}/${database}?sslmode=require`,
  };
}

/** Rollback helper — deletes a Neon project if a later provisioning step fails. */
export async function deleteNeonProject(projectId: string): Promise<void> {
  await neonFetch(`/projects/${projectId}`, { method: "DELETE" });
}

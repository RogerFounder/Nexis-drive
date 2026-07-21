/**
 * Triggers the GitHub Actions provisioning workflow via workflow_dispatch.
 *
 * Required env var: GITHUB_DISPATCH_TOKEN
 *   Fine-Grained PAT scoped ONLY to:
 *   - Repository: RogerFounder/Nexis-drive
 *   - Permission: Actions: write  (enables workflow_dispatch)
 *   No other permissions — no contents, secrets, or administration access.
 */

const REPO = "RogerFounder/Nexis-drive";
const WORKFLOW_FILE = "provision-client.yml";
const BRANCH = "main";

export interface ProvisioningInputs {
  provisioningRequestId: string;
  clientName: string;
  clientSlug: string;
  vertical: string;
  adminEmail: string;
  cpfCnpj: string;
  asaasCustomerId: string;
  asaasSubscriptionId: string;
}

export async function dispatchProvisioningWorkflow(inputs: ProvisioningInputs): Promise<void> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) throw new Error("GITHUB_DISPATCH_TOKEN não configurado.");

  const url = `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: BRANCH, inputs }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub Actions dispatch falhou (${response.status}): ${body}`);
  }
}

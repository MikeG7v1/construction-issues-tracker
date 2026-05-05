import type { ConstructionIssue, IssueUpdateInput } from '@/types'

const NETWORK_DELAY_MS = 500

function delay(ms = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function createIssue(issue: ConstructionIssue): Promise<ConstructionIssue> {
  await delay()
  return { ...issue }
}

async function updateIssue(
  issueId: string,
  patch: IssueUpdateInput,
): Promise<{ issueId: string; patch: IssueUpdateInput }> {
  await delay()
  return { issueId, patch }
}

async function deleteIssue(issueId: string): Promise<{ issueId: string }> {
  await delay()
  return { issueId }
}

export function useApi() {
  return {
    createIssue,
    updateIssue,
    deleteIssue,
  }
}

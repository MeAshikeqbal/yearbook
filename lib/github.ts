import { prisma } from "./prisma";

const GITHUB_OWNER = "MeAshikeqbal";
const GITHUB_REPO = "yearbook";

// Retrieve the token: user session token takes priority, then fallback to environment variables
function getAuthToken(sessionToken?: string): string | undefined {
  return sessionToken || process.env.GITHUB_PAT || process.env.GITHUB_TOKEN || undefined;
}

interface GitHubUser {
  login: string;
}

interface GitHubLabel {
  name: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  html_url: string;
  user: GitHubUser | null;
  labels: GitHubLabel[];
  pull_request?: any;
  created_at: string;
}

/**
 * Fetches all issues from the GitHub repository.
 */
export async function fetchGithubIssues(sessionToken?: string): Promise<GitHubIssue[]> {
  const token = getAuthToken(sessionToken);
  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Yearbook-Bug-Tracker",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=all&per_page=100`;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 0 }, // Bypass caching
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`GitHub API error (${res.status}):`, errorText);
    throw new Error(`Failed to fetch issues from GitHub: ${res.statusText}`);
  }

  return res.json() as Promise<GitHubIssue[]>;
}

/**
 * Creates a new issue on GitHub.
 */
export async function createGithubIssue(
  title: string,
  description: string,
  sessionToken?: string
): Promise<{ number: number; htmlUrl: string }> {
  const token = getAuthToken(sessionToken);
  if (!token) {
    throw new Error("GitHub authentication token is not configured.");
  }

  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Yearbook-Bug-Tracker",
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title,
      body: description,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`GitHub Create Issue error (${res.status}):`, errorText);
    throw new Error(`Failed to create issue on GitHub: ${res.statusText}`);
  }

  const issue = (await res.json()) as GitHubIssue;
  return {
    number: issue.number,
    htmlUrl: issue.html_url,
  };
}

/**
 * Synchronizes GitHub issues into the local Prisma database.
 */
export async function syncIssuesWithDatabase(sessionToken?: string) {
  const githubIssues = await fetchGithubIssues(sessionToken);
  let syncCount = 0;

  for (const issue of githubIssues) {
    // Skip pull requests
    if (issue.pull_request) {
      continue;
    }

    // Determine status
    let mappedStatus = "OPEN";
    if (issue.state === "closed") {
      mappedStatus = "RESOLVED";
    } else {
      const hasInProgressLabel = issue.labels.some((l) => {
        const name = l.name.toLowerCase();
        return name === "in-progress" || name === "in progress" || name === "working";
      });
      if (hasInProgressLabel) {
        mappedStatus = "IN_PROGRESS";
      }
    }

    // Upsert local bug record
    await prisma.bug.upsert({
      where: { githubNumber: issue.number },
      update: {
        title: issue.title,
        description: issue.body || "",
        status: mappedStatus,
        githubUrl: issue.html_url,
      },
      create: {
        title: issue.title,
        description: issue.body || "",
        status: mappedStatus,
        githubNumber: issue.number,
        githubUrl: issue.html_url,
        reporter: `GitHub: @${issue.user?.login || "anonymous"}`,
        createdAt: new Date(issue.created_at),
      },
    });

    syncCount++;
  }

  return syncCount;
}

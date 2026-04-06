export interface CommitEntry {
  timeAgo: string;
  plainEnglish: string;
  repo: string;
  url: string;
}

export interface GitHubActivity {
  commits: CommitEntry[];
  latestCommit: { timeAgo: string; repo: string } | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface GitHubEvent {
  type: string;
  repo: { name: string; url: string };
  payload: {
    commits?: Array<{ message: string; url?: string; sha?: string }>;
    ref?: string;
  };
  created_at: string;
}

export async function fetchGitHubActivity(): Promise<GitHubActivity> {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return { commits: [], latestCommit: null };
  }

  const res = await fetch(
    `https://api.github.com/users/${username}/events/public?per_page=50`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "feruza-portfolio",
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) return { commits: [], latestCommit: null };

  const events: GitHubEvent[] = await res.json();

  const pushEvents = events
    .filter((e) => e.type === "PushEvent" && e.payload.commits?.length)
    .slice(0, 15);

  if (pushEvents.length === 0) return { commits: [], latestCommit: null };

  // Collect raw commits
  const rawCommits = pushEvents.flatMap((event) =>
    (event.payload.commits || []).map((c) => ({
      message: c.message.split("\n")[0].trim(), // first line only
      repo: event.repo.name.replace(`${username}/`, ""),
      date: event.created_at,
      url: `https://github.com/${event.repo.name}/commit/${c.sha || ""}`,
    }))
  ).slice(0, 10);

  return {
    commits: rawCommits.map((c) => ({
      timeAgo: timeAgo(c.date),
      plainEnglish: c.message, // will be translated by Claude in the API route
      repo: c.repo,
      url: c.url,
    })),
    latestCommit: rawCommits[0]
      ? {
          timeAgo: timeAgo(rawCommits[0].date),
          repo: rawCommits[0].repo,
        }
      : null,
  };
}

import { NextResponse } from "next/server";
import { fetchGitHubActivity } from "@/lib/github";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const revalidate = 300;

export async function GET() {
  try {
    const activity = await fetchGitHubActivity();

    if (activity.commits.length === 0) {
      return NextResponse.json(activity);
    }

    const rawMessages = activity.commits.map((c) => c.plainEnglish).join("\n");

    const { text } = await generateText({
      model: anthropic("claude-opus-4.6"),
      prompt: `Rewrite each of these git commit messages as one plain English sentence of ≤12 words. No jargon. Write for someone who doesn't code. Return one sentence per line, same order, nothing else.\n\n${rawMessages}`,
    });

    const translated = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const commits = activity.commits.map((c, i) => ({
      ...c,
      plainEnglish: translated[i] || c.plainEnglish,
    }));

    return NextResponse.json({
      commits,
      latestCommit: activity.latestCommit,
    });
  } catch (error) {
    console.error("GitHub activity error:", error);
    return NextResponse.json({ commits: [], latestCommit: null });
  }
}

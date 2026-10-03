#!/usr/bin/env node
// Refreshes the "Recent Activity" block of README.md from the public GitHub
// Events API.
//
// GitHub trimmed the Events API payloads in 2025: push events no longer carry
// a commit count and pull requests no longer carry their URL. That is why the
// old third-party action printed "undefined". This script builds every link
// from the repository name and the PR/issue number, and skips any field that
// is missing instead of printing it.
//
// Usage: node .github/scripts/recent-activity.mjs
//
// Optional environment variables:
//   GITHUB_USERNAME  account to read (default: IsmaellHV)
//   GITHUB_TOKEN     token for a higher API rate limit
//   MAX_ITEMS        number of lines to show (default: 5)
//   README_PATH      file to update (default: README.md)
//   EVENTS_FILE      read events from a JSON file instead of the API (local testing)

import { readFile, writeFile } from 'node:fs/promises';

const USERNAME = process.env.GITHUB_USERNAME || 'IsmaellHV';
const MAX_ITEMS = Number.parseInt(process.env.MAX_ITEMS ?? '', 10) || 5;
const README_PATH = process.env.README_PATH || 'README.md';
const START = '<!--RECENT_ACTIVITY:start-->';
const END = '<!--RECENT_ACTIVITY:end-->';

// Activity on the profile repository itself is not interesting to visitors.
const IGNORED_REPOS = new Set([`${USERNAME}/${USERNAME}`.toLowerCase()]);

const escapeMarkdown = (text) => String(text).replace(/[\\`*_[\]<>]/g, '\\$&');
const repoLink = (repo) => `[${escapeMarkdown(repo)}](https://github.com/${repo})`;
const numberLink = (repo, kind, number) => `[#${number}](https://github.com/${repo}/${kind}/${number})`;
const tagPath = (tag) => tag.split('/').map(encodeURIComponent).join('/');
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** Turns one API event into a feed entry, or null when it should be skipped. */
function toEntry(event) {
  const repo = event?.repo?.name;
  if (!repo || IGNORED_REPOS.has(repo.toLowerCase())) return null;
  const payload = event.payload ?? {};

  switch (event.type) {
    case 'PushEvent': {
      const commits = payload.size ?? payload.commits?.length;
      return { type: 'push', repo, commits: Number.isInteger(commits) ? commits : null };
    }
    case 'PullRequestEvent': {
      const number = payload.number ?? payload.pull_request?.number;
      if (!number) return null;
      const pr = numberLink(repo, 'pull', number);
      if (payload.action === 'opened' || payload.action === 'reopened') {
        return { text: `💪 Opened PR ${pr} in ${repoLink(repo)}` };
      }
      const merged = payload.action === 'merged' || (payload.action === 'closed' && payload.pull_request?.merged === true);
      return merged ? { text: `🔀 Merged PR ${pr} in ${repoLink(repo)}` } : null;
    }
    case 'PullRequestReviewEvent': {
      const number = payload.pull_request?.number;
      return number ? { text: `👀 Reviewed PR ${numberLink(repo, 'pull', number)} in ${repoLink(repo)}` } : null;
    }
    case 'IssuesEvent': {
      const number = payload.issue?.number;
      if (!number) return null;
      const issue = numberLink(repo, 'issues', number);
      if (payload.action === 'opened' || payload.action === 'reopened') {
        return { text: `🔥 Opened issue ${issue} in ${repoLink(repo)}` };
      }
      return payload.action === 'closed' ? { text: `✔️ Closed issue ${issue} in ${repoLink(repo)}` } : null;
    }
    case 'CreateEvent':
      return payload.ref_type === 'repository' ? { text: `🎉 Created repository ${repoLink(repo)}` } : null;
    case 'PublicEvent':
      return { text: `🌍 Made ${repoLink(repo)} public` };
    case 'ReleaseEvent': {
      const tag = payload.release?.tag_name;
      if (payload.action !== 'published' || !tag) return null;
      const release = `[${escapeMarkdown(tag)}](https://github.com/${repo}/releases/tag/${tagPath(tag)})`;
      return { text: `🚀 Released ${release} in ${repoLink(repo)}` };
    }
    case 'ForkEvent':
      return { text: `🍴 Forked ${repoLink(repo)}` };
    case 'WatchEvent':
      return { text: `⭐ Starred ${repoLink(repo)}` };
    default:
      return null;
  }
}

/** Merges consecutive pushes to the same repository and drops duplicate lines. */
function toLines(entries) {
  const merged = [];
  for (const entry of entries) {
    const last = merged.at(-1);
    if (entry.type === 'push' && last?.type === 'push' && last.repo === entry.repo) {
      last.commits = last.commits !== null && entry.commits !== null ? last.commits + entry.commits : null;
    } else {
      merged.push({ ...entry });
    }
  }
  const lines = merged.map((entry) => {
    if (entry.type !== 'push') return entry.text;
    const pushed = entry.commits ? `Pushed ${plural(entry.commits, 'commit')} to` : 'Pushed to';
    return `⬆️ ${pushed} ${repoLink(entry.repo)}`;
  });
  return [...new Set(lines)];
}

async function fetchEvents() {
  if (process.env.EVENTS_FILE) {
    return JSON.parse(await readFile(process.env.EVENTS_FILE, 'utf8'));
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': `${USERNAME}-profile-readme`,
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const url = `https://api.github.com/users/${encodeURIComponent(USERNAME)}/events/public?per_page=100`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API answered ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function main() {
  const events = await fetchEvents();
  if (!Array.isArray(events)) {
    throw new Error('Unexpected API response: expected an array of events.');
  }

  const lines = toLines(events.map(toEntry).filter(Boolean)).slice(0, MAX_ITEMS);
  const block = lines.length > 0 ? lines.map((line) => `- ${line}`).join('\n') : '- 💤 No recent public activity.';

  const readme = await readFile(README_PATH, 'utf8');
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Could not find the ${START} and ${END} markers in ${README_PATH}.`);
  }

  const updated = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`;
  if (updated === readme) {
    console.log('Recent activity is already up to date.');
    return;
  }
  await writeFile(README_PATH, updated);
  console.log(`Recent activity updated:\n${block}`);
}

main().catch((error) => {
  console.error(`::error::${error.message}`);
  process.exitCode = 1;
});

# WhosPlaying — Claude Code Project Marker

This file marks `/Users/JW/whosplaying` as the canonical WhosPlaying project root for Claude Code.

## Always start sessions here

```bash
cd /Users/JW/whosplaying && claude
```

That ensures:

- The session's tool calls run with cwd = `/Users/JW/whosplaying`
- Session transcripts land under `~/.claude/projects/-Users-JW-whosplaying/`
- Project permissions in `.claude/settings.json` (this folder) take effect
- The active CLAUDE.md is WhosPlaying's, not opsbord's

## Never work on WhosPlaying from inside an opsbord-rooted session

Running `cd /Users/JW/whosplaying` inside a session that launched in `/Users/JW/opsbord` puts you in a broken state: the cwd is whosplaying but the project memory, permission allowlist, and any hooks (graphify, codereview) come from opsbord. Symptoms:

- Hooks fire about graphify or other opsbord-only tools
- Permission prompts ask twice for the same allowlist entries
- Session transcript is filed under the wrong project in `~/.claude/projects/`
- "main folder" in your Claude Code UI shows opsbord while you're editing whosplaying files

The fix is always: quit the session, `cd` to the right repo, relaunch.

## What lives where

| File | Purpose |
|---|---|
| `/Users/JW/whosplaying/CLAUDE.md` | Per-project instructions Claude reads on every turn |
| `/Users/JW/whosplaying/.claude/settings.json` | Project-level permissions, env, hooks |
| `/Users/JW/whosplaying/.claude/settings.local.json` | Your machine-local allowlist additions (gitignored) |
| `/Users/JW/whosplaying/.claude/launch.json` | Dev-server launch config for the preview MCP |
| `~/.claude/projects/-Users-JW-whosplaying/` | Session transcripts + auto-memory (per-machine) |

<div align="center">

<img src="https://thinklet.io/logo.png" alt="Thinklet" width="80" />

# Thinklet

**The open format and social catalog for apps that run inside AI.**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@thinklet/mcp.svg)](https://www.npmjs.com/package/@thinklet/mcp)
[![Discord](https://img.shields.io/discord/your-discord-id?label=Discord&logo=discord)](https://discord.gg/thinklet)

[thinklet.io](https://thinklet.io) ¬∑ [Catalog](https://thinklet.io/explore) ¬∑ [Docs](https://docs.thinklet.io) ¬∑ [Discord](https://discord.gg/thinklet)

</div>

---

<!-- GIF PLACEHOLDER ‚Äî replace with your screen recording before publishing -->
<!-- Recommended: 1200√ó675px, under 5MB, shows: type in Claude ‚Üí Thinklet opens ‚Üí interact ‚Üí close + reopen ‚Üí data still there -->
<div align="center">
  <img src="./assets/demo.gif" alt="Thinklet demo ‚Äî type a message in Claude, an interactive app appears, data persists across conversations" width="100%" />
</div>

---

## What Thinklet is

Every platform that matters has an app ecosystem. Chrome has extensions. VS Code has plugins. The App Store has apps.

MCP clients ‚Äî Claude, Cursor, Windsurf, ChatGPT ‚Äî are becoming platforms. Thinklet is the open format and social catalog for the apps that run inside them.

One MIT spec. One install command. 12,000+ apps built by the community ‚Äî search, remix, or publish your own without leaving your AI.

---

Thinklet is two things:

**1. An open spec (MIT).** A Thinklet is a single React component with two props: `content` (your app's persisted state) and `updateContent` (writes state back). State survives conversation restarts, browser refreshes, and device switches. Zero backend. No deploy.

**2. A social catalog.** 12,000+ Thinklets built by the community. Open in one message. Remix with lineage. Publish and get credited.

```tsx
export default function MyThinklet({ content, updateContent }) {
  const count = content.count ?? 0
  return (
    <button onClick={() => updateContent({ count: count + 1 })}>
      Clicked {count} times ‚Äî this number survives forever
    </button>
  )
}
```

> *"It feels like what Custom GPTs should have been."* ‚Äî Hacker News

---

## Install in 30 seconds

```bash
npx @thinklet/mcp install
```

That's it. Then open Claude and say:

```
Open the expense tracker Thinklet
```

```
Build me a habit tracker and save it as a Thinklet
```

```
Remix that kanban board to track my job applications instead
```

Your apps open instantly, remember everything, and never ask you to redescribe them.

---

## How it works

### The `content` prop ‚Äî zero-backend persistence

`content` is a plain JSON object managed by **TQL (Thinklet Query Language)**. When you call `updateContent`, TQL writes the delta back to the platform. The next time you open the Thinklet ‚Äî in any conversation, on any device ‚Äî your data is there.

```tsx
const { todos = [], filter = 'all' } = content

// Add a todo
updateContent({ todos: [...todos, { id: Date.now(), text, done: false }] })

// State survives:
// ‚úì Closing the conversation
// ‚úì Browser refresh
// ‚úì Opening from a different device
// ‚úì Sharing with a teammate
```

No localStorage. No API calls. No database setup. Just a prop.

### The MCP server ‚Äî Claude as your launcher

The `@thinklet/mcp` server gives Claude 7 tools:

| Tool | What it does |
|------|-------------|
| `discover_thinklets` | Search the catalog by query, category, or sort |
| `get_thinklet` | Fetch a Thinklet by ID |
| `open_thinklet` | Render a Thinklet inline in the conversation |
| `save_thinklet` | Save to your personal library |
| `remix_thinklet` | Fork with new instructions, lineage preserved |
| `publish_thinklet` | Ship to the public catalog |
| `list_my_thinklets` | Your library |

You never leave Claude. One message to open. One message to save.

### `useAIStreaming` ‚Äî AI inside your app

```tsx
import { useAIStreaming } from '@thinklet/hooks'

export default function ResearchThinklet({ content, updateContent }) {
  const { stream, isStreaming } = useAIStreaming()

  const analyze = async () => {
    const result = await stream(`Summarize: ${content.notes}`)
    updateContent({ summary: result })
  }

  return (
    <div>
      <p>{content.summary ?? 'No summary yet'}</p>
      <button onClick={analyze}>{isStreaming ? 'Thinking...' : 'Analyze notes'}</button>
    </div>
  )
}
```

Multiple streams run in parallel. Use this for multi-agent patterns inside a single Thinklet.

---

## Platform features

The spec and MCP are free and open source. The cloud platform at [thinklet.io](https://thinklet.io) adds:

| Feature | Free | Starter ($10/mo) | Creator ($25/mo) |
|---------|------|-----------------|-----------------|
| Browse public catalog | ‚úì | ‚úì | ‚úì |
| Create & save Thinklets | 20 credits | 100/mo | 250/mo |
| AI models | Claude | Claude + GPT-4o | All 11 models |
| Private Thinklets | ‚Äî | ‚úì | ‚úì |
| RAG (document attachment) | ‚Äî | ‚Äî | ‚úì |
| Publish to catalog | ‚Äî | ‚úì | ‚úì |
| Remix community Thinklets | ‚Äî | ‚úì | ‚úì |
| Analytics | ‚Äî | ‚Äî | ‚úì |

---

## Repo structure

```
thinklet/
‚îú‚îÄ‚îÄ spec/
‚îÇ   ‚îú‚îÄ‚îÄ component.md     ‚Üê Component contract
‚îÇ   ‚îú‚îÄ‚îÄ tql.md           ‚Üê TQL persistence spec
‚îÇ   ‚îî‚îÄ‚îÄ ai-streaming.md  ‚Üê useAIStreaming hook spec
‚îú‚îÄ‚îÄ mcp/
‚îÇ   ‚îú‚îÄ‚îÄ src/
‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ index.ts     ‚Üê MCP server entry
‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ tools/       ‚Üê Tool implementations
‚îÇ   ‚îî‚îÄ‚îÄ package.json
‚îú‚îÄ‚îÄ examples/
‚îÇ   ‚îú‚îÄ‚îÄ counter.tsx
‚îÇ   ‚îú‚îÄ‚îÄ expense-tracker.tsx
‚îÇ   ‚îî‚îÄ‚îÄ kanban-board.tsx
‚îî‚îÄ‚îÄ LICENSE
```

---

## What people are building

<!-- Replace with actual screenshots of 3 real Thinklets from your catalog once you have them -->

| Thinklet | What it does |
|----------|-------------|
| **Competitor Intel** | Track competitors, news, and positioning ‚Äî data persists across sessions |
| **Expense Tracker** | Log and categorize expenses ‚Äî your history never disappears |
| **Kanban Board** | Manage tasks inside Claude ‚Äî cards stay exactly where you left them |
| **Daily Habit Log** | Track habits with streaks ‚Äî survives every conversation restart |

Browse 12,000+ more at [thinklet.io/explore](https://thinklet.io/explore).

---

## Contributing

The spec and MCP are open to contributions.

- **Spec changes** ‚Äî open an issue first, then PR
- **MCP bugs** ‚Äî PRs welcome, include a test case
- **Example Thinklets** ‚Äî always welcome in `/examples`

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Why open source?

The spec being MIT means:
- Any MCP client can support Thinklets ‚Äî not just Claude
- Developers can build tooling on a stable, community-owned format
- The catalog grows without a gatekeeper
- If we disappear, your apps don't

The cloud platform funds the project. The spec belongs to everyone.

---

## License

MIT ¬© [Thinklet](https://thinklet.io)

---

<div align="center">
  <strong>Claude builds it. Thinklet keeps it.</strong>
  <br/><br/>
  <a href="https://thinklet.io">thinklet.io</a> ¬∑ <a href="https://discord.gg/thinklet">Discord</a> ¬∑ <a href="https://twitter.com/thinkletio">Twitter</a>
</div>

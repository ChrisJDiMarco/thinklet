<div align="center">

<img src="https://thinklet.io/logo.png" alt="Thinklet" width="80" />

# Thinklet

**The open spec for apps that live inside Claude.**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@thinklet/mcp.svg)](https://www.npmjs.com/package/@thinklet/mcp)
[![Discord](https://img.shields.io/discord/your-discord-id?label=Discord&logo=discord)](https://discord.gg/thinklet)

[thinklet.io](https://thinklet.io) · [Catalog](https://thinklet.io/explore) · [Docs](https://docs.thinklet.io) · [Discord](https://discord.gg/thinklet)

</div>

---

<!-- GIF PLACEHOLDER — replace with your screen recording before publishing -->
<!-- Recommended: 1200×675px, under 5MB, shows: type in Claude → Thinklet opens → interact → close + reopen → data still there -->
<div align="center">
  <img src="./assets/demo.gif" alt="Thinklet demo — type a message in Claude, an interactive app appears, data persists across conversations" width="100%" />
</div>

---

## The problem

Claude can build any app you describe.

But when the conversation ends, the app disappears. Tomorrow you describe the same thing. Claude rebuilds it from zero.

**Thinklet breaks the loop.**

---

## What Thinklet is

Thinklet is two things:

**1. An open spec (MIT).** A Thinklet is a single React component with two props: `content` (your app's persisted state) and `updateContent` (writes state back). State survives conversation restarts, browser refreshes, and device switches. Zero backend. No deploy.

**2. A social catalog.** 12,000+ Thinklets built by the community. Open in one message. Remix with lineage. Publish and get credited.

```tsx
export default function MyThinklet({ content, updateContent }) {
  const count = content.count ?? 0
  return (
    <button onClick={() => updateContent({ count: count + 1 })}>
      Clicked {count} times — this number survives forever
    </button>
  )
}
```

> *"It feels like what Custom GPTs should have been."* — Hacker News

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

### The `content` prop — zero-backend persistence

`content` is a plain JSON object managed by **TQL (Thinklet Query Language)**. When you call `updateContent`, TQL writes the delta back to the platform. The next time you open the Thinklet — in any conversation, on any device — your data is there.

```tsx
const { todos = [], filter = 'all' } = content

// Add a todo
updateContent({ todos: [...todos, { id: Date.now(), text, done: false }] })

// State survives:
// ✓ Closing the conversation
// ✓ Browser refresh
// ✓ Opening from a different device
// ✓ Sharing with a teammate
```

No localStorage. No API calls. No database setup. Just a prop.

### The MCP server — Claude as your launcher

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

### `useAIStreaming` — AI inside your app

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
| Browse public catalog | ✓ | ✓ | ✓ |
| Create & save Thinklets | 20 credits | 100/mo | 250/mo |
| AI models | Claude | Claude + GPT-4o | All 11 models |
| Private Thinklets | — | ✓ | ✓ |
| RAG (document attachment) | — | — | ✓ |
| Publish to catalog | — | ✓ | ✓ |
| Remix community Thinklets | — | ✓ | ✓ |
| Analytics | — | — | ✓ |

---

## Repo structure

```
thinklet/
├── spec/
│   ├── component.md     ← Component contract
│   ├── tql.md           ← TQL persistence spec
│   └── ai-streaming.md  ← useAIStreaming hook spec
├── mcp/
│   ├── src/
│   │   ├── index.ts     ← MCP server entry
│   │   └── tools/       ← Tool implementations
│   └── package.json
├── examples/
│   ├── counter.tsx
│   ├── expense-tracker.tsx
│   └── kanban-board.tsx
└── LICENSE
```

---

## What people are building

<!-- Replace with actual screenshots of 3 real Thinklets from your catalog once you have them -->

| Thinklet | What it does |
|----------|-------------|
| **Competitor Intel** | Track competitors, news, and positioning — data persists across sessions |
| **Expense Tracker** | Log and categorize expenses — your history never disappears |
| **Kanban Board** | Manage tasks inside Claude — cards stay exactly where you left them |
| **Daily Habit Log** | Track habits with streaks — survives every conversation restart |

Browse 12,000+ more at [thinklet.io/explore](https://thinklet.io/explore).

---

## Contributing

The spec and MCP are open to contributions.

- **Spec changes** — open an issue first, then PR
- **MCP bugs** — PRs welcome, include a test case
- **Example Thinklets** — always welcome in `/examples`

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Why open source?

The spec being MIT means:
- Any MCP client can support Thinklets — not just Claude
- Developers can build tooling on a stable, community-owned format
- The catalog grows without a gatekeeper
- If we disappear, your apps don't

The cloud platform funds the project. The spec belongs to everyone.

---

## License

MIT © [Thinklet](https://thinklet.io)

---

<div align="center">
  <strong>Claude builds it. Thinklet keeps it.</strong>
  <br/><br/>
  <a href="https://thinklet.io">thinklet.io</a> · <a href="https://discord.gg/thinklet">Discord</a> · <a href="https://twitter.com/thinkletio">Twitter</a>
</div>

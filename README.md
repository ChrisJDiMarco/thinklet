# Thinklet

**The open standard for interactive apps inside Claude.**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@thinklet/mcp.svg)](https://www.npmjs.com/package/@thinklet/mcp)

Thinklet is an open spec for single-file React apps that live inside AI conversations. The [Thinklet MCP server](./mcp) connects Claude (and any MCP-compatible tool) to the Thinklet catalog — 12,000+ apps built by 5,000+ creators, discoverable in one message.

**The format and MCP are MIT licensed. The cloud platform at [thinklet.io](https://thinklet.io) adds persistence, social features, multi-model support, RAG, private sharing, and team workspaces.**

---

## What is a Thinklet?

A Thinklet is a single default-exported React component:

```tsx
export default function MyThinklet({ content, updateContent }) {
  return (
    <div>
      <h1>Hello from a Thinklet</h1>
      <button onClick={() => updateContent({ count: (content.count ?? 0) + 1 })}>
        Clicked {content.count ?? 0} times
      </button>
    </div>
  )
}
```

- `content` — persisted state managed by TQL (Thinklet Query Language). Zero backend required.
- `updateContent` — merges new state, persists automatically, survives conversation restarts.

That's it. No routing, no build step, no deploy pipeline. Claude builds it. Thinklet keeps it.

---

## Quick Start

### Install the MCP in Claude

```bash
npx @thinklet/mcp install
```

Or manually add to your Claude MCP config:

```json
{
  "mcpServers": {
    "thinklet": {
      "command": "npx",
      "args": ["-y", "@thinklet/mcp"],
      "env": {
        "THINKLET_API_KEY": "your-api-key"
      }
    }
  }
}
```

Get your API key at [app.thinklet.io/settings](https://app.thinklet.io/settings).

### Use it in Claude

Once installed, you can say:

- `"Open the competitor intel Thinklet"` — opens an app from the catalog
- `"Show me trending Thinklets in the productivity category"`
- `"Remix this Thinklet to track my SaaS metrics instead"`
- `"Save this as a Thinklet called Expense Tracker"`

---

## Repository Structure

```
thinklet/
├── spec/
│   ├── component.md     ← The Thinklet component contract
│   ├── tql.md           ← TQL persistence layer spec
│   └── ai-streaming.md  ← useAIStreaming hook spec
├── mcp/
│   ├── src/
│   │   ├── index.ts     ← MCP server entry point
│   │   └── tools/       ← Tool implementations
│   └── package.json
├── examples/
│   ├── counter.tsx      ← Minimal example
│   ├── expense-tracker.tsx
│   └── kanban-board.tsx
└── LICENSE
```

---

## The Spec

Full documentation in [`/spec`](./spec).

### Component Contract

Every Thinklet must:
- Be a single file
- Have one default export (a React functional component)
- Accept `{ content, updateContent }` as props
- Not require any external state management (Redux, Zustand, etc.)
- Not make direct network calls — use `useAIStreaming` for AI, RAG for data

### TQL (Thinklet Query Language)

TQL is a zero-backend persistence layer. `content` is a plain JSON object. `updateContent` performs a shallow merge and persists to the Thinklet platform automatically. No localStorage, no API calls, no database setup.

```tsx
// Reading state
const { items = [], filter = 'all' } = content

// Writing state
updateContent({ items: [...items, newItem] })

// State persists across:
// - Conversation restarts
// - Browser refreshes
// - Sharing the Thinklet with others
```

### useAIStreaming

```tsx
import { useAIStreaming } from '@thinklet/hooks'

export default function AIThinklet({ content, updateContent }) {
  const { stream, isStreaming } = useAIStreaming()

  const analyze = async () => {
    const result = await stream('Analyze this data: ' + JSON.stringify(content.data))
    updateContent({ analysis: result })
  }

  return <button onClick={analyze}>{isStreaming ? 'Thinking...' : 'Analyze'}</button>
}
```

Multiple streams run in parallel — use this for multi-agent patterns within a single Thinklet.

---

## MCP Tools

The Thinklet MCP server exposes these tools to Claude:

| Tool | Description |
|------|-------------|
| `discover_thinklets` | Search the public catalog by query, category, or sort order |
| `get_thinklet` | Fetch a specific Thinklet by ID with full metadata |
| `open_thinklet` | Open a Thinklet in the current conversation (renders inline) |
| `save_thinklet` | Save a Thinklet to the authenticated user's library |
| `remix_thinklet` | Fork an existing Thinklet with new instructions |
| `publish_thinklet` | Publish a Thinklet to the public catalog |
| `list_my_thinklets` | List the authenticated user's personal library |

See [`/mcp`](./mcp) for full implementation.

---

## Platform Features (thinklet.io)

The open source spec and MCP connect to the Thinklet cloud platform. Free to start:

| Feature | Free | Starter ($10/mo) | Creator ($25/mo) |
|---------|------|-----------------|-----------------|
| Public catalog access | ✓ | ✓ | ✓ |
| Create & save Thinklets | 20 credits | 100/mo | 250/mo |
| AI models | Claude | Claude + GPT-4o | All 11 models |
| RAG (document attachment) | — | — | ✓ |
| Private Thinklets | — | ✓ | ✓ |
| Publish to catalog | — | ✓ | ✓ |
| Remix community Thinklets | — | ✓ | ✓ |
| Usage analytics | — | — | ✓ |

---

## Contributing

The spec and MCP are open to contributions. See [CONTRIBUTING.md](CONTRIBUTING.md).

- **Spec changes** — open an issue first, discuss, then PR
- **MCP bugs** — PRs welcome, include a test case
- **Examples** — always welcome

---

## License

MIT © [Thinklet](https://thinklet.io)

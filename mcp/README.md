# @thinklet/mcp

The official Thinklet MCP server. Connects Claude (and any MCP-compatible tool) to the Thinklet catalog of 12,000+ interactive apps.

## Install

```bash
npx @thinklet/mcp install
```

Or add manually to your Claude config (`~/.claude.json` for Claude Code, or Claude Desktop settings):

```json
{
  "mcpServers": {
    "thinklet": {
      "command": "npx",
      "args": ["-y", "@thinklet/mcp"],
      "env": {
        "THINKLET_API_KEY": "tk_your_key_here"
      }
    }
  }
}
```

Get your API key at [app.thinklet.io/settings](https://app.thinklet.io/settings). The key is optional for browsing — required for saving, remixing, and publishing.

## Tools

| Tool | Auth required | Description |
|------|:-------------:|-------------|
| `discover_thinklets` | No | Search the public catalog |
| `get_thinklet` | No | Get details for a specific Thinklet |
| `open_thinklet` | No | Render a Thinklet inline in the conversation |
| `save_thinklet` | Yes | Save a new Thinklet to your library |
| `remix_thinklet` | Yes | Fork and modify an existing Thinklet |
| `publish_thinklet` | Yes | Publish a Thinklet to the public catalog |
| `list_my_thinklets` | Yes | List your personal library |

## Usage Examples

In Claude, once the MCP is connected:

```
"Open the expense tracker Thinklet"
"Find me a kanban board Thinklet"
"Save what you just built as a Thinklet called 'Sprint Planner'"
"Remix that competitor intel Thinklet to focus on SaaS companies only"
"Publish my expense tracker to the catalog"
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `THINKLET_API_KEY` | No | — | API key for authenticated actions |
| `THINKLET_API_BASE` | No | `https://api.thinklet.io/v1` | Override API base URL |

## License

MIT © [Thinklet](https://thinklet.io)

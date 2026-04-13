#!/usr/bin/env node
/**
 * Thinklet MCP Server
 * MIT License — https://github.com/ChrisJDiMarco/thinklet
 *
 * Connects Claude (and any MCP-compatible tool) to the Thinklet catalog.
 * Install: npx @thinklet/mcp
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ThinkletClient } from "./client.js";

const API_KEY = process.env.THINKLET_API_KEY;
const API_BASE = process.env.THINKLET_API_BASE ?? "https://api.thinklet.io/v1";

const client = new ThinkletClient({ apiKey: API_KEY, baseUrl: API_BASE });

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    name: "discover_thinklets",
    description:
      "Search the Thinklet catalog for interactive apps. Returns a list of matching Thinklets with titles, descriptions, and IDs. Use this when the user wants to find an app for a specific purpose.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What to search for (e.g. 'expense tracker', 'SEO analyzer', 'kanban board')",
        },
        category: {
          type: "string",
          enum: ["productivity", "finance", "analytics", "games", "education", "tools", "social", "creative"],
          description: "Filter by category (optional)",
        },
        sort: {
          type: "string",
          enum: ["trending", "top", "newest", "most_remixed"],
          description: "Sort order (default: trending)",
        },
        limit: {
          type: "number",
          description: "Number of results to return (default: 10, max: 50)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_thinklet",
    description:
      "Get full details about a specific Thinklet by ID, including its description, creator, remix count, and render URL.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The Thinklet ID",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "open_thinklet",
    description:
      "Open a Thinklet in the current conversation. This renders the interactive app inline. Use this after discover_thinklets when the user wants to use a specific Thinklet.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The Thinklet ID to open",
        },
        thinklet_name: {
          type: "string",
          description: "Human-readable name (used if ID is not known — will search and open best match)",
        },
      },
      required: [],
    },
  },
  {
    name: "save_thinklet",
    description:
      "Save a React component as a new Thinklet in the user's personal library. The component must follow the Thinklet spec (default export, content/updateContent props). Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name for the Thinklet",
        },
        description: {
          type: "string",
          description: "What this Thinklet does",
        },
        code: {
          type: "string",
          description: "The React component code (single file, default export)",
        },
        category: {
          type: "string",
          enum: ["productivity", "finance", "analytics", "games", "education", "tools", "social", "creative"],
          description: "Category for the Thinklet",
        },
        is_private: {
          type: "boolean",
          description: "If true, only visible to the authenticated user (default: false)",
        },
      },
      required: ["name", "code"],
    },
  },
  {
    name: "remix_thinklet",
    description:
      "Fork an existing Thinklet and modify it based on instructions. Creates a new Thinklet in the user's library that builds on the original. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the Thinklet to remix",
        },
        instructions: {
          type: "string",
          description: "What to change or add in the remix (e.g. 'track weekly instead of daily', 'add a dark mode toggle')",
        },
        name: {
          type: "string",
          description: "Name for the remixed Thinklet (optional — defaults to 'Remix of [original name]')",
        },
      },
      required: ["id", "instructions"],
    },
  },
  {
    name: "publish_thinklet",
    description:
      "Publish a Thinklet from the user's private library to the public catalog so others can discover and remix it. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the Thinklet to publish",
        },
        description: {
          type: "string",
          description: "Public description for the catalog listing",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for discoverability",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_my_thinklets",
    description:
      "List the authenticated user's personal Thinklet library — both private and published. Requires authentication.",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          enum: ["all", "private", "published", "remixes"],
          description: "Filter the library (default: all)",
        },
      },
      required: [],
    },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function handleTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "discover_thinklets": {
      const { query = "", category, sort = "trending", limit = 10 } = args as {
        query?: string;
        category?: string;
        sort?: string;
        limit?: number;
      };

      const results = await client.discover({ query, category, sort, limit });

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No Thinklets found matching your search. Try different keywords or browse the catalog at app.thinklet.io" }] };
      }

      const formatted = results
        .map((t, i) =>
          `${i + 1}. **${t.name}** (ID: ${t.id})\n   ${t.description}\n   ⭐ ${t.likes} likes · 🔀 ${t.remixes} remixes · by @${t.creator}`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} Thinklets:\n\n${formatted}\n\nTo open one, use \`open_thinklet\` with the ID.`,
          },
        ],
      };
    }

    case "get_thinklet": {
      const { id } = args as { id: string };
      const thinklet = await client.get(id);

      return {
        content: [
          {
            type: "text",
            text: `**${thinklet.name}**\nby @${thinklet.creator} · ${thinklet.category}\n\n${thinklet.description}\n\n⭐ ${thinklet.likes} likes · 🔀 ${thinklet.remixes} remixes · 👁 ${thinklet.views} views\nCreated: ${thinklet.createdAt}\n\nOpen it with: \`open_thinklet\` (id: "${id}")`,
          },
        ],
      };
    }

    case "open_thinklet": {
      const { id, thinklet_name } = args as { id?: string; thinklet_name?: string };

      let thinkletId = id;

      if (!thinkletId && thinklet_name) {
        const results = await client.discover({ query: thinklet_name, limit: 1 });
        if (results.length === 0) {
          return { content: [{ type: "text", text: `Could not find a Thinklet named "${thinklet_name}". Try \`discover_thinklets\` to search.` }] };
        }
        thinkletId = results[0].id;
      }

      if (!thinkletId) {
        return { content: [{ type: "text", text: "Please provide an ID or name to open a Thinklet." }] };
      }

      const renderUrl = `${API_BASE.replace("/v1", "")}/render/${thinkletId}`;

      return {
        content: [
          {
            type: "text",
            text: `Opening Thinklet...`,
          },
          {
            type: "resource",
            resource: {
              uri: renderUrl,
              mimeType: "text/html",
              text: `Thinklet: ${thinkletId}`,
            },
          },
        ],
      };
    }

    case "save_thinklet": {
      const { name, description = "", code, category = "tools", is_private = false } = args as {
        name: string;
        description?: string;
        code: string;
        category?: string;
        is_private?: boolean;
      };

      if (!API_KEY) {
        return {
          content: [{
            type: "text",
            text: "Authentication required. Set your THINKLET_API_KEY environment variable. Get your key at app.thinklet.io/settings",
          }],
        };
      }

      const saved = await client.save({ name, description, code, category, isPrivate: is_private });

      return {
        content: [{
          type: "text",
          text: `✓ Saved as "${name}" (ID: ${saved.id})\n${is_private ? "Private — only visible to you." : "Saved to your library."}\n\nView it at: app.thinklet.io/t/${saved.id}\nPublish to the catalog with: \`publish_thinklet\` (id: "${saved.id}")`,
        }],
      };
    }

    case "remix_thinklet": {
      const { id, instructions, name } = args as {
        id: string;
        instructions: string;
        name?: string;
      };

      if (!API_KEY) {
        return {
          content: [{
            type: "text",
            text: "Authentication required. Set your THINKLET_API_KEY environment variable.",
          }],
        };
      }

      const remixed = await client.remix({ id, instructions, name });

      return {
        content: [{
          type: "text",
          text: `✓ Remix created: "${remixed.name}" (ID: ${remixed.id})\nBased on: ${remixed.originalName} by @${remixed.originalCreator}\n\nView it at: app.thinklet.io/t/${remixed.id}`,
        }],
      };
    }

    case "publish_thinklet": {
      const { id, description, tags = [] } = args as {
        id: string;
        description?: string;
        tags?: string[];
      };

      if (!API_KEY) {
        return {
          content: [{
            type: "text",
            text: "Authentication required. Set your THINKLET_API_KEY environment variable.",
          }],
        };
      }

      const published = await client.publish({ id, description, tags });

      return {
        content: [{
          type: "text",
          text: `✓ Published to the catalog!\n"${published.name}" is now discoverable by 5,000+ creators.\n\nPublic URL: app.thinklet.io/t/${id}\nOthers can now remix it and their versions will stack behind yours.`,
        }],
      };
    }

    case "list_my_thinklets": {
      const { filter = "all" } = args as { filter?: string };

      if (!API_KEY) {
        return {
          content: [{
            type: "text",
            text: "Authentication required. Set your THINKLET_API_KEY environment variable.",
          }],
        };
      }

      const thinklets = await client.listMine({ filter });

      if (thinklets.length === 0) {
        return {
          content: [{ type: "text", text: "No Thinklets in your library yet. Build one in this conversation and use `save_thinklet` to keep it." }],
        };
      }

      const formatted = thinklets
        .map((t, i) =>
          `${i + 1}. **${t.name}** (${t.status}) · ID: ${t.id}\n   ${t.description || "No description"}`
        )
        .join("\n\n");

      return {
        content: [{ type: "text", text: `Your Thinklets (${thinklets.length}):\n\n${formatted}` }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── Server bootstrap ──────────────────────────────────────────────────────────

const server = new Server(
  { name: "thinklet", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    return await handleTool(name, args as Record<string, unknown>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Thinklet MCP server running — github.com/ChrisJDiMarco/thinklet");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

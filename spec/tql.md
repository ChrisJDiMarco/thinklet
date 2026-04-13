# TQL — Thinklet Query Language

Version: 1.0.0

---

## What is TQL?

TQL is the zero-backend persistence layer for Thinklets. It's not a query language in the SQL sense — it's the name for the mechanism that makes `content` and `updateContent` work without any backend code, database setup, or API calls on your part.

When you call `updateContent({ count: 5 })`, TQL:
1. Merges the patch into the current `content` object (shallow merge)
2. Persists the new state to the Thinklet platform
3. Propagates the update to any other open sessions viewing the same Thinklet
4. Creates a versioned snapshot for recovery

From your component's perspective, it just works. No `async`, no error handling, no loading state for writes.

---

## The Data Model

`content` is a flat or nested plain JSON object. There are no schemas, no migrations, no types enforced at the platform level — that's your component's job.

```tsx
// content starts as an empty object for new Thinklets
const content = {}

// After first updateContent call:
const content = { items: [], filter: 'all' }

// After subsequent calls (shallow merge):
updateContent({ filter: 'active' })
// content = { items: [], filter: 'active' }
```

### Supported value types

- Strings
- Numbers
- Booleans
- Arrays (of any JSON-serializable values)
- Nested plain objects
- `null`

### Not supported

- Functions
- Class instances
- `undefined` (use `null` or omit the key)
- Circular references

---

## Merge Behavior

`updateContent` performs a **shallow merge** — it merges at the top level only.

```tsx
// Initial content
{ user: { name: 'Chris', role: 'admin' }, theme: 'light' }

// updateContent({ theme: 'dark' })
// Result:
{ user: { name: 'Chris', role: 'admin' }, theme: 'dark' }

// updateContent({ user: { name: 'Alex' } })
// Result: (user object is REPLACED, not deep merged)
{ user: { name: 'Alex' }, theme: 'dark' }

// To deep-merge nested objects, spread manually:
updateContent({ user: { ...content.user, name: 'Alex' } })
// Result:
{ user: { name: 'Alex', role: 'admin' }, theme: 'dark' }
```

---

## Versioning & Recovery

Every `updateContent` call creates a versioned snapshot. On the Thinklet platform, users can:
- View the full version history of their Thinklet's state
- Restore any previous snapshot
- See a diff between versions

This is not exposed through the component API (v1.0) — it's a platform-level feature accessible via the Thinklet web UI.

---

## Concurrency

TQL uses an optimistic update model:

1. `updateContent` updates local state immediately (no waiting for server confirmation)
2. The write is sent to the platform asynchronously
3. If two updates conflict (rare — Thinklets are single-user by default), last-write-wins

For collaborative Thinklets (shared with multiple editors), conflict resolution is handled by the platform using vector clocks. This is transparent to the component.

---

## Access Control

`content` visibility is controlled by the Thinklet's sharing settings (set on the platform, not in code):

| Mode | content access |
|------|---------------|
| Private | Only the owner can read/write |
| Shared (specific people) | Shared users read/write, others no access |
| Public (view only) | Anyone can open and read, only owner writes |
| Public (remixable) | Anyone can open a fork and write to their copy |

The component doesn't need to handle access control — the platform enforces it before delivering `content`.

---

## RAG Integration (Paid tiers)

On paid plans, you can attach documents to a Thinklet. Attached documents are available as a read-only `sources` array alongside `content`:

```tsx
export default function ResearchThinklet({ content, updateContent, sources = [] }) {
  // sources is an array of { title, excerpt, url } from attached documents
  // Use useAIStreaming to ask questions about them
}
```

Documents are indexed and chunked by the platform. They do not count against the `content` size limit.

---

## Limits

| Limit | Value |
|-------|-------|
| `content` object size | 512 KB (serialized JSON) |
| `updateContent` calls per minute | 60 |
| Array items (recommended max) | 10,000 |
| Nested object depth (recommended max) | 10 levels |

Exceeding the size limit throws a `TQLSizeError` in the component. Exceeding rate limits queues writes (no data loss, slight delay).

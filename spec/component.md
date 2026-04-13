# Thinklet Component Spec

Version: 1.0.0

---

## Overview

A Thinklet is a single-file React component that receives two props: `content` (persisted state) and `updateContent` (state updater). The Thinklet platform renders it inside Claude conversations via MCP Apps. It can also be rendered at `app.thinklet.io`.

---

## The Contract

```tsx
interface ThinkletProps {
  content: Record<string, any>       // Persisted state — starts as {}
  updateContent: (patch: Record<string, any>) => void  // Shallow merge + persist
}

export default function MyThinklet({ content, updateContent }: ThinkletProps) {
  // Your component here
}
```

### Rules

1. **Single file.** All code, styles, and logic in one `.tsx` or `.jsx` file.
2. **One default export.** The export must be a React functional component.
3. **No external state management.** No Redux, Zustand, Jotai, etc. Use `content`/`updateContent` for persistence, `useState` for ephemeral local state.
4. **No direct network calls.** Use `useAIStreaming` for AI responses. Use RAG for document data. Use Composio integrations for external services.
5. **No routing.** Thinklets are single-view apps. Use conditional rendering for multi-step flows.
6. **Tailwind is available.** Use Tailwind utility classes for styling. Custom CSS via `<style>` tags is also supported.

---

## Available Libraries

These are pre-bundled and importable without installation:

```tsx
// React (always available)
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// Thinklet hooks
import { useAIStreaming } from '@thinklet/hooks'

// UI components (shadcn/ui subset)
import { Button } from '@thinklet/ui'
import { Input } from '@thinklet/ui'
import { Card, CardContent, CardHeader } from '@thinklet/ui'

// Charts
import { LineChart, BarChart, PieChart } from 'recharts'

// Utilities
import _ from 'lodash'
import * as math from 'mathjs'
```

---

## State: content & updateContent

`content` is a plain JSON object — your app's persistent store.

```tsx
// Reading (always destructure with defaults)
const { items = [], filter = 'all', lastUpdated = null } = content

// Writing (shallow merge — only specify what changed)
updateContent({ filter: 'active' })
// content is now { items: [...], filter: 'active', lastUpdated: null }

// Nested updates — spread manually
updateContent({
  settings: { ...content.settings, theme: 'dark' }
})
```

### What persists

- Survives conversation restarts
- Survives browser refreshes
- Shared when you share the Thinklet link (read-only for viewers, writable for owner)
- Versioned — every `updateContent` call creates a recoverable snapshot

### What does NOT persist

- `useState` values (ephemeral, local only)
- Component refs
- In-progress stream results (stream output should be written to `content` on completion)

---

## Minimal Example

```tsx
export default function Counter({ content, updateContent }) {
  const { count = 0, label = 'Counter' } = content

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">{label}</h1>
      <div className="text-6xl font-mono text-center py-8">{count}</div>
      <div className="flex gap-2">
        <button
          className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          onClick={() => updateContent({ count: count - 1 })}
        >
          −
        </button>
        <button
          className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          onClick={() => updateContent({ count: count + 1 })}
        >
          +
        </button>
      </div>
      <button
        className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600"
        onClick={() => updateContent({ count: 0 })}
      >
        Reset
      </button>
    </div>
  )
}
```

---

## Real-World Example: Expense Tracker

```tsx
import { useState } from 'react'

export default function ExpenseTracker({ content, updateContent }) {
  const { expenses = [], budget = 1000 } = content
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = budget - total

  const addExpense = () => {
    if (!desc || !amount) return
    updateContent({
      expenses: [...expenses, {
        id: Date.now(),
        desc,
        amount: parseFloat(amount),
        date: new Date().toLocaleDateString()
      }]
    })
    setDesc('')
    setAmount('')
  }

  const removeExpense = (id) => {
    updateContent({ expenses: expenses.filter(e => e.id !== id) })
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Expenses</h1>
        <span className={`text-lg font-mono ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
          ${remaining.toFixed(2)} left
        </span>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          placeholder="Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <input
          className="w-24 px-3 py-2 border rounded-lg text-sm"
          placeholder="$0.00"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
          onClick={addExpense}
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {expenses.map(e => (
          <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-sm">{e.desc}</div>
              <div className="text-xs text-gray-400">{e.date}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">${e.amount.toFixed(2)}</span>
              <button
                className="text-gray-300 hover:text-red-400 text-xs"
                onClick={() => removeExpense(e.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">No expenses yet</div>
      )}
    </div>
  )
}
```

---

## Anti-Patterns

```tsx
// ❌ Don't mutate content directly
content.items.push(newItem)

// ✅ Always create new arrays/objects
updateContent({ items: [...content.items, newItem] })

// ❌ Don't fetch from external APIs directly
const data = await fetch('https://api.example.com/data')

// ✅ Use useAIStreaming or RAG (platform features)
const { stream } = useAIStreaming()

// ❌ Don't use localStorage
localStorage.setItem('key', value)

// ✅ Use content — it persists automatically
updateContent({ key: value })

// ❌ Don't import from npm directly
import axios from 'axios'

// ✅ Use pre-bundled libraries only (see Available Libraries above)
```

---

## Versioning

The spec follows semver. Breaking changes to the component contract will increment the major version. The platform always supports the current and previous major version.

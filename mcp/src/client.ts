/**
 * Thinklet API client
 * Thin wrapper around the thinklet.io REST API
 */

export interface ThinkletSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  creator: string;
  likes: number;
  remixes: number;
  views: number;
  createdAt: string;
}

export interface ThinkletDetail extends ThinkletSummary {
  code?: string;
  originalId?: string;
}

export interface SavedThinklet {
  id: string;
  name: string;
}

export interface RemixedThinklet {
  id: string;
  name: string;
  originalName: string;
  originalCreator: string;
}

export interface PublishedThinklet {
  id: string;
  name: string;
}

export interface ClientOptions {
  apiKey?: string;
  baseUrl: string;
}

export class ThinkletClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor({ apiKey, baseUrl }: ClientOptions) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) h["Authorization"] = `Bearer ${this.apiKey}`;
    return h;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const { default: fetch } = await import("node-fetch");
    const url = `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: { ...this.headers(), ...(options.headers as Record<string, string> ?? {}) },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Thinklet API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async discover(params: {
    query?: string;
    category?: string;
    sort?: string;
    limit?: number;
  }): Promise<ThinkletSummary[]> {
    const qs = new URLSearchParams();
    if (params.query) qs.set("q", params.query);
    if (params.category) qs.set("category", params.category);
    if (params.sort) qs.set("sort", params.sort);
    if (params.limit) qs.set("limit", String(params.limit));

    const data = await this.request<{ thinklets: ThinkletSummary[] }>(
      `/thinklets?${qs.toString()}`
    );
    return data.thinklets;
  }

  async get(id: string): Promise<ThinkletDetail> {
    return this.request<ThinkletDetail>(`/thinklets/${id}`);
  }

  async save(params: {
    name: string;
    description: string;
    code: string;
    category: string;
    isPrivate: boolean;
  }): Promise<SavedThinklet> {
    return this.request<SavedThinklet>("/thinklets", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async remix(params: {
    id: string;
    instructions: string;
    name?: string;
  }): Promise<RemixedThinklet> {
    return this.request<RemixedThinklet>(`/thinklets/${params.id}/remix`, {
      method: "POST",
      body: JSON.stringify({ instructions: params.instructions, name: params.name }),
    });
  }

  async publish(params: {
    id: string;
    description?: string;
    tags?: string[];
  }): Promise<PublishedThinklet> {
    return this.request<PublishedThinklet>(`/thinklets/${params.id}/publish`, {
      method: "POST",
      body: JSON.stringify({ description: params.description, tags: params.tags }),
    });
  }

  async listMine(params: { filter?: string }): Promise<(ThinkletSummary & { status: string })[]> {
    const qs = new URLSearchParams();
    if (params.filter && params.filter !== "all") qs.set("filter", params.filter);

    const data = await this.request<{ thinklets: (ThinkletSummary & { status: string })[] }>(
      `/me/thinklets?${qs.toString()}`
    );
    return data.thinklets;
  }
}

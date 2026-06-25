import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../api/client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: true,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

describe("api.get", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch.mockReturnValue(jsonResponse({ name: "Flour" }));
    const result = await api.get("flour");
    expect(result).toEqual({ name: "Flour" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/flour"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns null on 404", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 404 })
    );
    const result = await api.get("missing");
    expect(result).toBeNull();
  });

  it("throws on server error", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 500 })
    );
    await expect(api.get("key")).rejects.toThrow("Server error: 500");
  });
});

describe("api.set", () => {
  it("sends POST with JSON body", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: true, status: 201, text: () => Promise.resolve("") })
    );
    await api.set("recipe-book", { flour: { name: "Flour" } });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/recipe-book"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ flour: { name: "Flour" } }),
      })
    );
  });

  it("returns null on 201", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: true, status: 201, text: () => Promise.resolve("") })
    );
    const result = await api.set("key", "value");
    expect(result).toBeNull();
  });
});

describe("api.del", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve("") })
    );
    await api.del("key");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/key"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("returns null on 404 (already deleted)", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 404 })
    );
    const result = await api.del("missing");
    expect(result).toBeNull();
  });
});

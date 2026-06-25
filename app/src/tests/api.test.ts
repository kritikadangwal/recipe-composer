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
  it("returns data on success", async () => {
    // arrange
    mockFetch.mockReturnValue(jsonResponse({ name: "Flour" }));

    // act
    const result = await api.get("flour");

    // assert
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ name: "Flour" });
  });

  it("returns null data on 404 without error", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 404 })
    );
    const result = await api.get("missing");
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it("returns error on server error", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 500 })
    );
    const result = await api.get("key");
    expect(result.error).toBe("Server error: 500");
    expect(result.data).toBeNull();
  });

  it("returns error on network failure", async () => {
    mockFetch.mockReturnValue(Promise.reject(new Error("Failed to fetch")));
    const result = await api.get("key");
    expect(result.error).toBe("Failed to fetch");
    expect(result.data).toBeNull();
  });
});

describe("api.set", () => {
  it("sends POST with JSON body", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: true, status: 201, text: () => Promise.resolve("") })
    );
    const result = await api.set("recipe-book", { flour: { name: "Flour" } });
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/recipe-book"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ flour: { name: "Flour" } }),
      })
    );
  });

  it("returns error on failure", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 500 })
    );
    const result = await api.set("key", "value");
    expect(result.error).toBe("Server error: 500");
  });
});

describe("api.del", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve("") })
    );
    const result = await api.del("key");
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/key"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("returns null data on 404 without error", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ ok: false, status: 404 })
    );
    const result = await api.del("missing");
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });
});

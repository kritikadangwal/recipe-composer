import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImportExport } from "../components/ImportExport";
import type { RecipeBook } from "../types/recipe";

const sampleBook: RecipeBook = {
  flour: { name: "Flour" },
  bread: { name: "Bread", components: [{ id: "flour", qty: 500 }] },
};

describe("ImportExport", () => {
  it("renders import and export buttons", () => {
    render(<ImportExport book={sampleBook} onImport={vi.fn()} />);
    expect(screen.getByText("Import JSON")).toBeInTheDocument();
    expect(screen.getByText("Export JSON")).toBeInTheDocument();
  });

  it("renders a hidden file input", () => {
    render(<ImportExport book={sampleBook} onImport={vi.fn()} />);
    const input = document.getElementById("import-file") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("file");
    expect(input.accept).toBe(".json");
  });

  it("calls onImport with parsed JSON when a valid file is uploaded", async () => {
    const onImport = vi.fn();
    render(<ImportExport book={{}} onImport={onImport} />);

    const input = document.getElementById("import-file") as HTMLInputElement;
    const file = new File(
      [JSON.stringify(sampleBook)],
      "recipes.json",
      { type: "application/json" }
    );

    fireEvent.change(input, { target: { files: [file] } });

    // Wait for FileReader to complete
    await vi.waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(sampleBook);
    });
  });

  it("does not call onImport for invalid JSON array", async () => {
    const onImport = vi.fn();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<ImportExport book={{}} onImport={onImport} />);

    const input = document.getElementById("import-file") as HTMLInputElement;
    const file = new File(
      ["[1, 2, 3]"],
      "bad.json",
      { type: "application/json" }
    );

    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid format: expected a JSON object (dictionary).");
    });
    expect(onImport).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("shows alert for malformed JSON", async () => {
    const onImport = vi.fn();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<ImportExport book={{}} onImport={onImport} />);

    const input = document.getElementById("import-file") as HTMLInputElement;
    const file = new File(
      ["not json at all"],
      "bad.json",
      { type: "application/json" }
    );

    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to parse JSON file.");
    });
    expect(onImport).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

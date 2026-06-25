import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Toast } from "../components/Toast";

describe("Toast", () => {
  it("renders the message", () => {
    render(<Toast message="Saved!" onClose={vi.fn()} />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("applies the correct type class", () => {
    render(<Toast message="Error" type="error" onClose={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveClass("toast--error");
  });

  it("applies success type class", () => {
    render(<Toast message="Done" type="success" onClose={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveClass("toast--success");
  });

  it("defaults to info type", () => {
    render(<Toast message="Info" onClose={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveClass("toast--info");
  });

  it("calls onClose when dismiss button is clicked", () => {
    const onClose = vi.fn();
    render(<Toast message="Hi" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("auto-closes after duration", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Bye" onClose={onClose} duration={2000} />);

    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2000));
    expect(onClose).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });
});

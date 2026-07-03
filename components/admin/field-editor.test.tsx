// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { FieldEditor } from "./field-editor"
import type { Field } from "@/lib/admin/content-schema"

afterEach(cleanup)

describe("FieldEditor — text/textarea", () => {
  it("renders the label + help and emits changes", () => {
    const field: Field = { key: "headline", label: "Headline", type: "text", help: "Top of page" }
    const onChange = vi.fn()
    render(<FieldEditor field={field} value="Hi" onChange={onChange} />)

    expect(screen.getByText("Headline")).toBeTruthy()
    expect(screen.getByText("Top of page")).toBeTruthy()

    const input = screen.getByDisplayValue("Hi") as HTMLInputElement
    fireEvent.change(input, { target: { value: "Bye" } })
    expect(onChange).toHaveBeenCalledWith("Bye")
  })

  it("renders a textarea for type=textarea", () => {
    render(<FieldEditor field={{ key: "d", label: "Desc", type: "textarea" }} value="x" onChange={() => {}} />)
    expect((screen.getByDisplayValue("x") as HTMLElement).tagName).toBe("TEXTAREA")
  })
})

describe("FieldEditor — list", () => {
  const field: Field = { key: "tags", label: "Tags", type: "list", itemLabel: "Tag" }

  it("adds an item (appends an empty string)", () => {
    const onChange = vi.fn()
    render(<FieldEditor field={field} value={["a"]} onChange={onChange} />)
    fireEvent.click(screen.getByText(/Add Tag/i))
    expect(onChange).toHaveBeenCalledWith(["a", ""])
  })

  it("edits an item at its index", () => {
    const onChange = vi.fn()
    render(<FieldEditor field={field} value={["a", "b"]} onChange={onChange} />)
    fireEvent.change(screen.getByDisplayValue("b"), { target: { value: "B!" } })
    expect(onChange).toHaveBeenCalledWith(["a", "B!"])
  })

  it("removes an item", () => {
    const onChange = vi.fn()
    render(<FieldEditor field={field} value={["a", "b"]} onChange={onChange} />)
    const removeButtons = screen.getAllByLabelText("Remove")
    fireEvent.click(removeButtons[0])
    expect(onChange).toHaveBeenCalledWith(["b"])
  })
})

describe("FieldEditor — group (array of objects)", () => {
  const field: Field = {
    key: "items",
    label: "Questions",
    type: "group",
    itemLabel: "Question",
    fields: [
      { key: "question", label: "Q", type: "text" },
      { key: "answer", label: "A", type: "textarea" },
    ],
  }

  it("adds a blank object shaped from the subfields", () => {
    const onChange = vi.fn()
    render(<FieldEditor field={field} value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText(/Add Question/i))
    expect(onChange).toHaveBeenCalledWith([{ question: "", answer: "" }])
  })

  it("edits a subfield of a specific row", () => {
    const onChange = vi.fn()
    render(
      <FieldEditor
        field={field}
        value={[{ question: "old", answer: "" }]}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByDisplayValue("old"), { target: { value: "new" } })
    expect(onChange).toHaveBeenCalledWith([{ question: "new", answer: "" }])
  })

  it("moves a row down, swapping order", () => {
    const onChange = vi.fn()
    render(
      <FieldEditor
        field={field}
        value={[
          { question: "first", answer: "" },
          { question: "second", answer: "" },
        ]}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getAllByLabelText("Move down")[0])
    expect(onChange).toHaveBeenCalledWith([
      { question: "second", answer: "" },
      { question: "first", answer: "" },
    ])
  })

  it("disables Move up on the first row and Move down on the last", () => {
    render(
      <FieldEditor
        field={field}
        value={[
          { question: "a", answer: "" },
          { question: "b", answer: "" },
        ]}
        onChange={() => {}}
      />
    )
    expect((screen.getAllByLabelText("Move up")[0] as HTMLButtonElement).disabled).toBe(true)
    const downs = screen.getAllByLabelText("Move down") as HTMLButtonElement[]
    expect(downs[downs.length - 1].disabled).toBe(true)
  })
})

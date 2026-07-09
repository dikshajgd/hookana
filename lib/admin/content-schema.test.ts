import { describe, it, expect } from "vitest"
import { SECTIONS, CONTENT_DEFAULTS, type Field } from "./content-schema"

function fieldKeys(fields: Field[]): string[] {
  return fields.map((f) => f.key)
}

describe("content schema integrity", () => {
  it("has unique section keys", () => {
    const keys = SECTIONS.map((s) => s.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it("has unique field keys within each section", () => {
    for (const section of SECTIONS) {
      const keys = fieldKeys(section.fields)
      expect(new Set(keys).size, `duplicate field key in "${section.key}"`).toBe(keys.length)
    }
  })

  it("uses only known field types", () => {
    const allowed = new Set(["text", "textarea", "list", "group"])
    for (const section of SECTIONS) {
      for (const field of section.fields) {
        expect(allowed.has(field.type), `${section.key}.${field.key} type ${field.type}`).toBe(true)
      }
    }
  })

  it("requires group fields to declare subfields", () => {
    for (const section of SECTIONS) {
      for (const field of section.fields) {
        if (field.type === "group") {
          expect(Array.isArray(field.fields), `${section.key}.${field.key}`).toBe(true)
          expect((field.fields ?? []).length).toBeGreaterThan(0)
        }
      }
    }
  })

  it("provides a CONTENT_DEFAULTS entry for every section", () => {
    for (const section of SECTIONS) {
      expect(CONTENT_DEFAULTS, `missing defaults for ${section.key}`).toHaveProperty(section.key)
    }
  })

  it("only defines defaults for keys that exist as fields in the section", () => {
    for (const section of SECTIONS) {
      const defaults = CONTENT_DEFAULTS[section.key] ?? {}
      const known = new Set(fieldKeys(section.fields))
      for (const key of Object.keys(defaults)) {
        expect(known.has(key), `${section.key} default has unknown field "${key}"`).toBe(true)
      }
    }
  })

  it("defaults group fields to arrays of objects", () => {
    for (const section of SECTIONS) {
      const defaults = CONTENT_DEFAULTS[section.key] ?? {}
      for (const field of section.fields) {
        if (field.type === "group" && defaults[field.key] !== undefined) {
          expect(Array.isArray(defaults[field.key]), `${section.key}.${field.key}`).toBe(true)
        }
      }
    }
  })
})

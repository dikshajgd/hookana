import { describe, it, expect } from "vitest"
import { getAtPath, setAtPath, mergeDefaults } from "./editor-context"

describe("getAtPath", () => {
  const obj = { hero: { headline: "Hi", videoCards: [{ url: "a" }, { url: "b" }] } }

  it("reads a nested scalar", () => {
    expect(getAtPath(obj, "hero.headline")).toBe("Hi")
  })

  it("reads through array indices", () => {
    expect(getAtPath(obj, "hero.videoCards.1.url")).toBe("b")
  })

  it("returns undefined for a missing path without throwing", () => {
    expect(getAtPath(obj, "hero.nope.deep")).toBeUndefined()
    expect(getAtPath(obj, "missing.key")).toBeUndefined()
  })
})

describe("setAtPath", () => {
  it("sets a nested scalar immutably", () => {
    const before = { hero: { headline: "Old" } }
    const after = setAtPath(before, "hero.headline", "New")
    expect(after.hero.headline).toBe("New")
    expect(before.hero.headline).toBe("Old") // original untouched
    expect(after).not.toBe(before)
    expect(after.hero).not.toBe(before.hero)
  })

  it("sets an array element without mutating siblings", () => {
    const before = { hero: { videoCards: [{ url: "a" }, { url: "b" }] } }
    const after = setAtPath(before, "hero.videoCards.0.url", "z")
    expect(after.hero.videoCards[0].url).toBe("z")
    expect(after.hero.videoCards[1]).toBe(before.hero.videoCards[1]) // sibling shared
    expect(before.hero.videoCards[0].url).toBe("a") // original untouched
    expect(Array.isArray(after.hero.videoCards)).toBe(true)
  })

  it("creates intermediate objects for a fresh section", () => {
    const after = setAtPath({}, "hero.headline", "X")
    expect(after).toEqual({ hero: { headline: "X" } })
  })
})

describe("mergeDefaults", () => {
  const defaults = {
    hero: { headline: "Default", cards: [{ url: "d1" }] },
    footer: { copyright: "©" },
  }

  it("fills sections absent from saved settings", () => {
    const merged = mergeDefaults(defaults, { hero: { headline: "Saved" } })
    // saved scalar wins
    expect(merged.hero.headline).toBe("Saved")
    // default array preserved when saved omits it (prevents partial-save wipeout)
    expect(merged.hero.cards).toEqual([{ url: "d1" }])
    // untouched section still present from defaults
    expect(merged.footer.copyright).toBe("©")
  })

  it("lets a saved array replace the default wholesale", () => {
    const merged = mergeDefaults(defaults, { hero: { cards: [{ url: "s1" }, { url: "s2" }] } })
    expect(merged.hero.cards).toHaveLength(2)
    expect(merged.hero.cards[1].url).toBe("s2")
    expect(merged.hero.headline).toBe("Default")
  })

  it("keeps defaults when saved is empty", () => {
    expect(mergeDefaults(defaults, {})).toEqual(defaults)
  })
})

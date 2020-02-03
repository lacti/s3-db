import ensureArrayValue from "../../../src/storage/resource/ensureArrayValue";

test("ensureArrayValue", () => {
  expect(ensureArrayValue([])).toEqual([]);
  expect(ensureArrayValue([1, 2, 3])).toEqual([1, 2, 3]);
  expect(ensureArrayValue(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  expect(ensureArrayValue([{ a: 1 }, { b: 2 }, { c: 3 }])).toEqual([
    { a: 1 },
    { b: 2 },
    { c: 3 }
  ]);

  expect(() => ensureArrayValue("")).toThrow(/Invalid structure/);
  expect(() => ensureArrayValue(100)).toThrow(/Invalid structure/);
  expect(() => ensureArrayValue({})).toThrow(/Invalid structure/);
  expect(() => ensureArrayValue({ a: 1 })).toThrow(/Invalid structure/);
});

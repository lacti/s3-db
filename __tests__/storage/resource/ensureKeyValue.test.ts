import ensureKeyValue from "../../../src/storage/resource/ensureKeyValue";

test("ensureKeyValue", () => {
  expect(ensureKeyValue({})).toEqual({});
  expect(ensureKeyValue({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });

  expect(() => ensureKeyValue("")).toThrow(/Invalid structure/);
  expect(() => ensureKeyValue(100)).toThrow(/Invalid structure/);
  expect(() => ensureKeyValue([])).toThrow(/Invalid structure/);
  expect(() => ensureKeyValue([1, 2, 3])).toThrow(/Invalid structure/);
  expect(() => ensureKeyValue([{ a: 1 }, { b: 2 }])).toThrow(
    /Invalid structure/
  );
});

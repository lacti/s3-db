import readChildValue from "../../../src/storage/resource/readChildValue";

test("readChildValue", () => {
  expect(readChildValue({}, "")).toEqual(undefined);
  expect(readChildValue({}, "abc")).toEqual(undefined);
  expect(readChildValue({ abc: 100 }, "abc")).toEqual(100);
  expect(readChildValue({ abc: "def" }, "abc")).toEqual("def");
  expect(readChildValue({ abc: ["a", "b", "c"] }, "abc")).toEqual([
    "a",
    "b",
    "c"
  ]);
  expect(
    readChildValue({ abc: [{ a: 1 }, { b: 2 }, { c: 3 }] }, "abc")
  ).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  expect(readChildValue({ abc: { def: 100 } }, "abc")).toEqual({ def: 100 });

  expect(() => readChildValue([], "")).toThrow(/Invalid structure/);
  expect(() => readChildValue("string", "")).toThrow(/Invalid structure/);
  expect(() => readChildValue(1000, "")).toThrow(/Invalid structure/);
  expect(() => readChildValue([], "abc")).toThrow(/Invalid structure/);
  expect(() => readChildValue("string", "abc")).toThrow(/Invalid structure/);
  expect(() => readChildValue(1000, "abc")).toThrow(/Invalid structure/);
});

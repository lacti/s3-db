import processRemoveOperation from "../../../src/storage/update/processRemoveOperation";

test("processRemoveOperation-skipWithNullResource", () => {
  expect(
    processRemoveOperation({
      resource: null,
      path: "",
      key: undefined
    })
  ).toEqual(null);
  expect(
    processRemoveOperation({
      resource: null,
      path: "abc.def.efg",
      key: undefined
    })
  ).toEqual(null);
  expect(
    processRemoveOperation({
      resource: null,
      path: "",
      key: ["abc"]
    })
  ).toEqual(null);
  expect(
    processRemoveOperation({
      resource: null,
      path: "abc.def.efg",
      key: ["a", "b", "c"]
    })
  ).toEqual(null);
});

test("processRemoveOperation-removeRoot", () => {
  expect(
    processRemoveOperation({
      resource: { hello: "world" },
      path: "",
      key: undefined
    })
  ).toEqual(null);
});

test("processRemoveOperation-removeAllChildrenOfRoot", () => {
  expect(
    processRemoveOperation({
      resource: { hello: "world" },
      path: "",
      key: ["hello"]
    })
  ).toEqual({});
});

test("processRemoveOperation-removeSomeChildrenOfRoot", () => {
  expect(
    processRemoveOperation({
      resource: { hello: "world", hi: "there", something: [1, 2, "a", "b"] },
      path: "",
      key: ["hello", "hi"]
    })
  ).toEqual({ something: [1, 2, "a", "b"] });
});

test("processRemoveOperation-removeSomeChildrenWithInvalidPath", () => {
  expect(() =>
    processRemoveOperation({
      resource: { a: { b: { c: "c1", d: ["d1", "d2"] } } },
      path: "a.b.c.d",
      key: ["d1", "d2"]
    })
  ).toThrow(/Invalid structure/);
});

test("processRemoveOperation-removeSomeChildrenWithUndefinedKeys", () => {
  expect(
    processRemoveOperation({
      resource: { a: { b: { c: "c1", d: ["d1", "d2"] } } },
      path: "a.b",
      key: ["d1", "d2"]
    })
  ).toEqual({ a: { b: { c: "c1", d: ["d1", "d2"] } } });
});

test("processRemoveOperation-removeSomeChildrenWithUndefinedPath", () => {
  expect(
    processRemoveOperation({
      resource: { a: { b: { c: "c1", d: ["d1", "d2"] } } },
      path: "a.b.e",
      key: ["d1", "d2"]
    })
  ).toEqual({ a: { b: { c: "c1", d: ["d1", "d2"] } } });
  expect(
    processRemoveOperation({
      resource: { a: { b: { c: "c1", d: ["d1", "d2"] } } },
      path: "a.b.e.f.g",
      key: ["d1", "d2"]
    })
  ).toEqual({ a: { b: { c: "c1", d: ["d1", "d2"] } } });
});

test("processRemoveOperation-removeSomeChildrenWithValidPath", () => {
  expect(
    processRemoveOperation({
      resource: { a: { b: { c: "c1", d: ["d1", "d2"] } } },
      path: "a.b",
      key: ["c", "d"]
    })
  ).toEqual({ a: { b: {} } });
  expect(
    processRemoveOperation({
      resource: { a: { b: { c: "c1", d: ["d1", "d2"] } } },
      path: "a.b.d",
      key: undefined
    })
  ).toEqual({ a: { b: { c: "c1" } } });
  expect(
    processRemoveOperation({
      resource: { a: { b: { c: "c1", d: ["d1", "d2"] } } },
      path: "a.b",
      key: ["d"]
    })
  ).toEqual({ a: { b: { c: "c1" } } });
});

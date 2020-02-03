import processAppendOperation from "../../../src/storage/update/processAppendOperation";

test("processAppendOperation-appendKeyValueToRootWithNullResource", () => {
  expect(
    processAppendOperation({
      resource: null,
      path: "",
      value: { abc: "def" },
      upsert: false
    })
  ).toEqual({ abc: "def" });
});

test("processAppendOperation-appendKeyValueToRootWithKeyValueResource", () => {
  expect(
    processAppendOperation({
      resource: { old: "one" },
      path: "",
      value: { new: "thing" },
      upsert: false
    })
  ).toEqual({ old: "one", new: "thing" });
});

test("processAppendOperation-appendSameKeyValueToRootWithKeyValueResource", () => {
  expect(() =>
    processAppendOperation({
      resource: { old: "one" },
      path: "",
      value: { old: "thing" },
      upsert: false
    })
  ).toThrow(/already exists/);
});

test("processAppendOperation-upsertKeyValueToRootWithKeyValueResource", () => {
  expect(
    processAppendOperation({
      resource: { old: "one" },
      path: "",
      value: { old: "thing" },
      upsert: true
    })
  ).toEqual({ old: "thing" });
});

test("processAppendOperation-appendKeyValueToRootOfArrayValueResource", () => {
  expect(() =>
    processAppendOperation({
      resource: [1, 2, "a", "b"],
      path: "",
      value: { new: "thing" },
      upsert: false
    })
  ).toThrow(/Invalid structure/);
});

test("processAppendOperation-appendKeyValueToChildOfArrayValueResource", () => {
  expect(() =>
    processAppendOperation({
      resource: [1, 2, "a", "b"],
      path: "abc",
      value: { new: "thing" },
      upsert: false
    })
  ).toThrow(/Invalid structure/);
});

test("processAppendOperation-upsertKeyValueToRootOfArrayValueResource", () => {
  expect(() =>
    processAppendOperation({
      resource: [1, 2, "a", "b"],
      path: "",
      value: { new: "thing" },
      upsert: true
    })
  ).toThrow(/Invalid structure/);
});

test("processAppendOperation-upsertKeyValueToChildOfArrayValueResource", () => {
  expect(() =>
    processAppendOperation({
      resource: [1, 2, "a", "b"],
      path: "abc",
      value: { new: "thing" },
      upsert: true
    })
  ).toThrow(/Invalid structure/);
});

test("processAppendOperation-appendKeyValueToRootOfKeyValueResource", () => {
  expect(
    processAppendOperation({
      resource: { parent: { oldChild: "old-value" } },
      path: "parent",
      value: { newChild: "new-value" },
      upsert: false
    })
  ).toEqual({ parent: { oldChild: "old-value", newChild: "new-value" } });
});

test("processAppendOperation-appendSameKeyValueToRootOfKeyValueResource", () => {
  expect(() =>
    processAppendOperation({
      resource: { parent: { oldChild: "old-value" } },
      path: "parent",
      value: { oldChild: "new-value" },
      upsert: false
    })
  ).toThrow(/already exists/);
});

test("processAppendOperation-upsertKeyValueToRootOfKeyValueResource", () => {
  expect(
    processAppendOperation({
      resource: { parent: { oldChild: "old-value" } },
      path: "parent",
      value: { oldChild: "new-value" },
      upsert: true
    })
  ).toEqual({ parent: { oldChild: "new-value" } });
});

test("processAppendOperation-appendKeyValueToRootOfSimpleKeyValueResource", () => {
  expect(() =>
    processAppendOperation({
      resource: { parent: "simple-value" },
      path: "parent",
      value: { newChild: "simple-value" },
      upsert: false
    })
  ).toThrow(/Invalid structure/);
});

test("processAppendOperation-appendKeyValueWithPresentLongPath", () => {
  expect(
    processAppendOperation({
      resource: { a: { b: { c: { d: { e: "f" } } } } },
      path: "a.b.c.d",
      value: { f: "g" },
      upsert: false
    })
  ).toEqual({ a: { b: { c: { d: { e: "f", f: "g" } } } } });
});

test("processAppendOperation-appendKeyValueWithAbsentLongPath", () => {
  expect(
    processAppendOperation({
      resource: null,
      path: "a.b.c.d",
      value: { e: "f" },
      upsert: false
    })
  ).toEqual({ a: { b: { c: { d: { e: "f" } } } } });
});

test("processAppendOperation-appendComplexKeyValueWithLongPath", () => {
  expect(
    processAppendOperation({
      resource: null,
      path: "a.b.c.d",
      value: { e: { f: ["a", 1, 2] } },
      upsert: false
    })
  ).toEqual({ a: { b: { c: { d: { e: { f: ["a", 1, 2] } } } } } });
});

test("processAppendOperation-appendSameKeyValueWithLongPath", () => {
  expect(() =>
    processAppendOperation({
      resource: { a: { b: { c: { d: { e: "f" } } } } },
      path: "a.b.c.d",
      value: { e: "h" },
      upsert: false
    })
  ).toThrow(/already exists/);
});

test("processAppendOperation-upsertSameKeyValueWithLongPath", () => {
  expect(
    processAppendOperation({
      resource: { a: { b: { c: { d: { e: "f" } } } } },
      path: "a.b.c.d",
      value: { e: "h" },
      upsert: true
    })
  ).toEqual({ a: { b: { c: { d: { e: "h" } } } } });
});

test("processAppendOperation-appendKeyValueToArrayValueOfLongPath", () => {
  expect(() =>
    processAppendOperation({
      resource: { a: { b: { c: { d: [1, 2, 3] } } } },
      path: "a.b.c.d",
      value: { e: "h" },
      upsert: false
    })
  ).toThrow(/Invalid structure/);
});

test("processAppendOperation-appendArrayValueToRootWithNullResource", () => {
  expect(
    processAppendOperation({
      resource: null,
      path: "",
      value: [1, 2, "a", "b"],
      upsert: false
    })
  ).toEqual([1, 2, "a", "b"]);
});

test("processAppendOperation-appendArrayValueToLongPath", () => {
  expect(
    processAppendOperation({
      resource: null,
      path: "a.b.c",
      value: [1, 2, 3],
      upsert: false
    })
  ).toEqual({ a: { b: { c: [1, 2, 3] } } });
});

test("processAppendOperation-appendArrayValueTokeyValue", () => {
  expect(() =>
    processAppendOperation({
      resource: { a: { b: { c: { d: 100 } } } },
      path: "a.b.c",
      value: [1, 2, 3],
      upsert: false
    })
  ).toThrow(/Invalid structure/);
});

test("processAppendOperation-appendArrayValueToArrayValue", () => {
  expect(
    processAppendOperation({
      resource: { a: { b: { c: [1, 2, 3] } } },
      path: "a.b.c",
      value: [4, 5, 6],
      upsert: false
    })
  ).toEqual({ a: { b: { c: [1, 2, 3, 4, 5, 6] } } });
});

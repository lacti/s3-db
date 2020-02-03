import processModifyOperation from "../../../src/storage/update/processModifyOperation";

test("processModifyOperation-modifyKeyValueToRootWithNullResource", () => {
  expect(() =>
    processModifyOperation({
      resource: null,
      path: "",
      value: { abc: "def" }
    })
  ).toThrow(/resource does not exist/);
});

test("processModifyOperation-modifyKeyValueToRootWithInvalidPath", () => {
  expect(() =>
    processModifyOperation({
      resource: { top: { abc: "abc" } },
      path: "top2",
      value: { abc: "def" }
    })
  ).toThrow(/no target/);
});

test("processModifyOperation-modifyKeyValueToRootWithArrayValue", () => {
  expect(() =>
    processModifyOperation({
      resource: { top: [1, 2, "a", "b"] },
      path: "top",
      value: { abc: "def" }
    })
  ).toThrow(/Invalid structure/);
});

test("processModifyOperation-modifyKeyValueToRootWithValidPath", () => {
  expect(
    processModifyOperation({
      resource: { top: { abc: "abc" } },
      path: "top",
      value: { abc: "def" }
    })
  ).toEqual({ top: { abc: "def" } });
});

test("processModifyOperation-modifyManyKeyValuesToRootWithValidPath", () => {
  expect(
    processModifyOperation({
      resource: { top: { abc: "abc", bcd: ["b", "c", "d"] } },
      path: "top",
      value: { bcd: "efg", cde: [1, 2, "a", "b"] }
    })
  ).toEqual({ top: { abc: "abc", bcd: "efg", cde: [1, 2, "a", "b"] } });
});

test("processModifyOperation-replaceEmptyRoot", () => {
  expect(
    processModifyOperation({
      resource: {},
      path: "",
      value: { abc: "def" }
    })
  ).toEqual({ abc: "def" });
});

test("processModifyOperation-replaceExistingRoot", () => {
  expect(
    processModifyOperation({
      resource: { hello: "world" },
      path: "",
      value: { abc: "def" }
    })
  ).toEqual({ abc: "def" });
});

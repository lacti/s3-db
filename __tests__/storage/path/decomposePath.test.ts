import decomposePath from "../../../src/storage/path/decomposePath";

test("decomposePath", () => {
  expect(decomposePath("")).toEqual({ parentPath: "", currentKey: "" });
  expect(decomposePath("abc")).toEqual({ parentPath: "", currentKey: "abc" });
  expect(decomposePath("abc.def")).toEqual({
    parentPath: "abc",
    currentKey: "def"
  });
  expect(decomposePath("a.b.c.d.e.f")).toEqual({
    parentPath: "a.b.c.d.e",
    currentKey: "f"
  });
});

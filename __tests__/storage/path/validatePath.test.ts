import validatePath from "../../../src/storage/path/validatePath";

test("validatePath", () => {
  expect(validatePath("")).toBe(true);
  expect(validatePath("abc")).toBe(true);
  expect(validatePath("abc.def")).toBe(true);
  expect(validatePath("123.456.abc")).toBe(true);

  expect(validatePath(".")).toBe(false);
  expect(validatePath("...")).toBe(false);
  expect(validatePath(".abc")).toBe(false);
  expect(validatePath("abc..def")).toBe(false);
  expect(validatePath("abc....def")).toBe(false);
  expect(validatePath("123.456.abc.")).toBe(false);
  expect(validatePath("...abc...def...")).toBe(false);
});

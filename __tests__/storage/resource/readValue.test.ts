import readValue from "../../../src/storage/resource/readValue";
import ResourceValue from "../../../src/storage/resource/resourceValue";

test("readValue-fromSimpleObject", () => {
  const value: ResourceValue = {
    a: { name: "another" },
    b: { name: "book" },
    c: { name: "c-programming" }
  };

  expect(readValue(value, "a.name")).toEqual("another");
  expect(readValue(value, "b.name")).toEqual("book");
  expect(readValue(value, "c.name")).toEqual("c-programming");
  expect(readValue(value, "d")).toEqual(undefined);
  expect(readValue(value, "d.name")).toEqual(undefined);

  expect(readValue(value, "")).toEqual(value);
  expect(readValue(value, "a")).toEqual({ name: "another" });
  expect(readValue(value, "b")).toEqual({ name: "book" });
  expect(readValue(value, "c")).toEqual({ name: "c-programming" });
});

test("readValue-fromSimpleArray", () => {
  const value: ResourceValue = ["a", "b", "c"];

  expect(readValue(value, "")).toEqual(value);
  expect(() => readValue(value, "a")).toThrow(/Invalid structure/);
  expect(() => readValue(value, "a.b")).toThrow(/Invalid structure/);
});

test("readValue-fromComplex", () => {
  const value: ResourceValue = {
    users: {
      a: { name: "another" },
      b: { name: "book" },
      c: { name: "c-programming" }
    },
    members: ["a", "b", "c"],
    prices: [{ a: 100 }, { b: 200 }, { c: 3000 }]
  };

  expect(readValue(value, "users")).toEqual(value.users);
  expect(readValue(value, "users.b.name")).toEqual("book");
  expect(readValue(value, "users.d.name")).toEqual(undefined);
  expect(readValue(value, "another")).toEqual(undefined);

  expect(readValue(value, "members")).toEqual(value.members);
  expect(readValue(value, "prices")).toEqual(value.prices);

  expect(() => readValue(value, "users.a.name.x")).toThrow(/Invalid structure/);
  expect(() => readValue(value, "members.a")).toThrow(/Invalid structure/);
  expect(() => readValue(value, "prices.a")).toThrow(/Invalid structure/);
});

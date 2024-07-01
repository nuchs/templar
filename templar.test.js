import t from "tap";
import Registry from "./templar.js";

t.test("Basic Usage", async (t) => {
  function namedTemplate() {
    return "Hello Templar";
  }

  function paramTemplate(name) {
    return `Hello ${name}`;
  }

  const sut = new Registry();

  sut.add(() => "anonymous template", { name: "Michael" });
  t.equal(sut.execute("Michael"), "anonymous template");

  sut.add(namedTemplate);
  t.equal(sut.execute("namedTemplate"), "Hello Templar");

  sut.add(namedTemplate, { name: "override" });
  t.equal(sut.execute("override"), "Hello Templar");

  sut.add(paramTemplate);
  t.equal(sut.execute("paramTemplate", "Kit"), "Hello Kit");
});

t.test("Using a layout", async (t) => {
  function testLayout(body) {
    return `Layout: ${body}`;
  }
  const sut = new Registry();
  sut.add(testLayout);

  function laidOutByProperty() {
    return "stuff";
  }
  laidOutByProperty.layout = "testLayout";
  sut.add(laidOutByProperty);
  t.equal(sut.execute("laidOutByProperty"), "Layout: stuff");

  function laidOutByOption() {
    return "stuff";
  }
  sut.add(laidOutByOption, { layout: "testLayout" });
  t.equal(sut.execute("laidOutByOption"), "Layout: stuff");

  function nestedLayout(body) {
    return `Nest: ${body}`;
  }
  nestedLayout.layout = "testLayout";
  sut.add(nestedLayout);
  sut.add(laidOutByOption, { layout: "nestedLayout" });
  t.equal(sut.execute("laidOutByOption"), "Layout: Nest: stuff");
});

t.test("Invalid Template", async (t) => {
  const sut = new Registry();
  t.throws(() => sut.add(123));
});

t.test("Missing template", async (t) => {
  const sut = new Registry();
  t.throws(() => sut.execute("no such template"));

  const template = () => "";
  template.layout = "No such layout";
  sut.add(template);

  t.throws(() => sut.execute("template"));
});

t.test("Loading templates from file", async (t) => {
  const dir = t.testdir({
    "t1.js": `export default fn1
    function fn1() {
      return "foo"
    }`,
    "t2.js": `export default fn2
    function fn2() {
      return "bar"
    }`,
  });

  const sut = new Registry();
  await sut.load(`${dir}/t1.js`, `${dir}/t2.js`);

  t.equal(sut.execute("fn1"), "foo");
  t.equal(sut.execute("fn2"), "bar");
});

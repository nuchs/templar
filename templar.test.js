import t from "tap";
import Registry from "./templar.js";

t.test("Basic Usage", async (t) => {
  function namedTemplate() {
    return "Hello Templar";
  }

  const sut = new Registry();

  sut.add(() => "anonymous template", { name: "Michael" });
  t.equal(sut.execute("Michael"), "anonymous template");

  sut.add(namedTemplate);
  t.equal(sut.execute("namedTemplate"), "Hello Templar");

  sut.add(namedTemplate, { name: "override" });
  t.equal(sut.execute("override"), "Hello Templar");
});

t.test("Advanced Usage", async (t) => {
  function paramTemplate(_, name) {
    return `Hello ${name}`;
  }

  function nestedTemplate(tmpl, name) {
    return `Nest: ${tmpl("paramTemplate", name)}`;
  }

  function collectionTemplate(_) {
    return ["a", "b", "c"];
  }

  const sut = new Registry();

  sut.add(paramTemplate);
  t.equal(sut.execute("paramTemplate", "Kit"), "Hello Kit");

  sut.add(nestedTemplate);
  t.equal(sut.execute("nestedTemplate", "Michael"), "Nest: Hello Michael");

  sut.add(collectionTemplate);
  t.equal(sut.execute("collectionTemplate"), "a\nb\nc");
});

t.test("Using a layout", async (t) => {
  function basicLayout(_, content) {
    return `Layout: ${content}`;
  }

  function nestedLayout(_, content) {
    return `Nest: ${content}`;
  }

  function multipartLayout(_, content) {
    return `Head: ${content.head}, Body: ${content.body}`;
  }

  function laidOut() {
    return "laid";
  }

  function laidOutMultiPart() {
    return {
      head: "top",
      body: "bottom",
    };
  }

  const sut = new Registry();
  sut.add(basicLayout);

  laidOut.layout = "basicLayout";
  sut.add(laidOut);
  t.equal(sut.execute("laidOut"), "Layout: laid");

  nestedLayout.layout = "basicLayout";
  sut.add(nestedLayout);
  sut.add(laidOut, { layout: "nestedLayout" });
  t.equal(sut.execute("laidOut"), "Layout: Nest: laid");

  sut.add(multipartLayout);
  sut.add(laidOutMultiPart, { layout: "multipartLayout" });
  t.equal(sut.execute("laidOutMultiPart"), "Head: top, Body: bottom");
});

t.test("Bad templates", async (t) => {
  const sut = new Registry();

  const template = () => "";
  template.layout = "No such layout";
  sut.add(template);

  t.throws(() => sut.execute("template"));
  t.throws(() => sut.add(123));
  t.throws(() => sut.execute("no such template"));
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

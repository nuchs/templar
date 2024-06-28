export default class Registry {
  #templates = {};

  /**
   * Adds a template function to the registry.
   * @param {Function} template - The template function to add.
   * @param {Object} [opts] - Optional settings.
   * @param {string} [opts.name] - Custom name for the template.
   * @throws Will throw an error if the template is not a function.
   */
  add(template, opts = null) {
    if (typeof template !== "function") {
      throw new Error("template must be a function");
    }

    const name = opts?.name ?? template.name;
    template.layout = opts?.layout ?? template.layout;

    this.#templates[name] = template;
  }

  /**
   * Dynamically imports and loads templates from file paths.
   * @param {...string} filePaths - The file paths to load templates from.
   */
  async load(...filePaths) {
    for (const filePath of filePaths) {
      const { default: template } = await import(filePath);
      this.add(template);
    }
  }

  /**
   * Executes a template by name with provided arguments.
   * If the template has a layout property, it will execute the layout template.
   * @param {string} name - The name of the template to execute.
   * @param {...*} args - The arguments to pass to the template function.
   * @returns {*} The result of the template function execution.
   * @throws Will throw an error if the template is not found.
   */
  execute(name, ...args) {
    const template = this.#templates[name];
    if (!template) {
      throw new Error(`template ${name} not found`);
    }

    const result = template(...args);

    if (template.layout) {
      const layoutTemplate = this.#templates[template.layout];
      if (!layoutTemplate) {
        throw new Error(`layout template ${template.layout} not found`);
      }
      return layoutTemplate(result);
    }

    return result;
  }
}
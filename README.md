# Templar

A very simple package for managing templates

## Writing templates

Templates are just javascript functions. 

The first parameter to the function is a function that can be used to execute
other templates, any further parameters are optional and will be populated with
any arguments you provide when executing the template

If you return an array of strings they will be joined together with newlines

### Example template
```javascript
function Greeting(tmpl, name) {
    return `Hello ${name}`
}
```

### Example nested template
```javascript
function Nested(tmpl, name) {
    return `Nested ${tmpl.execute('Greeting', name)}`
}
```

### Example of returning a collection
```javascript
function Greeting(tmpl, contacts) {
    return contacts.map(contact => `
        <tr><td>${contact.name}</td><td>${contact.email}</td></tr>
    `)
}
```

## Adding Templates

To manage your templates you need to create a template registry, you can
add templates to registry and then execute them.

### Basic template usage
```javascript
import Registry from '@nuchs/templar'

function Greeting(tmpl, name) {
    return `Hello ${name}`
}

const registry = new Registry()

registry.add(Greeting)

// This will log:
// Hello World
Console.log(registry.execute('Greeting', 'World'))
```

### Overriding a template's name
By default the templates are named after the function they are defined in. You
can override this by providing a name option when add the template.

```javascript
import Registry from '@nuchs/templar'

function Greeting(tmpl, name) {
    return `Hello ${name}`
}

const registry = new Registry()

registry.add(Greeting, { name: "Salutation" })

// This will log:
// Hello World
Console.log(registry.execute('Salutation', 'World'))
```

## Layouts

Templar provides basic layout support. You can specify the output of one
template to be passed to another which will then be rendered. You can specify
the layout either by setting the `layout` property on the template or by
providing a `layout` option when adding the template. Specifying the layout when
adding the template will override the layout provided in the option.

Given the following templates:

```javascript
function Layout(tmpl, body) {
    return `<html>
        <header>
            <title>Using a layout</title>
        </header>
        <body>${body}</body>
    </html>`
}

function Content(tmpl) {
    return ""
}

registry.add(Layout)
```

### Specify layout via property
```javascript
Content.layout = "Layout"
registry.add(Content)
registry.execute(Content)
```

### Specify layout via option
```javascript
registry.add(Content, { layout: 'Layout' })
registry.execute(Content)
```

In both cases the output of rendering the template will be:

```html
<html>
    <header>
        <title>Using a layout</title>
    </header>
    <body>
        <p>Some Content</p>
    </body>
</html>`
```

You can specify a layout for a layout template in which case the output of the
first layout will be passed to the second.

### Nested Layouts
```javascript
function Nested(tmpl, body) {
    return `Nested: ${body}`
}

function Layout(tmpl, body) {
    return `Layout: ${body}`
}
Layout.layout = 'Nested'

function Laid() {
    return "Egg"
}
Laid.layout = 'Layout'

registry.add(Nested)
registry.add(Layout)
registry.add(Laid)

registry.execute("Laid")

// Outputs
// Nested: Layout: Egg
```

You can also have multiart layouts by having a template return an object rather
than a string e.g.

### Multiple layouts
```javascript

function multipartLayout(_, content) {
    return `Head: ${content.head}, Body: ${content.body}`;
}

function laidOutMultiPart() {
    return {
        head: "top",
        body: "bottom",
    };
}
laidOutMultiPart.layout = "multipartLayout";

registry.add(multipartLayout);
registry.add(laidOutMultiPart);
registry.execute("laidOutMultiPart");

// Outputs
// Head: top, Body: bottom
```

## Loading Templates From File

Templates can be loaded from file, the template function must have been exported
as the default for the module for this to work.

### template.js
```javascript
export default Greeting

function Greeting(tmpl, name) {
    return `Hello ${name}`
}
```

### Loading the template file
```javascript
registry.load('./path/to/template.js')
registry.execute('Greeting', 'World')
```

The load method can accept multiple paths and will attempt to load each one in
turn.

### Loading multiple template files
```javascript
registry.load('./path/to/template1.js', './path/to/template2.js')
```

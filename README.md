# xmlscanner

A fast XML parser / scanner written in Typescript

Given an XML string, the xml scanner will parse the XML and invoke the defined events on the specified paths.

## Core concepts

There are two basic types of XML parsers:

- SAX (event based)
- DOM (tree based)

This library implements a SAX parser on steroids thus giving a bit of the ease of use of the DOM parsers while still allowing for the speed of SAX parsers. The XML scanner allows for scanning XML strings. Streaming is not supported (yet).

The xml scanner is built around the concept of events and paths.
There are several types of events (like open tag, close tag, text, comment etc.) each fired when the scanner encounters the corresponding part of the XML document.
Paths which are used to define on which document elements the events need to be invoked. The paths are similar to the XPath absolute path expressions.
An event trie can be filled with events that need to be invoked on specific paths. Once defined it can be used to scan XML strings.

## Basic usage

Internally the xml scanner uses a trie structure with nodes of type `XmlEvents`. All fields in the `XmlEvents` object are optional, so you can and should define only the events you are interested in. An empty trie structure can be created by calling `emptyXmlEvents()`.

The trie can be expanded by calling `addElement(events, path)`. This will return the `XmlEvents` object where that path points to.

On the `XmlEvents` object you can define the events you are interested in. See the [XmlEvents](./src/xmlScannerTypes.ts) type for more information.

When the whole trie structure is set up, the `xmlScanner(xml, events)` function is called with the XML string and the trie structure.

## Code examples

For the examples below, we will use the following XML:

```xml
<company>
  <employees>
    <employee>
      <id>1</id>
      <name>John Doe</name>
      <position>Software Engineer</position>
      <department>Engineering</department>
    </employee>
    ... many more employee records ...
  </employees>
</company>
```

In order to extract just the employee names, we can use the following code:

```typescript
import { addElement, emptyXmlEvents, xmlScanner } from '@continuit/xmlscanner';

async function extractNames(xml: string) {
  // This will collect all the names found in the XML
  const names: string[] = [];

  // Setup the xml scanner.
  // In this case we are interested in the names,
  // so we will listen for the text event on elements on the following path:
  // company/employees/employee/name
  const events = emptyXmlEvents();
  addElement(events, 'company/employees/employee/name').text = (text) => names.push(text);
  ((text) => names.push(text));

  // Scan the XML and extract the names
  xmlScanner(xml, events);

  // Return the names
  return names;
}
```

A bit more complex example would be to extract all the employees as objects.

When an `employee` element is opened, we will create a new empty `Employee` object `activeEmployee`.
Since not all fields are available in each employee element, we will in fact use a `Partial<Employee>` object.
Then when the properties of the employee record are matched they are filled in the `activeEmployee` object.
When the `employee` element is closed, the `activeEmployee` object is pushed to the result array.

```typescript
type Employee = {
  id: number;
  name: string;
  position: string;
  department: string;
};

async function extractEmployees(xml: string): Employee[] {
  // This will collect all the employees found in the XML
  const result: Employee[] = [];

  // This will hold the current employee object as we parse the XML
  let activeEmployee: Partial<Employee> = {};

  // Setup the xml scanner.
  const events = emptyXmlEvents();

  // Get the event object for the path company/employees/employee
  const employee = addElement(events, 'company/employees/employee');

  // Setup the event listeners for the employee object.
  employee.tagopen = () => activeEmployee = {};
  addElement(employee, 'name').text = (text) => activeEmployee.name = text;
  addElement(employee, 'id').text = (text) => activeEmployee.id = Number.parseInt(text);
  addElement(employee, 'position').text = (text) => activeEmployee.position = text;
  addElement(employee, 'department').text = (text) => activeEmployee.department = text;
  employee.tagclose = () => result.push(activeEmployee as Employee);

  // Scan the XML and extract the employees
  xmlScanner(xml, events);

  // Return the employees
  return result;
}
```

## Performance

The xml scanner is designed to be as fast as possible.

Care has been taken to ensure that the library performs well. First of all: we tried out different approaches to fast parsing of the XML string. After doing analysis we used the two basic fast string operations are `indexOf` and `charCodeAt`.

In order to allow for events to be defined on different paths, we use a trie structure. 
This treelike structure is traversed while scanning the XML string so when events need to be invoked the right node is already at hand.
Since all events are defined on the nodes the memory usage is minimal. 
While scanning the XML document we keep track of where the equivalent trie node is so event invoking is also very fast.

No tokens are created while scanning, just scanning the XML string. 
When an event is specified on a path that need to pass some content (like text and attribute events) only then is the content extracted and entities unescaped. 
Since V8 and the like allow for allocation of substrings very fast there is only a minimal penalty in terms of performance, especially if there are no entities to unescape. 
This is the reason we used a string as the source of the XML document instead of an `UInt8Array`.

## Caveats

### Namespaces

The xml scanner currently does not support all XML features. Namespaces are not parsed, so if you have namespaces in your XML, you will need to handle those yourself.

```xml
<root xmlns:x="http://example.com/namespace">
  <x:child>text</x:child>
</root>
```

In the above case the path `root/x:child` will be matched, but if the namespace name is changed from `x` to `y`, the path `root/y:child` will not be matched.

### DTD

The xml scanner does not support DTDs. If you have DTDs in your XML, a not supported error will be thrown.

### Streaming

The xml scanner does not support streaming. The entire XML document must be present in a string before it can be scanned.

## Why another XML parser?

There are already a number of XML parsers available for Typescript, so why build another one.

The main reason is that I needed a fast XML parser for XML files wrapped inside zip files varying in size from 30MB to 200MB.
We did not find a solution that would be both performant and easy to use (and not run out of memory).

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for details.


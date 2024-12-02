import { assertEquals } from 'jsr:@std/assert';
import { xmlScanner } from '../src/xmlScanner.ts';
import { addElement, emptyXmlEvents } from '../src/xmlEventsBuilder.ts';

const xml = await Deno.readTextFile('./test_data/testfile.xml');

Deno.test('example_names_only', () => {
  const events = emptyXmlEvents();
  const names: string[] = [];
  addElement(events, 'company/employees/employee/name').text = (text) => names.push(text);
  xmlScanner(xml, events);
  assertEquals(names.length, 824);
});

type Employee = {
  id: number;
  name: string;
  position: string;
  department: string;
};

Deno.test('example_objects', () => {
  const events = emptyXmlEvents();
  const result: Employee[] = [];
  let activeEmployee: Partial<Employee> = {};

  const employee = addElement(events, 'company/employees/employee');
  employee.tagopen = () => activeEmployee = {};
  addElement(employee, 'name').text = (text) => activeEmployee.name = text;
  addElement(employee, 'id').text = (text) => activeEmployee.id = Number.parseInt(text);
  addElement(employee, 'position').text = (text) => activeEmployee.position = text;
  addElement(employee, 'department').text = (text) => activeEmployee.department = text;
  employee.tagclose = () => result.push(activeEmployee as Employee);

  xmlScanner(xml, events);

  assertEquals(result.length, 824);
  assertEquals(result[0].id, 1);
  assertEquals(result[0].name, 'John Doe');
  assertEquals(result[0].position, 'Software Engineer');
  assertEquals(result[0].department, 'Engineering');
});

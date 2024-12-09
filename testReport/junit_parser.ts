import { addAttributeEvent, addElement, emptyXmlEvents, xmlScanner } from '../src/mod.ts';

export type TestSuites = {
  name: string;
  tests: number;
  failures: number;
  errors: number;
  time: number;
  testSuites: TestSuite[];
};

export type TestSuite = {
  name: string;
  tests: number;
  disabled: number;
  errors: number;
  failures: number;
  testCases: TestCase[];
};

export type TestCaseState = 'PASSED' | 'FAILED' | 'SKIPPED';

export type TestCase = {
  name: string;
  classname: string;
  state: TestCaseState;
  time: number;
  line: number;
  col: number;
};

// Empty objects for building up the testSuites object.
const emptyTestSuite = {
  name: '',
  tests: 0,
  disabled: 0,
  errors: 0,
  failures: 0,
  testCases: [],
};

const emptyTestCase: TestCase = {
  name: '',
  classname: '',
  state: 'PASSED',
  time: 0,
  line: 0,
  col: 0,
};

const events = emptyXmlEvents();

export function createJUnitParser() {
  // State while building up the testSuites object.
  const testSuites: TestSuites = {
    name: '',
    tests: 0,
    failures: 0,
    errors: 0,
    time: 0,
    testSuites: [],
  };
  let activeTestSuite: TestSuite = structuredClone(emptyTestSuite);
  let activeTestCase: TestCase = structuredClone(emptyTestCase);

  // Events for parsing the JUnit XML file.
  // Testsuites level
  addAttributeEvent(events, 'testsuites', 'name', (value) => testSuites.name = value);
  addAttributeEvent(events, 'testsuites', 'tests', (value) => testSuites.tests = parseInt(value));
  addAttributeEvent(events, 'testsuites', 'failures', (value) => testSuites.failures = parseInt(value));
  addAttributeEvent(events, 'testsuites', 'errors', (value) => testSuites.errors = parseInt(value));
  addAttributeEvent(events, 'testsuites', 'time', (value) => testSuites.time = parseFloat(value));

  // TestSuite level
  const testSuiteEvents = addElement(events, 'testsuites/testsuite');
  testSuiteEvents.tagopen = () => {
    activeTestSuite = structuredClone(emptyTestSuite);
  };
  testSuiteEvents.tagclose = () => {
    testSuites.testSuites.push(activeTestSuite);
  };
  addAttributeEvent(testSuiteEvents, null, 'name', (value) => activeTestSuite.name = value);
  addAttributeEvent(testSuiteEvents, null, 'tests', (value) => activeTestSuite.tests = parseInt(value));
  addAttributeEvent(testSuiteEvents, null, 'disabled', (value) => activeTestSuite.disabled = parseInt(value));
  addAttributeEvent(testSuiteEvents, null, 'errors', (value) => activeTestSuite.errors = parseInt(value));
  addAttributeEvent(testSuiteEvents, null, 'failures', (value) => activeTestSuite.failures = parseInt(value));

  // TestCase level
  const testCaseEvents = addElement(events, 'testsuites/testsuite/testcase');
  testCaseEvents.tagopen = () => {
    activeTestCase = structuredClone(emptyTestCase);
  };
  testCaseEvents.tagclose = () => {
    activeTestSuite.testCases.push(activeTestCase);
  };
  addAttributeEvent(testCaseEvents, null, 'name', (value) => activeTestCase.name = value);
  addAttributeEvent(testCaseEvents, null, 'classname', (value) => activeTestCase.classname = value);
  addAttributeEvent(testCaseEvents, null, 'time', (value) => activeTestCase.time = parseFloat(value));
  addAttributeEvent(testCaseEvents, null, 'line', (value) => activeTestCase.line = parseInt(value));
  addAttributeEvent(testCaseEvents, null, 'col', (value) => activeTestCase.col = parseInt(value));
  addElement(testCaseEvents, 'skipped').tagopen = () => activeTestCase.state = 'SKIPPED';
  addElement(testCaseEvents, 'failure').tagopen = () => activeTestCase.state = 'FAILED';

  return (JUnitXml: string) => {
    // Cleanup previous results
    testSuites.testSuites = [];
    testSuites.name = '';
    testSuites.tests = 0;
    testSuites.failures = 0;
    testSuites.errors = 0;
    testSuites.time = 0;
    // Parse JUnit XML file.
    xmlScanner(JUnitXml, events);
    // Return the parsed JUnit XML file.
    return testSuites;
  };
}

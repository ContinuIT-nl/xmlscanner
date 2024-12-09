import type { TestCaseState, TestSuites } from './junit_parser.ts';
import type { LcovFile, LcovSummary } from './lcov_parser.ts';
import { buildMarkdownTable, markdownTitle, percentage } from './markdownUtils.ts';

const extractFilename = (path: string) => path.split('/').at(-1) || path;

const testState = (state: TestCaseState) => state === 'PASSED' ? '✅' : state === 'FAILED' ? '❌' : '⚠️';

export const convertTestresultsToMarkdown = (
  xmlFilename: string,
  jUnitResults: TestSuites,
  lcovResults: LcovFile[],
  lcovSummary: LcovSummary,
) => {
  const skipped = jUnitResults.testSuites.reduce((acc, suite) => acc + suite.disabled, 0);
  const success = jUnitResults.tests - jUnitResults.failures - jUnitResults.errors - skipped;

  // Testresult summary
  const testResultSummary = buildMarkdownTable(
    [
      '☑ Tests',
      `${testState('PASSED')} Success`,
      `${testState('FAILED')} Failures/Errors`,
      `${testState('SKIPPED')} Skipped`,
    ],
    ['right', 'right', 'right', 'right'],
    [[
      jUnitResults.tests.toLocaleString(),
      success.toLocaleString(),
      (jUnitResults.failures + jUnitResults.errors).toLocaleString(),
      skipped.toLocaleString(),
    ], ['', percentage(skipped, jUnitResults.tests), '', '']],
  );

  const codeCoverageSummary = buildMarkdownTable(
    ['☰ Lines', 'ᛘ Branches'],
    ['right', 'right'],
    [[
      percentage(lcovSummary.linesHit, lcovSummary.linesFound),
      percentage(lcovSummary.branchesHit, lcovSummary.branchesFound),
    ]],
  );

  const testDetailRows: string[][] = [];

  for (const testSuite of jUnitResults.testSuites) {
    for (const testCase of testSuite.testCases) {
      testDetailRows.push([
        `\`${extractFilename(testSuite.name)}\``,
        testCase.name,
        testState(testCase.state),
      ]);
    }
  }

  const testDetails = buildMarkdownTable(
    ['✓✓ Test Suite', '☑ Test', 'State'],
    ['default', 'default', 'default'],
    testDetailRows,
  );

  const codeCoverageDetails = buildMarkdownTable(
    ['🗎 File', '☰ Lines', 'ᛘ Branches'],
    ['left', 'right', 'right'],
    lcovResults.map((file) => [
      `\`${file.filename}\``,
      percentage(file.linesHit, file.linesFound),
      percentage(file.branchesHit, file.branchesFound),
    ]),
  );

  return [
    ...markdownTitle('Test Results', 1),
    `Results from \`${
      extractFilename(xmlFilename)
    }\` contains ${jUnitResults.testSuites.length} testsuites with ${jUnitResults.tests} tests:`,
    '',
    ...markdownTitle('Summary', 2),
    ...markdownTitle('Test Results', 3),
    ...testResultSummary,
    ...markdownTitle('Code Coverage', 3),
    ...codeCoverageSummary,
    ...markdownTitle('Detailed Test Results', 2),
    ...testDetails,
    ...markdownTitle('Detailed Code Coverage', 2),
    ...codeCoverageDetails,
  ].join('\n');
};

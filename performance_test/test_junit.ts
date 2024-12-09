import { createJUnitParser, type TestCaseState, type TestSuites } from './junit_parser.ts';
import { type LcovFile, lcovParser } from './lcov_parser.ts';

const extractFilename = (path: string) => path.split('/').at(-1) || path;

const testState = (state: TestCaseState) => state === 'PASSED' ? '✅' : state === 'FAILED' ? '❌' : '⚠️';

const convertTestresultsToMarkdown = (xmlFilename: string, jUnitResults: TestSuites, lcovResults: LcovFile[]) => {
  const skipped = jUnitResults.testSuites.reduce((acc, suite) => acc + suite.disabled, 0);
  const success = jUnitResults.tests - jUnitResults.failures - jUnitResults.errors - skipped;

  const percentage = (value: number, total: number) => value ? `${((value / total) * 100).toFixed(1)}%` : '';

  const results: string[] = [
    '# Test Results',
    '',
    `Results from \`${
      extractFilename(xmlFilename)
    }\` contains ${jUnitResults.testSuites.length} testsuites with ${jUnitResults.tests} tests:`,
    '',
    '## Summary',
    '',
    // Summary test results
    '### Test Results',
    '',
    `| ☑ Tests | ${testState('PASSED')} Success | ${testState('FAILED')} Failures/Errors | ${
      testState('SKIPPED')
    } Skipped |`,
    '|-------|----------|----------|--------|',
    `| ${jUnitResults.tests} | ${success} | ${jUnitResults.failures + jUnitResults.errors} | ${skipped} |`,
    `|  | ${percentage(success, jUnitResults.tests)} | ${
      percentage(jUnitResults.failures + jUnitResults.errors, jUnitResults.tests)
    } | ${percentage(skipped, jUnitResults.tests)} |`,
    '',
  ];

  const lcovSummary = lcovResults.reduce((acc, file) => {
    acc.functionsHit += file.functionsHit;
    acc.functionsFound += file.functionsFound;
    acc.branchesFound += file.branchesFound;
    acc.branchesHit += file.branchesHit;
    acc.linesFound += file.linesFound;
    acc.linesHit += file.linesHit;
    return acc;
  }, {
    functionsHit: 0,
    functionsFound: 0,
    branchesFound: 0,
    branchesHit: 0,
    linesFound: 0,
    linesHit: 0,
  });

  results.push(
    '### Code Coverage',
    '',
    '| ☰ Lines | ᛘ Branches |',
    '| ------:|----------:|',
    `| ${percentage(lcovSummary.linesHit, lcovSummary.linesFound)} | ${
      percentage(lcovSummary.branchesHit, lcovSummary.branchesFound)
    } |`,
    '',
  );

  // Detailed test results
  results.push(
    '## Detailed Test Results',
    '',
    '| ✓✓ Test Suite | ☑ Test | State |',
    '|------------|------|------|',
  );
  for (const testSuite of jUnitResults.testSuites) {
    for (const testCase of testSuite.testCases) {
      results.push(`| \`${extractFilename(testSuite.name)}\` | ${testCase.name} | ${testState(testCase.state)} |`);
    }
  }
  results.push('');

  // Detailed code coverage result
  results.push(
    '## Detailed Code Coverage',
    '',
    '| 🗎 File | ☰ Lines | ᛘ Branches |',
    '|:-----|------:|---------:|',
  );
  for (const file of lcovResults) {
    results.push(
      `| \`${file.filename}\` | ${percentage(file.linesHit, file.linesFound)} | ${
        percentage(file.branchesHit, file.branchesFound)
      } |`,
    );
  }
  results.push('');
  return results.join('\n');
};

async function test_xmlscanner(xmlFilename: string, lcovFilename: string) {
  const xmlBytes = await Deno.readFile(xmlFilename);
  const xmlData = new TextDecoder().decode(xmlBytes);

  const lcovBytes = await Deno.readFile(lcovFilename);
  const lcovData = new TextDecoder().decode(lcovBytes);

  // Create the parser for JUnit result file.
  const jUnitParser = createJUnitParser();

  // Performance test.
  const count = 10000;
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    jUnitParser(xmlData);
  }
  const end = performance.now();
  const duration_ms = (end - start) / count;
  const speed_MBps = xmlData.length * 1000 / (duration_ms * 1024 * 1024);
  console.log(`>>> JUnitParser took ${duration_ms.toFixed(3)} ms. (${speed_MBps.toFixed(1)} MB/s)`);

  // Convert the results to markdown.
  const results = convertTestresultsToMarkdown(xmlFilename, jUnitParser(xmlData), lcovParser(lcovData));
  await Deno.writeTextFile('./test_results.md', results);
}

export async function junit_tests() {
  const xmlFilename = './testresult.xml';
  const lcovFilename = './cov.lcov';
  await test_xmlscanner(xmlFilename, lcovFilename);
}

if (import.meta.main) {
  await junit_tests();
}

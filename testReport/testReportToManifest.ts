import type { TestSuites } from './junit_parser.ts';
import type { LcovFile, LcovSummary } from './lcov_parser.ts';
import { percentage } from './markdownUtils.ts';

export const convertTestresultsToManifest = (
  xmlFilename: string,
  jUnitResults: TestSuites,
  _lcovResults: LcovFile[],
  lcovSummary: LcovSummary,
) => {
  const skipped = jUnitResults.testSuites.reduce((acc, suite) => acc + suite.disabled, 0);
  const success = jUnitResults.tests - jUnitResults.failures - jUnitResults.errors - skipped;
  const result = {
    source: xmlFilename,
    codeCoverageLinesPercentage: percentage(lcovSummary.linesHit, lcovSummary.linesFound),
    codeCoverageBranchesPercentage: percentage(lcovSummary.branchesHit, lcovSummary.branchesFound),
    tests: jUnitResults.tests.toLocaleString(),
    testsPassed: success.toLocaleString(),
    testsFailed: (jUnitResults.failures + jUnitResults.errors).toLocaleString(),
    testsSkipped: skipped.toLocaleString(),
    testPercentage: percentage(success, jUnitResults.tests),
    testHash: 'TODO',
  };
  // todo: the idea is that the hash can be calcualed when the report is formed and that when the report is formed again the hash is the same.
  // The hash should not depend for the time of the report generation and timing related results in the report.
  return JSON.stringify(result, null, 2);
};

import { createJUnitParser, type TestSuites } from './junit_parser.ts';
import { createLcovSummary, type LcovFile, lcovParser } from './lcov_parser.ts';
import { convertTestresultsToMarkdown } from './testReportToMarkdown.ts';
import { convertTestresultsToManifest } from './testReportToManifest.ts';

type ReportDefinition = {
  test_results: {
    junit: string[];
    coverage: string[];
  };
  output: {
    markdown: string;
    manifest: string;
  };
};

function isReportDefinition(value: unknown): value is ReportDefinition {
  if (typeof value !== 'object' || value === null) return false;
  if (!('test_results' in value && 'output' in value)) return false;
  const { test_results, output } = value;
  if (typeof test_results !== 'object' || test_results === null || typeof output !== 'object' || output === null) {
    return false;
  }
  if (!('junit' in test_results && 'coverage' in test_results && 'markdown' in output && 'manifest' in output)) {
    return false;
  }
  const { junit, coverage } = test_results;
  const { markdown, manifest } = output;
  if (
    !(Array.isArray(junit) && Array.isArray(coverage) && typeof markdown === 'string' && typeof manifest === 'string')
  ) return false;
  return junit.every((element) => typeof element === 'string' && element.length > 0) &&
    coverage.every((element) => typeof element === 'string' && element.length > 0);
}

export async function createTestReport(reportDefinitionFilename: string) {
  // Get the definition file and validate it's content
  const definitionText = await Deno.readTextFile(reportDefinitionFilename);
  const definition = JSON.parse(definitionText);
  if (!isReportDefinition(definition)) throw new Error('Invalid report definition');

  // Load all JUnit files and convert and merge them
  const jUnitParser = createJUnitParser();
  const junitData: TestSuites[] = [];
  for (const junitFilename of definition.test_results.junit) {
    const junitBytes = await Deno.readFile(junitFilename);
    const xmlData = new TextDecoder().decode(junitBytes);
    junitData.push(jUnitParser(xmlData));
  }

  // Combine all JUnit data
  const combinedJUnitData: TestSuites = junitData.reduce((acc, data) => {
    acc.tests += data.tests;
    acc.failures += data.failures;
    acc.errors += data.errors;
    acc.time += data.time;
    acc.testSuites.push(...data.testSuites);
    return acc;
  }, { name: '', tests: 0, failures: 0, errors: 0, time: 0, testSuites: [] });

  // Load all LCOV files and convert and merge them
  const lcovDatas: LcovFile[] = [];
  for (const lcovFilename of definition.test_results.coverage) {
    const lcovBytes = await Deno.readFile(lcovFilename);
    const lcovData = new TextDecoder().decode(lcovBytes);
    lcovDatas.push(...lcovParser(lcovData));
  }

  // Create LCOV file summary
  const lcovSummary = createLcovSummary(lcovDatas);
  // Run the performance test
  if (definition.output.markdown) {
    const markdown = convertTestresultsToMarkdown(reportDefinitionFilename, combinedJUnitData, lcovDatas, lcovSummary);
    await Deno.writeTextFile(definition.output.markdown, markdown);
  }

  // Output the manifest file
  if (definition.output.manifest) {
    const manifest = convertTestresultsToManifest(reportDefinitionFilename, combinedJUnitData, lcovDatas, lcovSummary);
    await Deno.writeTextFile(definition.output.manifest, manifest);
  }
}

if (import.meta.main) {
  try {
    await createTestReport('./test_results/testreport.json');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}

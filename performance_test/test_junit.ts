import { createJUnitParser } from './junit_parser.ts';

async function test_xmlscanner(xmlFilename: string) {
  const xmlBytes = await Deno.readFile(xmlFilename);
  const xmlData = new TextDecoder().decode(xmlBytes);

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
}

export async function junit_tests() {
  const xmlFilename = './testresult.xml';
  await test_xmlscanner(xmlFilename);
}

if (import.meta.main) {
  await junit_tests();
}

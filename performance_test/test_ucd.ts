/**
 * This example demonstrates how to use the xmlScanner to parse a
 * large XML file from the Unicode Character Database (UCD).
 * The example reads the XML file and sets up event handlers to
 * capture specific attributes from the XML elements.
 * Specifically, it captures the code points and their names from
 * the 'char' elements within the 'repertoire' section of the UCD XML.
 *
 * The example also measures the performance of the XML scanning
 * process and prints the a selection code points and their names to the console.
 * It also compares the performance of the xmlScanner with the @libs/xml parser.
 */

import { addAttributeEvent, addElement, emptyXmlEvents, xmlScanner } from '../src/mod.ts';
import type { CodePoint, Result } from './ucd_types.ts';
import { setPriority } from 'node:os';

async function loadUcdData(): Promise<[string, number]> {
  const xmlFileBytes = await Deno.readFile('./test_data/ucd.all.flat.xml');
  const xmlFile = new TextDecoder('utf-8').decode(xmlFileBytes);
  return [xmlFile, xmlFileBytes.byteLength];
}

let currentMem: Deno.MemoryUsage = Deno.memoryUsage();

function getMemoryExtra() {
  const mem = Deno.memoryUsage();
  const extra = mem.heapUsed - currentMem.heapUsed;
  currentMem = mem;
  return extra;
}

async function perform_tests() {
  // Set process priority to highest prio to get more reproducible results
  setPriority(-20);
  // Load the XML file into memory
  const start = performance.now();
  const [xmlFile, xmlFileBytes] = await loadUcdData();
  const end = performance.now();
  const fileLoading_ms = end - start;
  const fileSize_MB = xmlFileBytes / 1024 / 1024;
  console.log(`>>> File loading took ${Math.round(fileLoading_ms)} ms. Size is ${Math.round(fileSize_MB)} MB.`);

  const results: Result[] = [];

  // Parse the XML file with the xmlScanner
  for (let i = 0; i < 10; i++) {
    getMemoryExtra();
    results.push(perform_xmlscanner_test(xmlFile));
  }

  // Parse the XML file with @libs/xml
  getMemoryExtra();
  results.push(perform_libs_xml_test(xmlFile));

  getMemoryExtra();

  const resultData = results.map((r) => ({
    source: r.source,
    duration_ms: r.duration_ms.toFixed(2),
    speed_MBps: (fileSize_MB / r.duration_ms * 1000).toFixed(2),
    memUsage_MB: r.memUsage_MB,
  }));

  // Emit result
  console.log(
    `${'Source'.padEnd(30)} | ${'Duration'.padStart(10)} ms | ${'Speed'.padStart(10)} MB/s | ${'Mem'.padStart(10)} MB`,
  );
  console.log(
    resultData.map((r) =>
      `${r.source.padEnd(30)} | ${r.duration_ms.padStart(10)} ms | ${r.speed_MBps.padStart(10)} MB/s | ${
        r.memUsage_MB.toFixed(2).padStart(10)
      } MB`
    ).join('\n'),
  );

  // ------------------------------------------------------------------------------------------------
  // Emit a small sample of the results
  // ------------------------------------------------------------------------------------------------
  // console.log(codePoints.slice(1000, 1010).map((cp) => `${cp.cp} - ${cp.name}`).join('\n'));
}

function perform_xmlscanner_test(xmlFile: string) {
  const codePoints: CodePoint[] = [];
  let codePoint = '';

  const addCodePoint = (name: string) => name ? codePoints.push({ cp: codePoint, name }) : null;

  const events = emptyXmlEvents();
  const charEvents = addElement(events, 'ucd/repertoire/char');
  charEvents.tagopen = (_name) => codePoint = '';
  addAttributeEvent(events, 'ucd/repertoire/char', 'cp', (attr) => codePoint = attr);
  addAttributeEvent(events, 'ucd/repertoire/char', 'na', addCodePoint);
  addAttributeEvent(events, 'ucd/repertoire/char/name-alias', 'alias', addCodePoint);

  const start = performance.now();
  xmlScanner(xmlFile, events);
  const end = performance.now();
  const duration_ms = end - start;
  return { source: 'xmlScanner', codePoints, duration_ms, memUsage_MB: getMemoryExtra() / 1024 / 1024 };
}

// ------------------------------------------------------------------------------------------------
// Parse with @libs/xml
// ------------------------------------------------------------------------------------------------
import { parse } from 'jsr:@libs/xml';

function perform_libs_xml_test(xmlFile: string) {
  const codePoints: CodePoint[] = [];
  const start = performance.now();
  const _result = parse(xmlFile);
  const end = performance.now();
  const duration_ms = end - start;

  // Extract the code points from the result
  // const codePoints = Object.entries(_result.ucd.repertoire).map(([cp, data]) => ({ cp: cp, name: data.na }));

  return { source: '@libs/xml', codePoints, duration_ms, memUsage_MB: getMemoryExtra() / 1024 / 1024 };
}

await perform_tests();

// todo: also add 10MB test and 1MB test

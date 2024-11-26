import { assertEquals } from 'jsr:@std/assert';
import { xmlAnalyser } from '../src/xmlAnalyser.ts';

Deno.test('xmlAnalyser', () => {
  // todo: CDATA  
  const xml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>  <?Hello World?>  <!-- comment --><root value="1"><child>text</child><sibling  /></root>`;
  const result = xmlAnalyser(xml);
  const expected = [
    "#comment",
    "#pi",
    "/root",
    "/root/child",
    "/root/child#content",
    "/root/sibling",
    "/root@value"
  ].sort();
  assertEquals(result, expected);
});

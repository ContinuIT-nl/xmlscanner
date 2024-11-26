import { assertEquals, assertGreater, assertThrows } from 'jsr:@std/assert';
import { xmlAnalyser } from '../src/xmlAnalyser.ts';
import { xmlScanner } from '../src/xmlScanner.ts';
import type { XmlEvents } from '../src/xmlScannerTypes.ts';

Deno.test('xmlScanner-events', () => {
  const result: string[] = [];

  const events: XmlEvents = {
    tagopen: (name: string) => result.push(`tagopen [${name}]`),
    tagclose: (name: string) => result.push(`tagclose [${name}]`),
    text: (text: string) => result.push(`text [${text}]`),
    cdata: (text: string) => result.push(`cdata [${text}]`),
    processinginstruction: (target: string, data: string) => result.push(`processinginstruction [${target}] [${data}]`),
    comment: (text: string) => result.push(`comment [${text}]`),
    xmlDeclaration: (version: string, encoding: string, standalone: string) =>
      result.push(`xmlDeclaration [${version}] [${encoding}] [${standalone}]`),
    allAttributes: (name: string, value: string) => result.push(`attribute [${name}] [${value}]`),
  };
  events.unknownElement = events;

  const xml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>  <?Hello World?>  <!-- comment --><root value="1"><child>text</child><sibling  /></root>`;
  xmlScanner(xml, events);

  const expected = [
    'xmlDeclaration [1.0] [UTF-8] [yes]',
    'processinginstruction [Hello] [World]',
    'comment [comment]',
    'tagopen [root]',
    'attribute [value] [1]',
    'tagopen [child]',
    'text [text]',
    'tagclose [child]',
    'tagopen [sibling]',
    'tagclose [sibling]',
    'tagclose [root]',
  ];
  assertEquals(result, expected);
});

const Count = 1000;

Deno.test('xmlScanner-performance', async () => {
  const xmlBytes = await Deno.readFile('./test/testfile.xml');
  const xmlText = new TextDecoder('utf-8').decode(xmlBytes);

  const start = performance.now();
  for (let i = 0; i < Count; i++) {
    xmlScanner(xmlText, {});
  }
  const end = performance.now();
  const duration_ms = Math.round(end - start) / Count;
  const mb_per_second = Math.round((xmlBytes.byteLength * 1000 / duration_ms) / 1024 / 1024);
  assertGreater(mb_per_second, 30);
  console.log(`>>> Scanning dummy XML took ${duration_ms * 1e6} ns/run (${mb_per_second} MB/s)`);
  xmlAnalyser(xmlText);
});

Deno.test('comment', () => {
  const xml = '<!-- comment --><a/>';
  xmlScanner(xml, {});
});

Deno.test('cdata', () => {
  const xml = '<a><![CDATA[bla]]></a>';
  xmlScanner(xml, {});
});

Deno.test('processing-instruction', () => {
  const xml1 = '<?target data?><a/>';
  xmlScanner(xml1, {});
  const xml2 = '<a/><?target data?>';
  xmlScanner(xml2, {});
});

Deno.test('invalid-xml-no-closing-tag', () => {
  // No closing tag
  const xml = '<root><child>text</child><sibling />'; 
  assertThrows(() => xmlScanner(xml, {}));
});

Deno.test('invalid-xml-no-root-element', () => {
  // No root element
  const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'; 
  assertThrows(() => xmlScanner(xml, {}));
});

Deno.test('invalid-xml-multiple-root-elements', () => {
  // Multiple root elements
  const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a/><b/>'; 
  assertThrows(() => xmlScanner(xml, {}));
});

Deno.test('invalid-xml-unmatched-tag', () => {
  // Unmatched tag
  const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a></b>'; 
  assertThrows(() => xmlScanner(xml, {}));
});

Deno.test('invalid-xml-unclosed-attribute', () => {
  // Unclosed attribute
  const xml = '<a b="c/>'; 
  assertThrows(() => xmlScanner(xml, {}));
  const xml2 = '<a b=\'c/>'; 
  assertThrows(() => xmlScanner(xml2, {}));
});

Deno.test('invalid-xml-processing-instruction', () => {
  // Unclosed processing instruction
  const xml = '<a><?Hello World</a>'; 
  assertThrows(() => xmlScanner(xml, {}));
  const xml2 = '<a/><?Hello World'; 
  assertThrows(() => xmlScanner(xml2, {}));
});

Deno.test('invalid-xml-comment', () => {
  // Unclosed comment
  const xml = '<a><!--Hello World</a>'; 
  assertThrows(() => xmlScanner(xml, {}));
  const xml2 = '<a/><!--Hello World'; 
  assertThrows(() => xmlScanner(xml2, {}));
});

Deno.test('invalid-xml-cdata', () => {
  // Unclosed CDATA
  const xml = '<a><![CDATA[Hello World]]</a>'; 
  assertThrows(() => xmlScanner(xml, {}));
});

Deno.test('invalid-xml-unknown-character', () => {
  // Unknown character
  const xml = '<a></a>b'; 
  assertThrows(() => xmlScanner(xml, {}));
  // Unknown character
  const xml2 = '<a b/>'; 
  assertThrows(() => xmlScanner(xml2, {}));
  const xml3 = '<a 3="c"/>'; 
  assertThrows(() => xmlScanner(xml3, {}));
});
  
Deno.test('special-characters', () => {
  const xml = '<a>  <主板 主板="beta">значение</主板> <！！>&lt;&gt;&#32;</！！> <Æ/><Ø/></a>';
  xmlScanner(xml, {});
});

Deno.test('emoticons', () => {
  const xml = '<😊>😎</😊>';
  xmlScanner(xml, {});
});

Deno.test('unqoute', () => {
  const xml = '<?xml version=\'1.0\' encoding="UTF-8" ?><a/>';
  xmlScanner(xml, {});
  // invalid ones we still accept.
  const xml2 = '<?xml version=\'1.0 encoding="UTF-8 standalone=true ?><a/>';
  xmlScanner(xml2, {});
});

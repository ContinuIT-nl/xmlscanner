import { unEntity } from '../src/unEntity.ts';
import { assertEquals } from '@std/assert';

Deno.test('unEntity', () => {
  assertEquals(unEntity('&lt;'), '<');
  assertEquals(unEntity('&gt;'), '>');
  assertEquals(unEntity('&amp;'), '&');
  assertEquals(unEntity('&apos;'), "'");
  assertEquals(unEntity('&quot;'), '"');
  assertEquals(unEntity('&lt;&gt;'), '<>');
  assertEquals(unEntity('.&lt;&gt;.'), '.<>.');
  assertEquals(unEntity('&lt;&gt;.'), '<>.');
  assertEquals(unEntity('.&lt;&gt;'), '.<>');
  assertEquals(unEntity('&lt;.&gt;'), '<.>');
  assertEquals(unEntity('.&lt;.&gt;.'), '.<.>.');
  assertEquals(unEntity('&lt;.&gt;.'), '<.>.');
  assertEquals(unEntity('.&lt;.&gt;'), '.<.>');
  assertEquals(unEntity('&#65;'), 'A');
  assertEquals(unEntity('&#x41;'), 'A');
  assertEquals(unEntity('&#X41;'), 'A');
  // Some failure cases
  assertEquals(unEntity('&lt'), '&lt');
  assertEquals(unEntity('&xx;'), '&xx;');
  assertEquals(unEntity('&#99'), '&#99');
  assertEquals(unEntity('&#x99'), '&#x99');
  assertEquals(unEntity('&lt;.&lt'), '<.&lt');
  assertEquals(unEntity('&lt;.&xx;'), '<.&xx;');
  assertEquals(unEntity('&lt;.&#99'), '<.&#99');
  assertEquals(unEntity('&lt;.&#x99'), '<.&#x99');
});

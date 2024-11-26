import { addAttributeEvent, addElement, emptyXmlEvents } from '../src/xmlEventsBuilder.ts';
import { xmlScanner } from '../src/xmlScanner.ts';
import { assertEquals } from 'jsr:@std/assert';

Deno.test('xmlEventBuilder-base', () => {
  const result: string[] = [];
  const events = emptyXmlEvents();
  addElement(events, 'root').tagopen = () => {
    result.push('Tagopen [root]');
  };
  addAttributeEvent(events, 'root', 'value', (value) => {
    result.push(`Attribute [value] [${value}]`);
  });
  addElement(events, 'root/child').text = (text) => {
    result.push(`Text [root/child] [${text}]`);
  };
  addElement(events, 'root/sibling').tagopen = () => {
    result.push('Tagopen [root/sibling]');
  };
  addElement(events, 'root/sibling').tagclose = () => {
    result.push('Tagclose [root/sibling]');
  };

  const xml = '<root value="1"><child>text</child><sibling  /><sibling/></root>';
  xmlScanner(xml, events);

  const expected = [
    'Tagopen [root]',
    'Attribute [value] [1]',
    'Text [root/child] [text]',
    'Tagopen [root/sibling]',
    'Tagclose [root/sibling]',
    'Tagopen [root/sibling]',
    'Tagclose [root/sibling]',
  ];
  assertEquals(result, expected);
});

Deno.test('xmlEventBuilder-specials', () => {
  const sql = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a href="b&#99;d">a&#x62;c</a>';
  const result: string[] = [];
  const events = emptyXmlEvents();
  addElement(events, 'a').tagopen = () => {
    result.push('Tagopen [a]');
  };
  addAttributeEvent(events, 'a', 'href', (value) => {
    result.push(`Attribute [href] [${value}]`);
  });
  addElement(events, 'a').text = (text) => {
    result.push(`Text [a] [${text}]`);
  };
  events.xmlDeclaration = () => { 
    result.push('XML Declaration');
  };
  xmlScanner(sql, events);

  const expected = ['XML Declaration', 'Tagopen [a]', 'Attribute [href] [bcd]', 'Text [a] [abc]'];
  assertEquals(result, expected);
});

import { unEntity } from './unEntity.ts';
import { XmlParsingError } from './XmlParsingError.ts';
import type { XmlEvents } from './xmlScannerTypes.ts';
import { validNameNextBits, validNameStartBits, whitespaceBits } from './characterBits.ts';

export const unquote = (value: string) => {
  if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  return value;
};

// Parse processing instruction or xml declaration. The characters <? are already validated.
const parsePIorXmlDeclaration = (
  xml: string,
  start: number,
  events: XmlEvents,
) => {
  const piEnd = xml.indexOf('?>', start + 2); // skip <?
  if (piEnd === -1) {
    throw new XmlParsingError('PROCESSING_INSTRUCTION_NOT_CLOSED', start);
  }
  let targetEnd = start + 2;
  while (
    targetEnd <= piEnd &&
    !(whitespaceBits[xml.charCodeAt(targetEnd) >> 5] &
      (1 << (xml.charCodeAt(targetEnd) & 31)))
  ) targetEnd++;
  const target = xml.slice(start + 2, targetEnd);
  if (target.toLowerCase() === 'xml') {
    // XML Declaration: <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    // Only allowed as the first token. No need to check if this is a second one, only one can exist at index 0.
    if (start !== 0) {
      throw new XmlParsingError('XML_DECLARATION_MUST_BE_FIRST_TOKEN', start);
    }
    const content = xml.slice(start + 5, piEnd); // Skip <?xml

    // Split content on whitespace and trim each part
    const parts = Object.fromEntries(
      content.split(/\s+/).filter((part) => part.trim() !== '').map((part) => part.split('=')),
    );
    // And emit event
    events.xmlDeclaration?.(
      unquote(parts.version ?? ''),
      unquote(parts.encoding ?? ''),
      unquote(parts.standalone ?? ''),
    );
  } else {
    // Emit PI event
    events.processinginstruction?.(target, xml.slice(targetEnd, piEnd).trim());
  }
  return piEnd + 2;
};

const parseElement = (xml: string, start: number, events: XmlEvents) => {
  // Opening tag or self closing tag
  // Scan the name & extract.
  let charCode = xml.charCodeAt(start + 1);
  if (!(validNameStartBits[charCode >> 5] & (1 << (charCode & 31)))) {
    throw new XmlParsingError('INVALID_ELEMENT_NAME', start);
  }
  let nameEnd = start + 2;
  for (;;) {
    charCode = xml.charCodeAt(nameEnd);
    if (!(validNameNextBits[charCode >> 5] & (1 << (charCode & 31)))) break;
    nameEnd++;
  }
  const tagName = xml.slice(start + 1, nameEnd);

  // Once we have the name, check if we can find the events for the tag. If not, we use unknownElement.
  const lEvents = events.children?.[tagName] ?? events.unknownElement ?? {};
  lEvents.tagopen?.(tagName);

  // Attributes loop
  let attrNameStart = nameEnd;
  for (;;) {
    // Find start of attribute name or end of the opening tag.
    charCode = xml.charCodeAt(attrNameStart);
    while (whitespaceBits[charCode >> 5] & (1 << (charCode & 31))) {
      attrNameStart++;
      charCode = xml.charCodeAt(attrNameStart);
    }

    // End of open tag
    if (charCode === 62) { // 62 = '>'
      // content loop
      let contentStart = attrNameStart + 1;
      for (;;) {
        // Scan for the next <. Everything before is text content.
        const contentEnd = xml.indexOf('<', contentStart);
        if (contentEnd === -1) {
          throw new XmlParsingError('NO_ENDTAG_FOUND', contentStart);
        }
        if (contentEnd > contentStart) {
          lEvents.text?.(unEntity(xml.slice(contentStart, contentEnd)));
        }

        // Is it a closing tag?
        const nextCode = xml.charCodeAt(contentEnd + 1);
        if (nextCode === 47) { // 47 = '/'
          // Compare name with the name of the current element.
          if (tagName !== xml.slice(contentEnd + 2, contentEnd + 2 + tagName.length)) {
            throw new XmlParsingError('MISMATCHED_TAG', contentEnd);
          }
          // Close tag
          lEvents.tagclose?.(tagName);
          // not: this is the only escape from the content loop.
          return contentEnd + 2 + tagName.length + 1;
        }

        if (nextCode === 63) { // 63 = '?'
          contentStart = parsePIorXmlDeclaration(xml, contentEnd, lEvents);
        } else if (nextCode === 33) { // 33 = '!'
          contentStart = parseCommentOrDocTypeOrCData(xml, contentEnd, lEvents, true);
        } else {
          contentStart = parseElement(xml, contentEnd, lEvents);
        }
      }
    }

    // Self closing tag
    if (charCode === 47 && xml.charCodeAt(attrNameStart + 1) === 62) { // 47 = '/', 62 = '>'
      lEvents.tagclose?.(tagName);
      return attrNameStart + 2;
    }

    // Attribute name.
    if (!(validNameStartBits[charCode >> 5] & (1 << (charCode & 31)))) {
      throw new XmlParsingError('INVALID_ATTRIBUTE_NAME', start);
    }
    let attrNameEnd = attrNameStart + 1;
    for (;;) {
      charCode = xml.charCodeAt(attrNameEnd);
      if (!(validNameNextBits[charCode >> 5] & (1 << (charCode & 31)))) break;
      attrNameEnd++;
    }

    // Attribute value
    // equal sign
    if (charCode !== 61) {
      throw new XmlParsingError('UNEXPECTED_TOKEN', attrNameEnd); // 61 = '='
    }
    // quote character
    charCode = xml.charCodeAt(attrNameEnd + 1);
    if (!(charCode === 34 || charCode === 39)) {
      throw new XmlParsingError('UNEXPECTED_TOKEN', attrNameEnd + 1); // 34 = '"', 39 = "'"
    }
    // attribute value end
    const attrValueEnd = xml.indexOf(charCode === 34 ? '"' : "'", attrNameEnd + 2);
    if (attrValueEnd === -1) {
      throw new XmlParsingError('ATTRIBUTE_VALUE_NOT_CLOSED', attrNameEnd + 2);
    }

    // Emit attribute events
    const attrName = xml.slice(attrNameStart, attrNameEnd);
    if (lEvents.allAttributes || lEvents.attributes?.[attrName]) {
      const attrValue = xml.slice(attrNameEnd + 2, attrValueEnd);
      lEvents.allAttributes?.(attrName, attrValue);
      lEvents.attributes?.[attrName]?.(unEntity(attrValue));
    }

    // Next attributes
    attrNameStart = attrValueEnd + 1;
  }
};

// Parse comment or doctype. The characters <! are already validated.
const parseCommentOrDocTypeOrCData = (
  xml: string,
  start: number,
  events: XmlEvents,
  allowCData: boolean,
) => {
  if (xml[start + 2] === '-' && xml[start + 3] === '-') {
    // We have found a comment
    const commentEnd = xml.indexOf('-->', start + 4);
    if (commentEnd === -1) {
      throw new XmlParsingError('COMMENT_NOT_CLOSED', start);
    }
    // Emit comment event
    events.comment?.(xml.slice(start + 4, commentEnd).trim());
    return commentEnd + 3;
  }
  // Let's see if it is a DOCTYPE
  if (xml.slice(start + 2, start + 9) === 'DOCTYPE') {
    // if (docTypeIndex !== -1) throw new XmlParsingError('MULTIPLE_DOCTYPE_FOUND', start);
    // docTypeIndex = start;
    throw new XmlParsingError('UNEXPECTED_TOKEN', start); // doctype not supported yet
    // todo: parse doctype
  }
  // cdata = '<![CDATA[' [^]]* ']]>'
  if (allowCData && xml.slice(start + 2, start + 9) === '[CDATA[') {
    const cdataEnd = xml.indexOf(']]>', start + 9);
    if (cdataEnd === -1) throw new XmlParsingError('CDATA_NOT_CLOSED', start);
    events.cdata?.(xml.slice(start + 8, cdataEnd));
    return cdataEnd + 3;
  }
  throw new XmlParsingError('UNEXPECTED_TOKEN', start);
};

/**
 * Execute the XML scanner.
 * The XML scanner will parse the XML string and invoke the defined by xmlEvents t  rie.
 *
 * @param xml - The XML string to parse.
 * @param xmlEvents - The trie structure with the events to invoke.
 * @returns void
 */
export function xmlScanner(xml: string, xmlEvents: XmlEvents): void {
  // An XML document is made up of the following:
  // <xmldeclaration>? misc* <doctype>? misc* <element> misc*
  // Where misc = whitespace | comment<!-- ... --> | processinginstruction<? ... ?>
  // Scan for the first occurance of <. All values before that must be whitespace.
  let index = 0;
  let rootElementIndex = -1;
  for (;;) {
    const ltIndex = xml.indexOf('<', index);

    // We did not find any element/comment etc until the end.
    if (ltIndex === -1) {
      const len = xml.length;
      while (index < len) {
        const charCode = xml.charCodeAt(index);
        if (!(whitespaceBits[charCode >> 5] & (1 << (charCode & 31)))) {
          throw new XmlParsingError('UNEXPECTED_TOKEN', index);
        }
        index++;
      }
      if (rootElementIndex !== -1) return;
      throw new XmlParsingError('NO_ROOT_ELEMENT_FOUND', index);
    }

    // Check there is only whitespace in between.
    while (index < ltIndex) {
      const charCode = xml.charCodeAt(index);
      if (!(whitespaceBits[charCode >> 5] & (1 << (charCode & 31)))) {
        throw new XmlParsingError('UNEXPECTED_TOKEN', index);
      }
      index++;
    }

    // Parse the token
    if (xml.charCodeAt(ltIndex + 1) === 63) { // 63 = '?'
      index = parsePIorXmlDeclaration(xml, ltIndex, xmlEvents);
    } else if (xml.charCodeAt(ltIndex + 1) === 33) { // 33 = '!'
      index = parseCommentOrDocTypeOrCData(xml, ltIndex, xmlEvents, false);
    } else {
      if (rootElementIndex !== -1) {
        throw new XmlParsingError('MULTIPLE_ROOT_ELEMENTS', ltIndex);
      }
      rootElementIndex = ltIndex;
      index = parseElement(xml, ltIndex, xmlEvents);
    }
  }
}

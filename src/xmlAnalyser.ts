import { xmlScanner } from './xmlScanner.ts';
import type { XmlEvents } from './xmlScannerTypes.ts';

/**
 * Analyzes the given XML string and returns a sorted array of unique paths and elements found within the XML.
 * The paths include tags, attributes, text content, CDATA sections, processing instructions, and comments.
 *
 * The main use case is for analysis of the XML structure and quick creation of correct xml event tries for scanning XML strings.
 * If you find employees/employee/name#text you can set a path of employees/employee and define a text event on that path.
 *
 * @param xml - The XML string to analyze.
 * @returns A sorted array of unique paths and elements found within the XML.
 */

export const xmlAnalyser = (xml: string): string[] => {
  const result = new Set<string>();
  const path: string[] = [''];
  const events: XmlEvents = {
    tagopen: (name: string) => {
      path.push(path.at(-1) + '/' + name);
      result.add(path.at(-1)!);
    },
    tagclose: () => {
      path.pop();
    },
    text: (text: string) => {
      if (text.trim()) result.add(path.at(-1) + '#content');
    },
    cdata: () => {
      result.add(path.at(-1) + '#cdata');
    },
    processinginstruction: () => {
      result.add(path.at(-1) + '#pi');
    },
    comment: () => {
      result.add(path.at(-1) + '#comment');
    },
    unknownAttribute: (name: string, _value: string) => {
      result.add(path.at(-1) + '@' + name);
    },
  };
  events.unknownElement = events;
  xmlScanner(xml, events);
  return [...result.values()].sort();
};

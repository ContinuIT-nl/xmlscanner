import { xmlScanner } from './xmlScanner.ts';
import type { XmlEvents } from './xmlScannerTypes.ts';

export const xmlAnalyser = (xml: string) => {
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
    allAttributes: (name: string, _value: string) => {
      result.add(path.at(-1) + '@' + name);
    },
  };
  events.unknownElement = events;
  xmlScanner(xml, events);
  return [...result.values()].sort();
};

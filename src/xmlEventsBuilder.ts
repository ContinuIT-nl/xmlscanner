import type { AttributeEvent, XmlEvents } from './xmlScannerTypes.ts';

export const emptyXmlEvents = (): XmlEvents => ({});

export const parseElementPath = (path: string): string[] => path.split('/').filter((part) => part);

export const addElement = (events: XmlEvents, elementPath: string): XmlEvents => {
  const pathArray = parseElementPath(elementPath);
  let current = events;
  for (const element of pathArray) {
    current.children ??= {};
    current = current.children[element] ??= {};
  }
  return current;
};

export const addAttributeEvent = (
  events: XmlEvents,
  elementPath: string,
  attributeName: string,
  attributeEvent: AttributeEvent,
): XmlEvents => {
  const elementEvents = addElement(events, elementPath);
  elementEvents.attributes ??= {};
  elementEvents.attributes[attributeName] = attributeEvent;
  return events;
};

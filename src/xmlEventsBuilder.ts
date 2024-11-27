import type { AttributeEvent, XmlEvents } from './xmlScannerTypes.ts';

export const emptyXmlEvents = (): XmlEvents => ({});

export const parseElementPath = (path: string): string[] => path.split('/').filter((part) => part);

/**
 * Add an element to the trie structure.
 * @param events - The trie structure node to add elements to.
 * @param elementPath - The path to add to the trie structure.
 * @returns The trie node the path points to.
 */
export const addElement = (
  events: XmlEvents,
  elementPath: string,
): XmlEvents => {
  const pathArray = parseElementPath(elementPath);
  let current = events;
  for (const element of pathArray) {
    current.children ??= {};
    current = current.children[element] ??= {};
  }
  return current;
};

/**
 * Add an attribute event to the trie structure.
 * @param events - The trie structure node to add the attribute event to.
 * @param elementPath - The path to the element an attribute event needs to be added to.
 * @param attributeName - The name of the attribute.
 * @param attributeEvent - The event to add.
 * @returns The trie structure node with the new attribute event added.
 */
export const addAttributeEvent = (
  events: XmlEvents,
  elementPath: string,
  attributeName: string,
  attributeEvent: AttributeEvent,
): XmlEvents => {
  const elementEvents = addElement(events, elementPath);
  elementEvents.attributes ??= {};
  elementEvents.attributes[attributeName] = attributeEvent;
  return elementEvents;
};

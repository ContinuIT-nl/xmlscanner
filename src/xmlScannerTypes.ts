/**
 * Event triggered when an XML tag is opened.
 * @param name The name of the opened tag.
 */
export type TagOpenEvent = (name: string) => void;

/**
 * Event triggered when an XML tag is closed.
 * @param name The name of the closed tag.
 */
export type TagCloseEvent = (name: string) => void;

/**
 * Event triggered when an attribute value is encountered.
 * @param value The value of the attribute.
 */
export type AttributeEvent = (value: string) => void;

/**
 * Event triggered when text content is encountered.
 * @param text The text content.
 */
export type TextEvent = (text: string) => void;

/**
 * Event triggered when CDATA content is encountered.
 * @param text The CDATA content.
 */
export type CdataEvent = (text: string) => void;

/**
 * Event triggered when a processing instruction is encountered.
 * @param target The target of the processing instruction.
 * @param data The data of the processing instruction.
 */
export type ProcessingInstructionEvent = (target: string, data: string) => void;

/**
 * Event triggered when a comment is encountered.
 * @param text The content of the comment.
 */
export type CommentEvent = (text: string) => void;

/**
 * Event triggered when an XML declaration is encountered.
 * The XML declaration can only appear as the first token in the XML document.
 * @param version The XML version.
 * @param encoding The encoding of the XML document.
 * @param standalone The standalone declaration.
 */
export type XmlDeclarationEvent = (
  version: string,
  encoding: string,
  standalone: string,
) => void;

/**
 * Event triggered when a DOCTYPE declaration is encountered.
 * The DOCTYPE declaration can only appear before the root element in the XML document.
 * @param name The name of the root element.
 * @param publicId The public identifier.
 * @param systemId The system identifier.
 */
export type XmlDocTypeEvent = (
  name: string,
  publicId: string,
  systemId: string,
) => void;

/**
 * Event triggered when an unknown attribute is encountered.
 * @param name The name of the unknown attribute.
 * @param value The value of the unknown attribute.
 */
export type XmlUnknownAttributeEvent = (name: string, value: string) => void;

/**
 * Represents a collection of event handlers for XML parsing.
 */
export type XmlEvents = {
  /** Event handler for opening tags. */
  tagopen?: TagOpenEvent;
  /** Event handler for closing tags. */
  tagclose?: TagCloseEvent;
  /** Event handler for text content. */
  text?: TextEvent;
  /** Event handler for CDATA sections. */
  cdata?: CdataEvent;
  /** Event handler for processing instructions. */
  processinginstruction?: ProcessingInstructionEvent;
  /** Event handler for comments. */
  comment?: CommentEvent;
  /** Event handler for XML declarations. */
  xmlDeclaration?: XmlDeclarationEvent;
  /** Event handler for DOCTYPE declarations. */
  docType?: XmlDocTypeEvent;
  /** Event handler for unknown attributes. */
  unknownAttribute?: XmlUnknownAttributeEvent;
  /** Event handlers for unknown elements. */
  unknownElement?: XmlEvents;
  /**
   * Child elements, where the key is the element name and the value is the corresponding XmlEvents.
   */
  children?: Map<string, XmlEvents>;
  /**
   * Attribute handlers, where the key is the attribute name and the value is the corresponding AttributeEvent.
   */
  attributes?: Map<string, AttributeEvent>;
};

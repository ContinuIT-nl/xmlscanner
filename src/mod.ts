import type {
  AttributeEvent,
  CdataEvent,
  CommentEvent,
  ProcessingInstructionEvent,
  TagCloseEvent,
  TagOpenEvent,
  TextEvent,
  XmlDeclarationEvent,
  XmlDocTypeEvent,
  XmlEvents,
  XmlUnknownAttributeEvent,
} from './xmlScannerTypes.ts';
import { xmlAnalyser } from './xmlAnalyser.ts';
import { xmlScanner } from './xmlScanner.ts';
import { XmlErrorMessages, XmlParsingError, type XmlParsingErrorCode } from './XmlParsingError.ts';
import { unEntity } from './unEntity.ts';
import { addAttributeEvent, addElement, emptyXmlEvents, parseElementPath } from './xmlEventsBuilder.ts';

export {
  addAttributeEvent,
  addElement,
  emptyXmlEvents,
  parseElementPath,
  unEntity,
  xmlAnalyser,
  XmlErrorMessages,
  XmlParsingError,
  xmlScanner,
};

export type {
  AttributeEvent,
  CdataEvent,
  CommentEvent,
  ProcessingInstructionEvent,
  TagCloseEvent,
  TagOpenEvent,
  TextEvent,
  XmlDeclarationEvent,
  XmlDocTypeEvent,
  XmlEvents,
  XmlParsingErrorCode,
  XmlUnknownAttributeEvent,
};

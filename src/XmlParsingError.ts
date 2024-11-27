/**
 * Error codes as a type for XML parsing errors.
 */
export type XmlParsingErrorCode = keyof typeof XmlErrorMessages;

/**
 * Error messages for XML parsing errors.
 */
export const XmlErrorMessages = {
  'PROCESSING_INSTRUCTION_NOT_CLOSED': 'Processing instruction or XML declaration not closed',
  'XML_DECLARATION_MUST_BE_FIRST_TOKEN': 'XML declaration must be the first token in the document',
  'NO_ROOT_ELEMENT_FOUND': 'No root element found',
  'UNEXPECTED_TOKEN': 'Unexpected token',
  'COMMENT_NOT_CLOSED': 'Comment not closed',
  'DOCTYPE_NOT_SUPPORTED': 'DOCTYPE is not supported (yet)',
  'MULTIPLE_ROOT_ELEMENTS': 'Multiple root elements found',
  'MULTIPLE_DOCTYPE_FOUND': 'Multiple doctype found',
  'CDATA_NOT_CLOSED': 'CDATA not closed',
  'INVALID_ELEMENT_NAME': 'Invalid element name',
  'INVALID_ATTRIBUTE_NAME': 'Invalid attribute name',
  'ATTRIBUTE_VALUE_NOT_CLOSED': 'Attribute value not closed',
  'NO_ENDTAG_FOUND': 'No end tag found',
  'MISMATCHED_TAG': 'Mismatched tag',
};

/**
 * Error class for XML parsing errors.
 */
export class XmlParsingError extends Error {
  public ErrorCode: XmlParsingErrorCode;
  public position: number;
  constructor(errorCode: XmlParsingErrorCode, position: number) {
    super(XmlErrorMessages[errorCode]);
    this.ErrorCode = errorCode;
    this.position = position;
  }
}

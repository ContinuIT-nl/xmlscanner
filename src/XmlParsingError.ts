import { XmlErrorMessages } from './xmlScannerConstants.ts';
import type { XmlParsingErrorCode } from './xmlScannerTypes.ts';

export class XmlParsingError extends Error {
  public ErrorCode: XmlParsingErrorCode;
  public position: number;
  constructor(errorCode: XmlParsingErrorCode, position: number) {
    super(XmlErrorMessages[errorCode]);
    this.ErrorCode = errorCode;
    this.position = position;
  }
}

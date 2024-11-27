// 16KB of lookup tables for valid name start and next characters.
// The lookup tables are 64Kbits in size each denoting if that codepoint is valid or not.
export const validNameStartBits = new Uint32Array(0x10000 >> 5);
export const validNameNextBits = new Uint32Array(0x10000 >> 5);
export const whitespaceBits = new Uint32Array(0x10000 >> 5);

// Code point ranges for valid name start and next characters.

type CodePointRange = [number, number];

// NameStartChar ::= ":" | [A-Z] | "_" | [a-z] |
// [#xC0-#xD6]     | [#xD8-#xF6]     | [#xF8-#x2FF]    | [#x370-#x37D]   | [#x37F-#x1FFF]  | [#x200C-#x200D]   |
// [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
// 0xD800..0xDFFF are surrogate pairs, we match those as well for [#x10000-#xEFFFF].
const validNameStart: CodePointRange[] = [
  [':'.charCodeAt(0), ':'.charCodeAt(0)],
  ['A'.charCodeAt(0), 'Z'.charCodeAt(0)],
  ['_'.charCodeAt(0), '_'.charCodeAt(0)],
  ['a'.charCodeAt(0), 'z'.charCodeAt(0)],
  [0xC0, 0xD6],
  [0xD8, 0xF6],
  [0xF8, 0x2FF],
  [0x370, 0x37D],
  [0x37F, 0x1FFF],
  [0x200C, 0x200D],
  [0x2070, 0x218F],
  [0x2C00, 0x2FEF],
  [0x3001, 0xDFFF],
  [0xF900, 0xFDCF],
  [0xFDF0, 0xFFFD],
];

// NameChar	     ::= ":" | [A-Z] | "_" | [a-z] | "-" | "." | [0-9] |
// #xB7 | [#xC0-#xD6] [#xD8-#xF6] | [#xF8-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] |
// [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
// 0xD800..0xDFFF are surrogate pairs, we match those as well for [#x10000-#xEFFFF].
const validNameNext: CodePointRange[] = [
  [':'.charCodeAt(0), ':'.charCodeAt(0)],
  ['A'.charCodeAt(0), 'Z'.charCodeAt(0)],
  ['_'.charCodeAt(0), '_'.charCodeAt(0)],
  ['a'.charCodeAt(0), 'z'.charCodeAt(0)],
  ['-'.charCodeAt(0), '-'.charCodeAt(0)],
  ['.'.charCodeAt(0), '.'.charCodeAt(0)],
  ['0'.charCodeAt(0), '9'.charCodeAt(0)],
  [0xB7, 0xB7],
  [0xC0, 0xD6],
  [0xD8, 0xF6],
  [0xF8, 0x37D],
  [0x37F, 0x1FFF],
  [0x200C, 0x200D],
  [0x203F, 0x2040],
  [0x2070, 0x218F],
  [0x2C00, 0x2FEF],
  [0x3001, 0xDFFF],
  [0xF900, 0xFDCF],
  [0xFDF0, 0xFFFD],
];

const whitespace: CodePointRange[] = [
  [0x20, 0x20],
  [0x09, 0x09],
  [0x0A, 0x0A],
  [0x0D, 0x0D],
];

const setCodepointRange = (bits: Uint32Array, range: CodePointRange) => {
  for (let i = range[0]; i <= range[1]; i++) bits[i >> 5] |= 1 << (i & 31);
};

for (const range of validNameStart) {
  setCodepointRange(validNameStartBits, range);
}
for (const range of validNameNext) setCodepointRange(validNameNextBits, range);
for (const range of whitespace) setCodepointRange(whitespaceBits, range);

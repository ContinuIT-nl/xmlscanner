export type Alignment = 'left' | 'right' | 'center' | 'default';

export const alignmentStr = (alignment: Alignment, width: number) => {
  switch (alignment) {
    case 'left':
      return `:${'-'.repeat(width - 1)}`;
    case 'right':
      return `${'-'.repeat(width - 1)}:`;
    case 'center':
      return `:${'-'.repeat(width - 2)}:`;
    default:
      return '-'.repeat(width);
  }
};

const strLenCodePoints = (str: string) => [...str].length;

export const padString = (str: string, alignment: Alignment, width: number) => {
  const l = strLenCodePoints(str);
  switch (alignment) {
    case 'left':
      return str + ' '.repeat(width - l);
    case 'right':
      return ' '.repeat(width - l) + str;
    case 'center': {
      const left = Math.floor((width - l) / 2);
      return ' '.repeat(left) + str + ' '.repeat(width - l - left);
    }
    default:
      return str + ' '.repeat(width - l);
  }
};

export const buildMarkdownTable = (headers: string[], alignment: Alignment[], data: string[][]): string[] => {
  const maxWidths = new Array(headers.length).fill(3);
  for (let i = 0; i < headers.length; i++) maxWidths[i] = Math.max(maxWidths[i], strLenCodePoints(headers[i]));
  for (const row of data) {
    const len = Math.min(headers.length, row.length);
    for (let i = 0; i < len; i++) maxWidths[i] = Math.max(maxWidths[i], strLenCodePoints(row[i]));
  }
  return [
    `| ${headers.map((s, i) => s.padEnd(maxWidths[i])).join(' | ')} |`,
    `| ${maxWidths.map((w, i) => alignmentStr(alignment[i] ?? 'default', w)).join(' | ')} |`,
    ...data.map((row) =>
      `| ${row.map((s, i) => padString(s, alignment[i] ?? 'default', maxWidths[i] ?? 3)).join(' | ')} |`
    ),
    '',
  ];
};

export const markdownTitle = (title: string, level: number = 1) => [`${'#'.repeat(level)} ${title}`, ''];

export const percentage = (value: number, total: number) => value ? `${((value / total) * 100).toFixed(1)}%` : '';

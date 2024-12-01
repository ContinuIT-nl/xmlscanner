export type CodePoint = {
  cp: string;
  name: string;
};

export type Result = {
  source: string;
  codePoints: CodePoint[];
  duration_ms: number;
};

export type LcovFile = {
  title: string;
  filename: string;

  functionsHit: number;
  functionsFound: number;
  functions: Map<string, LCovFunction>;

  branchesFound: number;
  branchesHit: number;
  // branches: [];

  linesFound: number;
  linesHit: number;
  lines: number[];
};

export type LcovSummary = Pick<
  LcovFile,
  'functionsHit' | 'functionsFound' | 'branchesFound' | 'branchesHit' | 'linesFound' | 'linesHit'
>;

export type LCovFunction = {
  name: string;
  line: number;
  hits: number;
};

const emptyFile: LcovFile = {
  title: '',
  filename: '',

  functionsHit: 0,
  functionsFound: 0,
  functions: new Map<string, LCovFunction>(),

  branchesFound: 0,
  branchesHit: 0,
  //branches: []

  linesFound: 0,
  linesHit: 0,
  lines: [],
};

export const lcovParser = (lcov: string): LcovFile[] => {
  const result: LcovFile[] = [];
  let currentFile: LcovFile = { ...emptyFile };

  const typeProcessors: Record<string, (data: string[]) => void> = {
    // Metadata
    'TN': (data: string[]) => {
      currentFile.title = data[0];
    },
    'SF': (data: string[]) => {
      let filename = data[0];
      // todo: better way to handle this?
      // Filename is a fullpath, but what's needed is a path relative to the root.
      filename = filename.replace(/\\/g, '/');
      currentFile.filename = filename.split('/').at(-1) ?? '';
    },

    // Function stats
    'FNF': (data: string[]) => {
      currentFile.functionsFound = parseInt(data[0]);
    },
    'FNH': (data: string[]) => {
      currentFile.functionsHit = parseInt(data[0]);
    },
    'FN': (data: string[]) => {
      currentFile.functions.set(data[1], {
        name: data[1],
        line: parseInt(data[0]),
        hits: 0,
      });
    },
    'FNDA': (data: string[]) => {
      const func = currentFile.functions.get(data[1]);
      if (func) func.hits = parseInt(data[0]);
    },

    // Branch stats
    'BRF': (data: string[]) => {
      currentFile.branchesFound = parseInt(data[0]);
    },
    'BRH': (data: string[]) => {
      currentFile.branchesHit = parseInt(data[0]);
    },

    // Line stats
    'LF': (data: string[]) => {
      currentFile.linesFound = parseInt(data[0]);
    },
    'LH': (data: string[]) => {
      currentFile.linesHit = parseInt(data[0]);
    },
    'DA': (data: string[]) => {
      const line = parseInt(data[0]);
      const hits = parseInt(data[1]);
      currentFile.lines[line] = hits;
    },

    // End of record
    'end_of_record': () => {
      result.push(currentFile);
      currentFile = { ...emptyFile };
    },
  };

  // Parse the lcov file.
  const lcovData = lcov.split('\n').map((line) => line.trim());
  for (const line of lcovData) {
    const colonIndex = line.indexOf(':');
    const type = line.substring(0, colonIndex === -1 ? undefined : colonIndex);
    const dataString = colonIndex === -1 ? '' : line.substring(colonIndex + 1);
    const data = (dataString ?? '').split(',');
    typeProcessors[type]?.(data);
  }
  return result;
};

export const createLcovSummary = (lcov: LcovFile[]): LcovSummary =>
  lcov.reduce(
    (acc, file) => {
      acc.functionsHit += file.functionsHit;
      acc.functionsFound += file.functionsFound;
      acc.branchesFound += file.branchesFound;
      acc.branchesHit += file.branchesHit;
      acc.linesFound += file.linesFound;
      acc.linesHit += file.linesHit;
      return acc;
    },
    {
      functionsHit: 0,
      functionsFound: 0,
      branchesFound: 0,
      branchesHit: 0,
      linesFound: 0,
      linesHit: 0,
    } satisfies LcovSummary,
  );

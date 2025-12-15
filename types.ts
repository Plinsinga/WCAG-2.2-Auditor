export enum WCAGLevel {
  A = 'A',
  AA = 'AA',
}

export enum WCAGResult {
  PASS = 'Voldoet',
  FAIL = 'Voldoet niet',
  NOT_CHECKED = 'Nog niet onderzocht',
  NA = 'Niet relevant',
  OUT_OF_SCOPE = 'Buiten scope',
}

export interface Finding {
  location: string;
  observation: string;
  problemDescription: string;
  impact: string;
  advice: string;
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  level: WCAGLevel;
  disciplines?: string;
  result: WCAGResult;
  reason?: string; // Reason for NOT_CHECKED, NA or OUT_OF_SCOPE
  findings?: Finding[];
}

export interface Principle {
  name: string;
  description: string;
  criteria: Criterion[];
  stats: {
    pass: number;
    fail: number;
    total: number;
  };
}

export interface ReportData {
  meta: {
    client: string;
    product: string;
    date: string;
    version: string;
    researchers: string;
  };
  scope: {
    inScope: string[];
    outScope: string[];
  };
  summary: {
    conclusion: string;
    feedback: string;
    scores: {
      wcag21: { pass: number; total: number };
      wcag22: { pass: number; total: number };
    };
  };
  principles: Principle[];
}
export interface MonthlyBreakdown {
  month: string;
  total: number;
  count: number;
  average: number;
  percentOfYear: number;
}

export interface EngineerBreakdown {
  name: string;
  total: number;
  count: number;
  percentOfYear: number;
}

export interface MonthlyReportSummary {
  totalAmount: number;
  totalTransactions: number;
  averageMonthly: number;
  averageTransaction: number;
  peakMonth: { month: string; total: number } | null;
}

export interface MonthlyReport {
  year: number;
  summary: MonthlyReportSummary;
  months: MonthlyBreakdown[];
  byEngineer: EngineerBreakdown[];
}

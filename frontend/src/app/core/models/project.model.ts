export type ProjectStatus = 'Planning' | 'Ongoing' | 'Completed' | 'On Hold';
export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Project {
  _id: string;
  projectName: string;
  clientName: string;
  siteAddress: string;
  assignedEngineer?: { _id: string; name: string; email: string } | string | null;
  startDate: string;
  expectedEndDate: string;
  totalEstimationAmount: number;
  initialInvestedAmount: number;
  status: ProjectStatus;
  totalExpenses?: number;
  remainingBudget?: number;
  budgetUtilizationPercent?: number;
  budgetStatus?: BudgetStatus;
  createdAt?: string;
}

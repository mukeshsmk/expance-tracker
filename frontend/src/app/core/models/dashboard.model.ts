export interface DashboardSummary {
  totalProjects: number;
  totalEstimatedCost: number;
  totalInvestedAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  activeProjects: number;
  completedProjects: number;
}

export interface ChartData {
  monthlyExpenseTrend: { label: string; total: number }[];
  budgetVsExpense: { projectName: string; budget: number; expenses: number }[];
}

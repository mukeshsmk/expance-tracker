export interface Expense {
  _id: string;
  project: string;
  expenseDate: string;
  description: string;
  amount: number;
  billFile?: { url: string; originalName: string; mimeType: string };
  createdByName: string;
  createdAt?: string;
}

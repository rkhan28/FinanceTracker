export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface BudgetTarget {
  category: string;
  amount: number;
  spent: number;
}

export interface FinancialProfile {
  monthlyIncome: number;
  savingsGoals: SavingsGoal[];
  budgetTargets: BudgetTarget[];
  studentLoans: number;
  creditCards: number;
  investments: number;
}

export interface AppState {
  hasCompletedSetup: boolean;
  transactions: Transaction[];
  financialProfile: FinancialProfile;
  currentStep: number;
}

export const CATEGORIES = [
  { value: 'food', label: '🍕 Food & Dining', color: '#f59e0b' },
  { value: 'transportation', label: '🚗 Transportation', color: '#ef4444' },
  { value: 'education', label: '📚 Education', color: '#8b5cf6' },
  { value: 'entertainment', label: '🎬 Entertainment', color: '#06b6d4' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#10b981' },
  { value: 'health', label: '🏥 Health & Fitness', color: '#f97316' },
  { value: 'utilities', label: '⚡ Utilities', color: '#6366f1' },
  { value: 'rent', label: '🏠 Rent & Housing', color: '#84cc16' },
  { value: 'income', label: '💰 Income', color: '#22c55e' },
  { value: 'other', label: '📦 Other', color: '#64748b' },
];
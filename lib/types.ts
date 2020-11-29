export type Budget = {
  id: string;
  name: string;
  month: string;
  value: number;
  _rev?: string;
};

export type Expense = {
  id: string;
  cost: number;
  description: string;
  budget: string;
  date: string;
  _rev?: string;
};

export type SettingOption = 'currency' | 'syncToken' | 'lastSyncDate';

export type Setting = {
  name: SettingOption;
  value: string;
};

export interface WrappedComponentProps {
  isFocused: boolean;
  isUsingDarkMode: boolean;
  isLoading: boolean;
  monthInView: string;
  lastSyncDate: string;
  currency: string;
  budgets: Budget[];
  expenses: Expense[];
  loadData: (options?: {
    monthToLoad?: string;
    forceReload?: boolean;
  }) => Promise<void>;
  showLoading: () => void;
  hideLoading: () => void;
  showAlert: (title: string, message: string) => void;
  showNotification: (message: string) => void;
  changeMonthInView: (newMonth: string) => void;
  saveBudget: (budget: Budget) => Promise<boolean>;
  saveExpense: (expense: Expense) => Promise<boolean>;
  getSetting: (settingName: string) => Promise<string>;
  saveSetting: (setting: Setting) => Promise<boolean>;
  deleteBudget: (budgetId: string) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  importData: (
    replaceData: boolean,
    budgets: Budget[],
    expenses: Expense[],
  ) => Promise<boolean>;
  exportAllData: () => Promise<{ budgets: Budget[]; expenses: Expense[] }>;
  deleteAllData: () => Promise<boolean>;
}

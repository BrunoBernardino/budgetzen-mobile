import {
  RxDatabase,
  RxJsonSchema,
  RxDocument,
  addRxPlugin,
  createRxDatabase,
  PouchDB,
} from 'rxdb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import { sortByDate, sortByName, splitArrayInChunks } from './utils';

import * as T from './types';

interface DB {
  _hasFinishedFirstSync: {
    budgets: boolean;
    expenses: boolean;
  };
  updateSyncDate: (alive: boolean) => Promise<void>;
  connect: () => Promise<RxDatabase>;
  fetchBudgets: (db: RxDatabase, month: string) => Promise<T.Budget[]>;
  fetchExpenses: (db: RxDatabase, month: string) => Promise<T.Expense[]>;
  fetchSetting: (name: T.SettingOption) => Promise<string>;
  saveBudget: (db: RxDatabase, budget: T.Budget) => Promise<void>;
  saveExpense: (db: RxDatabase, expense: T.Expense) => Promise<void>;
  saveSetting: (setting: T.Setting) => Promise<void>;
  deleteBudget: (db: RxDatabase, budgetId: string) => Promise<void>;
  deleteExpense: (db: RxDatabase, expenseId: string) => Promise<void>;
  copyBudgets: (
    db: RxDatabase,
    originalMonth: string,
    destinationMonth: string,
  ) => Promise<void>;
  importData: (
    db: RxDatabase,
    replaceData: boolean,
    budgets: T.Budget[],
    expenses: T.Expense[],
  ) => Promise<void>;
  exportAllData: (
    db: RxDatabase,
  ) => Promise<{ budgets: T.Budget[]; expenses: T.Expense[] }>;
  deleteAllData: (localDb: RxDatabase) => Promise<void>;
}

type BudgetDocument = RxDocument<T.Budget>;
const budgetSchema: RxJsonSchema<T.Budget> = {
  title: 'budget schema',
  description: 'describes a budget',
  version: 0,
  keyCompression: true,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
    },
    name: {
      type: 'string',
    },
    month: {
      type: 'string',
    },
    value: {
      type: 'number',
    },
  },
  required: ['name', 'month', 'value'],
};

type ExpenseDocument = RxDocument<T.Expense>;
const expenseSchema: RxJsonSchema<T.Expense> = {
  title: 'expense schema',
  description: 'describes an expense',
  version: 0,
  keyCompression: true,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
    },
    cost: {
      type: 'number',
    },
    description: {
      type: 'string',
    },
    budget: {
      type: 'string',
    },
    date: {
      type: 'string',
    },
  },
  required: ['cost', 'description', 'budget', 'date'],
};

addRxPlugin(require('pouchdb-adapter-asyncstorage'));
addRxPlugin(require('pouchdb-adapter-http'));
PouchDB.plugin(require('pouchdb-erase'));

const localDbName = 'localdb_budgetscalm_v0';

const DB: DB = {
  _hasFinishedFirstSync: {
    budgets: false,
    expenses: false,
  },
  updateSyncDate: async (alive = true) => {
    const lastSyncDate = moment().format('YYYY-MM-DD HH:mm:ss');
    if (alive) {
      await DB.saveSetting({
        name: 'lastSyncDate',
        value: alive ? lastSyncDate : '',
      });
    }
  },
  connect: async () => {
    try {
      const syncToken = await DB.fetchSetting('syncToken');

      const db = await createRxDatabase({
        name: localDbName,
        adapter: 'asyncstorage',
        multiInstance: false,
        ignoreDuplicate: true,
      });

      await db.collection({
        name: 'budgets',
        schema: budgetSchema,
      });

      await db.collection({
        name: 'expenses',
        schema: expenseSchema,
      });

      if (syncToken.length > 0) {
        const syncOptions = {
          remote: syncToken,
          options: {
            live: true,
            retry: true,
          },
        };
        const budgetsSync = db.budgets.sync(syncOptions);
        const expensesSync = db.expenses.sync(syncOptions);

        budgetsSync.alive$.subscribe((alive) => DB.updateSyncDate(alive));
        expensesSync.alive$.subscribe((alive) => DB.updateSyncDate(alive));
        budgetsSync.change$.subscribe((change) => DB.updateSyncDate(change.ok));
        expensesSync.change$.subscribe((change) =>
          DB.updateSyncDate(change.ok),
        );
        budgetsSync.complete$.subscribe(() => {
          DB._hasFinishedFirstSync.budgets = true;
        });
        expensesSync.complete$.subscribe(() => {
          DB._hasFinishedFirstSync.expenses = true;
        });
      } else {
        DB._hasFinishedFirstSync.budgets = true;
        DB._hasFinishedFirstSync.expenses = true;
      }

      return db;
    } catch (error) {
      console.log('Failed to connect to DB');
      console.log(error);
      console.log(JSON.stringify(error));
      return null;
    }
  },
  fetchBudgets: async (db, month) => {
    try {
      const budgets: BudgetDocument[] = await db.budgets
        .find()
        .where('month')
        .eq(month)
        .exec();
      return budgets.map((budget) => budget.toJSON()).sort(sortByName);
    } catch (error) {
      console.log('Failed to fetch budgets');
      console.log(error);
      return [];
    }
  },
  fetchExpenses: async (db, month) => {
    try {
      const expenses: ExpenseDocument[] = await db.expenses
        .find()
        .where('date')
        .gte(`${month}-01`)
        .lte(`${month}-31`)
        .exec();
      return expenses
        .map((expense) => expense.toJSON())
        .sort(sortByDate)
        .reverse();
    } catch (error) {
      console.log('Failed to fetch expenses');
      console.log(error);
      return [];
    }
  },
  fetchSetting: async (name) => {
    const value = await AsyncStorage.getItem(`setting_${name}`);
    return value || '';
  },
  saveBudget: async (db, budget) => {
    if (budget.name === 'Total') {
      throw new Error('Cannot create budget named "Total".');
    }

    if (budget.name.trim().length === 0) {
      throw new Error('The budget needs a valid name.');
    }

    if (budget.value <= 0 || Number.isNaN(budget.value)) {
      throw new Error('The budget needs a valid value.');
    }

    if (!moment(budget.month, 'YYYY-MM').isValid()) {
      budget.month = moment().format('YYYY-MM');
    }

    // Check if the name is unique for the given month
    const duplicateBudget: BudgetDocument = await db.budgets
      .findOne()
      .where('month')
      .eq(budget.month)
      .where('name')
      .eq(budget.name)
      .where('id')
      .ne(budget.id)
      .exec();

    if (duplicateBudget) {
      throw new Error(
        'A budget with the same name for the same month alread exists.',
      );
    }

    if (budget.id === 'newBudget') {
      await db.budgets.insert({
        ...budget,
        id: `${Date.now().toString()}:${Math.random()}`,
      });
    } else {
      const existingBudget: BudgetDocument = await db.budgets
        .findOne()
        .where('id')
        .eq(budget.id)
        .exec();

      const oldName = existingBudget.name;
      const newName = budget.name;

      await existingBudget.update({
        $set: {
          name: budget.name,
          value: budget.value,
        },
      });

      // Update all expenses with the previous budget name to the new one, if it changed
      if (oldName !== newName) {
        const matchingExpenses: ExpenseDocument[] = await db.expenses
          .find()
          .where('date')
          .gte(`${existingBudget.month}-01`)
          .lte(`${existingBudget.month}-31`)
          .where('budget')
          .eq(oldName)
          .exec();

        for (const expense of matchingExpenses) {
          await expense.update({
            $set: {
              budget: newName,
            },
          });
        }
      }
    }
  },
  saveExpense: async (db, expense) => {
    if (expense.description.trim().length === 0) {
      throw new Error('The expense needs a valid description.');
    }

    if (expense.cost <= 0 || Number.isNaN(expense.cost)) {
      throw new Error('The expense needs a valid cost.');
    }

    if (!moment(expense.date, 'YYYY-MM-DD').isValid()) {
      expense.date = moment().format('YYYY-MM-DD');
    }

    // Check if there's an existing expense with a better budget
    if (
      (!expense.budget || expense.budget === 'Misc') &&
      expense.id === 'newExpense'
    ) {
      const matchingExpenseDoc: ExpenseDocument = await db.expenses
        .findOne()
        .where('description')
        .eq(expense.description)
        .exec();

      const matchingExpense = (matchingExpenseDoc &&
        matchingExpenseDoc.toJSON()) || { budget: '' };

      if (matchingExpense.budget) {
        expense.budget = matchingExpense.budget;
      }
    }

    if (!expense.budget) {
      expense.budget = 'Misc';
    }

    // Check if the budget exists for the expense in that given month, otherwise create one
    const existingBudget: BudgetDocument = await db.budgets
      .findOne()
      .where('month')
      .eq(expense.date.substr(0, 7))
      .where('name')
      .eq(expense.budget)
      .exec();

    if (!existingBudget) {
      await DB.saveBudget(db, {
        id: 'newBudget',
        name: expense.budget,
        month: expense.date.substr(0, 7),
        value: 100,
      });
    }

    if (expense.id === 'newExpense') {
      await db.expenses.insert({
        ...expense,
        id: `${Date.now().toString()}:${Math.random()}`,
      });
    } else {
      const existingExpense: ExpenseDocument = await db.expenses
        .findOne()
        .where('id')
        .eq(expense.id)
        .exec();
      await existingExpense.update({
        $set: {
          cost: expense.cost,
          description: expense.description,
          budget: expense.budget,
          date: expense.date,
        },
      });
    }
  },
  saveSetting: async (setting) => {
    await AsyncStorage.setItem(`setting_${setting.name}`, setting.value);
  },
  deleteBudget: async (db, budgetId) => {
    const existingBudget: BudgetDocument = await db.budgets
      .findOne()
      .where('id')
      .eq(budgetId)
      .exec();

    // Check if the budget has no expenses, if so, don't delete
    const matchingExpenses: ExpenseDocument[] = await db.expenses
      .find()
      .where('date')
      .gte(`${existingBudget.month}-01`)
      .lte(`${existingBudget.month}-31`)
      .where('budget')
      .eq(existingBudget.name)
      .exec();

    if (matchingExpenses.length > 0) {
      // Check if there are duplicate budgets (can happen on slow sync)
      const matchingBudgets: BudgetDocument[] = await db.budgets
        .find()
        .where('month')
        .eq(existingBudget.month)
        .where('name')
        .eq(existingBudget.name)
        .exec();

      if (matchingBudgets.length === 1) {
        throw new Error(
          "There are expenses using this budget. You can't delete a budget with expenses",
        );
      }
    }

    await existingBudget.remove();
  },
  deleteExpense: async (db, expenseId) => {
    const existingExpense: ExpenseDocument = await db.expenses
      .findOne()
      .where('id')
      .eq(expenseId)
      .exec();
    await existingExpense.remove();
  },
  copyBudgets: async (db, originalMonth, destinationMonth) => {
    // Don't copy anything until we're done with the first sync
    if (
      !DB._hasFinishedFirstSync.expenses ||
      !DB._hasFinishedFirstSync.budgets
    ) {
      return;
    }

    const originalBudgets = await DB.fetchBudgets(db, originalMonth);
    const destinationBudgets = originalBudgets.map((budget) => {
      const newBudget: T.Budget = { ...budget };
      newBudget.id = `${Date.now().toString()}:${Math.random()}`;
      newBudget.month = destinationMonth;
      delete newBudget._rev;
      return newBudget;
    });

    if (destinationBudgets.length > 0) {
      await db.budgets.bulkInsert(destinationBudgets);
    }
  },
  importData: async (db, replaceData, budgets, expenses) => {
    if (replaceData) {
      await DB.deleteAllData(db);

      // Recreate collections
      await db.collection({
        name: 'budgets',
        schema: budgetSchema,
      });
      await db.collection({
        name: 'expenses',
        schema: expenseSchema,
      });
    }

    const chunkLength = 200;

    if (budgets.length > chunkLength) {
      const chunkedBudgets = splitArrayInChunks(budgets, chunkLength);
      for (const budgetsChunk of chunkedBudgets) {
        await db.budgets.bulkInsert(budgetsChunk);
        // Wait a second, to avoid hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      await db.budgets.bulkInsert(budgets);
    }

    if (expenses.length > chunkLength) {
      const chunkedExpenses = splitArrayInChunks(expenses, chunkLength);
      for (const expensesChunk of chunkedExpenses) {
        await db.expenses.bulkInsert(expensesChunk);
        // Wait a second, to avoid hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      await db.expenses.bulkInsert(expenses);
    }
  },
  exportAllData: async (db) => {
    // NOTE: The queries look weird because .dump() and simple .find() were returning indexes and other stuff
    const budgets: BudgetDocument[] = await db.budgets
      .find()
      .where('month')
      .gte('2000-01')
      .lte('2100-12')
      .exec();
    const sortedBudgets = budgets
      .map((budget) => {
        const rawBudget = budget.toJSON();
        delete rawBudget._rev;
        return rawBudget;
      })
      .sort(sortByName);
    const expenses: ExpenseDocument[] = await db.expenses
      .find()
      .where('date')
      .gte('2000-01-01')
      .lte('2100-12-31')
      .exec();
    const sortedExpenses = expenses
      .map((expense) => {
        const rawExpense = expense.toJSON();
        delete rawExpense._rev;
        return rawExpense;
      })
      .sort(sortByDate);
    return { budgets: sortedBudgets, expenses: sortedExpenses };
  },
  deleteAllData: async (localDb: RxDatabase) => {
    await localDb.budgets.remove();
    await localDb.expenses.remove();

    const db = new PouchDB(localDbName);
    // @ts-ignore erase comes from pouchdb-erase
    db.erase();
    const syncToken = await DB.fetchSetting('syncToken');
    if (syncToken.length > 0) {
      const remoteDb = new PouchDB(syncToken);
      // @ts-ignore erase comes from pouchdb-erase
      await remoteDb.erase();
    }
  },
};

export default DB;

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import mockApi, { Expense } from '@/utils/api';
import { RootState } from './store';

export interface ExpenseState {
  expenses: Expense[];
  pendingActions: Array<{
    type: 'add' | 'update' | 'delete';
    payload: Expense | string;
  }>;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: ExpenseState = {
  expenses: [],
  pendingActions: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 5,
};

// Async actions to handle data fetching and saving with API
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (
    { page, pageSize }: { page: number; pageSize: number },
    { rejectWithValue, getState }
  ) => {
    const state = getState() as RootState;

    if (navigator.onLine) {
      // App is online
      try {
        const response = await mockApi.fetchExpenses(page, pageSize);
        return response;
      } catch (error) {
        return rejectWithValue('Failed to fetch expenses from API');
      }
    } else {
      console.log('offline');
      const storedExpenses = localStorage.getItem('tempexpenses');
      if (storedExpenses) {
        const expenses = JSON.parse(storedExpenses);
        return { data: expenses, total: expenses.length };
      } else {
        return rejectWithValue('No expenses found in localStorage');
      }
    }
  }
);

export const addExpenseAsync = createAsyncThunk(
  'expenses/addExpense',
  async (expense: Expense, { rejectWithValue, getState, dispatch }) => {
    try {
      // Check if online
      if (navigator.onLine) {
        await mockApi.saveExpense(expense);
        // Re-fetch expenses after adding a new record
        const state = getState() as RootState;
        const { page, pageSize } = state.expenses;
        dispatch(fetchExpenses({ page, pageSize }));
      } else {
        console.log('App is offline, adding to pending actions:', expense);
        dispatch(addPendingAction({ type: 'add', payload: expense }));
      }
      return expense;
    } catch (error) {
      return rejectWithValue('Failed to save expense');
    }
  }
);

export const updateExpenseAsync = createAsyncThunk(
  'expenses/updateExpense',
  async (expense: Expense, { rejectWithValue, getState, dispatch }) => {
    try {
      if (navigator.onLine) {
        await mockApi.updateExpense(expense);
      } else {
        console.log('App is offline, adding to pending actions:', expense);
        dispatch(addPendingAction({ type: 'update', payload: expense }));
      }
      return expense;
    } catch (error) {
      return rejectWithValue('Failed to update expense');
    }
  }
);

const removeTempExpense = (expense: Expense) => {
  const updatedTempExpenses = JSON.parse(
    localStorage.getItem('tempexpenses') || '[]'
  ).filter((exp: Expense) => exp.id !== expense.id);
  localStorage.setItem('tempexpenses', JSON.stringify(updatedTempExpenses));
};

export const syncPendingActions = createAsyncThunk(
  'expenses/syncPendingActions',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { pendingActions } = state.expenses;

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'add':
            console.log('add opeartion started to execute');
            await mockApi.saveExpense(action.payload as Expense);
            removeTempExpense(action.payload as Expense);
            break;
          case 'update':
            console.log('update opeartion started to execute');
            await mockApi.updateExpense(action.payload as Expense);
            break;
          case 'delete':
            console.log('delete opeartion started to execute');
            await mockApi.deleteExpense(action.payload as string);
            break;
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
    dispatch(clearPendingActions());
  }
);

export const deleteExpenseAsync = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue, getState, dispatch }) => {
    try {
      if (navigator.onLine) {
        await mockApi.deleteExpense(id);
      } else {
        console.log('App is offline, adding to pending actions:', id);
        dispatch(addPendingAction({ type: 'delete', payload: id }));
      }
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    // Synchronous actions for offline support
    addPendingAction: (
      state,
      action: PayloadAction<{
        type: 'add' | 'update' | 'delete';
        payload: Expense | string;
      }>
    ) => {
      console.log('Adding pending action:', action.payload);
      state.pendingActions.push(action.payload);
    },
    clearPendingActions: (state) => {
      state.pendingActions = [];
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle async actions
    builder.addCase(fetchExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = action.payload.data;
      state.total = action.payload.total;
      state.page = action.meta.arg.page;
      state.pageSize = action.meta.arg.pageSize;
    });
    builder.addCase(fetchExpenses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch expenses';
    });

    builder.addCase(addExpenseAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addExpenseAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses.push(action.payload);
      if (!navigator.onLine) {
        const storedExpenses = JSON.parse(
          localStorage.getItem('tempexpenses') || '[]'
        );
        storedExpenses.push(action.payload);
        localStorage.setItem('tempexpenses', JSON.stringify(storedExpenses));
      }
    });
    builder.addCase(addExpenseAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to add expense';
    });

    builder.addCase(updateExpenseAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateExpenseAsync.fulfilled, (state, action) => {
      const index = state.expenses.findIndex(
        (exp) => exp.id === action.payload.id
      );
      if (index !== -1) {
        state.loading = false;
        state.expenses[index] = action.payload;
        if (!navigator.onLine) {
          const storedExpenses = JSON.parse(
            localStorage.getItem('tempexpenses') || '[]'
          );
          const storedIndex = storedExpenses.findIndex(
            (exp: Expense) => exp.id === action.payload.id
          );
          if (storedIndex !== -1) {
            storedExpenses[storedIndex] = action.payload;
            localStorage.setItem(
              'tempexpenses',
              JSON.stringify(storedExpenses)
            );
          }
        }
      }
    });
    builder.addCase(updateExpenseAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update expense';
    });

    builder.addCase(deleteExpenseAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteExpenseAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
      if (!navigator.onLine) {
        const storedExpenses = JSON.parse(
          localStorage.getItem('tempexpenses') || '[]'
        );
        const updatedExpenses = storedExpenses.filter(
          (exp: Expense) => exp.id !== action.payload
        ); // Remove the deleted expense
        localStorage.setItem('tempexpenses', JSON.stringify(updatedExpenses));
      }
    });
    builder.addCase(deleteExpenseAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete expense';
    });
  },
});

export const { setCurrentPage, addPendingAction, clearPendingActions } =
  expenseSlice.actions;
export default expenseSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import expenseReducer, { ExpenseState } from './expenseSlice';

// Middleware to load from localStorage
const loadState = (): ExpenseState => {
  try {
    const serializedState = localStorage.getItem('expenses');
    return {
      expenses: serializedState ? JSON.parse(serializedState) : [],
      pendingActions: [],
      loading: false,
      error: null,
      total: 0,
      page: 1,
      pageSize: 5,
    };
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return {
      expenses: [],
      pendingActions: [],
      loading: false,
      error: null,
      total: 0,
      page: 1,
      pageSize: 5,
    };
  }
};

const store = configureStore({
  reducer: {
    expenses: expenseReducer,
  },
  preloadedState: {
    expenses: loadState(),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

const mockApi = {
  fetchExpenses: async (
    page: number = 1,
    pageSize: number = 5,
    selectedCategory: string
  ): Promise<{ data: Expense[]; total: number }> => {
    return new Promise<{ data: Expense[]; total: number }>((resolve) => {
      setTimeout(() => {
        const allExpenses: Expense[] = JSON.parse(
          localStorage.getItem('expenses') || '[]'
        );
        const filteredExpenses = selectedCategory
          ? allExpenses.filter(
              (expense) => expense.category === selectedCategory
            )
          : allExpenses;
        const total = filteredExpenses.length;
        const adjustedPage = selectedCategory && page > 1 ? 1 : page;
        const startIndex = (adjustedPage - 1) * pageSize;
        const paginatedExpenses = filteredExpenses.slice(
          startIndex,
          startIndex + pageSize
        );

        resolve({ data: paginatedExpenses, total });
      }, 1000); // Simulate network delay
    });
  },

  saveExpense: async (expense: Expense): Promise<void> => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const existingData = JSON.parse(
          localStorage.getItem('expenses') || '[]'
        );
        existingData.push(expense);
        localStorage.setItem('expenses', JSON.stringify(existingData));
        resolve();
      }, 1000); // Simulate network delay
    });
  },

  updateExpense: async (expense: Expense): Promise<void> => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const existingData = JSON.parse(
          localStorage.getItem('expenses') || '[]'
        );
        const updatedData = existingData.map((exp: Expense) =>
          exp.id === expense.id ? expense : exp
        );
        localStorage.setItem('expenses', JSON.stringify(updatedData));
        resolve();
      }, 1000); // Simulate network delay
    });
  },

  deleteExpense: async (id: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const existingData = JSON.parse(
          localStorage.getItem('expenses') || '[]'
        );
        const updatedData = existingData.filter(
          (exp: Expense) => exp.id !== id
        );
        localStorage.setItem('expenses', JSON.stringify(updatedData));
        resolve();
      }, 1000); // Simulate network delay
    });
  },
};

export default mockApi;

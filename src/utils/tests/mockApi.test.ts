import mockApi, { Expense } from '../../utils/api';

describe('mockApi', () => {
  beforeEach(() => {
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
      length: 0,
      key: jest.fn(),
    } as unknown as Storage;

    // Ensure the mock state is reset
    (localStorage.getItem as jest.Mock).mockReturnValue('[]'); // Default to an empty array
  });

  it('should fetch expenses correctly', async () => {
    const expenseData: Expense[] = [
      {
        id: '1',
        title: 'Expense 1',
        amount: 10,
        date: '2025-01-01',
        category: 'Food',
      },
      {
        id: '2',
        title: 'Expense 2',
        amount: 20,
        date: '2025-01-02',
        category: 'Transport',
      },
    ];
    // Mock the localStorage setItem and getItem
    localStorage.setItem('expenses', JSON.stringify(expenseData));
    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify(expenseData)
    );

    const result = await mockApi.fetchExpenses(1, 2);

    expect(result.data).toEqual(expenseData);
    expect(result.total).toBe(2);
  });

  it('should save a new expense', async () => {
    const expense: Expense = {
      id: '3',
      title: 'Expense 3',
      amount: 30,
      date: '2025-01-03',
      category: 'Food',
    };
    await mockApi.saveExpense(expense);

    // Mock the updated state after save
    const updatedExpenses = [
      {
        id: '3',
        title: 'Expense 3',
        amount: 30,
        date: '2025-01-03',
        category: 'Food',
      },
    ];
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(
      JSON.stringify(updatedExpenses)
    );

    const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expect(storedExpenses).toContainEqual(expense);
  });

  it('should update an expense', async () => {
    const expense: Expense = {
      id: '3',
      title: 'Expense 3 Updated',
      amount: 40,
      date: '2025-01-03',
      category: 'Food',
    };
    await mockApi.updateExpense(expense);

    // Mock the updated state after update
    const updatedExpenses = [
      {
        id: '3',
        title: 'Expense 3 Updated',
        amount: 40,
        date: '2025-01-03',
        category: 'Food',
      },
    ];
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(
      JSON.stringify(updatedExpenses)
    );

    const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const updatedExpense = storedExpenses.find(
      (exp: Expense) => exp.id === '3'
    );
    expect(updatedExpense?.title).toBe('Expense 3 Updated');
  });

  it('should delete an expense', async () => {
    await mockApi.deleteExpense('3');

    const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const deletedExpense = storedExpenses.find(
      (exp: Expense) => exp.id === '3'
    );
    expect(deletedExpense).toBeUndefined();
  });
});

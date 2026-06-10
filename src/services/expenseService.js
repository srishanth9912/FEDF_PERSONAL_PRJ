export const getExpenses = () => {
  try {
    const expenses = localStorage.getItem('expenses');
    return expenses ? JSON.parse(expenses) : [];
  } catch (error) {
    console.error('Error reading expenses:', error);
    return [];
  }
};

export const saveExpenses = (expensesList) => {
  try {
    localStorage.setItem('expenses', JSON.stringify(expensesList));
    return true;
  } catch (error) {
    console.error('Error saving expenses:', error);
    return false;
  }
};

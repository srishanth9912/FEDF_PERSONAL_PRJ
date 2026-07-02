const STORAGE_KEY = "expenses";

const normalizeExpense = (expense) => {
  if (!expense || typeof expense !== "object") return null;

  const amount = Number(expense.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!expense.category || !expense.date) return null;

  return {
    ...expense,
    id: expense.id || `${expense.date}-${expense.category}-${amount}`,
    title: typeof expense.title === "string" ? expense.title : "",
    amount,
    category: expense.category,
    date: expense.date,
  };
};

export const getExpenses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeExpense).filter(Boolean);
  } catch (error) {
    console.error("Error reading expenses:", error);
    return [];
  }
};

export const saveExpenses = (expensesList) => {
  try {
    const safeExpenses = Array.isArray(expensesList)
      ? expensesList.map(normalizeExpense).filter(Boolean)
      : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeExpenses));
    return true;
  } catch (error) {
    console.error("Error saving expenses:", error);
    return false;
  }
};


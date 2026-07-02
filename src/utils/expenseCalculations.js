import { CATEGORIES, MONTHS } from "../constants";

export const formatCurrency = (amount) => `\u20b9${amount.toLocaleString()}`;

export const filterExpensesByMonthYear = (expenses, monthValue, yearValue) =>
  expenses.filter((expense) => {
    const [year, month] = expense.date.split("-").map(Number);
    return (
      (month - 1).toString() === monthValue.toString() &&
      year.toString() === yearValue.toString()
    );
  });

export const getTotalAmount = (expenses) =>
  expenses.reduce((sum, item) => sum + item.amount, 0);

export const getCategoryTotals = (expenses) =>
  CATEGORIES.reduce((totals, category) => {
    totals[category] = getTotalAmount(
      expenses.filter((expense) => expense.category === category),
    );
    return totals;
  }, {});

export const getSortedCategoriesByTotal = (categoryTotals) =>
  [...CATEGORIES].sort(
    (a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0),
  );

export const getMonthLabel = (monthValue) =>
  MONTHS.find((month) => month.value === monthValue.toString())?.label || "";


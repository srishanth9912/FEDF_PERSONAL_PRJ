import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import { getExpenses, saveExpenses } from './services/expenseService';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleAddExpense = (newExpense) => {
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleUpdateExpense = (id, updatedFields) => {
    const updated = expenses.map((exp) =>
      exp.id === id ? { ...exp, ...updatedFields } : exp
    );
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleDeleteExpense = (id) => {
    const updated = expenses.filter((item) => item.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard expenses={expenses} />;
      case 'transactions':
        return (
          <Transactions
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'analytics':
        return <Analytics expenses={expenses} />;
      default:
        return <Dashboard expenses={expenses} />;
    }
  };

  return (
    <div className="app-wrapper">
      <header>
        <div
          className="logo"
          onClick={() => setCurrentPage('dashboard')}
          onKeyDown={(e) => e.key === 'Enter' && setCurrentPage('dashboard')}
          role="button"
          tabIndex={0}
        >
          <h1>Daily Expense Tracker</h1>
        </div>
        <nav>
          <div className="nav-links">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={currentPage === 'dashboard' ? 'active' : ''}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('transactions')}
              className={currentPage === 'transactions' ? 'active' : ''}
            >
              Transactions
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={currentPage === 'analytics' ? 'active' : ''}
            >
              Analytics
            </button>
          </div>
          <button
            id="theme-toggle"
            className="theme-toggle-btn"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </nav>
      </header>
      <main>{renderPage()}</main>
      <footer>
        <p>© {new Date().getFullYear()} Daily Expense Tracker — Designed for clear, simple budgeting</p>
      </footer>
    </div>
  );
}



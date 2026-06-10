import { useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS, MONTHS, YEARS } from '../constants';

export default function Dashboard({ expenses }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthName = MONTHS[currentMonth].label;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const thisMonthExpenses = expenses.filter((exp) => {
    const [year, month] = exp.date.split('-').map(Number);
    return month - 1 === currentMonth && year === currentYear;
  });

  const currentMonthTotal = thisMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = thisMonthExpenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, item) => sum + item.amount, 0);
    return acc;
  }, {});

  const topCategory = CATEGORIES.reduce((best, cat) =>
    (categoryTotals[cat] || 0) > (categoryTotals[best] || 0) ? cat : best
    , CATEGORIES[0]);

  const activeCategories = CATEGORIES
    .filter((cat) => categoryTotals[cat] > 0)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

  const lookupExpenses = expenses.filter((exp) => {
    const [year, month] = exp.date.split('-').map(Number);
    return (
      (month - 1).toString() === selectedMonth &&
      year.toString() === selectedYear
    );
  });

  const lookupTotal = lookupExpenses.reduce((sum, item) => sum + item.amount, 0);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const lookupMonthName = MONTHS.find((m) => m.value === selectedMonth)?.label || '';

  return (
    <div className="dashboard-container">

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <span className="stat-icon">💸</span>
          <div className="stat-body">
            <span className="stat-label">Spent This Month</span>
            <span className="stat-value primary">₹{currentMonthTotal.toLocaleString()}</span>
            <span className="stat-sub">{currentMonthName} {currentYear}</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <span className="stat-icon">🧾</span>
          <div className="stat-body">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{thisMonthExpenses.length}</span>
            <span className="stat-sub">This month</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <span className="stat-icon">{CATEGORY_ICONS[topCategory] || '📦'}</span>
          <div className="stat-body">
            <span className="stat-label">Top Category</span>
            <span className="stat-value">
              {thisMonthExpenses.length > 0 ? topCategory : '—'}
            </span>
            <span className="stat-sub">
              {thisMonthExpenses.length > 0
                ? `₹${categoryTotals[topCategory].toLocaleString()}`
                : 'No data yet'}
            </span>
          </div>
        </div>
      </div>

      {activeCategories.length > 0 && (
        <div className="glass-panel spending-insight-card">
          <div className="insight-header">
            <h3>Where Did Your Money Go?</h3>
            <span className="insight-period">{currentMonthName} {currentYear}</span>
          </div>
          <div className="insight-rows">
            {activeCategories.map((cat, idx) => {
              const amt = categoryTotals[cat];
              const pct = currentMonthTotal > 0
                ? Math.round((amt / currentMonthTotal) * 100)
                : 0;
              return (
                <div key={cat} className="insight-row">
                  <span className="insight-rank">#{idx + 1}</span>
                  <span className="insight-icon">{CATEGORY_ICONS[cat]}</span>
                  <span className="insight-name">{cat}</span>
                  <span className="insight-pct-pill">{pct}%</span>
                  <span className="insight-amount">₹{amt.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <p className="insight-note">
            For charts and month comparisons, go to <strong>Analytics</strong>.
          </p>
        </div>
      )}

      <div className="glass-panel lookup-card-full">
        <h3>Monthly Expenditure Lookup</h3>
        <p className="lookup-desc">Select any month and year to see the total amount spent.</p>
        <div className="lookup-controls">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="lookup-result">
          <div className="lookup-total">
            <span className="lookup-label">Total for {lookupMonthName} {selectedYear}</span>
            <span className="lookup-amount">₹{lookupTotal.toLocaleString()}</span>
          </div>
          <span className="lookup-count">
            {lookupExpenses.length} transaction{lookupExpenses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {lookupExpenses.length > 0 ? (
          <div className="particulars-list">
            {lookupExpenses.map((exp) => (
              <div key={exp.id} className="particular-item">
                <span className="particular-icon">{CATEGORY_ICONS[exp.category] || '📦'}</span>
                <span className="particular-title">
                  {exp.title || <em className="text-muted">No description</em>}
                </span>
                <span className={`category-badge cat-${exp.category.toLowerCase()}`}>
                  {exp.category}
                </span>
                <span className="particular-date">
                  {exp.date}
                </span>
                <span className="particular-amount">₹{exp.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No transactions found for {lookupMonthName} {selectedYear}.</p>
        )}
      </div>

      <div className="glass-panel recent-card">
        <h3>Recent Transactions</h3>
        {recentExpenses.length === 0 ? (
          <p className="empty-state">
            No transactions yet. Head to Transactions to add your first entry.
          </p>
        ) : (
          <div className="recent-list">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="recent-item">
                <span className="recent-icon">{CATEGORY_ICONS[exp.category] || '📦'}</span>
                <div className="recent-details">
                  <span className="recent-title">
                    {exp.title || <em className="text-muted">No description</em>}
                  </span>
                  <span className="recent-date">
                    {exp.date}
                  </span>
                </div>
                <span className={`category-badge cat-${exp.category.toLowerCase()}`}>
                  {exp.category}
                </span>
                <span className="recent-amount">₹{exp.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

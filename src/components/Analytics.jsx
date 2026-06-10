import { useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, MONTHS, YEARS } from '../constants';

export default function Analytics({ expenses }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filteredExpenses = expenses.filter((exp) => {
    const [year, month] = exp.date.split('-').map(Number);
    return (
      (month - 1).toString() === selectedMonth &&
      year.toString() === selectedYear
    );
  });

  const totalSpent = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filteredExpenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, item) => sum + item.amount, 0);
    return acc;
  }, {});

  const percentages = CATEGORIES.reduce((acc, cat) => {
    const amt = categoryTotals[cat] || 0;
    acc[cat] = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
    return acc;
  }, {});

  const sortedCategories = [...CATEGORIES].sort(
    (a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0)
  );

  const activeCategories = sortedCategories.filter((cat) => categoryTotals[cat] > 0);

  const currentMonthLabel =
    MONTHS.find((m) => m.value === selectedMonth)?.label || '';

  return (
    <div className="analytics-container">
      <div className="glass-panel analytics-card">

        <div className="analytics-header">
          <div>
            <h2>Month-Wise Visual Analytics</h2>
            <p>Pick any month to explore category spending.</p>
          </div>
          <div className="analytics-filters">
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
        </div>

        {totalSpent === 0 ? (
          <div className="empty-analytics">
            <span className="empty-icon">📊</span>
            <p>No records for {currentMonthLabel} {selectedYear}.</p>
            <p className="text-muted">
              Add expenses in Transactions to see charts here.
            </p>
          </div>
        ) : (
          <div className="analytics-content">

            {/* Stacked Flexbox Bar — replaces the donut chart */}
            <div className="stacked-bar-section">
              <h4>Category Distribution</h4>
              <div className="stacked-bar-total">
                <span>Total Spent:</span>
                <strong>₹{totalSpent.toLocaleString()}</strong>
              </div>
              <div className="stacked-bar">
                {activeCategories.map((cat) => (
                  <div
                    key={cat}
                    className="stacked-segment"
                    style={{
                      width: `${percentages[cat]}%`,
                      backgroundColor: CATEGORY_COLORS[cat],
                    }}
                    title={`${cat}: ${percentages[cat]}%`}
                  >
                    {percentages[cat] >= 10 && (
                      <span className="segment-label">{percentages[cat]}%</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="stacked-legend">
                {activeCategories.map((cat) => (
                  <div key={cat} className="legend-item">
                    <div className="legend-top">
                      <span className="legend-color" style={{ backgroundColor: CATEGORY_COLORS[cat] }}></span>
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span className="legend-name">{cat}</span>
                    </div>
                    <div className="legend-bottom">
                      <span className="legend-pct">{percentages[cat]}%</span>
                      <span className="legend-amt">₹{categoryTotals[cat].toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown and Rankings side by side */}
            <div className="analytics-bottom-grid">

              <div className="breakdown-section">
                <h4>Spending Breakdown</h4>
                <div className="bar-chart">
                  {sortedCategories.map((cat) => {
                    const pct = percentages[cat] || 0;
                    const amt = categoryTotals[cat] || 0;
                    return (
                      <div key={cat} className="bar-row">
                        <div className="bar-label-group">
                          <span>{CATEGORY_ICONS[cat]} {cat}</span>
                          <span className="bar-amt">₹{amt.toLocaleString()}</span>
                        </div>
                        <div className="bar-track">
                          <div
                            className={`bar-fill cat-${cat.toLowerCase()}-fill`}
                            style={{ width: `${pct}%` }}
                          >
                            {pct >= 12 && (
                              <span className="bar-pct-label">{pct}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ranked-section">
                <h4>Ranked by Spending</h4>
                <div className="ranked-list">
                  {sortedCategories.map((cat, idx) => (
                    <div key={cat} className="ranked-item">
                      <span className="rank-num">#{idx + 1}</span>
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span className="rank-name">{cat}</span>
                      <div className="rank-bar-mini">
                        <div
                          className={`rank-bar-fill cat-${cat.toLowerCase()}-fill`}
                          style={{ width: `${percentages[cat]}%` }}
                        />
                      </div>
                      <span className="rank-pct">{percentages[cat]}%</span>
                      <span className="rank-amt">₹{categoryTotals[cat].toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}

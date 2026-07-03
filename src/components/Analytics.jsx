import { useState, useMemo } from 'react';
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  MONTHS,
} from '../constants';

// ── Helpers ───────────────────────────────────────────────

const filterByMonthYear = (expenses, month, year) =>
  expenses.filter((exp) => {
    const [y, m] = exp.date.split('-').map(Number);
    return m - 1 === month && y === year;
  });

const buildCategoryTotals = (exps) =>
  CATEGORIES.reduce((acc, cat) => {
    acc[cat] = exps
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

// Build year list from actual data + current year ± buffer
const buildYearList = (expenses) => {
  const cy = new Date().getFullYear();
  const dataYears = expenses.map((e) => parseInt(e.date.split('-')[0], 10));
  const all = new Set([...dataYears, cy - 1, cy, cy + 1, cy + 2]);
  return [...all].filter((y) => y >= 2000).sort((a, b) => a - b).map(String);
};

// ── SVG Donut Pie Chart ───────────────────────────────────
const DONUT_R = 80;
const DONUT_CX = 110;
const DONUT_CY = 110;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;
const STROKE_W = 28;

function DonutChart({ activeCategories, categoryTotals, percentages, totalSpent }) {
  const [hovered, setHovered] = useState(null);

  let cumulative = 0;
  const segments = activeCategories.map((cat) => {
    const pct = percentages[cat] / 100;
    const dashLen = pct * CIRCUMFERENCE;
    const dashGap = CIRCUMFERENCE - dashLen;
    const offset = CIRCUMFERENCE - cumulative * CIRCUMFERENCE;
    cumulative += pct;
    return { cat, dashLen, dashGap, offset };
  });

  const centerTop = hovered ? `${CATEGORY_ICONS[hovered]} ${hovered}` : 'Total';
  const centerBottom = hovered
    ? `₹${categoryTotals[hovered].toLocaleString()} · ${percentages[hovered]}%`
    : `₹${totalSpent.toLocaleString()}`;

  return (
    <div className="donut-chart-wrap">
      <svg
        viewBox={`0 0 ${DONUT_CX * 2} ${DONUT_CY * 2}`}
        className="donut-svg"
        aria-label="Spending distribution pie chart"
      >
        <circle
          cx={DONUT_CX}
          cy={DONUT_CY}
          r={DONUT_R}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={STROKE_W}
        />
        {segments.map(({ cat, dashLen, dashGap, offset }) => (
          <circle
            key={cat}
            cx={DONUT_CX}
            cy={DONUT_CY}
            r={DONUT_R}
            fill="none"
            stroke={CATEGORY_COLORS[cat]}
            strokeWidth={hovered === cat ? STROKE_W + 6 : STROKE_W}
            strokeDasharray={`${dashLen} ${dashGap}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            style={{
              transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
              opacity: hovered && hovered !== cat ? 0.35 : 1,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHovered(cat)}
            onMouseLeave={() => setHovered(null)}
            transform={`rotate(-90 ${DONUT_CX} ${DONUT_CY})`}
          />
        ))}
        <text x={DONUT_CX} y={DONUT_CY - 10} textAnchor="middle" className="donut-center-top">
          {centerTop}
        </text>
        <text x={DONUT_CX} y={DONUT_CY + 14} textAnchor="middle" className="donut-center-bottom">
          {centerBottom}
        </text>
      </svg>

      <div className="donut-legend">
        {activeCategories.map((cat) => (
          <div
            key={cat}
            className={`donut-legend-item${hovered === cat ? ' donut-legend-active' : ''}`}
            onMouseEnter={() => setHovered(cat)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="donut-legend-dot" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
            <span className="donut-legend-icon">{CATEGORY_ICONS[cat]}</span>
            <span className="donut-legend-name">{cat}</span>
            <span className="donut-legend-pct">{percentages[cat]}%</span>
            <span className="donut-legend-amt">₹{categoryTotals[cat].toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function Analytics({ expenses }) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());

  // Dynamic year list — built from actual data + current year buffer
  const yearList = useMemo(() => buildYearList(expenses), [expenses]);

  const selMonth = parseInt(selectedMonth, 10);
  const selYear = parseInt(selectedYear, 10);

  const filteredExpenses = useMemo(
    () => filterByMonthYear(expenses, selMonth, selYear),
    [expenses, selMonth, selYear]
  );

  const totalSpent = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = useMemo(() => buildCategoryTotals(filteredExpenses), [filteredExpenses]);

  const percentages = useMemo(
    () =>
      CATEGORIES.reduce((acc, cat) => {
        acc[cat] =
          totalSpent > 0
            ? Math.round(((categoryTotals[cat] || 0) / totalSpent) * 100)
            : 0;
        return acc;
      }, {}),
    [categoryTotals, totalSpent]
  );

  const sortedCategories = useMemo(
    () => [...CATEGORIES].sort((a, b) => (categoryTotals[b] || 0) - (categoryTotals[a] || 0)),
    [categoryTotals]
  );
  const activeCategories = sortedCategories.filter((cat) => categoryTotals[cat] > 0);

  const currentMonthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label || '';

  return (
    <div className="analytics-container">
      <div className="glass-panel analytics-card">

        {/* Header */}
        <div className="analytics-header">
          <div>
            <h2>Analytics</h2>
            <p>Deep dive into your spending patterns.</p>
          </div>
          <div className="analytics-filters">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {yearList.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {totalSpent === 0 ? (
          <div className="empty-analytics">
            <span className="empty-icon">📊</span>
            <p>No records for {currentMonthLabel} {selectedYear}.</p>
            <p className="text-muted">Add expenses in Transactions to see charts here.</p>
          </div>
        ) : (
          <div className="analytics-content" key={`${selectedMonth}-${selectedYear}`}>

            {/* Stat Cards */}
            <div className="an-stat-grid">
              <div className="an-stat-card">
                <span className="an-stat-icon">💸</span>
                <div className="an-stat-body">
                  <span className="an-stat-label">Total Spent</span>
                  <span className="an-stat-value primary">₹{totalSpent.toLocaleString()}</span>
                  <span className="an-stat-sub">{currentMonthLabel} {selectedYear}</span>
                </div>
              </div>
              <div className="an-stat-card">
                <span className="an-stat-icon">🧾</span>
                <div className="an-stat-body">
                  <span className="an-stat-label">Transactions</span>
                  <span className="an-stat-value">{filteredExpenses.length}</span>
                  <span className="an-stat-sub">
                    avg ₹{filteredExpenses.length > 0
                      ? Math.round(totalSpent / filteredExpenses.length).toLocaleString()
                      : 0} each
                  </span>
                </div>
              </div>
            </div>

            {/* Donut Pie Chart + Ranked */}
            <div className="pie-and-ranked-grid">
              <div className="pie-section">
                <h4>Category Breakdown</h4>
                <DonutChart
                  activeCategories={activeCategories}
                  categoryTotals={categoryTotals}
                  percentages={percentages}
                  totalSpent={totalSpent}
                />
              </div>

              <div className="ranked-section">
                <h4>Ranked by Spending</h4>
                <div className="ranked-list">
                  {sortedCategories.map((cat, idx) => {
                    const amt = categoryTotals[cat] || 0;
                    return (
                      <div key={cat} className="ranked-item-simple">
                        <span className="rank-num">#{idx + 1}</span>
                        <span className="rank-icon">{CATEGORY_ICONS[cat]}</span>
                        <span className="rank-name">{cat}</span>
                        <span className="rank-pct">{percentages[cat]}%</span>
                        <span className="rank-amt">₹{amt.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
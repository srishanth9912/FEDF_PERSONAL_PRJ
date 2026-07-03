import { useState, useMemo } from 'react';
import { CATEGORIES, CATEGORY_ICONS, getTodayString } from '../constants';

const createExpenseId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const NOTE_MAX = 60;

export default function Transactions({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) {
  const todayString = getTodayString();

  // ── Form state ──
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(todayString);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [successFlash, setSuccessFlash] = useState(false);

  // ── Search / filter state ──
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // ── Inline delete confirm state ──
  const [deletingId, setDeletingId] = useState(null);

  // ── Derived: filtered + sorted expenses ──
  const displayedExpenses = useMemo(() => {
    let result = [...expenses];
    // Sort newest first
    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (exp) =>
          (exp.title || '').toLowerCase().includes(q) ||
          (exp.category || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== 'All') {
      result = result.filter((exp) => exp.category === filterCategory);
    }

    return result;
  }, [expenses, searchQuery, filterCategory]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (filterCategory !== 'All') count++;
    return count;
  }, [searchQuery, filterCategory]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('All');
  };

  // ── Form handlers ──
  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }

    // Prevent future date entries
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      setError("Future dates are not allowed.");
      return;
    }

    setError('');

    try {
      if (editingId) {
        onUpdateExpense(editingId, {
          title: note.trim(),
          amount: parsedAmount,
          category,
          date,
        });
        setEditingId(null);
        setEditingExpense(null);
      } else {
        onAddExpense({
          id: createExpenseId(),
          title: note.trim(),
          amount: parsedAmount,
          category,
          date,
        });
      }

      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 1500);

      setAmount('');
      setNote('');
      setCategory('Food');
      setDate(todayString);
    } catch (err) {
      setError('Failed to save expense. Your browser storage might be full.');
      console.error(err);
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setEditingExpense(exp);
    setNote(exp.title || '');
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
    setError('');
    setDeletingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingExpense(null);
    setAmount('');
    setNote('');
    setCategory('Food');
    setDate(todayString);
    setError('');
  };

  // ── Inline delete ──
  const handleDeleteClick = (id) => setDeletingId(id);
  const handleDeleteConfirm = (id) => { onDeleteExpense(id); setDeletingId(null); };
  const handleDeleteCancel = () => setDeletingId(null);

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const filteredTotal = displayedExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="transactions-container">

      {/* ── Editing Mode Banner ── */}
      {editingId && editingExpense && (
        <div className="editing-banner">
          <span className="editing-banner-icon">✏️</span>
          <div className="editing-banner-text">
            <span>You are editing:</span>
            <strong>{editingExpense.title || 'No description'}</strong>
            <span className="editing-banner-amount">
              ₹{editingExpense.amount.toLocaleString()} · {editingExpense.category}
            </span>
          </div>
          <button
            className="editing-banner-close"
            onClick={handleCancelEdit}
            title="Cancel edit"
            aria-label="Cancel editing"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Add / Edit Form ── */}
      <section
        className={[
          'glass-panel',
          'add-expense-card',
          editingId ? 'editing-active' : '',
          successFlash ? 'success-flash' : '',
        ].join(' ')}
      >
        <h2>{editingId ? '✏️ Edit Expense' : ' Add New Expense'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="add-expense-form" noValidate>
          <div className="form-row">

            <div className="form-group">
              <label htmlFor="exp-date">Date</label>
              <input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group form-group-grow">
              <label htmlFor="exp-note">
                Description <span className="optional">(Optional)</span>
              </label>
              <div className="input-with-count">
                <input
                  id="exp-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                  placeholder="e.g. Lunch at canteen"
                />
                <span className={`char-count ${note.length >= NOTE_MAX ? 'char-count-limit' : ''}`}>
                  {note.length}/{NOTE_MAX}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="exp-category">Category</label>
              <select
                id="exp-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="exp-amount">Amount (₹)</label>
              <input
                id="exp-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-add">
              {editingId ? '✓ Update' : ' Save'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary btn-add"
                onClick={handleCancelEdit}
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ── Advanced Search & Filters ── */}
      <div className="glass-panel filter-bar-card">
        <div className="filter-main-bar">
          <div className="filter-search-wrap">
            <span className="filter-search-icon">🔍</span>
            <input
              id="txn-search"
              type="text"
              className="filter-search-input"
              placeholder="Search description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="filter-clear-x"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn-filter-toggle ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-active' : ''}`}
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
          >
            🎛️ Filters
            {activeFiltersCount > 0 && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
          </button>

          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
              ✕ Clear All
            </button>
          )}

          <span className="filter-result-count">
            {displayedExpenses.length} of {expenses.length}
          </span>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {showFilters && (
          <div className="filter-drawer-panel">
            {/* Category selection */}
            <div className="drawer-group">
              <label className="drawer-label">Category</label>
              <div className="drawer-pills">
                <button
                  type="button"
                  className={`drawer-pill ${filterCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setFilterCategory('All')}
                >
                  💼 All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`drawer-pill ${filterCategory === cat ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Expense Table ── */}
      <div className="glass-panel transactions-table-card">
        <div className="table-header">
          <h2>All Expenses</h2>
          {expenses.length > 0 && (
            <span className="total-badge">
              {hasActiveFilters
                ? `Filtered ₹${filteredTotal.toLocaleString()} / Total ₹${totalSpent.toLocaleString()}`
                : `Total: ₹${totalSpent.toLocaleString()}`}
            </span>
          )}
        </div>

        {expenses.length === 0 ? (
          <p className="empty-state">
            No expenses recorded yet.<br />Add your first expense using the form above.
          </p>
        ) : displayedExpenses.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <p>No results match your search or filter.</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Description</th>
                  <th scope="col">Category</th>
                  <th scope="col" className="text-right">Amount</th>
                  <th scope="col" className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className={`${editingId === exp.id ? 'editing-row' : ''} ${deletingId === exp.id ? 'deleting-row' : ''}`}
                  >
                    <td>{exp.date}</td>
                    <td>{exp.title || <span className="text-muted">—</span>}</td>
                    <td>
                      <span className={`category-badge cat-${exp.category.toLowerCase()}`}>
                        {CATEGORY_ICONS[exp.category]} {exp.category}
                      </span>
                    </td>
                    <td className="text-right font-mono">
                      <strong>₹{exp.amount.toLocaleString()}</strong>
                    </td>
                    <td className="text-center">
                      {deletingId === exp.id ? (
                        <div className="delete-confirm-inline">
                          <span className="delete-confirm-label">⚠️ Delete?</span>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteConfirm(exp.id)}
                          >
                            Yes
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleDeleteCancel}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(exp)}
                            className="btn btn-secondary btn-sm"
                            disabled={!!deletingId}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(exp.id)}
                            className="btn btn-danger btn-sm"
                            disabled={!!editingId}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>{hasActiveFilters ? 'Filtered Total' : 'Total Spent'}</strong></td>
                  <td className="text-right font-mono">
                    <strong>₹{filteredTotal.toLocaleString()}</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

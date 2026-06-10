import { useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS, getTodayString } from '../constants';

export default function Transactions({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) {
  const todayString = getTodayString();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(todayString);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

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

    setError('');

    if (editingId) {
      onUpdateExpense(editingId, {
        title: note.trim(),
        amount: parsedAmount,
        category,
        date,
      });
      setEditingId(null);
    } else {
      onAddExpense({
        id: Date.now().toString(),
        title: note.trim(),
        amount: parsedAmount,
        category,
        date,
      });
    }

    setAmount('');
    setNote('');
    setCategory('Food');
    setDate(todayString);
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setNote(exp.title || '');
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAmount('');
    setNote('');
    setCategory('Food');
    setDate(todayString);
    setError('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense? This action cannot be undone.')) {
      onDeleteExpense(id);
    }
  };

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="transactions-container">
      <section className="glass-panel add-expense-card">
        <h2>{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

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
              <input
                id="exp-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Lunch at canteen"
              />
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
              {editingId ? 'Update Expense' : 'Save Expense'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary btn-add" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="glass-panel transactions-table-card">
        <div className="table-header">
          <h2>All Expenses</h2>
          {expenses.length > 0 && (
            <span className="total-badge">
              Total: ₹{totalSpent.toLocaleString()}
            </span>
          )}
        </div>

        {expenses.length === 0 ? (
          <p className="empty-state">
            No expenses recorded yet.<br />Add your first expense using the form above.
          </p>
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
                {expenses.map((exp) => (
                  <tr key={exp.id} className={editingId === exp.id ? 'editing-row' : ''}>
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
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(exp)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Total Spent</strong></td>
                  <td className="text-right font-mono">
                    <strong>₹{totalSpent.toLocaleString()}</strong>
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

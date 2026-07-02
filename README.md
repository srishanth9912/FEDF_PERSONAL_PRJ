# Daily Expense Tracker - Project Blueprint

Last updated: 2026-07-02
Project folder: `project1`
App type: Frontend-only React expense tracker
Build tool: Vite
Storage: Browser `localStorage`
Backend/database: None currently

This README is written as the main project map. A non-coder, developer, tester, or AI assistant should be able to read this single file and understand what the app is, how it works, where the important code lives, what has been checked, and where future updates should be recorded.

## 1. Project Summary

Daily Expense Tracker is a simple personal finance web app. It lets a user record daily expenses, view all transactions, check the current month's spending, and inspect month-wise analytics.

The app runs completely in the browser. It does not need a server, login system, or external database. Expense records are saved in the user's browser using `localStorage`, which means the data stays on the same browser/device until the browser storage is cleared.

Main user actions:

- Add an expense with date, optional description, category, and amount.
- Edit an existing expense.
- Delete an expense after confirmation.
- View dashboard summaries for the current month.
- Look up total spending for a selected month and year.
- View analytics by category for a selected month and year.

## 2. Current Features

### Dashboard

File: `src/components/Dashboard.jsx`

The Dashboard is the first screen. It receives the full expense list from `App.jsx` and calculates summary information.

It shows:

- Total amount spent in the current month.
- Number of transactions in the current month.
- Top spending category in the current month.
- Category ranking for the current month.
- Monthly lookup by selected month and year.
- Recent transactions list.

Important logic:

- Current month is calculated from `new Date()`.
- Expense dates are expected in `YYYY-MM-DD` format.
- Month filtering splits the date by `-`, reads year and month, then compares them with the selected/current month.
- Category totals are calculated using the shared `CATEGORIES` list from `src/constants.js`.

### Transactions

File: `src/components/Transactions.jsx`

The Transactions page is where users add, edit, and delete expenses.

It contains:

- Expense date input.
- Optional description input.
- Category dropdown.
- Amount input.
- Save or update button.
- Cancel button while editing.
- Table of all expenses.
- Edit and delete buttons for every row.

Important logic:

- Amount must be a positive number.
- Date is required.
- Description is optional.
- New expenses get a unique ID using `crypto.randomUUID()` when available, with a fallback ID generator.
- Editing fills the form with the selected expense, then updates that same record.
- Deleting uses `window.confirm()` so the user must confirm before the record is removed.

### Analytics

File: `src/components/Analytics.jsx`

The Analytics page shows month-wise visual spending breakdowns.

It contains:

- Month and year filters.
- Total spending for the selected month.
- A stacked category distribution bar.
- Category legend with percentages and amounts.
- Spending breakdown bars.
- Ranked category list.

Important logic:

- It filters expenses by selected month/year.
- It calculates total spending for that selected period.
- It calculates each category's amount and percentage.
- It sorts categories from highest spending to lowest.
- If there is no data for the selected period, it shows an empty state message.

## 3. App Flow

The main app controller is `src/App.jsx`.

Simple flow:

1. `src/main.jsx` starts React and renders `App`.
2. `App.jsx` loads saved expenses from `localStorage` using `getExpenses()`.
3. `App.jsx` stores expenses in React state.
4. Navigation buttons switch between Dashboard, Transactions, and Analytics.
5. Transactions page calls functions from `App.jsx` when adding, editing, or deleting.
6. `App.jsx` updates the in-memory list and saves the updated list with `saveExpenses()`.
7. Dashboard and Analytics automatically receive the newest expense list through props.

Short version:

```text
main.jsx
  -> App.jsx
    -> loads expenses from expenseService.js
    -> renders one page at a time
      -> Dashboard.jsx
      -> Transactions.jsx
      -> Analytics.jsx
```

## 4. Data Model

Each expense is expected to look like this:

```js
{
  id: "unique-id",
  title: "Lunch at canteen",
  amount: 120,
  category: "Food",
  date: "2026-07-02"
}
```

Field meaning:

- `id`: unique identifier used for edit/delete and React list rendering.
- `title`: optional description. Empty string is allowed.
- `amount`: positive number.
- `category`: one of the allowed categories.
- `date`: string in `YYYY-MM-DD` format.

Storage key:

```text
expenses
```

The browser stores all expenses under this one `localStorage` key.

## 5. Storage Logic

File: `src/services/expenseService.js`

This file is the storage layer. It is the only place that should directly read from or write to `localStorage`.

Exports:

- `getExpenses()`
- `saveExpenses(expensesList)`

### getExpenses()

Purpose: Load saved expenses from browser storage.

Logic:

1. Reads the raw string from `localStorage` using the `expenses` key.
2. Converts the string back into JavaScript data using `JSON.parse()`.
3. Makes sure the result is an array.
4. Normalizes every expense.
5. Removes broken or unsafe records.
6. Returns a clean list.
7. If anything goes wrong, returns an empty list instead of crashing the app.

### saveExpenses(expensesList)

Purpose: Save the expense list into browser storage.

Logic:

1. Makes sure the input is an array.
2. Normalizes each expense before saving.
3. Removes invalid records.
4. Converts the clean list into a JSON string.
5. Saves it to `localStorage`.
6. Returns `true` when saving works.
7. Returns `false` when saving fails.

### normalizeExpense()

Internal helper. It protects the app from broken data.

It checks:

- Expense must be an object.
- Amount must be a real positive number.
- Category must exist.
- Date must exist.
- Title must be a string or it becomes an empty string.
- Missing IDs get a fallback generated ID.

## 6. Shared Constants

File: `src/constants.js`

This file stores shared values used across the app.

Current categories:

- Food
- Utility
- Travel
- Entertainment
- Others

Other shared values:

- `CATEGORY_ICONS`: icon for each category.
- `CATEGORY_COLORS`: CSS color variable for each category.
- `MONTHS`: month dropdown values from January to December.
- `YEARS`: currently `2024`, `2025`, `2026`, `2027`.
- `getTodayString()`: returns today's date in `YYYY-MM-DD` format.
- `formatCurrency()`: formats an amount as INR/Rs style currency text.

Important note: If you add a new category, update all matching places together:

- `CATEGORIES`
- `CATEGORY_ICONS`
- `CATEGORY_COLORS`
- CSS classes in `src/App.css` for badges and chart fills

## 7. Styling and UI Files

### src/index.css

Global styling:

- Theme colors.
- CSS variables.
- Font family.
- Body defaults.
- Shared animation keyframes.

### src/App.css

Main app styling:

- Header and navigation.
- Buttons.
- Forms.
- Cards/panels.
- Category badges.
- Dashboard layout.
- Transactions table.
- Analytics layout.
- Responsive mobile rules.

Design style:

- Light green finance-style theme.
- Card-based layout.
- Sticky header.
- Responsive layout for smaller screens.

## 8. File Map

```text
project1/
  README.md
    Main project blueprint and handoff document.

  package.json
    Project scripts and dependencies.

  package-lock.json
    Locked dependency versions generated by npm.

  vite.config.js
    Vite build configuration.

  eslint.config.js
    ESLint rules for code quality checks.

  index.html
    Main HTML entry file. Loads React through src/main.jsx.

  public/
    favicon.svg
      Browser tab icon. Currently referenced by index.html.

    icons.svg
      Public SVG asset. Currently not used by the React app.

  src/
    main.jsx
      React entry point. Mounts App into the page.

    App.jsx
      Main app controller. Handles page navigation, expense state, and save/update/delete logic.

    App.css
      Main component and page styling.

    index.css
      Global theme and base styles.

    constants.js
      Shared categories, month/year values, icons, colors, and date/currency helpers.

    components/
      Dashboard.jsx
        Current-month summary, monthly lookup, recent transactions.

      Transactions.jsx
        Add, edit, delete, and list all expenses.

      Analytics.jsx
        Month-wise category analytics and charts.

    services/
      expenseService.js
        Reads and writes expense data in localStorage.

    assets/
      hero.png
      react.svg
      vite.svg
        Asset files currently not used in the live app screens.

  test/
    expenseService.test.js
      Tests for expense save/load behavior.

  dist/
    Production build output generated by npm run build.
    This folder can be regenerated and should not be manually edited.

  node_modules/
    Installed dependencies.
    This folder can be regenerated using npm install.
```

## 9. Commands

Run from inside the `project1` folder.

### Install dependencies

```bash
npm install
```

Use this if `node_modules` is missing.

### Start development server

```bash
npm run dev
```

This starts the local Vite server for development.

### Build production files

```bash
npm run build
```

This checks whether the app can be packaged for production. Output goes to `dist/`.

### Preview production build

```bash
npm run preview
```

This serves the built `dist/` app locally.

### Run lint check

```bash
npm run lint
```

This checks for code quality problems.

### Run tests

```bash
npm test
```

This currently runs Node's built-in test runner for `test/expenseService.test.js`.

## 10. Current Test Coverage

Current test file:

```text
test/expenseService.test.js
```

It checks:

- Empty storage returns an empty expense list.
- Valid expenses can be saved and read back.
- Broken saved records are ignored instead of crashing the app.

Current gap:

- There are no browser UI tests yet.
- Add/edit/delete flows are not tested through the actual React screen.
- Dashboard and Analytics calculations are not separately unit-tested.

Suggested future tests:

- Add an expense and confirm it appears in the table.
- Edit an expense and confirm the value changes.
- Delete an expense and confirm it disappears.
- Add expenses in different months and confirm Dashboard/Analytics totals are correct.
- Check mobile layout with a browser-based test tool.

## 11. Known Limitations

This app is useful but still simple.

Current limitations:

- Data is only stored in the browser on the same device.
- Clearing browser storage deletes all expenses.
- There is no login or cloud sync.
- There is no export to CSV/PDF yet.
- There is no budget limit or warning system yet.
- Year dropdown only includes 2024 to 2027.
- Categories are fixed in code.
- Currency display is intended for INR/Rs style usage.
- Public assets `icons.svg`, `hero.png`, `react.svg`, and `vite.svg` are present but not used in the current app UI.

## 12. Developer Notes

### Navigation

There is no React Router. Page switching is handled by this state in `App.jsx`:

```js
const [currentPage, setCurrentPage] = useState('dashboard');
```

The app renders one component based on `currentPage`:

- `dashboard` renders `Dashboard`
- `transactions` renders `Transactions`
- `analytics` renders `Analytics`

### State ownership

`App.jsx` owns the main expense list. Child components do not save data directly.

- Dashboard only reads expenses.
- Analytics only reads expenses.
- Transactions asks App to add, update, or delete.
- App updates state and calls `saveExpenses()`.

This is good because the saving logic stays in one place.

### Date handling

The app uses simple string dates in `YYYY-MM-DD` format. Month and year are extracted by splitting the string:

```js
const [year, month] = exp.date.split('-').map(Number);
```

Important: If the date format changes later, Dashboard and Analytics filtering must be updated.

### Category CSS connection

Category names are converted to lowercase for CSS class names:

```js
cat-${exp.category.toLowerCase()}
```

Example:

```text
Food -> cat-food
Utility -> cat-utility
```

If category names with spaces are added later, this logic may need improvement.

## 13. AI Handoff Guide

If you upload only this README to an AI assistant, use this instruction:

```text
You are helping with a React/Vite frontend-only expense tracker. Read this README as the project blueprint. The app stores expense data in browser localStorage through src/services/expenseService.js. App.jsx owns the expense state and page navigation. Dashboard, Transactions, and Analytics are the main screens. Keep explanations plain-English because the owner is a non-coder. Before changing code, explain what you plan to change and why.
```

Recommended AI workflow for future changes:

1. Read this README first.
2. Read the exact files related to the requested feature.
3. Explain the planned change in plain English.
4. Make a small focused code change.
5. Run `npm run lint`.
6. Run `npm run build`.
7. Run `npm test` if storage or logic changed.
8. Update the README change log below.

## 14. Future Update Area

Use this section every time the project changes. Add the newest item at the top.

### Update Log

#### 2026-07-02 - Stability and README blueprint update

Changed:

- Replaced the default Vite README with a full project map.
- Documented app purpose, file map, data flow, storage logic, commands, tests, and limitations.
- Added reusable guidance for future AI/developer handoffs.

Related previous stability work:

- Restored and strengthened expense saving through `saveExpenses()`.
- Made startup loading cleaner in `App.jsx`.
- Added safer expense IDs in `Transactions.jsx`.
- Added storage tests for expense save/load behavior.

Verified:

- `npm run lint` passed.
- `npm run build` passed.
- `npm test` passed.

### Planned / Suggested Next Updates

Use this list as a future improvement board:

- Add export to CSV.
- Add monthly budget limit and warning message.
- Add custom categories.
- Add search/filter in Transactions.
- Add chart library or better visual analytics.
- Add browser UI tests.
- Add backup/import feature.
- Add dark mode.
- Clean unused assets if they are not needed.

## 15. Quick Health Status

As of 2026-07-02:

- App type: Working frontend-only React app.
- Storage: Browser localStorage.
- Lint: Passing.
- Build: Passing.
- Tests: Passing for storage service.
- Biggest risk: No full browser UI test coverage yet.
- Best next safety improvement: Add tests for add/edit/delete user flows.


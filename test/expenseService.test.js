import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { getExpenses, saveExpenses } from "../src/services/expenseService.js";

const storage = new Map();

beforeEach(() => {
  storage.clear();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
});

test("returns an empty list when there is no saved data", () => {
  assert.deepEqual(getExpenses(), []);
});

test("saves and reads valid expenses", () => {
  const expenses = [
    {
      id: "1",
      title: "Lunch",
      amount: 120,
      category: "Food",
      date: "2026-07-02",
    },
  ];

  assert.equal(saveExpenses(expenses), true);
  assert.deepEqual(getExpenses(), expenses);
});

test("ignores broken saved records instead of crashing", () => {
  storage.set(
    "expenses",
    JSON.stringify([
      {
        id: "1",
        title: "Bus",
        amount: 20,
        category: "Travel",
        date: "2026-07-02",
      },
      { id: "bad", amount: "not-a-number", category: "Food", date: "2026-07-02" },
      null,
    ]),
  );

  assert.deepEqual(getExpenses(), [
    {
      id: "1",
      title: "Bus",
      amount: 20,
      category: "Travel",
      date: "2026-07-02",
    },
  ]);
});


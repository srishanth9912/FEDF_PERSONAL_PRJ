export const CATEGORIES = ["Food", "Utility", "Travel", "Entertainment", "Others"];

export const CATEGORY_ICONS = {
  Food: "\u{1F355}",
  Utility: "\u{1F4A1}",
  Travel: "\u{1F68C}",
  Entertainment: "\u{1F3AC}",
  Others: "\u{1F3F7}\uFE0F",
};

export const CATEGORY_COLORS = {
  Food: "var(--food-color)",
  Utility: "var(--utility-color)",
  Travel: "var(--travel-color)",
  Entertainment: "var(--entertainment-color)",
  Others: "var(--others-color)",
};

export const MONTHS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

export const YEARS = ["2024", "2025", "2026", "2027"];

export const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};


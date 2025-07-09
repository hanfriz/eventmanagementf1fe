// Configuration untuk content localization
export const contentConfig = {
  defaultLanguage: "id",
  supportedLanguages: ["id", "en"],
  dateFormat: "id-ID",
  currency: "IDR",
  currencySymbol: "Rp",

  // Format patterns
  datePattern: "dd/MM/yyyy",
  timePattern: "HH:mm",
  currencyPattern: "#,##0",

  // UI Configuration
  itemsPerPage: 12,
  maxSearchResults: 100,
  debounceDelay: 300,
} as const;

// Content namespaces for better organization
export const contentNamespaces = {
  UI: "ui",
  FORMS: "forms",
  MESSAGES: "messages",
  ERRORS: "errors",
  LABELS: "labels",
} as const;

export type CurrencyCode =
  | "USD" | "GBP" | "EUR" | "INR" | "JPY" | "CNY"
  | "AUD" | "CAD" | "SGD" | "CHF" | "AED";

// Country → currency map. Countries not in this map fall back to USD.
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  // Americas
  "United States": "USD",
  "Canada": "CAD",
  "Mexico": "USD",
  "Brazil": "USD",
  "Argentina": "USD",
  "Chile": "USD",
  "Colombia": "USD",
  "Peru": "USD",

  // Europe — eurozone
  "Germany": "EUR",
  "France": "EUR",
  "Spain": "EUR",
  "Italy": "EUR",
  "Netherlands": "EUR",
  "Belgium": "EUR",
  "Austria": "EUR",
  "Portugal": "EUR",
  "Ireland": "EUR",
  "Greece": "EUR",
  "Finland": "EUR",
  "Estonia": "EUR",
  "Luxembourg": "EUR",

  // Europe — other
  "United Kingdom": "GBP",
  "Switzerland": "CHF",
  "Sweden": "EUR",
  "Norway": "EUR",
  "Denmark": "EUR",
  "Poland": "EUR",
  "Czech Republic": "EUR",
  "Romania": "EUR",
  "Hungary": "EUR",

  // Asia
  "India": "INR",
  "Japan": "JPY",
  "China": "CNY",
  "Singapore": "SGD",
  "Hong Kong": "USD",
  "South Korea": "USD",
  "Taiwan": "USD",
  "Indonesia": "USD",
  "Philippines": "USD",
  "Vietnam": "USD",
  "Thailand": "USD",
  "Malaysia": "USD",
  "Pakistan": "USD",
  "Bangladesh": "USD",
  "Sri Lanka": "USD",
  "Nepal": "USD",

  // Middle East
  "United Arab Emirates": "AED",
  "Saudi Arabia": "USD",
  "Israel": "USD",
  "Qatar": "USD",
  "Kuwait": "USD",
  "Turkey": "USD",

  // Oceania
  "Australia": "AUD",
  "New Zealand": "AUD",

  // Africa
  "South Africa": "USD",
  "Nigeria": "USD",
  "Egypt": "USD",
  "Kenya": "USD",
  "Ghana": "USD",
  "Morocco": "USD",

  // Other
  "Russia": "USD",
  "Ukraine": "USD",
  "Other": "USD",
};

export const COUNTRIES: string[] = Object.keys(COUNTRY_TO_CURRENCY).sort((a, b) => {
  if (a === "Other") return 1;
  if (b === "Other") return -1;
  return a.localeCompare(b);
});

export function currencyForCountry(country: string): CurrencyCode {
  return COUNTRY_TO_CURRENCY[country] ?? "USD";
}

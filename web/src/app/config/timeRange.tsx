import { getXDaysAgo, getXYearsAgo } from "@/lib/dateUtils";

export const timeRangeValues = [
  { label: "Letzte 2 Jahre", value: getXYearsAgo(2) },
  { label: "Letztes Jahr", value: getXYearsAgo(1) },
  { label: "Letzte 30 Tage", value: getXDaysAgo(30) },
  { label: "Letzte 7 Tage", value: getXDaysAgo(7) },
  { label: "Heute", value: getXDaysAgo(1) },
];

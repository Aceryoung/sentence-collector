export function getKstDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatKstDateDisplay(date: Date): string {
  return getKstDateString(date).replace(/-/g, ".");
}

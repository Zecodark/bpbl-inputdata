/** Generate a record ID like ID20260411-112346 using the local clock. */
export function generateRecordNo(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    "ID" +
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    "-" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

/** ISO-like timestamp suitable for the spreadsheet (`YYYY-MM-DD HH:MM:SS`). */
export function nowStamp(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    now.getFullYear() +
    "-" +
    pad(now.getMonth() + 1) +
    "-" +
    pad(now.getDate()) +
    " " +
    pad(now.getHours()) +
    ":" +
    pad(now.getMinutes()) +
    ":" +
    pad(now.getSeconds())
  );
}

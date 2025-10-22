export const DAILY_VERSES = ["Psalm 23:1","John 3:16","Romans 8:28"];
export function getTodayReference() {
  const start = new Date("2020-01-01T00:00:00Z");
  const diff = Math.floor((Date.now() - start.getTime()) / (1000*60*60*24));
  return DAILY_VERSES[diff % DAILY_VERSES.length];
}

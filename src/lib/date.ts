/** <input type="date"> と epoch ミリ秒の相互変換（ローカルタイム基準）。 */

export function toDateInputValue(time: number): string {
  const date = new Date(time);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateInputValue(value: string, edge: 'start' | 'end'): number | null {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!matched) return null;
  const [, year, month, day] = matched;
  const date =
    edge === 'start'
      ? new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0)
      : new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
  const time = date.getTime();
  return Number.isFinite(time) ? time : null;
}

export function formatYearMonth(time: number): string {
  const date = new Date(time);
  return `${date.getFullYear()}/${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}

export function formatDate(time: number): string {
  const date = new Date(time);
  return `${date.getFullYear()}/${`${date.getMonth() + 1}`.padStart(2, '0')}/${`${date.getDate()}`.padStart(2, '0')}`;
}

/** time から years 年さかのぼった時刻。 */
export function subtractYears(time: number, years: number): number {
  const date = new Date(time);
  date.setFullYear(date.getFullYear() - years);
  return date.getTime();
}

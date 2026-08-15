'use client';

import { fromDateInputValue, subtractYears, toDateInputValue } from '@/lib/date';

export type Range = { from: number; to: number };

type Props = {
  /** 取得済みデータ全体の期間。入力の上下限に使う。 */
  bounds: Range;
  value: Range;
  onChange: (range: Range) => void;
};

const PRESETS: { label: string; years: number | null }[] = [
  { label: '全期間', years: null },
  { label: '直近1年', years: 1 },
  { label: '直近3年', years: 3 },
  { label: '直近5年', years: 5 },
];

export function PeriodFilter({ bounds, value, onChange }: Props) {
  const presetRange = (years: number | null): Range =>
    years === null
      ? bounds
      : { from: Math.max(bounds.from, subtractYears(bounds.to, years)), to: bounds.to };

  // 期間が短くて複数のプリセットが同じ範囲になることがあるため、最初に一致した 1 つだけを選択状態にする。
  const activeLabel = PRESETS.find((preset) => {
    const range = presetRange(preset.years);
    return range.from === value.from && range.to === value.to;
  })?.label;

  return (
    <section className="period">
      <h2 className="section-title">表示する期間</h2>
      <div className="period-controls">
        <label className="period-field">
          <span>開始</span>
          <input
            type="date"
            className="text-input"
            value={toDateInputValue(value.from)}
            min={toDateInputValue(bounds.from)}
            max={toDateInputValue(value.to)}
            onChange={(event) => {
              const from = fromDateInputValue(event.target.value, 'start');
              if (from !== null) onChange({ from, to: Math.max(from, value.to) });
            }}
          />
        </label>
        <label className="period-field">
          <span>終了</span>
          <input
            type="date"
            className="text-input"
            value={toDateInputValue(value.to)}
            min={toDateInputValue(value.from)}
            max={toDateInputValue(bounds.to)}
            onChange={(event) => {
              const to = fromDateInputValue(event.target.value, 'end');
              if (to !== null) onChange({ from: Math.min(value.from, to), to });
            }}
          />
        </label>
        <div className="preset-buttons">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={preset.label === activeLabel ? 'chip chip-active' : 'chip'}
              aria-pressed={preset.label === activeLabel}
              onClick={() => onChange(presetRange(preset.years))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

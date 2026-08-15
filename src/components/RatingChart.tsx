'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { UserHistory } from '@/lib/atcoder';
import { formatDate, formatYearMonth } from '@/lib/date';
import { RATING_BANDS, ratingAxisDomain, seriesColor } from '@/lib/rating';

type Props = {
  histories: UserHistory[];
  /** 表示する期間 (epoch ミリ秒)。 */
  range: { from: number; to: number };
};

type ChartRow = { date: number } & Record<string, number | null>;

/** ユーザーごとの点を、同じ日時をまとめた 1 つのテーブルに変換する。 */
function buildRows(histories: UserHistory[], range: { from: number; to: number }): ChartRow[] {
  const byDate = new Map<number, ChartRow>();

  for (const { user, points } of histories) {
    for (const point of points) {
      if (point.date < range.from || point.date > range.to) continue;
      let row = byDate.get(point.date);
      if (!row) {
        row = { date: point.date };
        byDate.set(point.date, row);
      }
      row[user] = point.rating;
    }
  }

  const rows = [...byDate.values()].sort((a, b) => a.date - b.date);
  // 折れ線を連続させるため、点が無いユーザーの列は null で埋めておく。
  for (const row of rows) {
    for (const { user } of histories) {
      if (!(user in row)) row[user] = null;
    }
  }
  return rows;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string | number; value?: number | null; color?: string }[];
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entries = payload.filter((entry) => typeof entry.value === 'number');
  if (entries.length === 0) return null;

  return (
    <div className="tooltip">
      <div className="tooltip-date">{typeof label === 'number' ? formatDate(label) : ''}</div>
      {entries.map((entry) => (
        <div key={String(entry.name)} className="tooltip-row">
          <span className="tooltip-swatch" style={{ backgroundColor: entry.color }} />
          <span className="tooltip-name">{entry.name}</span>
          <span className="tooltip-value">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function RatingChart({ histories, range }: Props) {
  const rows = useMemo(() => buildRows(histories, range), [histories, range]);

  const [yMin, yMax] = useMemo(() => {
    const ratings = rows.flatMap((row) =>
      histories.map((history) => row[history.user]).filter((value): value is number => value !== null),
    );
    if (ratings.length === 0) return ratingAxisDomain(0, 0);
    return ratingAxisDomain(Math.min(...ratings), Math.max(...ratings));
  }, [rows, histories]);

  if (rows.length === 0) {
    return <p className="empty">選択した期間にコンテスト参加履歴がありません。</p>;
  }

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          {RATING_BANDS.filter((band) => band.max > yMin && band.min < yMax).map((band) => (
            <ReferenceArea
              key={band.name}
              y1={Math.max(band.min, yMin)}
              y2={Math.min(band.max, yMax)}
              fill={band.color}
              fillOpacity={0.8}
              ifOverflow="hidden"
            />
          ))}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.12)" />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={[range.from, range.to]}
            tickFormatter={formatYearMonth}
            minTickGap={40}
            stroke="#555"
          />
          <YAxis domain={[yMin, yMax]} allowDataOverflow tickCount={9} width={56} stroke="#555" />
          <Tooltip content={<ChartTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
          {histories.map((history, index) => (
            <Line
              key={history.user}
              type="linear"
              dataKey={history.user}
              name={history.user}
              stroke={seriesColor(index)}
              strokeWidth={2}
              legendType="plainline"
              // 既定のマーカーは中が白抜きになるため、線と同じ色で塗りつぶす。
              dot={{ r: 3, fill: seriesColor(index), stroke: seriesColor(index) }}
              activeDot={{ r: 5, fill: seriesColor(index), stroke: '#ffffff', strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

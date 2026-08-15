/**
 * AtCoder のレート帯（色）定義。
 * 元の Jupyter Notebook (compare_rating.ipynb) の Color / get_rate_range / get_color_code と同じ値。
 */
export type RatingBand = {
  name: string;
  /** 下限（含む） */
  min: number;
  /** 上限（含まない） */
  max: number;
  /** グラフの背景に塗る色 */
  color: string;
};

export const RATING_BANDS: readonly RatingBand[] = [
  { name: 'gray', min: 0, max: 400, color: '#D9D9D9' },
  { name: 'brown', min: 400, max: 800, color: '#D9C5B2' },
  { name: 'green', min: 800, max: 1200, color: '#B2D9B2' },
  { name: 'light blue', min: 1200, max: 1600, color: '#B2ECEC' },
  { name: 'blue', min: 1600, max: 2000, color: '#B2B2FF' },
  { name: 'yellow', min: 2000, max: 2400, color: '#ECECB2' },
  { name: 'orange', min: 2400, max: 2800, color: '#FFD9B2' },
  { name: 'red', min: 2800, max: 4000, color: '#FFB2B2' },
] as const;

/** 各ユーザーの折れ線に割り当てる色。 */
export const SERIES_COLORS: readonly string[] = [
  '#1f77b4',
  '#d62728',
  '#2ca02c',
  '#ff7f0e',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#17becf',
  '#7f7f7f',
  '#bcbd22',
];

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

/**
 * データの min/max から、レート帯の区切りに合わせた Y 軸の表示範囲を求める。
 * Notebook では最小レートを含む帯から、最大レート + 200 を超える帯までを描画していた。
 */
export function ratingAxisDomain(minRating: number, maxRating: number): [number, number] {
  const bands = RATING_BANDS.filter((band) => band.max > minRating);
  const lower = bands.length > 0 ? bands[0].min : 0;

  const upperBand = RATING_BANDS.find((band) => band.max > maxRating + 200);
  const upper = upperBand ? upperBand.max : RATING_BANDS[RATING_BANDS.length - 1].max;

  return [lower, Math.max(upper, lower + 400)];
}

/**
 * AtCoder のコンテスト履歴取得。
 *
 * atcoder.jp の /users/<user>/history/json は CORS ヘッダを返さずブラウザから直接叩けないため、
 * AtCoder Problems (kenkoooo.com) が公開しているプロキシ経由で取得する。
 */
const HISTORY_ENDPOINT = (user: string) =>
  `https://kenkoooo.com/atcoder/proxy/users/${encodeURIComponent(user)}/history/json`;

/** AtCoder が返すコンテスト結果 1 件分。 */
type ContestResult = {
  IsRated: boolean;
  Place: number;
  OldRating: number;
  NewRating: number;
  Performance: number;
  ContestScreenName: string;
  ContestName: string;
  EndTime: string;
};

export type RatingPoint = {
  /** コンテスト終了時刻 (epoch ミリ秒) */
  date: number;
  /** そのコンテスト後のレート */
  rating: number;
  contestName: string;
  performance: number;
};

export type UserHistory = {
  user: string;
  points: RatingPoint[];
};

export class AtCoderFetchError extends Error {
  constructor(
    readonly user: string,
    message: string,
  ) {
    super(message);
    this.name = 'AtCoderFetchError';
  }
}

function isContestResult(value: unknown): value is ContestResult {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.IsRated === 'boolean' &&
    typeof record.NewRating === 'number' &&
    typeof record.EndTime === 'string'
  );
}

/** 1 ユーザー分の Rated なコンテスト履歴を、時刻昇順で取得する。 */
export async function fetchUserHistory(user: string, signal?: AbortSignal): Promise<UserHistory> {
  let response: Response;
  try {
    response = await fetch(HISTORY_ENDPOINT(user), { signal });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new AtCoderFetchError(user, '通信に失敗しました。時間をおいて再度お試しください。');
  }

  if (!response.ok) {
    throw new AtCoderFetchError(user, `取得に失敗しました (HTTP ${response.status})`);
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new AtCoderFetchError(user, '想定外の形式のデータが返されました。');
  }

  const points = body
    .filter(isContestResult)
    .filter((result) => result.IsRated)
    .map<RatingPoint>((result) => ({
      date: new Date(result.EndTime).getTime(),
      rating: result.NewRating,
      contestName: result.ContestName,
      performance: result.Performance,
    }))
    .filter((point) => Number.isFinite(point.date))
    .sort((a, b) => a.date - b.date);

  if (points.length === 0) {
    throw new AtCoderFetchError(
      user,
      'Rated なコンテスト参加履歴が見つかりませんでした。ユーザー名を確認してください。',
    );
  }

  return { user, points };
}

export type FetchOutcome =
  | { status: 'fulfilled'; history: UserHistory }
  | { status: 'rejected'; user: string; message: string };

/** 複数ユーザーをまとめて取得する。1 人失敗しても他の結果は返す。 */
export async function fetchUserHistories(
  users: string[],
  signal?: AbortSignal,
): Promise<FetchOutcome[]> {
  return Promise.all(
    users.map(async (user): Promise<FetchOutcome> => {
      try {
        return { status: 'fulfilled', history: await fetchUserHistory(user, signal) };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        const message =
          error instanceof AtCoderFetchError ? error.message : '不明なエラーが発生しました。';
        return { status: 'rejected', user, message };
      }
    }),
  );
}

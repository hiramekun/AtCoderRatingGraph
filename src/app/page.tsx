'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { PeriodFilter, type Range } from '@/components/PeriodFilter';
import { RatingChart } from '@/components/RatingChart';
import { UserNameForm } from '@/components/UserNameForm';
import { fetchUserHistories, type UserHistory } from '@/lib/atcoder';

type FetchError = { user: string; message: string };

/** 入力欄の内容を、空を除き重複を排除したユーザー名リストにする。 */
function normalizeUserNames(userNames: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of userNames) {
    const name = raw.trim();
    if (name === '') continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

export default function Home() {
  const [userNames, setUserNames] = useState<string[]>(['', '']);
  const [histories, setHistories] = useState<UserHistory[]>([]);
  const [errors, setErrors] = useState<FetchError[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<Range | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const bounds = useMemo<Range | null>(() => {
    const dates = histories.flatMap((history) => [
      history.points[0].date,
      history.points[history.points.length - 1].date,
    ]);
    if (dates.length === 0) return null;
    return { from: Math.min(...dates), to: Math.max(...dates) };
  }, [histories]);

  const handleSubmit = useCallback(async () => {
    const targets = normalizeUserNames(userNames);
    if (targets.length === 0) return;

    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setLoading(true);
    try {
      const outcomes = await fetchUserHistories(targets, controller.signal);
      const fetched = outcomes
        .filter((outcome) => outcome.status === 'fulfilled')
        .map((outcome) => outcome.history);
      const failed = outcomes
        .filter((outcome) => outcome.status === 'rejected')
        .map(({ user, message }) => ({ user, message }));

      setHistories(fetched);
      setErrors(failed);

      const dates = fetched.flatMap((history) => [
        history.points[0].date,
        history.points[history.points.length - 1].date,
      ]);
      setRange(dates.length > 0 ? { from: Math.min(...dates), to: Math.max(...dates) } : null);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      throw error;
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        setLoading(false);
      }
    }
  }, [userNames]);

  return (
    <main className="page">
      <header className="header">
        <h1 className="title">AtCoder Rating Graph</h1>
        <p className="lead">複数ユーザーの AtCoder レーティング推移を並べて比較できます。</p>
      </header>

      <UserNameForm
        userNames={userNames}
        loading={loading}
        onChange={setUserNames}
        onSubmit={handleSubmit}
      />

      {errors.length > 0 && (
        <ul className="errors">
          {errors.map((error) => (
            <li key={error.user}>
              <strong>{error.user}</strong>: {error.message}
            </li>
          ))}
        </ul>
      )}

      {bounds && range && histories.length > 0 ? (
        <>
          <PeriodFilter bounds={bounds} value={range} onChange={setRange} />
          <RatingChart histories={histories} range={range} />
        </>
      ) : (
        !loading && (
          <p className="empty">
            ユーザー名を入力して「比較する」を押すと、レーティングの推移が表示されます。
          </p>
        )
      )}

      <footer className="footer">
        <p>
          データ提供:{' '}
          <a href="https://atcoder.jp/" target="_blank" rel="noreferrer">
            AtCoder
          </a>{' '}
          /{' '}
          <a href="https://kenkoooo.com/atcoder/" target="_blank" rel="noreferrer">
            AtCoder Problems
          </a>{' '}
          のプロキシ API
        </p>
        <p>
          <a
            href="https://github.com/hiramekun/AtCoderRatingGraph"
            target="_blank"
            rel="noreferrer"
          >
            GitHub リポジトリ
          </a>
        </p>
      </footer>
    </main>
  );
}

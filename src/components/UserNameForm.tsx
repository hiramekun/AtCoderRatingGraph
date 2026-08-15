'use client';

import type { FormEvent } from 'react';

type Props = {
  userNames: string[];
  loading: boolean;
  onChange: (userNames: string[]) => void;
  onSubmit: () => void;
};

const MAX_USERS = 10;

export function UserNameForm({ userNames, loading, onChange, onSubmit }: Props) {
  const updateAt = (index: number, value: string) => {
    onChange(userNames.map((name, i) => (i === index ? value : name)));
  };

  const removeAt = (index: number) => {
    const next = userNames.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : ['']);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const canSubmit = !loading && userNames.some((name) => name.trim() !== '');

  return (
    <form className="form" onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <legend className="legend">比較するユーザー名</legend>
        <ul className="user-list">
          {userNames.map((name, index) => (
            // 入力欄は並び順そのものが同一性なので index を key にする。
            <li key={index} className="user-row">
              <input
                type="text"
                className="text-input"
                value={name}
                placeholder="AtCoder ID (例: hiramekun)"
                autoComplete="off"
                spellCheck={false}
                aria-label={`ユーザー名 ${index + 1}`}
                onChange={(event) => updateAt(index, event.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={`ユーザー名 ${index + 1} を削除`}
                disabled={userNames.length === 1 && name === ''}
                onClick={() => removeAt(index)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={userNames.length >= MAX_USERS}
            onClick={() => onChange([...userNames, ''])}
          >
            ＋ ユーザーを追加
          </button>
          <button type="submit" className="primary-button" disabled={!canSubmit}>
            {loading ? '取得中…' : '比較する'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

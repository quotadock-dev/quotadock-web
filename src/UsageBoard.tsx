import { useState } from 'react';
import { translate } from './locale';
import type { Language } from './locale';
import { english, koreanWindows } from './translations';

type Scenario = 'normal' | 'unknown' | 'stale';
interface QuotaWindow { label: string; remaining: number | null }
interface ProviderExample {
  id: 'claude' | 'codex' | 'gemini' | 'grok'; name: string; plan: string | null;
  windows: readonly QuotaWindow[];
}
const examples: readonly ProviderExample[] = [
  { id: 'claude', name: 'Claude', plan: 'Max', windows: [{ label: 'Session', remaining: 72 }, { label: 'Weekly', remaining: 91 }] },
  { id: 'codex', name: 'Codex', plan: 'ChatGPT Pro', windows: [{ label: '5-hour', remaining: 84 }, { label: 'Weekly', remaining: 63 }] },
  { id: 'gemini', name: 'Gemini', plan: 'Standard', windows: [{ label: 'Pro model tier', remaining: 88 }, { label: 'Flash model tier', remaining: 96 }] },
  { id: 'grok', name: 'Grok', plan: null, windows: [{ label: '사용량', remaining: null }] },
];
const status: Record<Scenario, string> = {
  normal: 'DEMO · 고정 예시 데이터입니다. 실시간 연결 없음',
  unknown: 'DEMO · 알 수 없음은 0%가 아닙니다',
  stale: 'DEMO · 오래된 관측 상태의 예시입니다. 현재 사용량이 아닙니다',
};

export function UsageBoard({ language }: { language: Language }) {
  const t = (value: string) => translate(value, language, english);
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [replay, setReplay] = useState(0);
  const number = new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : 'en-US');
  const label = (value: string) => language === 'ko' ? koreanWindows[value] || value : value === '사용량' ? t('사용량') : value;
  return <>
    <div className="demo-controls">
      <label>{t('예시 상태')} <select id="scenario" value={scenario} onChange={event => {
        const value = event.currentTarget.value;
        if (value === 'normal' || value === 'unknown' || value === 'stale') {
          setScenario(value); setReplay(0);
        }
      }}>
        <option value="normal">{t('일반')}</option>
        <option value="unknown">{t('모두 알 수 없음')}</option>
        <option value="stale">{t('오래된 관측')}</option>
      </select></label>
      <button id="demo-refresh" type="button" onClick={() => setReplay(value => value + 1)}>↻ {t('예시 다시 보기')}</button>
    </div>
    <p id="demo-status" className="small" role="status" aria-live="polite">
      {t(status[scenario])}{replay > 0 && (language === 'ko' ? ` · 예시 다시 보기 ${number.format(replay)}회 (네트워크 갱신 없음)` : ` · Replay sample: ${number.format(replay)} (no network refresh)`)}
    </p>
    <div id="providers" className="providers" role="region" aria-label={t('고정 예시 사용량 보드')}>
      {examples.map(provider => <article key={provider.id} className={`provider ${scenario === 'stale' ? 'is-stale' : ''}`}>
        <div className="provider-header">
          <div className="provider-title"><img className="provider-icon" src={`/icons/${provider.id}.svg`} alt="" />
            <div><h3>{provider.name}</h3><div className="plan">{provider.plan ? <>{provider.plan} · {t('예시')}</> : t('플랜 알 수 없음')}</div></div>
          </div><span className="badge">{t(scenario === 'stale' ? 'DEMO · STALE' : 'DEMO')}</span>
        </div>
        {provider.windows.map(window => {
          const amount = scenario === 'unknown' ? null : window.remaining;
          return <div className="window" key={window.label}>
            <div className="window-heading"><span>{label(window.label)}</span><strong>{amount === null ? t('알 수 없음') : `${number.format(amount)}% ${t('남음')}`}</strong></div>
            {amount === null ? <p className="unknown">{t('측정된 사용량 없음 · 추정 막대 없음')}</p> :
              <progress className="track" max={100} value={amount}
                aria-label={`${provider.name} ${label(window.label)} ${t('예시 남은 사용량')}`}
                aria-valuetext={`${number.format(amount)}% ${t('남음')} · ${t(scenario === 'stale' ? '오래된 예시, 현재 사용량 아님' : '고정 예시')}`} />}
            <p className="reset">{t('리셋 · 예시에서는 제공하지 않음')}</p>
          </div>;
        })}
        <div className="source">{t(scenario === 'stale' ? 'DEMO · 오래된 고정 예시 / 실제 관측 없음' : 'DEMO · 고정 예시 / 실제 관측 없음')}</div>
      </article>)}
    </div>
  </>;
}

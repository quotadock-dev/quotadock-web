import { useState } from 'react';

type Scenario = 'normal' | 'unknown' | 'stale';
interface QuotaWindow { label: string; remaining: number | null }
interface ProviderExample {
  id: 'claude' | 'codex' | 'gemini' | 'grok'; name: string; plan: string;
  windows: readonly QuotaWindow[];
}
const examples: readonly ProviderExample[] = [
  { id: 'claude', name: 'Claude', plan: 'Max · 예시', windows: [{ label: 'Session', remaining: 72 }, { label: 'Weekly', remaining: 91 }] },
  { id: 'codex', name: 'Codex', plan: 'ChatGPT Pro · 예시', windows: [{ label: '5-hour', remaining: 84 }, { label: 'Weekly', remaining: 63 }] },
  { id: 'gemini', name: 'Gemini', plan: 'Standard · 예시', windows: [{ label: 'Pro model tier', remaining: 88 }, { label: 'Flash model tier', remaining: 96 }] },
  { id: 'grok', name: 'Grok', plan: '플랜 알 수 없음', windows: [{ label: '사용량', remaining: null }] },
];
const status: Record<Scenario, string> = {
  normal: 'DEMO · 고정 예시 데이터입니다. 실시간 연결 없음',
  unknown: 'DEMO · 알 수 없음은 0%가 아닙니다',
  stale: 'DEMO · 오래된 관측 상태의 예시입니다. 현재 사용량이 아닙니다',
};

export function UsageBoard() {
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [replay, setReplay] = useState(0);
  return <>
    <div className="demo-controls">
      <label>예시 상태 <select id="scenario" value={scenario} onChange={event => {
        const value = event.currentTarget.value;
        if (value === 'normal' || value === 'unknown' || value === 'stale') {
          setScenario(value); setReplay(0);
        }
      }}>
        <option value="normal">일반 · 일부 확인 불가</option>
        <option value="unknown">모두 알 수 없음</option>
        <option value="stale">오래된 관측</option>
      </select></label>
      <button id="demo-refresh" type="button" onClick={() => setReplay(value => value + 1)}>↻ 예시 다시 보기</button>
    </div>
    <p id="demo-status" className="small" role="status" aria-live="polite">
      {status[scenario]}{replay > 0 && ` · 예시 다시 보기 ${replay}회 (네트워크 갱신 없음)`}
    </p>
    <div id="providers" className="providers" role="region" aria-label="고정 예시 사용량 보드">
      {examples.map(provider => <article key={provider.id} className={`provider ${scenario === 'stale' ? 'is-stale' : ''}`}>
        <div className="provider-header">
          <div className="provider-title"><img className="provider-icon" src={`/icons/${provider.id}.svg`} alt="" />
            <div><h3>{provider.name}</h3><div className="plan">{provider.plan}</div></div>
          </div><span className="badge">{scenario === 'stale' ? 'DEMO · STALE' : 'DEMO'}</span>
        </div>
        {provider.windows.map(window => {
          const amount = scenario === 'unknown' ? null : window.remaining;
          return <div className="window" key={window.label}>
            <div className="window-heading"><span>{window.label}</span><strong>{amount === null ? '알 수 없음' : `${amount}% 남음`}</strong></div>
            {amount === null ? <p className="unknown">측정된 사용량 없음 · 추정 막대 없음</p> :
              <progress className="track" max={100} value={amount}
                aria-label={`${provider.name} ${window.label} 예시 남은 사용량`}
                aria-valuetext={`${amount}% 남음${scenario === 'stale' ? ' · 오래된 예시, 현재 사용량 아님' : ' · 고정 예시'}`} />}
            <p className="reset">리셋 · 예시에서는 제공하지 않음</p>
          </div>;
        })}
        <div className="source">{scenario === 'stale' ? 'DEMO · 오래된 고정 예시 / 실제 관측 없음' : 'DEMO · 고정 예시 / 실제 관측 없음'}</div>
      </article>)}
    </div>
  </>;
}

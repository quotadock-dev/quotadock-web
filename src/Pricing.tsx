import { useState } from 'react';

export function Pricing({ language }: { language: 'ko' | 'en' }) {
  const [cycle, setCycle] = useState('month');
  const ko = language === 'ko';
  const annual = cycle === 'year';
  const price = (monthly: number) => new Intl.NumberFormat(ko ? 'ko-KR' : 'en-US', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(monthly * (annual ? 10 : 1));
  const period = ko ? annual ? '/ 년' : '/ 월' : annual ? '/ year' : '/ month';
  return <>
    <label>{ko ? '결제 주기' : 'Billing cycle'} <select aria-label={ko ? '결제 주기' : 'Billing cycle'} value={cycle} onChange={event => setCycle(event.target.value)}>
      <option value="month">{ko ? '월간' : 'Monthly'}</option><option value="year">{ko ? '연간' : 'Annual'}</option>
    </select></label>
    <p>{ko ? '여러 AI 계정과 수집기 컴퓨터를 관리하는 요금제입니다.' : 'Plans for managing AI accounts and collector computers.'}</p>
    <div className="plans">{[['Free', 0, 3, 1], ['Plus', 2990, 10, 3], ['Pro', 5990, 25, 5]].map(([name, amount, accounts, computers]) => <article key={name} aria-label={String(name)}>
      <h3>QuotaDock {name}</h3>
      <p className="price">{amount === 0 ? ko ? '무료' : 'Free' : price(Number(amount))} <span>{amount !== 0 && period}</span></p>
      <ul><li>{ko ? `AI 계정 최대 ${accounts}개` : `Up to ${accounts} AI accounts`}</li><li>{ko ? `수집기 컴퓨터 최대 ${computers}대` : `Up to ${computers} collector computer${computers === 1 ? '' : 's'}`}</li></ul>
      {name === 'Free' ? <p>{ko ? '기간 제한 없이 무료' : 'Free with no time limit'}</p> : <p>{ko ? '첫 구매 시 결제:' : 'Charged at first purchase:'} {price(Number(amount))} {period} · {ko ? '자동 갱신' : 'auto-renewing'}</p>}
    </article>)}</div>
    <p className="small">{ko ? 'AI 서비스 구독료는 별도입니다. QuotaDock Plus는 ChatGPT Plus가 아닙니다. 새 관측에는 온라인 로컬 수집기가 필요합니다.' : 'AI provider subscriptions are separate. QuotaDock Plus is not ChatGPT Plus. Fresh readings require an online local collector.'}</p>
    <details className="plan-terms"><summary>{ko ? '결제 안내·약관' : 'Purchase details and terms'}</summary>
      <p>{ko ? '유료 구독은 무료 체험 없이 첫 구매부터 결제됩니다. 연간 요금은 첫 구매 시 1년 전액이 청구됩니다. 표시 가격은 KRW 안내이며 실제 가격은 Apple StoreKit에서 확인하세요.' : 'Paid subscriptions are charged from the first purchase, with no free trial. Annual billing charges the full year at first purchase. Displayed prices are in KRW; confirm actual prices in Apple StoreKit.'}</p>
      <p>{ko ? '선택한 월간 또는 연간 주기로 자동 갱신됩니다. Apple 구독 설정에서 해지하세요. 앱 계정 삭제는 구독 해지가 아닙니다.' : 'Renews automatically on the selected monthly or annual cycle. Cancel in Apple subscription settings; deleting the app account does not cancel billing.'}</p>
      <a href="https://usage.mvtp.cloud/#privacy">{ko ? '개인정보' : 'Privacy'}</a> · <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">{ko ? '이용약관' : 'Terms'}</a>
    </details>
  </>;
}

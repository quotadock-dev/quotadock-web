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
      {name === 'Plus' && <><p>{ko ? '첫 1개월 무료 · 조건부 혜택' : 'First 1 month free · Conditional offer'}</p><p className="small">{ko ? `혜택 적용 시 무료 1개월 후 ${price(2990)} ${period} 자동 갱신` : `With the offer, after 1 free month: ${price(2990)} ${period}, auto-renewing`}</p>
        <details className="trial-details"><summary>{ko ? '무료 혜택 조건' : 'Offer conditions'}</summary><p>{ko ? 'Plus 월간·연간에만 적용되는 정책입니다. Apple에 1개월 무료 introductory offer가 설정되어 있고 구독 그룹 자격을 충족해야 합니다. Apple 구독 그룹당 introductory offer는 한 번만 이용할 수 있습니다. 이 웹은 현재 방문자의 자격을 확인하지 않습니다.' : 'Policy for Plus monthly and annual only. Requires a configured Apple 1-month free introductory offer and subscription-group eligibility. Only one introductory offer per Apple subscription group. This web page does not determine your eligibility.'}</p></details></>}
    </article>)}</div>
    <p className="small">{ko ? 'AI 서비스 구독료는 별도입니다. QuotaDock Plus는 ChatGPT Plus가 아닙니다. 새 관측에는 온라인 로컬 수집기가 필요합니다.' : 'AI provider subscriptions are separate. QuotaDock Plus is not ChatGPT Plus. Fresh readings require an online local collector.'}</p>
    <details className="plan-terms"><summary>{ko ? '결제 안내·약관' : 'Purchase details and terms'}</summary>
      <p>{ko ? '표시 가격은 KRW 요금제 안내입니다. 실제 가격과 혜택 적용 여부는 Apple StoreKit에서 확인합니다. 혜택 미적용 시 선택한 주기의 정가로 시작합니다.' : 'Displayed KRW prices describe plan policy. Apple StoreKit determines actual prices and offer eligibility. Without the offer, billing starts at the selected cycle’s regular price.'}</p>
      <p>{ko ? '선택한 월간 또는 연간 주기로 자동 갱신됩니다. Apple 구독 설정에서 해지하세요. 앱 계정 삭제는 구독 해지가 아닙니다.' : 'Renews automatically on the selected monthly or annual cycle. Cancel in Apple subscription settings; deleting the app account does not cancel billing.'}</p>
      <a href="https://usage.mvtp.cloud/#privacy">{ko ? '개인정보' : 'Privacy'}</a> · <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">{ko ? '이용약관' : 'Terms'}</a>
    </details>
  </>;
}

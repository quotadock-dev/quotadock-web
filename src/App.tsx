import { UsageBoard } from './UsageBoard';
import { translate, useLanguage } from './locale';
import { english } from './translations';
import { Pricing } from './Pricing';

const source = 'https://github.com/quotadock-dev/quotadock/tree/feat/quota-dock';
export function App() {
  const { language, control } = useLanguage();
  const t = (value: string) => translate(value, language, english);
  return <>
    <a className="skip-link" href="#main">{t('본문으로 건너뛰기')}</a>
    <div className="shell">
      <header className="masthead">
        <a className="brand" href="#"><img src="/allowmark.svg" width="32" height="32" alt="" />Allowmark</a>{control}
        <nav aria-label={t('주 메뉴')}><a href="#demo">{t('데모')}</a><a href="#plans">{t('요금제')}</a>
          <a href="#privacy">{t('데이터 안내')}</a><a href="#refresh-policy">{t('갱신 안내')}</a><a href={source}>{t('소스 ↗')}</a></nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero">
          <p className="eyebrow">{language === 'ko' ? '얼로마크 / AI 사용량의 작은 이정표' : 'ALLOWMARK / A SMALL MEASURE OF CLARITY'}</p>
          <div className="hero-copy">
          <div>
          <h1>{t('다음 작업을 위한')}<br />{t('여유를 확인하세요.')}</h1>
          </div><div className="hero-aside">
          <p className="lead">{t('흩어진 AI 사용량을, 하나의 차분한 보드로.')}</p>
          <p className="small muted">{language === 'ko' ? '소스 미리보기 · 합성 고정 데모. 가입이나 앱 제공이 아닙니다.' : 'Source preview · Synthetic, fixed demo. Not signup or app delivery.'}</p>
          <div className="actions"><a className="cta" href="#demo">{t('예시 보드 살펴보기 ↓')}</a>
            <a href={`${source}#readme`}>{t('소스 ↗')}</a></div>
          </div></div>
        </section>
        <section id="demo" aria-labelledby="demo-title">
          <div className="section-head"><div>
            <h2 id="demo-title">{t('한눈에 보는 남은 사용량')}</h2></div><span className="badge">{t('DEMO · 실제 계정 아님')}</span></div>
          <UsageBoard language={language} />
          <details><summary>{t('데이터 안내')}</summary><p className="muted">{t('아래 값은 고정된 예시입니다. 서비스에 로그인하거나 네트워크에서 사용량을 가져오지 않습니다.')}</p></details>
        </section>
        <section className="principles">
          <article><p className="eyebrow">{t('01 / EVERY WINDOW')}</p><h2>{t('창마다, 따로.')}</h2>
            <p>{t('세션과 주간, 모델 티어별 창을 한 숫자로 합치지 않습니다. 리셋 시각은 참고 정보이지 새 할당량의 약속이 아닙니다.')}</p></article>
          <article><p className="eyebrow">{t('02 / NO GUESSWORK')}</p><h2>{t('모르면, 알 수 없음.')}</h2>
            <p>{t('측정되지 않은 값은 0%가 아닙니다. 절대 메시지 수를 추정하지 않고 마지막 관측과 오래된 상태를 구분합니다.')}</p></article>
          <article><p className="eyebrow">{t('03 / YOUR BRIDGE')}</p><h2>{t('내 연결은, 내 환경에.')}</h2>
            <p>{t('실제 보드는 로컬 CodexBar와 페어링된 브리지로 연결합니다. 공개 데모는 자격 증명을 받지 않습니다.')}</p></article>
        </section>
        <section id="privacy" className="release-info" aria-labelledby="privacy-title">
          <details><summary id="privacy-title">{t('개인정보와 데이터 흐름')}</summary>
          <p>{t('실제 앱의 흐름은 로컬 CodexBar → 페어링된 수집기 → 서버 → 앱·위젯입니다. 새 사용량을 수집하려면 로컬 수집기가 실행 중이고 온라인이어야 합니다. 오프라인에서는 마지막 저장값만 볼 수 있습니다.')}</p>
          <p>{t('서버에는 사용량 외에 가명 식별자, 세션, 동의 및 결제 관련 메타데이터도 저장됩니다.')}</p>
          <p>{t('선택적 2단계 인증을 사용하면 암호화된 인증 앱 비밀값, 복구 코드 해시와 보안 기록이 서버에 저장됩니다. 고객 지원을 사용하면 문의 제목·분류·메시지와 담당자·내부 메모가 저장되며, 내부 메모는 고객에게 표시되지 않습니다. 제공자 자격 증명이나 진단 파일은 자동 전송하지 않습니다. 새 보안·지원 기능은 아직 서버에 적용하지 않은 소스입니다.')}</p>
          <p>{t('이 공개 페이지는 계정 연결, 동의 수집, 가입 또는 결제를 제공하지 않습니다. 데모는 제공자 API를 호출하지 않으며 입력할 자격 증명도 없습니다.')}</p>
          </details>
        </section>
        <section id="refresh-policy" className="release-info" aria-labelledby="refresh-title">
          <details><summary id="refresh-title">{t('갱신 시점과 저장값')}</summary>
          <p>{t('정기 갱신의 due 간격은 Free 2시간, Plus 1시간, Pro 20–120분(기본 20분)입니다. 이는 갱신 대상이 되는 간격이지 정확한 시각의 수집 보장이 아닙니다. 로컬 수집기의 온라인 상태에 따라 새 관측이 늦어질 수 있습니다.')}</p>
          <p>{t('Free의 조기 갱신은 KST(한국 표준시) 하루당 성공한 배치 10회입니다. 개별 창의 수가 아니라 성공한 조기 갱신 배치 단위로 계산합니다.')}</p>
          <p>{t('위젯은 캐시된 저장값만 표시하며 직접 제공자 사용량을 수집하지 않습니다. 위젯 업데이트 시점은 OS 스케줄링에 따르므로 앱과 표시 시각이 다를 수 있습니다. 오래된 값은 현재 사용량으로 보장하지 않으며, 알 수 없음은 0%가 아닙니다.')}</p>
          </details>
        </section>
        <section id="plans"><p className="eyebrow">PLANS</p><h2>{t('요금제')}</h2>
          <Pricing language={language} />
          <p className="small muted"><a href="#refresh-policy">{t('정기·조기 갱신 정책')}</a>{t('을 확인하세요.')}
          </p>
        </section>
        <section className="availability"><details><summary>{t('지금 알아둘 점')}</summary>
          <p>{t('Claude · Codex · Gemini · Grok의 측정 가능 여부는 CodexBar 지원, 로그인 상태, 플랜과 제공자 변경에 따라 달라집니다.')}</p>
          <p>{t('Codex는 전체 ChatGPT 사용량이 아닙니다. Free 지원은 화면·롤아웃에 따라 다르며 읽을 수 없는 값은 알 수 없음으로 표시합니다.')}</p>
          </details>
        </section>
      </main>
      <footer><strong>Allowmark</strong><p>{t('Less checking. More making.')}</p>
        <a href={source}>GitHub ↗</a>
        <p className="small muted">{t('제공자와 제휴하거나 보증받은 제품이 아닙니다.')}</p>
        <a href="/THIRD_PARTY_NOTICES.md">{t('아이콘 라이선스 및 고지')}</a></footer>
    </div>
  </>;
}

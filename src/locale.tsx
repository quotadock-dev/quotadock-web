import { useEffect, useState } from 'react';

export type Language = 'en' | 'ko';
type Preference = Language | 'system';
const key = 'quotadock.language';
const systemLanguage = (): Language => navigator.language.toLowerCase().split('-')[0] === 'ko' ? 'ko' : 'en';
const valid = (value: string | null): Preference => value === 'en' || value === 'ko' ? value : 'system';
const korean: Readonly<Record<string, string>> = { 'A LITTLE CLARITY, BEFORE YOUR NEXT PROMPT': '다음 프롬프트 전에, 조금 더 명확하게', 'DEMO / SANITIZED EXAMPLES': 'DEMO / 안전하게 정리한 예시', '01 / EVERY WINDOW': '01 / 사용량 창마다', '02 / NO GUESSWORK': '02 / 추정 없이', '03 / YOUR BRIDGE': '03 / 내 브리지', 'BEFORE SIGNUP / DATA FLOW': '가입 전 안내 / 데이터 흐름', 'REFRESH / PLANNED POLICY': '갱신 / 예정 정책', 'PLANNED, NOT ON SALE': '출시 전 목표 / 판매하지 않음', 'Less checking. More making.': '확인은 줄이고, 작업은 더 많이.', 'DEMO · STALE': 'DEMO · 오래됨 · STALE' };
export function useLanguage() {
  const [preference, setPreference] = useState<Preference>(() => { try { return valid(localStorage.getItem(key)); } catch { return 'system'; } });
  const [system, setSystem] = useState(systemLanguage);
  const language = preference === 'system' ? system : preference;
  useEffect(() => {
    const changed = () => setSystem(systemLanguage());
    const stored = (event: StorageEvent) => { if (event.key === key || event.key === null) setPreference(valid(event.newValue)); };
    window.addEventListener('languagechange', changed); window.addEventListener('storage', stored);
    return () => { window.removeEventListener('languagechange', changed); window.removeEventListener('storage', stored); };
  }, []);
  useEffect(() => { document.documentElement.lang = language; document.title = language === 'ko' ? 'QuotaDock · 다음 작업을 위한 여유' : 'QuotaDock · Room for your next task'; }, [language]);
  const control = <label className="setting">{language === 'ko' ? '언어' : 'Language'} <select aria-label={language === 'ko' ? '언어' : 'Language'} value={preference} onChange={event => {
    const next = valid(event.target.value); setPreference(next);
    try { localStorage.setItem(key, next); } catch { /* In-memory preference still works. */ }
  }}><option value="system">{language === 'ko' ? '시스템 기본값' : 'System default'}</option><option value="en">English</option><option value="ko">한국어</option></select></label>;
  return { language, control };
}

// Only explicitly selected UI labels are translated; upstream data stays raw.
export function translate(value: string, language: Language, dictionary: Readonly<Record<string, string>>): string {
  return language === 'ko' ? korean[value] ?? value : dictionary[value] ?? value;
}

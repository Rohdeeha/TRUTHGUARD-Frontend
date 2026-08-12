import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import App from './App';
import './index.css';
import { LanguageProvider } from './pages/LanguageContext';

// Configure i18n directly inside main.tsx
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          nav: {
            tagline: 'Osun 2026 Fact Check',
            debunks: 'Live Fact-Checks',
            report: 'Report Incident',
            situationRoom: 'Situation Room',
            lockRoom: 'Lock Situation Room',
            footer: '© 2026 TruthGuard Initiative · FactCheck Africa / BallotEyes Working Group'
          },
          home: {
            heroTitle: 'Live Election Fact-Checks',
            heroSubtitle: 'Real-time verified claims, debunked rumors, and official statements for Osun 2026.',
            searchPlaceholder: 'Search verified claims, candidates, or rumors...',
            filterAll: 'All Debunks',
            filterElectionDay: 'Election Day',
            filterCandidates: 'Candidates',
            filterINEC: 'INEC / Voting',
            filterSecurity: 'Security',
            readFull: 'Read Full Analysis',
            shareReport: 'Share Fact-Check',
            statusFalse: 'FALSE',
            statusMisleading: 'MISLEADING',
            statusVerified: 'VERIFIED TRUE',
            syncing: 'Syncing live database...',
            claimLabel: 'Claim: ',
            noReports: 'No verified reports match your current search or filter.',
            loadMore: 'Load More Reports'
          },
          dashboard: {
            controlPanel: {
              title: 'Control Panel',
              subtitle: 'Manage and verify incoming incident reports'
            }
          },
          time: {
            justNow: 'Just now',
            minsAgo: 'mins ago',
            hoursAgo: 'hours ago',
            daysAgo: 'days ago',
            recently: 'Recently'
          }
        }
      },
      yo: {
        translation: {
          nav: {
            tagline: 'Osun 2026 Fact Check',
            debunks: 'Àwọn Fact-Check',
            report: 'Sọ̀jásí Ìṣẹ̀lẹ̀',
            situationRoom: 'Agbègbè Situation Room',
            lockRoom: 'Tì Agbègbè Situation Room',
            footer: '© 2026 Ẹgbẹ́ TruthGuard · Ìgbìmọ̀ FactCheck Africa / BallotEyes'
          },
          home: {
            heroTitle: 'Àwọn Fact-Check Ìbo Tí Ọ́ Ń Lọ',
            heroSubtitle: 'Àwọn ìròyìn tí a ti fìdí rẹ̀ múlẹ̀ fún ìbo Osun 2026.',
            searchPlaceholder: 'Ṣàwárí àwọn ìròyìn, àwọn olùdíje, tàbí ìró...',
            filterAll: 'Gbogbo Fact-Check',
            filterElectionDay: 'Ọjọ́ Ìbo',
            filterCandidates: 'Àwọn Olùdíje',
            filterINEC: 'INEC / Ìbo',
            filterSecurity: 'Ààbò',
            readFull: 'Kà Á Kíkún',
            shareReport: 'Pín Fact-Check Yìí',
            statusFalse: 'EKE NI',
            statusMisleading: 'Ó Ń SI NI LỌ̀NA',
            statusVerified: 'LÓÒTỌ́ NI',
            syncing: 'A ń fa àwọn ìròyìn wá...',
            claimLabel: 'Ohun tí wọ́n sọ: ',
            noReports: 'Kò sí ìròyìn kankan tó bá ohun tí ẹ ń wá mu.',
            loadMore: 'Wo Àwọn Ìròyìn Míì'
          },
          dashboard: {
            controlPanel: {
              title: 'Fífún ní Àṣẹ',
              subtitle: 'Ṣàkóso àti fìdí àwọn ìròyìn tí ó wọlé múlẹ̀'
            }
          },
          time: {
            justNow: 'Nísinsìnyí',
            minsAgo: 'ìṣẹ́jú sẹ́yìn',
            hoursAgo: 'wákàtí sẹ́yìn',
            daysAgo: 'ọjọ́ sẹ́yìn',
            recently: 'Lẹ́nu àìpẹ́ yìí'
          }
        }
      },
      pcm: {
        translation: {
          nav: {
            tagline: 'Osun 2026 Fact Check',
            debunks: 'Check Am',
            report: 'Report Mata',
            situationRoom: 'Situation Room',
            lockRoom: 'Lock Situation Room',
            footer: '© 2026 TruthGuard Initiative · FactCheck Africa / BallotEyes Working Group'
          },
          home: {
            heroTitle: 'Live Election Fact-Checks',
            heroSubtitle: 'Real-time news check, fake story debunk, and official info for Osun 2026.',
            searchPlaceholder: 'Search news, candidate name, or fake story...',
            filterAll: 'All Check-Am',
            filterElectionDay: 'Voting Day',
            filterCandidates: 'Candidates',
            filterINEC: 'INEC / Voting',
            filterSecurity: 'Security Mata',
            readFull: 'Read Full Story',
            shareReport: 'Share This Check',
            statusFalse: 'TOTAL LIE',
            statusMisleading: 'WAYO STORY',
            statusVerified: 'CONFIRM TRUE',
            syncing: 'We dey arrange the news...',
            claimLabel: 'Wetin dem talk: ',
            noReports: 'We no see any news for wetin you dey find.',
            loadMore: 'Load More News'
          },
          dashboard: {
            controlPanel: {
              title: 'Control Panel',
              subtitle: 'Manage and check all the reports wey enter'
            }
          },
          time: {
            justNow: 'Just now',
            minsAgo: 'mins ago',
            hoursAgo: 'hours ago',
            daysAgo: 'days ago',
            recently: 'Recently'
          }
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
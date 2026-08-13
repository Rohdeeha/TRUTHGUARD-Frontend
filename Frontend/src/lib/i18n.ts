import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            nav: {
                tagline: 'Osun 2026 Fact Check',
                debunks: 'Live Fact-Checks',
                report: 'Report Incident',
                situationRoom: 'Situation Room'
            },
            home: {
                heroTitle: 'Live Election Fact-Checks',
                heroSubtitle: 'Real-time verified claims, debunked rumors, and official statements for Osun 2026.',
                searchPlaceholder: 'Search verified claims, candidates, or rumors...',
                filterAll: 'All Debunks',
                filterElectionDay: 'Election Day',
                filterCandidates: 'Candidates',
                filterINEC: 'INEC / Voting Info',
                filterSecurity: 'Security',
                readFull: 'Read Full Analysis',
                shareReport: 'Share Fact-Check',
                statusFalse: 'FALSE',
                statusMisleading: 'MISLEADING',
                statusVerified: 'VERIFIED TRUE'
            },
            report: {
                title: 'Report Fake News or Incident Wey Happen',
                subtitle: 'Help keep Osun 2026 clean from fake news. Send suspicious news, fake results, or voting trouble straight to our Situation Room.',
                incidentType: 'Incident Type',
                types: {
                    fakeNews: 'Fake News / Unverified Claim',
                    suppression: 'Voter Suppression / Intimidation',
                    falseResults: 'False Election Results',
                    technical: 'Technical / BVAS Issue',
                    other: 'Other'
                },
                description: 'Description',
                placeholder: 'Describe the suspicious claim, location, or video link in detail...',
                uploadLabel: 'Upload Media Evidence (Optional)',
                uploadHint: 'Click to attach screenshot, audio, or video evidence',
                anonymous: 'Keep my report anonymous',
                submit: 'Submit Incident Report',
                successTitle: 'Report Received!',
                successMessage: 'Thank you for helping keep the Osun 2026 elections transparent. Our verification team is reviewing your submission.',
                submitAnother: 'Submit Another Report'
            },
            dashboard: {
                controlPanel: 'Situation Room Dashboard'
            }
        }
    },
    yo: {
        translation: {
            nav: {
                tagline: 'Osun 2026 Fact Check',
                debunks: 'Àwọn Fact-Check',
                report: 'Sọ̀jásí Ìṣẹ̀lẹ̀',
                situationRoom: 'Agbègbè Situation Room'
            },
            home: {
                heroTitle: 'Àwọn Fact-Check Ìbo Tí Ọ́ Ń Lọ',
                heroSubtitle: 'Àwọn ìròyìn tí a ti fìdí rẹ̀ múlẹ̀ fún ìbo Osun 2026.',
                searchPlaceholder: 'Ṣàwárí àwọn ìròyìn, àwọn olùdíje, tàbí ìró...',
                filterAll: 'Gbogbo Fact-Check',
                filterVoterSuppression: 'Dídènà Oǹdībò',
                filterDisinformation: 'Ìroyìn Eke / Ìroyìn Ẹ̀tàn',
                filterTFGBV: 'Ibi Lórí Íńtánẹ́ẹ̀tì Sí Ẹ̀yà (TFGBV)',
                filterLogistics: 'Àìṣedeede Ètò Ìmúrasílẹ̀',
                filterViolence: 'Ìwà Ìpánilára / Ìbànẹ́rù',
                filterINEC: 'INEC / Ọ̀rọ̀ Ìdībò',
                readFull: 'Kà Á Kíkún',
                shareReport: 'Pín Fact-Check Yìí',
                statusFalse: 'EKE NI',
                statusMisleading: 'Ó Ń SI NI LỌ̀NA',
                statusVerified: 'LÓÒTỌ́ NI'
            },
            report: {
                title: 'Sọ̀jásí Ìṣẹ̀lẹ̀ Tàbí Ìròyìn Eke',
                subtitle: 'Ràn wá lọ́wọ́ láti pa ìbo Osun 2026 mọ́ kúrò nínú ìròyìn eke.',
                incidentType: 'Irúfẹ́ Ìṣẹ̀lẹ̀',
                types: {
                    fakeNews: 'Ìròyìn Eke / Ìròyìn Láìsí Ẹ̀rí',
                    suppression: 'Dídènà Oǹdībò / Ìbànẹ́rù',
                    falseResults: 'Àbájáde Ìbo Eke',
                    technical: 'Àìṣedeede Ẹ̀rọ BVAS / Network',
                    other: 'Òmíràn'
                },
                description: 'Àlàyé Ìṣẹ̀lẹ̀',
                placeholder: 'Kọ àwọn àlàyé nípa ìròyìn eke tàbí ibi tí ó ti ṣẹ́lẹ̀...',
                uploadLabel: 'Fi Ẹ̀rí Awòrán/Fídíò Mọ́ Ọ́n (Aṣàyàn)',
                uploadHint: 'Tẹ̀ ẹ́ láti fi àwòrán tabi fídíò rẹ ránṣẹ́',
                anonymous: 'Fipamọ́ orukọ mi',
                submit: 'Fi Ìròyìn Ránṣẹ́',
                successTitle: 'A ti gba ìròyìn rẹ!',
                successMessage: 'Ẹ ṣeun fún ìrànlọ́wọ́ rẹ láti jẹ́ kí ìdībò Osun 2026 jẹ́ mọ́gaara.',
                submitAnother: 'Sọ Ìròyìn Mìíràn'
            },
            dashboard: {
                controlPanel: 'Agbègbè Dashboard Situation Room'
            }
        }
    },
    pcm: {
        translation: {
            nav: {
                tagline: 'Osun 2026 Fact Check',
                debunks: 'Check Am',
                report: 'Report Mata',
                situationRoom: 'Situation Room'
            },
            home: {
                heroTitle: 'Live Election Fact-Checks',
                heroSubtitle: 'Real-time news check, fake story debunk, and official info for Osun 2026.',
                searchPlaceholder: 'Search news, candidate name, or fake story...',
                filterAll: 'All Check-Am',
                filterElectionDay: 'Voting Day',
                filterCandidates: 'Candidates',
                filterINEC: 'INEC / Voting Mata',
                filterSecurity: 'Security Mata',
                readFull: 'Read Full Story',
                shareReport: 'Share This Check',
                statusFalse: 'TOTAL LIE',
                statusMisleading: 'WAYO STORY',
                statusVerified: 'CONFIRM TRUE'
            },
            report: {
                title: 'Report Fake News or Incident Wey Happen',
                subtitle: 'Help keep Osun 2026 clean from fake news. Send suspicious news, fake results, or voting trouble straight to our Situation Room.',
                incidentType: 'Kind Incident',
                types: {
                    fakeNews: 'Fake News / Lie Story',
                    suppression: 'Wuruwuru / People Wey Dey Scare Voters',
                    falseResults: 'Fake Election Result',
                    technical: 'BVAS Machine Issue / Network Problem',
                    other: 'Another Mata'
                },
                description: 'Gbe Mata Come',
                placeholder: 'Write all details about fake news or voting trouble wey happen...',
                uploadLabel: 'Upload Picture or Video Evidence (Optional)',
                uploadHint: 'Click here to put screenshot, voice note, or video evidence',
                anonymous: 'Hide my name',
                submit: 'Send Am Go',
                successTitle: 'We Don Get Your Report!',
                successMessage: 'Thank you as you dey help make Osun 2026 election clean. Our people dey check am now.',
                submitAnother: 'Report Another Mata'
            },
            dashboard: {
                controlPanel: 'Situation Room Dashboard'
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
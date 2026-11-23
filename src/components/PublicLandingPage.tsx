import { Lock, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  PUBLIC_LANG_STORAGE_KEY,
  PUBLIC_TRANSLATIONS,
  PublicLanguage,
  WHATSAPP_URL,
} from '../i18n/publicTranslations.ts';
import { AboutSection } from './AboutSection.tsx';
import { ContactSection } from './ContactSection.tsx';
import { HappyClientsCarousel } from './HappyClientsCarousel.tsx';
import { HeroSection } from './HeroSection.tsx';
import { LanguageSelectorModal } from './LanguageSelectorModal.tsx';
import { Navbar } from './Navbar.tsx';

interface PublicLandingPageProps {
  onOpenLogin: () => void;
  isOwnerAuthenticated: boolean;
  onEnterDashboard: () => void;
}

function readStoredLanguage(): PublicLanguage | null {
  try {
    const val = localStorage.getItem(PUBLIC_LANG_STORAGE_KEY);
    if (val === 'en' || val === 'te' || val === 'hi') {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

export function PublicLandingPage({
  onOpenLogin,
  isOwnerAuthenticated,
  onEnterDashboard,
}: PublicLandingPageProps) {
  const [language, setLanguage] = useState<PublicLanguage>(
    () => readStoredLanguage() || 'en'
  );
  const [promptOpen, setPromptOpen] = useState<boolean>(
    () => readStoredLanguage() === null
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleSelectLanguage = (nextLang: PublicLanguage) => {
    setLanguage(nextLang);
    setPromptOpen(false);
    try {
      localStorage.setItem(PUBLIC_LANG_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage failures in restricted iframes
    }
  };

  const t = PUBLIC_TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-900">
      <Navbar language={language} onChangeLanguage={handleSelectLanguage} />

      <main>
        <HeroSection language={language} />
        <AboutSection language={language} />
        <HappyClientsCarousel language={language} />
        <ContactSection language={language} />
      </main>

      <footer className="border-t border-slate-200 bg-[#FAFBF9] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-sm font-semibold text-slate-900">
              {t.brandName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {t.footer.addressSummary} ·{' '}
              <span className="font-mono-tabular">+91 9392457024</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <a href="#about" className="hover:text-slate-900 transition-colors">
              {t.nav.about}
            </a>
            <a href="#clients" className="hover:text-slate-900 transition-colors">
              {t.nav.clients}
            </a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">
              {t.nav.contact}
            </a>
            <span>
              © {new Date().getFullYear()} {t.footer.rights}
            </span>
            <button
              type="button"
              onClick={isOwnerAuthenticated ? onEnterDashboard : onOpenLogin}
              title="Owner Portal"
              aria-label="Owner Portal"
              className="inline-flex items-center gap-1 text-[10px] text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
            >
              <Lock className="h-2.5 w-2.5" />
              <span>
                {isOwnerAuthenticated ? t.footer.portal : t.footer.admin}
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Direct Chat Action */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.whatsapp.cta}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-lg bg-[#15803d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>{t.whatsapp.floatingLabel}</span>
      </a>

      <LanguageSelectorModal
        isOpen={promptOpen}
        onSelectLanguage={handleSelectLanguage}
      />
    </div>
  );
}

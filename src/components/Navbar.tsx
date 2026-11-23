import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import {
  LANGUAGE_OPTIONS,
  PUBLIC_TRANSLATIONS,
  PublicLanguage,
} from '../i18n/publicTranslations.ts';

interface NavbarProps {
  language: PublicLanguage;
  onChangeLanguage: (lang: PublicLanguage) => void;
}

export function Navbar({ language, onChangeLanguage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = PUBLIC_TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#FAFBF9]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:gap-8">
        {/* Zone 1: Wordmark */}
        <a
          href="#top"
          className="font-display text-base font-bold tracking-tight text-slate-900 sm:text-lg whitespace-nowrap shrink-0"
        >
          {t.brandName}
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#about"
            className="hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.about}
          </a>
          <a
            href="#clients"
            className="hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.clients}
          </a>
          <a
            href="#contact"
            className="hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.contact}
          </a>
        </nav>

        {/* Zone 3: Language Switcher + Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700">
            <Globe className="h-4 w-4 shrink-0 text-emerald-800" />
            <select
              aria-label={t.nav.languageLabel}
              value={language}
              onChange={(e) =>
                onChangeLanguage(e.target.value as PublicLanguage)
              }
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          <a
            href="#contact"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 whitespace-nowrap shrink-0"
          >
            {t.nav.requestQuote}
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={t.nav.toggleMenu}
            className="inline-flex lg:hidden items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <a
              href="#about"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-900"
            >
              {t.nav.about}
            </a>
            <a
              href="#clients"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-900"
            >
              {t.nav.clients}
            </a>
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-900"
            >
              {t.nav.contact}
            </a>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Globe className="h-4 w-4 text-emerald-800" />
                {t.nav.languageLabel}
              </span>
              <div className="flex items-center gap-1.5">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      onChangeLanguage(opt.code);
                      setMobileOpen(false);
                    }}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      language === opt.code
                        ? 'border-emerald-900 bg-emerald-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
            >
              {t.nav.requestQuote}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

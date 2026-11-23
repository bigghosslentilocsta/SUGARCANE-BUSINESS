import { Globe } from 'lucide-react';
import {
  LANGUAGE_OPTIONS,
  PUBLIC_TRANSLATIONS,
  PublicLanguage,
} from '../i18n/publicTranslations.ts';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onSelectLanguage: (lang: PublicLanguage) => void;
}

export function LanguageSelectorModal({
  isOpen,
  onSelectLanguage,
}: LanguageSelectorModalProps) {
  if (!isOpen) return null;

  const t = PUBLIC_TRANSLATIONS.en.languageModal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-select-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-white">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-800">{t.eyebrow}</p>
            <h2
              id="language-select-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              {t.title}
            </h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {t.description}
        </p>

        <div className="mt-6 space-y-3">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => onSelectLanguage(opt.code)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors cursor-pointer ${
                opt.code === 'en'
                  ? 'border-emerald-800 bg-emerald-50/70 hover:bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-emerald-700 hover:bg-[#FAFBF9]'
              }`}
            >
              <div>
                <p className="font-display text-base font-semibold text-slate-900">
                  {opt.nativeLabel}
                </p>
                <p className="text-xs text-slate-500">{opt.subtitle}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-800">
                {opt.englishLabel}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <button
            type="button"
            onClick={() => onSelectLanguage('en')}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
          >
            {t.continueDefault}
          </button>
        </div>
      </div>
    </div>
  );
}

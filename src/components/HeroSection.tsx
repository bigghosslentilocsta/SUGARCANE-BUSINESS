import { ArrowRight, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import {
  PUBLIC_TRANSLATIONS,
  PublicLanguage,
  WHATSAPP_URL,
} from '../i18n/publicTranslations.ts';

const HERO_IMAGE = '/assets/aistudio/image_5fcf53d7.png';

interface HeroSectionProps {
  language: PublicLanguage;
}

export function HeroSection({ language }: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);
  const t = PUBLIC_TRANSLATIONS[language];

  return (
    <section id="top" className="border-b border-slate-200 bg-[#FAFBF9]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between lg:col-span-6 lg:py-2">
            <div>
              <p className="text-sm font-medium text-emerald-800">
                {t.hero.eyebrow}
              </p>
              <h1
                className="font-display mt-3 font-bold tracking-tight text-slate-900"
                style={{
                  fontSize: 'clamp(2.05rem, 3.8vw, 3.5rem)',
                  lineHeight: 1.12,
                  textWrap: 'balance',
                }}
              >
                {t.hero.headline}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                {t.hero.description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 whitespace-nowrap shrink-0"
              >
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-[#15803d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.whatsapp.cta}</span>
              </a>
              <a
                href="#clients"
                className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-emerald-900 hover:decoration-emerald-900 transition-colors whitespace-nowrap shrink-0"
              >
                {t.hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-4/3 lg:aspect-auto lg:h-full min-h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-emerald-950">
              {!imgError ? (
                <img
                  src={HERO_IMAGE}
                  alt={t.hero.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-900 to-emerald-950 p-8 text-center text-white">
                  <p className="font-display text-xl font-semibold">
                    {t.brandName}
                  </p>
                  <p className="mt-1 text-sm text-emerald-200">
                    {t.hero.imageFallbackSub}
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Full-width 4-column operational metrics row */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-200 pt-8 md:grid-cols-4">
          {t.hero.metrics.map((metric) => (
            <div key={metric.value}>
              <p className="font-mono-tabular text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

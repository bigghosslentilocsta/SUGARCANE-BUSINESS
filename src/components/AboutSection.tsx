import { useState } from 'react';
import {
  PUBLIC_TRANSLATIONS,
  PublicLanguage,
} from '../i18n/publicTranslations.ts';

const ABOUT_IMAGE = '/assets/aistudio/image_6b0fe2f5.png';

interface AboutSectionProps {
  language: PublicLanguage;
}

export function AboutSection({ language }: AboutSectionProps) {
  const [imgError, setImgError] = useState(false);
  const t = PUBLIC_TRANSLATIONS[language];

  return (
    <section id="about" className="border-b border-slate-200 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-5">
            <div className="aspect-3/4 lg:aspect-auto lg:h-full min-h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {!imgError ? (
                <img
                  src={ABOUT_IMAGE}
                  alt={t.about.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-950 p-6 text-center text-white">
                  <span className="font-display text-lg font-medium">
                    {t.about.imageFallback}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-sm font-medium text-emerald-800">
              {t.about.eyebrow}
            </p>
            <h2
              className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              {t.about.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              {t.about.description}
            </p>

            <div className="mt-8 divide-y divide-slate-200 border-t border-b border-slate-200">
              {t.about.capabilities.map((cap) => (
                <div key={cap.index} className="py-5">
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    <span className="font-mono-tabular mr-2.5 text-emerald-800">
                      {cap.index}
                    </span>
                    {cap.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {cap.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

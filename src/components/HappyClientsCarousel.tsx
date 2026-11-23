import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.ts';
import {
  formatLocalizedDate,
  PUBLIC_TRANSLATIONS,
  PublicLanguage,
} from '../i18n/publicTranslations.ts';
import { CarouselImageItem } from '../types/index.ts';

const FALLBACK_SLIDES: CarouselImageItem[] = [
  {
    _id: 'fallback_1',
    url: '/assets/aistudio/image_5fcf53d7.png',
    publicId: 'seed:depot_shed',
    caption: 'Covered Depot Stock — Clean Bundled Sugarcane Ready for Dispatch',
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback_2',
    url: '/assets/aistudio/image_6b0fe2f5.png',
    publicId: 'seed:field_check',
    caption: 'Direct Field Inspection — Checking Stalk Height & Sweetness Before Harvest',
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback_3',
    url: '/assets/aistudio/image_535ce9fa.png',
    publicId: 'seed:warehouse_stack',
    caption: 'Bulk Warehouse Stack — Year-Round 12-Month Supply Reserve',
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback_4',
    url: '/assets/aistudio/image_c0dbed69.png',
    publicId: 'seed:fresh_stalks',
    caption: 'Freshly Cut Golden-Green Cane Selected from Maharashtra & Karnataka Farms',
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback_5',
    url: '/assets/aistudio/image_0c3698c9.png',
    publicId: 'seed:local_delivery',
    caption: 'Trimmed High-Sweetness Cane Loaded for Customer Unit Delivery',
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback_6',
    url: '/assets/aistudio/image_ae3db5ef.png',
    publicId: 'seed:market_yard',
    caption: 'Wholesale Market Yard Supply — Supporting 50+ Active & 100+ Seasonal Units',
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

interface HappyClientsCarouselProps {
  language: PublicLanguage;
}

export function HappyClientsCarousel({ language }: HappyClientsCarouselProps) {
  const [slides, setSlides] = useState<CarouselImageItem[]>(FALLBACK_SLIDES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const t = PUBLIC_TRANSLATIONS[language];

  useEffect(() => {
    let mounted = true;
    api
      .get<CarouselImageItem[]>('/carousel')
      .then((res) => {
        if (mounted && Array.isArray(res.data) && res.data.length > 0) {
          setSlides(res.data);
          setActiveIndex(0);
        }
      })
      .catch(() => {
        // Retain fallback slides if API is unreachable
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const total = slides.length;
  const safeIndex = total > 0 ? activeIndex % total : 0;
  const current = slides[safeIndex];

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 1000);
    return () => clearInterval(timer);
  }, [total, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const getSlideCaption = (slide: CarouselImageItem): string => {
    if (language === 'te') {
      return (
        slide.captionTe?.trim() ||
        t.clients.slideCaptionsByUrl[slide.url] ||
        slide.caption ||
        t.clients.fallbackCaption
      );
    }
    if (language === 'hi') {
      return (
        slide.captionHi?.trim() ||
        t.clients.slideCaptionsByUrl[slide.url] ||
        slide.caption ||
        t.clients.fallbackCaption
      );
    }
    return (
      slide.caption ||
      t.clients.slideCaptionsByUrl[slide.url] ||
      t.clients.fallbackCaption
    );
  };

  return (
    <section id="clients" className="border-b border-slate-200 bg-[#FAFBF9] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-800">
              {t.clients.eyebrow}
            </p>
            <h2
              className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              {t.clients.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono-tabular text-sm text-slate-500">
              {String(safeIndex + 1).padStart(2, '0')} /{' '}
              {String(total).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label={t.clients.prevAria}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label={t.clients.nextAria}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-[#0B1410]">
          <div className="relative aspect-16/9 max-h-[540px] w-full overflow-hidden">
            {loading && slides.length === 0 ? (
              <div className="h-full w-full animate-pulse bg-slate-200" />
            ) : current && !brokenIds[current._id] ? (
              <>
                <img
                  src={current.url}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
                />
                <img
                  key={current._id}
                  src={current.url}
                  alt={getSlideCaption(current)}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenIds((prev) => ({ ...prev, [current._id]: true }))
                  }
                  className="relative z-10 h-full w-full object-contain transition-opacity duration-200"
                />
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-900 to-slate-900 p-8 text-center text-white">
                <ImageIcon className="h-10 w-10 text-emerald-300" />
                <p className="font-display mt-3 text-lg font-medium">
                  {current ? getSlideCaption(current) : t.clients.fallbackTitle}
                </p>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            {current && (
              <div className="absolute inset-x-0 bottom-0 z-30 p-6 sm:p-8">
                <p className="font-display text-lg font-semibold text-white sm:text-xl">
                  {getSlideCaption(current)}
                </p>
                <p className="mt-1 text-xs text-slate-200">
                  {t.clients.uploadedPrefix}{' '}
                  {formatLocalizedDate(current.uploadedAt, language)}
                </p>
              </div>
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-10">
            {slides.map((slide, idx) => {
              const isActive = idx === safeIndex;
              const captionText = getSlideCaption(slide);
              return (
                <button
                  key={slide._id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`${idx + 1}: ${captionText}`}
                  className={`group relative aspect-16/9 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'border-emerald-800 ring-2 ring-emerald-800/30'
                      : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  {!brokenIds[slide._id] ? (
                    <img
                      src={slide.url}
                      alt={captionText}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenIds((prev) => ({ ...prev, [slide._id]: true }))
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api } from '../api/client.ts';
import {
  PUBLIC_TRANSLATIONS,
  PublicLanguage,
  WHATSAPP_URL,
} from '../i18n/publicTranslations.ts';

interface ContactSectionProps {
  language: PublicLanguage;
}

export function ContactSection({ language }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const t = PUBLIC_TRANSLATIONS[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError(t.contact.validationError);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        name,
        phone,
        company,
        message,
      });

      setSuccessMessage(t.contact.successMessage);
      setName('');
      setPhone('');
      setCompany('');
      setMessage('');
    } catch {
      setError(t.contact.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-emerald-800">
              {t.contact.eyebrow}
            </p>
            <h2
              className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              {t.contact.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {t.contact.description}
            </p>

            <div className="mt-8 space-y-6 border-t border-slate-200 pt-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#FAFBF9] text-emerald-900">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.contact.addressTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t.contact.addressLine1}
                    <br />
                    {t.contact.addressLine2}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#FAFBF9] text-emerald-900">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.contact.mobileTitle}
                  </p>
                  <a
                    href="tel:+919392457024"
                    className="font-mono-tabular mt-1 inline-block text-sm text-slate-700 hover:text-emerald-900 transition-colors"
                  >
                    +91 9392457024
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#FAFBF9] text-emerald-900">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.contact.hoursTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t.contact.hoursLine1}
                    <br />
                    {t.contact.hoursLine2}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#15803d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t.whatsapp.cta}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-slate-200 bg-[#FAFBF9] p-6 sm:p-8"
            >
              <h3 className="font-display text-xl font-semibold text-slate-900">
                {t.contact.formTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {t.contact.formSubtitle}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-slate-700"
                  >
                    {t.contact.nameLabel}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-slate-700"
                  >
                    {t.contact.phoneLabel}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.contact.phonePlaceholder}
                    className="font-mono-tabular mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-company"
                  className="block text-sm font-medium text-slate-700"
                >
                  {t.contact.companyLabel}
                </label>
                <input
                  id="contact-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t.contact.companyPlaceholder}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-slate-700"
                >
                  {t.contact.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contact.messagePlaceholder}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>

              {error && (
                <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
              )}

              {successMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {submitting
                    ? t.contact.submittingButton
                    : t.contact.submitButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

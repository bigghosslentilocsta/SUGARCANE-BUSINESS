import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Image as ImageIcon,
  Languages,
  Mic,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { api } from '../../api/client.ts';
import { CarouselImageItem, DashboardMetrics } from '../../types/index.ts';
import { formatDateShort, formatINR } from '../../utils/format.ts';

interface DashboardOverviewProps {
  onNavigatePayments: () => void;
}

export function DashboardOverview({
  onNavigatePayments,
}: DashboardOverviewProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [images, setImages] = useState<CarouselImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groqConfigured, setGroqConfigured] = useState<boolean | null>(null);

  // Carousel uploader state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [captionTe, setCaptionTe] = useState('');
  const [captionHi, setCaptionHi] = useState('');
  const [showManualTranslations, setShowManualTranslations] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const [uploadWarning, setUploadWarning] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});

  // Whisper audio transcription state
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit / Translate modal state for existing carousel images
  const [editingImage, setEditingImage] = useState<CarouselImageItem | null>(
    null
  );
  const [editCaptionEn, setEditCaptionEn] = useState('');
  const [editCaptionTe, setEditCaptionTe] = useState('');
  const [editCaptionHi, setEditCaptionHi] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [translatingEdit, setTranslatingEdit] = useState(false);
  const [editFeedback, setEditFeedback] = useState('');
  const [editError, setEditError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [metricsRes, carouselRes, capabilitiesRes] = await Promise.all([
        api.get<DashboardMetrics>('/dashboard/metrics'),
        api.get<CarouselImageItem[]>('/carousel'),
        api
          .get<{ groqConfigured: boolean }>('/carousel/capabilities')
          .catch(() => ({ data: { groqConfigured: false } })),
      ]);
      setMetrics(metricsRes.data);
      setImages(carouselRes.data);
      setGroqConfigured(capabilitiesRes.data.groqConfigured);
    } catch {
      setError('Unable to load dashboard metrics. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError('');
    setUploadNotice('');
    setUploadWarning('');
  };

  const sendAudioForWhisper = async (audioBlob: Blob, filename: string) => {
    setTranscribingAudio(true);
    setUploadError('');
    setUploadNotice('');
    setUploadWarning('');
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);

      const res = await api.post<{
        text: string;
        captionTe: string;
        captionHi: string;
        translated: boolean;
        note?: string;
        groqConfigured?: boolean;
      }>('/carousel/transcribe-caption', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (typeof res.data.groqConfigured === 'boolean') {
        setGroqConfigured(res.data.groqConfigured);
      }

      if (res.data.text) {
        setCaption(res.data.text);
      }
      if (res.data.captionTe) {
        setCaptionTe(res.data.captionTe);
      }
      if (res.data.captionHi) {
        setCaptionHi(res.data.captionHi);
      }
      if (res.data.captionTe || res.data.captionHi) {
        setShowManualTranslations(true);
      }

      if (res.data.translated) {
        setUploadNotice(
          'Audio transcribed with Whisper (whisper-large-v3) and translated to Telugu & Hindi.'
        );
      } else if (res.data.note) {
        setUploadWarning(res.data.note);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to transcribe audio caption.';
      setUploadError(msg);
    } finally {
      setTranscribingAudio(false);
    }
  };

  const handleAudioFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendAudioForWhisper(file, file.name);
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = '';
    }
  };

  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      audioFileInputRef.current?.click();
      return;
    }

    setUploadError('');
    setUploadWarning('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const mimeType = recorder.mimeType || 'audio/webm';
        const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          void sendAudioForWhisper(blob, `voice-caption.${ext}`);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setUploadError(
        'Microphone access unavailable. Use "Upload Audio" (.m4a/.mp3/.wav) to transcribe via Whisper.'
      );
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Select an image file before uploading.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadNotice('');
    setUploadWarning('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append(
        'caption',
        caption.trim() || 'Happy Client & Sugarcane Supply Dispatch'
      );
      if (captionTe.trim()) {
        formData.append('captionTe', captionTe.trim());
      }
      if (captionHi.trim()) {
        formData.append('captionHi', captionHi.trim());
      }

      const res = await api.post<{
        images: CarouselImageItem[];
        rotatedOutCount: number;
        translated?: boolean;
        translationNote?: string;
        groqConfigured?: boolean;
      }>('/carousel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (typeof res.data.groqConfigured === 'boolean') {
        setGroqConfigured(res.data.groqConfigured);
      }

      setImages(res.data.images);
      setSelectedFile(null);
      setCaption('');
      setCaptionTe('');
      setCaptionHi('');
      setShowManualTranslations(false);

      const fileInput = document.getElementById(
        'carousel-file-input'
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';

      const rotationText =
        res.data.rotatedOutCount > 0
          ? `Oldest ${res.data.rotatedOutCount} photo rotated out (10-slot limit).`
          : '';

      if (res.data.translated) {
        setUploadNotice(
          `Photo uploaded with English, Telugu & Hindi captions published. ${rotationText}`.trim()
        );
      } else {
        setUploadNotice(
          `Photo uploaded to Happy Clients carousel. ${rotationText}`.trim()
        );
        if (res.data.translationNote) {
          setUploadWarning(res.data.translationNote);
        }
      }

      // Refresh metrics count
      api
        .get<DashboardMetrics>('/dashboard/metrics')
        .then((m) => setMetrics(m.data))
        .catch(() => {});
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to upload image.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    setUploadNotice('');
    setUploadWarning('');
    setUploadError('');
    try {
      const res = await api.delete<{ images: CarouselImageItem[] }>(
        `/carousel/${id}`
      );
      setImages(res.data.images);
    } catch {
      setUploadError('Failed to remove image.');
    }
  };

  const openEditModal = (img: CarouselImageItem) => {
    setEditingImage(img);
    setEditCaptionEn(img.caption || '');
    setEditCaptionTe(img.captionTe || '');
    setEditCaptionHi(img.captionHi || '');
    setEditFeedback('');
    setEditError('');
  };

  const handleSaveEdit = async (autoTranslate: boolean) => {
    if (!editingImage) return;
    if (autoTranslate) {
      setTranslatingEdit(true);
    } else {
      setSavingEdit(true);
    }
    setEditError('');
    setEditFeedback('');

    try {
      const res = await api.patch<{
        updated: CarouselImageItem;
        images: CarouselImageItem[];
        translated?: boolean;
        translationNote?: string;
        groqConfigured?: boolean;
      }>(`/carousel/${editingImage._id}`, {
        caption: editCaptionEn.trim(),
        captionTe: editCaptionTe.trim(),
        captionHi: editCaptionHi.trim(),
        autoTranslate,
      });

      if (typeof res.data.groqConfigured === 'boolean') {
        setGroqConfigured(res.data.groqConfigured);
      }

      setImages(res.data.images);
      if (res.data.updated) {
        setEditingImage(res.data.updated);
        setEditCaptionEn(res.data.updated.caption || '');
        setEditCaptionTe(res.data.updated.captionTe || '');
        setEditCaptionHi(res.data.updated.captionHi || '');
      }

      if (autoTranslate) {
        if (res.data.translated) {
          setEditFeedback(
            'Translated English caption into Telugu and Hindi via Groq.'
          );
        } else {
          setEditError(
            res.data.translationNote ||
              'Automatic translation unavailable. Please enter Telugu/Hindi manually or configure GROQ_API_KEY.'
          );
        }
      } else {
        setEditFeedback('Captions saved and published.');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update image captions.';
      setEditError(msg);
    } finally {
      setSavingEdit(false);
      setTranslatingEdit(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Financial Metric Cards */}
      <section aria-label="Financial overview">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Financial Summary
          </h2>
          {metrics && (
            <p className="text-xs text-slate-500">
              {metrics.totalClients} Active Clients ·{' '}
              <span className="font-mono-tabular">
                {metrics.totalTonnage} Tons
              </span>{' '}
              Total Supplied
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
              />
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">
                Today&apos;s Revenue
              </p>
              <p className="font-mono-tabular mt-2 text-2xl font-semibold text-slate-900">
                {formatINR(metrics.todaysRevenue)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Recorded on {formatDateShort(new Date().toISOString())}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">
                This Month&apos;s Revenue
              </p>
              <p className="font-mono-tabular mt-2 text-2xl font-semibold text-slate-900">
                {formatINR(metrics.thisMonthsRevenue)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Current billing month total
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">
                Total Credits (Receivable / Settled)
              </p>
              <p className="font-mono-tabular mt-2 text-2xl font-semibold text-emerald-800">
                {formatINR(metrics.totalCredits)}
              </p>
              <p className="font-mono-tabular mt-2 text-xs text-slate-600">
                Settled {formatINR(metrics.settledCredits)} · Due{' '}
                {formatINR(metrics.pendingReceivables)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">
                Total Debits (Truck Expenditures)
              </p>
              <p className="font-mono-tabular mt-2 text-2xl font-semibold text-amber-700">
                {formatINR(metrics.totalDebits)}
              </p>
              <p className="font-mono-tabular mt-2 text-xs text-slate-600">
                Net settled cashflow {formatINR(metrics.netOperatingPosition)}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Carousel Management Component */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Happy Clients Carousel Management
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Upload field and mill delivery photos. English captions
              auto-translate to Telugu &amp; Hindi via Groq for public visitors.
              Maximum 10 photos kept.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Languages className="h-3.5 w-3.5 text-emerald-800" />
              {groqConfigured === true
                ? 'Groq Translation + Whisper Active'
                : groqConfigured === false
                ? 'Manual Telugu/Hindi (GROQ_API_KEY not set)'
                : 'Checking translation service...'}
            </span>
            <span className="font-mono-tabular text-sm font-semibold text-emerald-900 whitespace-nowrap">
              {images.length} / 10 Slots Active
            </span>
          </div>
        </div>

        <form onSubmit={handleUpload} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <label
                htmlFor="carousel-file-input"
                className="block text-sm font-medium text-slate-700"
              >
                Select Photo (JPG, PNG, WebP)
              </label>
              <input
                id="carousel-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-[#FAFBF9] px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-emerald-800 cursor-pointer"
              />
            </div>

            <div className="md:col-span-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="carousel-caption-input"
                  className="block text-sm font-medium text-slate-700"
                >
                  Photo Caption (English)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg,.flac"
                    onChange={handleAudioFileSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    disabled={transcribingAudio}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Upload className="h-3 w-3" />
                    <span>
                      {transcribingAudio ? 'Transcribing...' : 'Upload Audio'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecord}
                    disabled={transcribingAudio}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                      isRecording
                        ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3" />
                        <span>Whisper Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <input
                id="carousel-caption-input"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Morning Dispatch — Shri Renuka Agro Mills"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={uploading || transcribingAudio}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowManualTranslations((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5" />
              <span>
                {showManualTranslations
                  ? 'Hide Telugu & Hindi override fields'
                  : 'Optional: Review or enter Telugu & Hindi captions'}
              </span>
            </button>
            <p className="text-xs text-slate-500">
              Leave Telugu &amp; Hindi blank to auto-translate on upload.
            </p>
          </div>

          {showManualTranslations && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-[#FAFBF9] p-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="carousel-caption-te"
                  className="block text-xs font-medium text-slate-700"
                >
                  Telugu Caption (తెలుగు)
                </label>
                <input
                  id="carousel-caption-te"
                  type="text"
                  value={captionTe}
                  onChange={(e) => setCaptionTe(e.target.value)}
                  placeholder="Auto-filled via Groq or enter Telugu caption..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="carousel-caption-hi"
                  className="block text-xs font-medium text-slate-700"
                >
                  Hindi Caption (हिन्दी)
                </label>
                <input
                  id="carousel-caption-hi"
                  type="text"
                  value={captionHi}
                  onChange={(e) => setCaptionHi(e.target.value)}
                  placeholder="Auto-filled via Groq or enter Hindi caption..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none"
                />
              </div>
            </div>
          )}
        </form>

        {uploadError && (
          <p className="mt-3 text-sm font-medium text-red-700">{uploadError}</p>
        )}
        {uploadWarning && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <span>{uploadWarning}</span>
          </div>
        )}
        {uploadNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{uploadNotice}</span>
          </div>
        )}

        {images.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-[#FAFBF9] py-10 text-center">
            <ImageIcon className="h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              No carousel images uploaded yet
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Upload your first photo above to display it on the public site.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {images.map((img, idx) => (
              <div
                key={img._id}
                className="group flex flex-col justify-between overflow-hidden rounded-lg border border-slate-200 bg-[#FAFBF9]"
              >
                <div>
                  <div className="relative aspect-16/9 bg-slate-200">
                    {!brokenIds[img._id] ? (
                      <img
                        src={img.url}
                        alt={img.caption}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenIds((prev) => ({
                            ...prev,
                            [img._id]: true,
                          }))
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p
                      title={img.caption}
                      className="truncate text-xs font-semibold text-slate-900"
                    >
                      {img.caption}
                    </p>
                    <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
                      <p className="truncate" title={img.captionTe || 'Not set'}>
                        <span className="font-semibold text-slate-500">TE:</span>{' '}
                        {img.captionTe || '—'}
                      </p>
                      <p className="truncate" title={img.captionHi || 'Not set'}>
                        <span className="font-semibold text-slate-500">HI:</span>{' '}
                        {img.captionHi || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-200/80 px-3 py-2 text-[11px] text-slate-500">
                  <span className="font-mono-tabular">
                    #{idx + 1} · {formatDateShort(img.uploadedAt)}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(img)}
                      aria-label={`Edit captions for ${img.caption}`}
                      className="inline-flex items-center gap-1 font-medium text-emerald-800 hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img._id)}
                      aria-label={`Delete ${img.caption}`}
                      className="inline-flex items-center gap-1 text-red-700 hover:underline cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit / Translate Carousel Caption Modal */}
      {editingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-carousel-caption-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3
                  id="edit-carousel-caption-title"
                  className="font-display text-lg font-semibold text-slate-900"
                >
                  Edit &amp; Translate Photo Caption
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Public visitors see Telugu or Hindi automatically when
                  selected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                aria-label="Close edit dialog"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="edit-caption-en"
                  className="block text-sm font-medium text-slate-700"
                >
                  English Caption
                </label>
                <input
                  id="edit-caption-en"
                  type="text"
                  value={editCaptionEn}
                  onChange={(e) => setEditCaptionEn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">
                  Localized Captions for Public Gallery
                </span>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(true)}
                  disabled={translatingEdit || savingEdit || !editCaptionEn.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {translatingEdit
                      ? 'Translating via Groq...'
                      : 'Auto-Translate (Groq)'}
                  </span>
                </button>
              </div>

              <div>
                <label
                  htmlFor="edit-caption-te"
                  className="block text-sm font-medium text-slate-700"
                >
                  Telugu Caption (తెలుగు)
                </label>
                <input
                  id="edit-caption-te"
                  type="text"
                  value={editCaptionTe}
                  onChange={(e) => setEditCaptionTe(e.target.value)}
                  placeholder="Enter or auto-translate Telugu caption..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-caption-hi"
                  className="block text-sm font-medium text-slate-700"
                >
                  Hindi Caption (हिन्दी)
                </label>
                <input
                  id="edit-caption-hi"
                  type="text"
                  value={editCaptionHi}
                  onChange={(e) => setEditCaptionHi(e.target.value)}
                  placeholder="Enter or auto-translate Hindi caption..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>

              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {editError}
                </div>
              )}
              {editFeedback && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
                  {editFeedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(false)}
                  disabled={savingEdit || translatingEdit || !editCaptionEn.trim()}
                  className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Save Captions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Receivables Snapshot */}
      {metrics && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Pending Client Payments
              </h3>
              <button
                type="button"
                onClick={onNavigatePayments}
                className="text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
              >
                Manage All
              </button>
            </div>
            {metrics.recentPendingTransactions.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">
                All client transactions are currently settled.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.recentPendingTransactions.map((t) => {
                  const paid = t.paidAmount || 0;
                  const due = Math.max(0, t.amount - paid);
                  return (
                    <div
                      key={t._id}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {t.clientName}
                        </p>
                        <p className="font-mono-tabular text-xs text-slate-500">
                          {formatDateShort(t.date)} · {t.quantity} {t.unit}
                          {paid > 0 ? ` · Paid ${formatINR(paid)}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono-tabular font-semibold text-slate-900">
                          {formatINR(due)}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" />
                          {paid > 0 ? 'Partial Due' : 'Due'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Recent Truck &amp; Warehouse Payouts
              </h3>
              <button
                type="button"
                onClick={onNavigatePayments}
                className="text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
              >
                Open Ledger
              </button>
            </div>
            {metrics.recentExpenditures.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">
                No expenditures recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.recentExpenditures.map((exp) => (
                  <div
                    key={exp._id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {exp.truckNumber || exp.driverName ? (
                          <>
                            {exp.truckNumber && (
                              <span className="font-mono-tabular">
                                {exp.truckNumber}
                              </span>
                            )}
                            {exp.truckNumber && exp.driverName ? ' · ' : ''}
                            {exp.driverName}
                          </>
                        ) : (
                          'Warehouse / Cash Payout'
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {exp.description || '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono-tabular font-semibold text-slate-900">
                        {formatINR(exp.amountPaid)}
                      </p>
                      <p className="font-mono-tabular text-xs text-slate-500">
                        {formatDateShort(exp.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

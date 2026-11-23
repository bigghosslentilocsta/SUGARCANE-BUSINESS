import Groq, { toFile } from 'groq-sdk';

export interface CaptionTranslationResult {
  captionTe: string;
  captionHi: string;
  translated: boolean;
  note?: string;
}

export interface AudioCaptionResult {
  text: string;
  captionTe: string;
  captionHi: string;
  translated: boolean;
  note?: string;
}

const PREFERRED_CHAT_MODELS = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'openai/gpt-oss-120b',
  'qwen/qwen3-32b',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b',
  'moonshotai/kimi-k2-instruct',
  'moonshotai/kimi-k2-instruct-0905',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
  'llama3-70b-8192',
  'llama3-8b-8192',
];

const FALLBACK_CHAT_MODELS = [
  'llama-3.1-8b-instant',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'openai/gpt-oss-20b',
  'qwen/qwen3-32b',
  'llama-3.3-70b-versatile',
];

const NON_CHAT_MODEL_PATTERN =
  /whisper|guard|tts|playai|orpheus|embed|moderation|safeguard/i;

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
}

function getGroqClient(): Groq {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY?.trim(),
  });
}

function parseTranslationJson(rawContent: string): {
  captionTe: string;
  captionHi: string;
} {
  const candidates = [rawContent.trim()];
  const jsonBlockMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonBlockMatch) {
    candidates.push(jsonBlockMatch[0]);
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      const captionTe =
        typeof parsed.captionTe === 'string' ? parsed.captionTe.trim() : '';
      const captionHi =
        typeof parsed.captionHi === 'string' ? parsed.captionHi.trim() : '';
      if (captionTe || captionHi) {
        return { captionTe, captionHi };
      }
    } catch {
      // Try next JSON candidate
    }
  }

  return { captionTe: '', captionHi: '' };
}

async function resolveCandidateModels(groq: Groq): Promise<{
  chatModels: string[];
  whisperModels: string[];
  listedIds: string[];
}> {
  try {
    const response = await groq.models.list();
    const listedIds = (response.data || [])
      .map((m) => m.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    const whisperModels = listedIds.filter((id) => /whisper/i.test(id));
    // Prefer whisper-large-v3 first if available
    whisperModels.sort((a, b) => {
      if (a === 'whisper-large-v3') return -1;
      if (b === 'whisper-large-v3') return 1;
      return a.localeCompare(b);
    });

    const rawChat = listedIds.filter((id) => !NON_CHAT_MODEL_PATTERN.test(id));
    const ordered: string[] = [];

    for (const preferred of PREFERRED_CHAT_MODELS) {
      if (rawChat.includes(preferred)) {
        ordered.push(preferred);
      }
    }

    for (const remaining of rawChat) {
      if (!ordered.includes(remaining) && !/compound/i.test(remaining)) {
        ordered.push(remaining);
      }
    }

    for (const compound of rawChat) {
      if (!ordered.includes(compound)) {
        ordered.push(compound);
      }
    }

    return {
      chatModels: ordered,
      whisperModels:
        whisperModels.length > 0
          ? whisperModels
          : ['whisper-large-v3', 'whisper-large-v3-turbo'],
      listedIds,
    };
  } catch (err) {
    console.warn(
      'Unable to list Groq models, using fallback list:',
      err instanceof Error ? err.message : 'Unknown error'
    );
    return {
      chatModels: FALLBACK_CHAT_MODELS,
      whisperModels: ['whisper-large-v3', 'whisper-large-v3-turbo'],
      listedIds: [],
    };
  }
}

async function runTranslationWithModel(
  groq: Groq,
  model: string,
  cleanCaption: string
): Promise<{ captionTe: string; captionHi: string }> {
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    {
      role: 'system',
      content:
        'You are a precise agricultural and B2B trade translator for an Indian sugarcane export business (Mallikarjuna Sugarcane Suppliers). Translate the provided English image caption into natural, accurate Telugu (Telugu script) and Hindi (Devanagari script). Return strictly valid JSON with exactly two string keys: "captionTe" and "captionHi". Do not include explanations or markdown.',
    },
    {
      role: 'user',
      content: cleanCaption,
    },
  ];

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages,
    });
    const raw = completion.choices?.[0]?.message?.content || '';
    return parseTranslationJson(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (/response_format|json_object/i.test(message)) {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0,
        messages,
      });
      const raw = completion.choices?.[0]?.message?.content || '';
      return parseTranslationJson(raw);
    }
    throw err;
  }
}

export async function translateCaptionToTeluguAndHindi(
  englishCaption: string
): Promise<CaptionTranslationResult> {
  const cleanCaption = englishCaption.trim();
  if (!cleanCaption) {
    return {
      captionTe: '',
      captionHi: '',
      translated: false,
      note: 'Caption is empty.',
    };
  }

  if (!isGroqConfigured()) {
    return {
      captionTe: '',
      captionHi: '',
      translated: false,
      note: 'GROQ_API_KEY is not configured in server secrets. Saved English caption; configure GROQ_API_KEY or enter Telugu/Hindi captions manually.',
    };
  }

  const groq = getGroqClient();
  const { chatModels, listedIds } = await resolveCandidateModels(groq);

  if (chatModels.length === 0) {
    const availText =
      listedIds.length > 0
        ? `Enabled models on your Groq key: ${listedIds.join(', ')}.`
        : 'No accessible chat models were returned by your Groq key.';
    return {
      captionTe: '',
      captionHi: '',
      translated: false,
      note: `No text chat model is enabled for your Groq project to translate English into Telugu & Hindi. ${availText} Enable a Groq chat model (e.g. llama-3.1-8b-instant or llama-3.3-70b-versatile) in Groq Console, or enter Telugu/Hindi captions manually.`,
    };
  }

  let lastErrorMessage = 'Unknown error';
  for (const model of chatModels.slice(0, 5)) {
    try {
      const { captionTe, captionHi } = await runTranslationWithModel(
        groq,
        model,
        cleanCaption
      );

      if (captionTe || captionHi) {
        return {
          captionTe,
          captionHi,
          translated: true,
        };
      }
    } catch (err) {
      lastErrorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`Groq translation attempt failed on model ${model}:`, lastErrorMessage);
    }
  }

  console.error('Groq translation failed across available models:', lastErrorMessage);
  return {
    captionTe: '',
    captionHi: '',
    translated: false,
    note: 'Groq translation could not complete with the models enabled on your Groq account. You can retry Auto-Translate or enter Telugu/Hindi captions manually.',
  };
}

export async function transcribeAudioCaption(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<AudioCaptionResult> {
  if (!isGroqConfigured()) {
    throw new Error(
      'GROQ_API_KEY is not configured on the server. Add GROQ_API_KEY in Settings -> Secrets to use Whisper audio transcription.'
    );
  }

  const groq = getGroqClient();
  const safeName = filename && filename.trim() ? filename.trim() : 'audio.m4a';
  const safeType = mimetype && mimetype.trim() ? mimetype.trim() : 'audio/mp4';
  const { whisperModels } = await resolveCandidateModels(groq);

  let transcriptionText = '';
  let lastWhisperError: unknown = null;

  for (const whisperModel of whisperModels.slice(0, 2)) {
    try {
      const audioFile = await toFile(buffer, safeName, { type: safeType });
      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: whisperModel,
        temperature: 0,
        response_format: 'verbose_json',
      });
      transcriptionText =
        typeof transcription.text === 'string' ? transcription.text.trim() : '';
      lastWhisperError = null;
      break;
    } catch (err) {
      lastWhisperError = err;
    }
  }

  if (lastWhisperError) {
    throw lastWhisperError instanceof Error
      ? lastWhisperError
      : new Error('Whisper audio transcription failed.');
  }

  if (!transcriptionText) {
    return {
      text: '',
      captionTe: '',
      captionHi: '',
      translated: false,
      note: 'Whisper could not detect speech in the audio file.',
    };
  }

  const translated = await translateCaptionToTeluguAndHindi(transcriptionText);
  return {
    text: transcriptionText,
    captionTe: translated.captionTe,
    captionHi: translated.captionHi,
    translated: translated.translated,
    note: translated.note,
  };
}

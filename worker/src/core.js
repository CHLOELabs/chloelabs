const TOPIC_MAX_LENGTH = 100;
const QUESTION_MAX_LENGTH = 240;
const AGE_BANDS = new Set(['8-10', '10-12', '12-14']);

export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}

export function validateLearnRequest(payload, mode) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError('Please send a valid learning request.');
  }

  const topic = cleanText(payload.topic, TOPIC_MAX_LENGTH, 'topic');
  const ageBand = AGE_BANDS.has(payload.ageBand) ? payload.ageBand : '10-12';

  if (mode === 'questions') {
    return {topic, ageBand};
  }

  const question = cleanText(
    payload.question,
    QUESTION_MAX_LENGTH,
    'learning question',
  );

  return {topic, question, ageBand};
}

export function extractStructuredOutput(response) {
  const message = response?.output?.find((item) => item.type === 'message');
  const outputText = message?.content?.find(
    (item) => item.type === 'output_text',
  )?.text;

  if (!outputText) {
    throw new Error('The learning service returned no usable content.');
  }

  return JSON.parse(outputText);
}

export function corsHeaders(origin, allowedOrigin) {
  const allowed =
    origin === allowedOrigin ||
    origin === 'http://localhost:3000' ||
    origin === 'http://127.0.0.1:3000';

  return {
    'Access-Control-Allow-Origin': allowed ? origin : allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function jsonResponse(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function cleanText(value, maxLength, label) {
  if (typeof value !== 'string') {
    throw new RequestError(`Please enter a ${label}.`);
  }

  const cleaned = value.replace(/\s+/g, ' ').trim();

  if (!cleaned) {
    throw new RequestError(`Please enter a ${label}.`);
  }

  if (cleaned.length > maxLength) {
    throw new RequestError(
      `Please keep the ${label} under ${maxLength} characters.`,
    );
  }

  return cleaned;
}

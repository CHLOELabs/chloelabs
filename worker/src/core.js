const TOPIC_MAX_LENGTH = 100;
const QUESTION_MAX_LENGTH = 240;
const AGE_BANDS = new Set(['8-10', '10-12', '12-14']);
const BUILD_TYPES = new Set([
  'physical model',
  'game',
  'interactive webpage',
  'diagram or animation',
  'simple tool',
  'help me choose',
]);
const BUILD_TIMES = new Set(['30 minutes', 'a few hours', 'several days']);
const BUILD_LEVELS = new Set(['starter', 'growing', 'challenge']);
const BUILD_TOOLS = new Set([
  'craft materials',
  'computer',
  'coding',
  'building materials',
  'household materials',
]);
const INVESTIGATION_TYPES = new Set([
  'observe',
  'compare',
  'measure',
  'use data',
  'test an idea',
  'help me choose',
]);
const INVESTIGATION_TIMES = new Set([
  '30 minutes',
  'one day',
  'several days',
  'several weeks',
]);
const INVESTIGATION_SETTINGS = new Set([
  'indoors',
  'outdoors',
  'online public data',
  'school or community',
]);
const CREATE_FORMATS = new Set([
  'story',
  'illustration',
  'comic',
  'video plan',
  'digital exhibit',
  'help me choose',
]);
const SHARE_FORMATS = new Set([
  'short talk',
  'poster',
  'demo',
  'quiz',
  'mini lesson',
  'help me choose',
]);

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

export function validateBuildRequest(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError('Please send a valid build request.');
  }

  const topic = cleanText(payload.topic, TOPIC_MAX_LENGTH, 'topic');
  const ageBand = AGE_BANDS.has(payload.ageBand) ? payload.ageBand : '10-12';
  const buildType = BUILD_TYPES.has(payload.buildType)
    ? payload.buildType
    : 'help me choose';
  const time = BUILD_TIMES.has(payload.time) ? payload.time : 'a few hours';
  const difficulty = BUILD_LEVELS.has(payload.difficulty)
    ? payload.difficulty
    : 'growing';
  const tools = Array.isArray(payload.tools)
    ? [...new Set(payload.tools.filter((tool) => BUILD_TOOLS.has(tool)))].slice(
        0,
        5,
      )
    : [];

  return {topic, ageBand, buildType, time, difficulty, tools};
}

export function validateInvestigationRequest(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError('Please send a valid investigation request.');
  }
  return {
    topic: cleanText(payload.topic, TOPIC_MAX_LENGTH, 'topic'),
    ageBand: AGE_BANDS.has(payload.ageBand) ? payload.ageBand : '10-12',
    investigationType: INVESTIGATION_TYPES.has(payload.investigationType)
      ? payload.investigationType
      : 'help me choose',
    time: INVESTIGATION_TIMES.has(payload.time)
      ? payload.time
      : 'one day',
    setting: INVESTIGATION_SETTINGS.has(payload.setting)
      ? payload.setting
      : 'indoors',
  };
}

export function validateCreateRequest(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError('Please send a valid creative request.');
  }
  return {
    topic: cleanText(payload.topic, TOPIC_MAX_LENGTH, 'topic'),
    ageBand: AGE_BANDS.has(payload.ageBand) ? payload.ageBand : '10-12',
    format: CREATE_FORMATS.has(payload.format)
      ? payload.format
      : 'help me choose',
    time: BUILD_TIMES.has(payload.time) ? payload.time : 'a few hours',
  };
}

export function validateShareRequest(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError('Please send a valid sharing request.');
  }
  return {
    topic: cleanText(payload.topic, TOPIC_MAX_LENGTH, 'topic'),
    ageBand: AGE_BANDS.has(payload.ageBand) ? payload.ageBand : '10-12',
    format: SHARE_FORMATS.has(payload.format)
      ? payload.format
      : 'help me choose',
    audience: cleanText(payload.audience || 'family', 60, 'audience'),
    time: BUILD_TIMES.has(payload.time) ? payload.time : '30 minutes',
  };
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

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RequestError,
  corsHeaders,
  extractStructuredOutput,
  validateBuildRequest,
  validateInvestigationRequest,
  validateCreateRequest,
  validateShareRequest,
  validateLearnRequest,
} from '../src/core.js';

test('validates a questions request and defaults the age band', () => {
  assert.deepEqual(
    validateLearnRequest({topic: '  owl   feathers '}, 'questions'),
    {topic: 'owl feathers', ageBand: '10-12'},
  );
});

test('validates a discovery request', () => {
  assert.deepEqual(
    validateLearnRequest(
      {
        topic: 'owls',
        question: 'Why do owls fly quietly?',
        ageBand: '8-10',
      },
      'discover',
    ),
    {
      topic: 'owls',
      question: 'Why do owls fly quietly?',
      ageBand: '8-10',
    },
  );
});

test('rejects missing and oversized input', () => {
  assert.throws(
    () => validateLearnRequest({topic: ''}, 'questions'),
    RequestError,
  );
  assert.throws(
    () => validateLearnRequest({topic: 'x'.repeat(101)}, 'questions'),
    RequestError,
  );
});

test('validates and limits a build request', () => {
  assert.deepEqual(
    validateBuildRequest({
      topic: ' volcanoes ',
      buildType: 'physical model',
      time: 'a few hours',
      difficulty: 'growing',
      tools: ['craft materials', 'computer', 'not allowed'],
    }),
    {
      topic: 'volcanoes',
      ageBand: '10-12',
      buildType: 'physical model',
      time: 'a few hours',
      difficulty: 'growing',
      tools: ['craft materials', 'computer'],
    },
  );
});

test('validates an investigation request', () => {
  assert.deepEqual(
    validateInvestigationRequest({
      topic: ' birds ',
      investigationType: 'observe',
      time: 'several days',
      setting: 'outdoors',
    }),
    {
      topic: 'birds',
      ageBand: '10-12',
      investigationType: 'observe',
      time: 'several days',
      setting: 'outdoors',
    },
  );
});

test('validates creative and sharing requests', () => {
  assert.equal(
    validateCreateRequest({topic: 'space', format: 'comic'}).format,
    'comic',
  );
  assert.equal(
    validateShareRequest({topic: 'space', format: 'quiz', audience: 'family'})
      .audience,
    'family',
  );
});

test('extracts structured Responses API output', () => {
  const result = extractStructuredOutput({
    output: [
      {
        type: 'message',
        content: [
          {
            type: 'output_text',
            text: '{"questions":["One?","Two?","Three?"]}',
          },
        ],
      },
    ],
  });

  assert.equal(result.questions.length, 3);
});

test('limits CORS to ChloeLabs and local development', () => {
  assert.equal(
    corsHeaders(
      'https://chloelabs.github.io',
      'https://chloelabs.github.io',
    )['Access-Control-Allow-Origin'],
    'https://chloelabs.github.io',
  );
  assert.equal(
    corsHeaders('https://example.com', 'https://chloelabs.github.io')[
      'Access-Control-Allow-Origin'
    ],
    'https://chloelabs.github.io',
  );
});

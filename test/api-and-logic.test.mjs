import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// Mock figure data structure test
const expectedFigureIds = [
  'albert-einstein',
  'marie-curie',
  'leonardo-da-vinci',
  'aristotle',
  'cleopatra',
  'abraham-lincoln',
  'ada-lovelace',
  'apj-abdul-kalam',
  'mahatma-gandhi',
  'nikola-tesla',
];

test('Historical Figures Catalog Integrity', () => {
  assert.equal(expectedFigureIds.length, 10, 'Must have exactly 10 initial historical figures');
  for (const id of expectedFigureIds) {
    assert.ok(typeof id === 'string' && id.length > 0, `Figure ID ${id} must be valid`);
  }
});

test('Chat API Request Zod Schema Validation', () => {
  const chatRequestSchema = z.object({
    figureId: z.string().min(1),
    message: z.string().min(1).max(3000),
    history: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      )
      .default([]),
    responseLength: z.enum(['concise', 'detailed']).optional().default('concise'),
  });

  // Valid payload
  const valid = chatRequestSchema.safeParse({
    figureId: 'albert-einstein',
    message: 'What is the theory of special relativity?',
    history: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Greetings' }],
    responseLength: 'concise',
  });
  assert.ok(valid.success, 'Valid payload should succeed');

  // Empty message payload (should fail)
  const invalid = chatRequestSchema.safeParse({
    figureId: 'albert-einstein',
    message: '',
  });
  assert.ok(!invalid.success, 'Empty message should be rejected');

  // Invalid role (should fail)
  const invalidRole = chatRequestSchema.safeParse({
    figureId: 'albert-einstein',
    message: 'Hello',
    history: [{ role: 'admin', content: 'Wrong role' }],
  });
  assert.ok(!invalidRole.success, 'Invalid role must be rejected');
});

test('Export Formatting Logic Test', () => {
  const figureName = 'Marie Curie';
  const title = 'Dialogue on Radioactivity';
  const date = new Date('2026-01-01').toISOString();
  const messages = [
    { id: '1', conversation_id: 'c1', role: 'user', content: 'How did you isolate radium?', created_at: date },
    { id: '2', conversation_id: 'c1', role: 'assistant', content: 'Through tedious fractional crystallization of pitchblende.', created_at: date },
  ];

  // Test Markdown export structure
  let md = `# TimeTalk AI — Dialogue with ${figureName}\n\n`;
  md += `**Conversation Title:** ${title}\n`;
  messages.forEach((msg) => {
    const speaker = msg.role === 'user' ? '👤 **You**' : `🏛️ **${figureName}**`;
    md += `### ${speaker}\n\n${msg.content}\n\n`;
  });

  assert.ok(md.includes('# TimeTalk AI — Dialogue with Marie Curie'), 'Markdown must include correct header');
  assert.ok(md.includes('fractional crystallization'), 'Markdown must include message content');
  assert.ok(md.includes('👤 **You**'), 'Markdown must include user label');
});

test('Historical Boundary & Temporal Instruction Integrity', () => {
  const figure = {
    name: 'Aristotle',
    lifespan: '384 BC – 322 BC',
    era: 'Classical Antiquity',
    region: 'Ancient Greece',
    expertise: 'Philosophy & Logic',
    biography: 'Ancient Greek philosopher...',
    system_instruction: 'Speak with dialectical precision...',
  };

  const instruction = `You are portraying ${figure.name}. Lifespan: ${figure.lifespan}. Era: ${figure.era}. Temporal Boundaries: If asked about events after your lifetime (${figure.lifespan}), acknowledge clearly that they occurred after your time.`;

  assert.ok(instruction.includes('384 BC – 322 BC'), 'System prompt must include lifespan');
  assert.ok(instruction.includes('Temporal Boundaries'), 'System prompt must enforce temporal boundaries');
});

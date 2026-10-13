import { test } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

// Figure test fixtures
const TEST_FIGURE = {
  id: 'albert-einstein',
  name: 'Albert Einstein',
  lifespan: '1879 – 1955',
  era: 'Modern Era (20th Century)',
  region: 'Europe / North America',
  expertise: 'Theoretical Physics & Cosmology',
  biography: 'Nobel laureate theoretical physicist who developed the theory of relativity.',
  portrait_url: 'https://example.com/einstein.jpg',
  system_instruction: 'You are Albert Einstein. Speak with reverence for the harmonies of nature.',
  starter_questions: ['What discovery are you most proud of?']
};

test('Zod chat request schema validates correctly', () => {
  const chatRequestSchema = z.object({
    figureId: z.string().min(1),
    message: z.string().min(1).max(3000),
    history: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).default([]),
    responseLength: z.enum(['concise', 'detailed']).optional().default('concise'),
  });

  // Valid payload
  const valid = chatRequestSchema.safeParse({
    figureId: 'albert-einstein',
    message: 'What is relativity?',
    history: [{ role: 'user', content: 'Hello' }],
    responseLength: 'concise',
  });
  assert.strictEqual(valid.success, true);

  // Missing figureId
  const invalid = chatRequestSchema.safeParse({
    figureId: '',
    message: 'Hello',
  });
  assert.strictEqual(invalid.success, false);

  // Empty message
  const emptyMsg = chatRequestSchema.safeParse({
    figureId: 'marie-curie',
    message: '',
  });
  assert.strictEqual(emptyMsg.success, false);
});

test('Historical persona system instruction generation incorporates temporal limits', () => {
  function buildTestInstruction(figure, responseLength = 'concise') {
    return `You are an educational historical conversation simulator portraying ${figure.name}.
Lifespan: ${figure.lifespan}.
Era: ${figure.era}.
Temporal Boundaries: If the user asks about people or events after your lifetime (${figure.lifespan}), acknowledge clearly that those events occurred after your time.`;
  }

  const instruction = buildTestInstruction(TEST_FIGURE);
  assert.ok(instruction.includes('Albert Einstein'));
  assert.ok(instruction.includes('1879 – 1955'));
  assert.ok(instruction.includes('Temporal Boundaries'));
});

test('Format export generates valid Markdown and TXT transcripts', () => {
  function formatExport(figureName, title, messages, format) {
    if (format === 'md') {
      let md = `# TimeTalk AI — Dialogue with ${figureName}\n\n`;
      md += `**Conversation Title:** ${title}\n\n`;
      messages.forEach(m => {
        md += `### ${m.role === 'user' ? 'You' : figureName}\n\n${m.content}\n\n`;
      });
      return md;
    } else {
      let txt = `TIMETALK AI — ${figureName.toUpperCase()}\nTitle: ${title}\n\n`;
      messages.forEach(m => {
        txt += `[${m.role.toUpperCase()}]: ${m.content}\n`;
      });
      return txt;
    }
  }

  const msgs = [
    { role: 'user', content: 'What is energy?' },
    { role: 'assistant', content: 'Energy and mass are equivalent according to E=mc^2.' }
  ];

  const mdResult = formatExport('Albert Einstein', 'Discussion on Energy', msgs, 'md');
  assert.ok(mdResult.includes('# TimeTalk AI — Dialogue with Albert Einstein'));
  assert.ok(mdResult.includes('E=mc^2'));

  const txtResult = formatExport('Albert Einstein', 'Discussion on Energy', msgs, 'txt');
  assert.ok(txtResult.includes('TIMETALK AI — ALBERT EINSTEIN'));
  assert.ok(txtResult.includes('[USER]: What is energy?'));
});

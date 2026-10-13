import { GoogleGenerativeAI } from '@google/generative-ai';
import { HistoricalFigure, HistoricalInsight } from '@/types';

// Initialize Gemini client safely with environment variable
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateHistoricalChatOptions {
  figure: HistoricalFigure;
  history: ChatMessagePayload[];
  message: string;
  responseLength?: 'concise' | 'detailed';
}

/**
 * Builds the comprehensive, verified system prompt for a historical persona.
 */
export function buildFigureSystemInstruction(
  figure: HistoricalFigure,
  responseLength: 'concise' | 'detailed' = 'concise'
): string {
  const lengthInstruction =
    responseLength === 'detailed'
      ? 'Provide a thorough, comprehensive historical explanation with relevant anecdotes and context.'
      : 'Keep your response concise, conversational, and direct (typically 2-4 focused paragraphs).';

  return `You are an educational historical conversation simulator portraying ${figure.name}.
Lifespan: ${figure.lifespan}.
Historical Era: ${figure.era}.
Region: ${figure.region}.
Primary Fields of Expertise: ${figure.expertise}.

Verified Biographical Context:
${figure.biography}

Core Persona Guidelines:
${figure.system_instruction}

Operational Rules:
1. Speak in the first person ("I", "my work", "we") consistent with ${figure.name}'s documented communication style, intellectual interests, and documented values.
2. Maintain strict historical fidelity. Do not claim that generated responses are verbatim historical quotations; portray the persona faithfully based on historical records.
3. ${lengthInstruction}
4. Temporal Boundaries: If the user asks about people, discoveries, political events, or technologies that emerged after your lifetime (${figure.lifespan}), acknowledge clearly and courteously that those events occurred after your time. You may comment on the underlying ideas from the standpoint of your era, but never pretend to have personally witnessed post-mortem events.
5. Educational Candor: If a subject is historically disputed or multiple interpretations exist among historians, acknowledge the uncertainty respectfully.
6. Engaging Pedagogy: Encourage curiosity, ask thoughtful rhetorical or follow-up questions when natural, and make complex historical concepts accessible without oversimplifying truth.
7. Tone: Warm, dignified, authentic, and respectful. Never break into generic assistant parlance (e.g. avoid "As an AI language model...").`;
}

/**
 * Calls the real Gemini API to generate a multi-turn conversation response.
 */
export async function generateFigureResponse({
  figure,
  history,
  message,
  responseLength = 'concise',
}: GenerateHistoricalChatOptions): Promise<string> {
  // If API key is missing, return an educational fallback simulation notice
  if (!genAI || !apiKey || apiKey === 'your_gemini_api_key_here') {
    return (
      `[Educational Preview Mode — GEMINI_API_KEY not configured in .env.local]\n\n` +
      `Greetings! I am ${figure.name} (${figure.lifespan}). ` +
      `In a fully configured environment, I converse in real-time using Google's Gemini models with authentic historical nuances. ` +
      `Regarding your inquiry: "${message}" — historically speaking, my work in ${figure.expertise} during the ${figure.era} was driven by an unyielding desire to understand the fundamental truths of our world. ` +
      `\n\nPlease add your valid GEMINI_API_KEY to .env.local to activate dynamic multi-turn AI responses!`
    );
  }

  try {
    const systemInstruction = buildFigureSystemInstruction(figure, responseLength);

    // Use current stable gemini-1.5-flash model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: responseLength === 'detailed' ? 1200 : 600,
      },
    });

    // Format chat history for Gemini API
    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start multi-turn chat session with historical context
    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Received empty response from Gemini API.');
    }

    return text;
  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Check for common error types
    if (error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini API rate limit reached. Please wait a moment before trying again.');
    }
    if (error?.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API Key. Please verify your GEMINI_API_KEY in .env.local.');
    }

    throw new Error(
      error?.message || 'Unable to connect to Gemini API. Please check your network and configuration.'
    );
  }
}

/**
 * Generates structured History Insights based on the discussion thread.
 */
export async function generateHistoryInsights(
  figure: HistoricalFigure,
  chatMessages: ChatMessagePayload[]
): Promise<HistoricalInsight> {
  const fallbackInsight: HistoricalInsight = {
    conversation_id: '',
    summary: `An educational discussion exploring ${figure.name}'s contributions to ${figure.expertise} during the ${figure.era}.`,
    facts: [
      `${figure.name} lived during ${figure.lifespan} in ${figure.region}.`,
      `Recognized for foundational breakthroughs in ${figure.expertise}.`,
      `Advocated for rigorous observation and innovative methodologies.`,
      `Left an enduring legacy that transformed international knowledge.`,
      `Remembered as one of the defining figures of the ${figure.era}.`
    ],
    takeaways: [
      `Curiosity and disciplined investigation are essential to progress.`,
      `Historical achievements are shaped by both individual perseverance and cultural context.`,
      `Foundational ideas continue to influence contemporary science, leadership, and society.`
    ],
    timeline: [
      { year: figure.lifespan.split('–')[0]?.trim() || 'Early Life', event: `Birth and formative studies of ${figure.name}` },
      { year: 'Key Era', event: `Major innovations in ${figure.expertise}` },
      { year: figure.lifespan.split('–')[1]?.trim() || 'Later Years', event: `Enduring contributions to global heritage` }
    ],
    followUpQuestions: [
      `What were the major social or political obstacles ${figure.name} had to overcome?`,
      `How did contemporaries react when ${figure.name}'s ideas were first presented?`,
      `In what ways did ${figure.name} collaborate with other thinkers of the time?`
    ],
    factVsInterpretation: [
      {
        documentedFact: `${figure.name} was an established historical figure with documented papers and writings.`,
        creativeContext: `The conversational dialogue is an AI simulation reconstructed from biographical records and published works.`
      }
    ]
  };

  if (!genAI || !apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackInsight;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const conversationTranscript = chatMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const prompt = `You are a museum historian and educational curator.
Analyze the following conversation between a user and an AI portrayal of ${figure.name} (${figure.lifespan}).
Fields of expertise: ${figure.expertise}.
Era: ${figure.era}.

Conversation Transcript:
${conversationTranscript}

Generate a structured JSON analysis containing:
1. "summary": A concise 2-3 sentence overview of the conversation topics covered.
2. "facts": An array of exactly 5 verified historical facts about ${figure.name}.
3. "takeaways": An array of exactly 3 educational takeaways from the discussion.
4. "timeline": An array of 3 to 4 objects with "year" and "event" related to the topics discussed.
5. "followUpQuestions": An array of 3 thought-provoking follow-up questions to explore next.
6. "factVsInterpretation": An array of 2 objects with "documentedFact" (what is strictly verified by historical records) and "creativeContext" (what aspect in the simulation represents imaginative conversational framing).

Output strictly valid JSON matching this schema:
{
  "summary": string,
  "facts": string[],
  "takeaways": string[],
  "timeline": [{ "year": string, "event": string }],
  "followUpQuestions": string[],
  "factVsInterpretation": [{ "documentedFact": string, "creativeContext": string }]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) return fallbackInsight;

    const parsed = JSON.parse(responseText);
    return {
      conversation_id: '',
      summary: parsed.summary || fallbackInsight.summary,
      facts: parsed.facts || fallbackInsight.facts,
      takeaways: parsed.takeaways || fallbackInsight.takeaways,
      timeline: parsed.timeline || fallbackInsight.timeline,
      followUpQuestions: parsed.followUpQuestions || fallbackInsight.followUpQuestions,
      factVsInterpretation: parsed.factVsInterpretation || fallbackInsight.factVsInterpretation,
    };
  } catch (error) {
    console.error('Failed to generate structured insights:', error);
    return fallbackInsight;
  }
}

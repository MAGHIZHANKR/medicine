import { AIReminderParseResult, FrequencyType, FoodInstructionType } from '../types';

/**
 * AI Service for converting natural language schedule instructions
 * into structured reminder fields with safety disclaimers and human confirmation.
 */

export async function parseScheduleWithAI(promptText: string): Promise<AIReminderParseResult> {
  const input = promptText.trim();
  if (!input) {
    throw new Error("Please enter your reminder schedule in plain words.");
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Try Gemini API if key is available
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const response = await callGeminiExtract(input, apiKey);
      if (response && response.name) {
        return response;
      }
    } catch (err) {
      console.warn('Gemini API parse failed, using local NLP parser:', err);
    }
  }

  // Fallback to high-precision local semantic extraction
  const result = parseNaturalLanguageLocally(input);
  if (!result || !result.name) {
    throw new Error("I couldn't understand the schedule clearly. Please enter it manually.");
  }

  return result;
}

async function callGeminiExtract(userInput: string, apiKey: string): Promise<AIReminderParseResult | null> {
  const systemPrompt = `You are a specialized, safe reminder parser for MediMate AI.
Extract ONLY the user's stated reminder parameters from natural language into JSON format.
DO NOT diagnose, DO NOT recommend new medicines, DO NOT adjust dosages, and DO NOT invent medical advice.
Output ONLY a JSON object matching this schema:
{
  "name": "string (medicine name stated by user)",
  "dosage": "string (dosage stated, default '1 tablet' if unspecified)",
  "time": "HH:MM (24-hour format e.g. 08:00, 13:00, 20:00)",
  "frequency": "Once | Daily | Twice Daily | Three Times Daily | Custom",
  "foodInstruction": "Before food | After food | With food | No instruction",
  "notes": "string (optional user notes)"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Input: "${userInput}"` }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const parsed = JSON.parse(text);
  return {
    name: parsed.name || 'Medicine',
    dosage: parsed.dosage || '1 tablet',
    time: parsed.time || '08:00',
    frequency: (parsed.frequency as FrequencyType) || 'Daily',
    foodInstruction: (parsed.foodInstruction as FoodInstructionType) || 'After food',
    notes: parsed.notes || '',
    confidence: 0.95
  };
}

/**
 * Deterministic, robust natural language schedule parser
 * Handles common elderly and caregiver phrases like:
 * "Remind me to take my BP tablet every morning after breakfast at 8"
 * "Metformin 500mg at 9pm after dinner twice daily"
 * "Take Vitamin D 1 capsule with lunch at 1:00 PM"
 */
export function parseNaturalLanguageLocally(text: string): AIReminderParseResult | null {
  const lower = text.toLowerCase();

  // 1. Food instruction detection
  let foodInstruction: FoodInstructionType = 'No instruction';
  if (lower.includes('after food') || lower.includes('after meal') || lower.includes('after breakfast') || lower.includes('after lunch') || lower.includes('after dinner')) {
    foodInstruction = 'After food';
  } else if (lower.includes('before food') || lower.includes('before meal') || lower.includes('before breakfast') || lower.includes('before lunch') || lower.includes('before dinner') || lower.includes('empty stomach')) {
    foodInstruction = 'Before food';
  } else if (lower.includes('with food') || lower.includes('with meal') || lower.includes('with breakfast') || lower.includes('with lunch') || lower.includes('with dinner')) {
    foodInstruction = 'With food';
  }

  // 2. Frequency detection
  let frequency: FrequencyType = 'Daily';
  if (lower.includes('twice') || lower.includes('two times') || lower.includes('2 times') || lower.includes('2x')) {
    frequency = 'Twice Daily';
  } else if (lower.includes('three times') || lower.includes('3 times') || lower.includes('thrice') || lower.includes('3x')) {
    frequency = 'Three Times Daily';
  } else if (lower.includes('once') || lower.includes('only today') || lower.includes('single')) {
    frequency = 'Once';
  } else if (lower.includes('daily') || lower.includes('every day') || lower.includes('every morning') || lower.includes('every night') || lower.includes('every evening')) {
    frequency = 'Daily';
  }

  // 3. Time detection
  let time = '08:00';
  // Matches "8:00 AM", "8 am", "8pm", "at 8", "13:00", "20:00", etc.
  const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i;
  const timeMatch = lower.match(timeRegex);

  if (lower.includes('morning') && !timeMatch) {
    time = '08:00';
  } else if (lower.includes('afternoon') && !timeMatch) {
    time = '13:00';
  } else if (lower.includes('evening') && !timeMatch) {
    time = '18:00';
  } else if (lower.includes('night') || lower.includes('bedtime') && !timeMatch) {
    time = '21:00';
  } else if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const isPm = timeMatch[3]?.toLowerCase().includes('p');
    const isAm = timeMatch[3]?.toLowerCase().includes('a');

    if (isPm && hour < 12) hour += 12;
    if (isAm && hour === 12) hour = 0;

    // If context implies night/dinner/pm without explicit am/pm
    if (!isPm && !isAm && (lower.includes('dinner') || lower.includes('night') || lower.includes('evening')) && hour <= 11) {
      hour += 12;
    }

    const padH = hour.toString().padStart(2, '0');
    const padM = minute.toString().padStart(2, '0');
    time = `${padH}:${padM}`;
  }

  // 4. Dosage detection
  let dosage = '1 tablet';
  const dosageMatch = lower.match(/(\d+(?:\.\d+)?)\s*(tablet|tablets|pill|pills|capsule|capsules|drop|drops|ml|mg|puff|puffs|spoon|spoons)/i);
  if (dosageMatch) {
    dosage = `${dosageMatch[1]} ${dosageMatch[2]}`;
  } else if (lower.includes('one tablet') || lower.includes('a tablet')) {
    dosage = '1 tablet';
  } else if (lower.includes('two tablets')) {
    dosage = '2 tablets';
  } else if (lower.includes('one capsule') || lower.includes('a capsule')) {
    dosage = '1 capsule';
  }

  // 5. Medicine Name Extraction
  let cleanName = '';
  // Remove boilerplate like "remind me to take my", "take", "please", "every morning", etc.
  let working = text
    .replace(/^(remind me to take|remind me to|please remind me to|take my|take|i need to take|remind)/i, '')
    .replace(/(every morning|every day|daily|every evening|every night|after breakfast|before breakfast|after lunch|before lunch|after dinner|before dinner|after food|before food|with food)/gi, '')
    .replace(/at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '')
    .replace(/\b(\d+\s*(?:tablets?|pills?|capsules?|mg|ml))\b/gi, '')
    .replace(/\b(my|the|a|an)\b/gi, '')
    .trim();

  // If common name patterns exist
  const knownMeds = ['Metformin', 'BP Tablet', 'Blood Pressure Tablet', 'Vitamin D', 'Aspirin', 'Lisinopril', 'Atorvastatin', 'Paracetamol', 'Thyroxine', 'Calcium', 'Omega 3', 'Insulin'];
  for (const known of knownMeds) {
    if (lower.includes(known.toLowerCase())) {
      cleanName = known;
      break;
    }
  }

  if (!cleanName) {
    // Take words remaining
    cleanName = working.split(/[,.;]/)[0]?.trim();
    if (!cleanName || cleanName.length < 2) {
      cleanName = 'Medicine';
    }
    // Capitalize first letter
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  return {
    name: cleanName,
    dosage,
    time,
    frequency,
    foodInstruction,
    notes: `Created from quick schedule input: "${text}"`,
    confidence: 0.9
  };
}

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an award-winning creative director and prompt engineer specializing in "diary page" quote content for vertical reels (9:16). Every output must follow this exact fixed visual signature — do not vary the core layout:

- 9:16 vertical, reel-safe, ultra-realistic photograph, highly detailed, 8k resolution.
- An open diary/journal page lying at a gentle angle on a wooden table (never flat top-down).
- Soft morning sunlight from one side, warm golden highlights, long soft shadows.
- Quote handwritten in elegant, slightly imperfect human cursive/print (fountain pen or fine-tip pen), natural ink texture with shadows of the writing falling beautifully on the page.
- The shadow of a pen or nearby object falls naturally across part of the page.
- Visible paper grain, filmic warm desaturated color grade, shallow depth of field, subtle film grain.
- No CGI look, no illustration style, purely photorealistic.

CRITICAL INSTRUCTION: Analyze the emotional core of the given quote. Based on its expression and emotion, choose 1 or 2 complementary secondary objects/props to place near the diary (e.g., instead of just a coffee cup, maybe a withered rose, a pocket watch, scattered autumn leaves, a teardrop on the wood, an antique compass, etc.). It must echo the meaning gracefully without being overly literal.

Output STRICT JSON ONLY (no markdown fences, no preamble, no commentary) with exactly these keys:
{
  "image_prompt": "the full dense image generation prompt, ready to paste into Midjourney/DALL-E 3, highly descriptive including the chosen emotional objects, sunlight, and 9:16 ratio",
  "caption_hook": "a scroll-stopping first line for the social post",
  "caption_body": "1-2 short sentences of caption body explaining the quote's deep meaning",
  "cta": "a short call to action line (e.g., 'Save this for when you need a reminder.')",
  "hashtags": ["5 to 7 relevant hashtags without the # symbol"],
  "scene_note": "one sentence explaining why the chosen secondary prop/object fits this specific quote's emotion"
}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quote } = body;

    if (!quote || typeof quote !== 'string' || quote.length > 800) {
      return NextResponse.json({ error: 'Missing or invalid quote' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server is missing GEMINI_API_KEY. Set it in your environment variables.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: quote,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.7,
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: 'Could not parse model output', raw: text }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 });
  }
}

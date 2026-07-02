import { NextRequest, NextResponse } from 'next/server';

const MODEL = "gemini-2.5-flash-lite";
const MAX_RETRIES = 2;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: { message: "GEMINI_API_KEY no configurada en el servidor" } },
      { status: 500 }
    );
  }

  console.log("[API /api/chat] Handler called, key length:", apiKey.length);

  let body: { contents: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Cuerpo de solicitud inválido" } },
      { status: 400 }
    );
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: body.contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if ([502, 504, 429].includes(response.status) && attempt < MAX_RETRIES) {
          const delay = 1500 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        return NextResponse.json(
          { error: errorData.error || { message: `Error en la API (${response.status})` } },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return NextResponse.json(
          { error: { message: "La solicitud a Gemini tardó demasiado" } },
          { status: 504 }
        );
      }

      if (attempt < MAX_RETRIES) {
        const delay = 1500 * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      return NextResponse.json(
        { error: { message: "Error al comunicarse con Gemini" } },
        { status: 502 }
      );
    }
  }
}

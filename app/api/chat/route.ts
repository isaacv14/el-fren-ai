import { NextRequest, NextResponse } from 'next/server';

const MODEL = "gemini-2.5-flash-lite";
const MAX_RETRIES = 3;

const MAX_CONTENTS_LENGTH = 50;
const MAX_TEXT_LENGTH = 5000;
const MAX_BODY_BYTES = 100_000;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: { message: "GEMINI_API_KEY no configurada en el servidor" } },
      { status: 500 }
    );
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: { message: "Cuerpo de solicitud demasiado grande" } },
      { status: 413 }
    );
  }

  let body: { contents?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Cuerpo de solicitud inválido" } },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.contents) || body.contents.length === 0) {
    return NextResponse.json(
      { error: { message: "Se requiere un array 'contents' con al menos un elemento" } },
      { status: 400 }
    );
  }

  if (body.contents.length > MAX_CONTENTS_LENGTH) {
    return NextResponse.json(
      { error: { message: `Demasiados mensajes. Máximo: ${MAX_CONTENTS_LENGTH}` } },
      { status: 400 }
    );
  }

  for (const item of body.contents) {
    if (!item || typeof item !== 'object') {
      return NextResponse.json(
        { error: { message: "Cada elemento de contents debe ser un objeto" } },
        { status: 400 }
      );
    }
    const parts = (item as { parts?: Array<{ text?: string }> }).parts;
    if (!Array.isArray(parts)) {
      return NextResponse.json(
        { error: { message: "Cada elemento de contents debe tener un array 'parts'" } },
        { status: 400 }
      );
    }
    for (const part of parts) {
      if (typeof part?.text !== 'string' || part.text.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          { error: { message: `Cada 'text' en parts debe ser un string de máximo ${MAX_TEXT_LENGTH} caracteres` } },
          { status: 400 }
        );
      }
    }
  }

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

        if ([502, 503, 504, 429].includes(response.status) && attempt < MAX_RETRIES) {
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

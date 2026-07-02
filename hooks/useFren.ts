import { useState, useEffect } from 'react';
import { FREN_SYSTEM_PROMPT } from '@/constants/prompts';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VeredictData {
  bachiller: string;
  confidence: number;
}

function extractVeredictData(reply: string): { cleaned: string; data: VeredictData | null } {
  const dataRegex = /\[DATA\](\{[\s\S]*?\})\[\/DATA\]/;
  const match = reply.match(dataRegex);

  if (!match) {
    return { cleaned: reply, data: null };
  }

  try {
    const parsed = JSON.parse(match[1]);
    if (
      typeof parsed.bachiller === 'string' &&
      typeof parsed.confidence === 'number' &&
      Number.isInteger(parsed.confidence) &&
      parsed.confidence >= 0 &&
      parsed.confidence <= 100
    ) {
      const cleaned = reply.replace(dataRegex, '').trim();
      return { cleaned, data: { bachiller: parsed.bachiller, confidence: parsed.confidence } };
    }
  } catch {
  }

  return { cleaned: reply, data: null };
}

async function recordVeredict(data: VeredictData) {
  try {
    const res = await fetch('/api/record-verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bachiller: data.bachiller,
        choice_confidence: data.confidence,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('Error recording verdict:', res.status, body);
    }
  } catch (e) {
    console.error('Error recording verdict:', e);
  }
}

export const useFren = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "¡Qué xopá! Soy El Fren, tu guía aquí en Pa'lante con el Saber. ¿Cómo te llamas, fren?" }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem("frenChatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Error parsing chat history", error);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("frenChatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = async (input: string) => {
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const contentsWithContext = [
      {
        role: 'user',
        parts: [{ text: `CONTEXTO DE TU ROL: ${FREN_SYSTEM_PROMPT}. RESPONDE A PARTIR DE AQUÍ.` }]
      },
      {
        role: 'model',
        parts: [{ text: "¡Ofi fren! Ya capté el flow. Soy El Fren y estoy listo para guiar a los muchachos de Pa'lante con el Saber. ¿Qué xopá?" }]
      },
      ...history
    ];

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: contentsWithContext })
      });

      if (!response.ok) {
        const rawText = await response.text().catch(() => "NO_SE_PUDO_LEER_TEXTO");
        console.error(`Status: ${response.status}, Body:`, rawText);
        let errorData: Record<string, unknown> = {};
        try { errorData = JSON.parse(rawText) } catch { /* not JSON */ }
        console.error("Detalle del error:", errorData);
        throw new Error(errorData?.error?.message || `Error en la API (${response.status})`);
      }

      const data = await response.json();
      const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Chuzo, se me fue la onda. ¿Me repites?";

      const { cleaned, data: veredictData } = extractVeredictData(rawReply);

      setMessages(prev => [...prev, { role: 'assistant', content: cleaned }]);

      if (veredictData) {
        recordVeredict(veredictData);
      }

    } catch (e) {
      console.error("Error en useFren:", e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Ey fren, algo pasó con la conexión. Dale de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};

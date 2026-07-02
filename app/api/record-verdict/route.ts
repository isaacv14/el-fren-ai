import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const BACHILLERES_VALIDOS = [
  'Ciencias',
  'Humanidades',
  'Comercio',
  'Turismo y Hotelería',
  'Agropecuario',
  'Informática',
];

const MAX_BODY_BYTES_RV = 10_000;

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES_RV) {
    return NextResponse.json(
      { error: 'Cuerpo de solicitud demasiado grande' },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();
    const { bachiller, choice_confidence } = body;

    if (!bachiller || typeof bachiller !== 'string') {
      return NextResponse.json(
        { error: 'El campo "bachiller" es requerido y debe ser un string' },
        { status: 400 }
      );
    }

    if (!BACHILLERES_VALIDOS.includes(bachiller)) {
      return NextResponse.json(
        { error: `"bachiller" debe ser uno de: ${BACHILLERES_VALIDOS.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof choice_confidence !== 'number' || !Number.isInteger(choice_confidence) || choice_confidence < 0 || choice_confidence > 100) {
      return NextResponse.json(
        { error: '"choice_confidence" debe ser un entero entre 0 y 100' },
        { status: 400 }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from('veredictos')
      .insert({ bachiller, choice_confidence })
      .select()
      .single();

    if (error) {
      console.error('Error inserting verdict into Supabase:', error);
      return NextResponse.json(
        { error: 'Error al guardar el veredicto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('Error in record-verdict:', e);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

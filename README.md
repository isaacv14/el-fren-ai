# El Fren AI

Chatbot de orientación vocacional para estudiantes panameños de 9° grado. Ayuda a elegir su bachillerato mediante conversaciones naturales con IA.

## Stack

| Tecnología | Versión |
|-----------|---------|
| Next.js | 16.1.6 (App Router) |
| React | 19.2.4 |
| TypeScript | 5.7.3 |
| Tailwind CSS | ^4.2.0 |
| Supabase | ^2.108.1 |
| Google Gemini | gemini-2.5-flash-lite |

## Estructura

```
el-fren-ai/
├── app/
│   ├── api/
│   │   ├── chat/route.ts            # Proxy a Gemini API
│   │   └── record-verdict/route.ts  # Guarda veredictos en Supabase
│   ├── globals.css                  # Estilos globales
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Página principal (chat)
│   ├── robots.ts                    # SEO
│   └── sitemap.ts                   # SEO
├── components/
│   └── Chat/
│       ├── FrenChat.css             # Estilos del chat
│       └── FrenChat.tsx             # Componente del chat
├── constants/
│   └── prompts.ts                   # System prompt de El Fren
├── hooks/
│   └── useFren.ts                   # Lógica del chat
├── lib/
│   ├── moderation.ts                # Filtro de malas palabras
│   ├── supabase.ts                  # Clientes Supabase
│   └── utils.ts                     # Utilidades (cn)
├── supabase/
│   └── migrations/
│       └── 00001_create_veredictos.sql
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```env
GEMINI_API_KEY=tu_api_key
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_public_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Scripts

```bash
pnpm install     # Instalar dependencias
pnpm dev         # Desarrollo (http://localhost:3000)
pnpm build       # Build de producción
pnpm start       # Servir build
```

## Base de datos (Supabase)

Ejecutar la migración en `supabase/migrations/00001_create_veredictos.sql`:

```sql
CREATE TABLE IF NOT EXISTS veredictos (
  id BIGSERIAL PRIMARY KEY,
  bachiller TEXT NOT NULL,
  choice_confidence INTEGER NOT NULL CHECK (choice_confidence >= 0 AND choice_confidence <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Despliegue

### Vercel

Conecta el repositorio y configura las variables de entorno.

### Subdominio

Apunta `chat.palanteconelsaber.site` a Vercel como dominio personalizado.

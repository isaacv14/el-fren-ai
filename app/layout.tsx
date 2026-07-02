import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'

export const metadata: Metadata = {
  title: "El Fren AI | Pa'lante Con El Saber",
  description: "El Fren AI es un chatbot desarrollado por el equipo de Pa'lante con el Saber que ayuda a jóvenes panameños a elegir su bachillerato. El chatbot utiliza inteligencia artificial para proporcionar información personalizada sobre las diferentes opciones de bachillerato disponibles en Panamá, ayudando a los estudiantes a tomar decisiones informadas sobre su futuro académico.",
  keywords: ["equipo Pa'lante Con El Saber", "jóvenes panameños", "Laboratorio Acción Ciudadana", "IA", "inteligencia artificial", "chatbot", "bachillerato", "educación en Panamá", "futuro académico"],
  openGraph: {
    title: "El Fren AI | Pa'lante Con El Saber",
    description: "El Fren AI es un chatbot desarrollado por el equipo de Pa'lante con el Saber que ayuda a jóvenes panameños a elegir su bachillerato.",
    url: "https://chat.palanteconelsaber.site",
    siteName: "El Fren AI",
    images: [{ url: "https://palanteconelsaber.site/logo-white.png" }],
    locale: "es_PA",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

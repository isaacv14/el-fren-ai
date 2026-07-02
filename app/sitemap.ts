import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://chat.palanteconelsaber.site',
      lastModified: new Date(),
      priority: 1,
    },
  ]
}

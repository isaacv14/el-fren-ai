import { Filter } from 'bad-words'

const filter = new Filter()

filter.addWords(
  'pendejo',
  'carajo',
  'hijueputa',
  'marica',
  'maricón',
  'guevón',
  'huevón',
  'verga',
  'picha',
  'coño',
  'cabrón',
  'puta',
  'puto',
  'mierda',
  'maldito',
  'baboso',
  'cono',
  'hpta',
  'culero',
  'chinga',
  'chingar',
  'chingado',
  'pendeja',
  'pendejas',
  'pendejos',
  'joder',
  'jodiendo',
  'jodido',
)

export function containsProfanity(text: string): boolean {
  return filter.isProfane(text)
}

export function cleanText(text: string): string {
  return filter.clean(text)
}

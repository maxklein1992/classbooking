// Voorbeeld-startcontent voor de Blog-tab.
//
// De blogs zijn SEO-vriendelijk opgezet:
//  - beschrijvende titel met relevante zoekwoorden
//  - eigen meta description per blog
//  - leesbare slug (met streepjes) op basis van de titel
//  - correcte heading-structuur: de titel is de enige h1 (op de detailpagina),
//    de body gebruikt h2/h3 via genummerde blokken
//  - alt-teksten bij afbeeldingen
//  - interne links waar relevant (zie `internalLink`)

export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export interface BlogImage {
  src: string
  /** Beschrijvende alt-tekst (verplicht voor SEO en toegankelijkheid). */
  alt: string
}

export interface BlogPost {
  /** Leesbare URL-slug, bijv. "5-tips-om-het-meeste-uit-je-training-te-halen". */
  slug: string
  title: string
  /** Meta description voor zoekmachines (± 150 tekens). */
  metaDescription: string
  /** Korte samenvatting in het overzicht. */
  excerpt: string
  author: string
  /** Publicatiedatum (ISO). */
  publishedAt: string
  readingMinutes: number
  image: BlogImage
  body: BlogBlock[]
  /** Optionele interne link (pad in de app) getoond onderaan de blog. */
  internalLink?: { to: string; label: string }
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: '5-tips-om-het-meeste-uit-je-training-te-halen',
    title: '5 tips om het meeste uit je training te halen',
    metaDescription:
      'Haal meer uit elke sportles met deze 5 praktische tips: van een goede warming-up en de juiste voeding tot herstel en het bijhouden van je progressie.',
    excerpt:
      'Van warming-up tot herstel: vijf praktische tips waarmee je elke training effectiever en leuker maakt.',
    author: 'Team Classo',
    publishedAt: '2026-06-30T09:00:00.000Z',
    readingMinutes: 4,
    image: {
      src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
      alt: 'Sporter doet een oefening in de sportschool tijdens een training',
    },
    body: [
      {
        type: 'p',
        text: 'Of je nu net begint of al jaren traint: met een paar slimme gewoontes haal je veel meer uit elke sessie. Deze vijf tips helpen je om vooruitgang te boeken én met plezier te blijven trainen.',
      },
      { type: 'h2', text: '1. Begin met een goede warming-up' },
      {
        type: 'p',
        text: 'Een warming-up van vijf tot tien minuten verhoogt je hartslag, maakt je spieren losser en verkleint de kans op blessures. Kies bewegingen die lijken op de training die je gaat doen.',
      },
      { type: 'h2', text: '2. Stel een concreet doel per training' },
      {
        type: 'p',
        text: 'Ga je voor kracht, conditie of techniek? Een helder doel houdt je gefocust en maakt het makkelijker om je progressie te meten.',
      },
      { type: 'h2', text: '3. Let op je voeding en hydratatie' },
      {
        type: 'p',
        text: 'Eet ongeveer een tot twee uur voor je training iets licht verteerbaars en drink voldoende water. Na afloop helpen eiwitten je spieren te herstellen.',
      },
      { type: 'h2', text: '4. Neem herstel serieus' },
      {
        type: 'p',
        text: 'Spieren groeien tijdens rust, niet tijdens de training zelf. Plan rustdagen in en zorg voor voldoende slaap.',
      },
      { type: 'h2', text: '5. Hou je vooruitgang bij' },
      {
        type: 'p',
        text: 'Noteer je oefeningen, gewichten en hoe je je voelde. Zo zie je zwart-op-wit dat je vooruitgaat — een enorme motivatieboost.',
      },
      { type: 'h3', text: 'Klaar om te beginnen?' },
      {
        type: 'p',
        text: 'Boek een training die bij je doel past en pas deze tips meteen toe.',
      },
    ],
    internalLink: { to: '/trainingen', label: 'Bekijk alle trainingen' },
  },
  {
    slug: 'hoe-kies-je-de-juiste-training-voor-jouw-doelen',
    title: 'Hoe kies je de juiste training voor jouw doelen?',
    metaDescription:
      'Boksen, yoga of HIIT? Ontdek in dit artikel hoe je de sporttraining kiest die past bij jouw doelen, niveau en agenda — met een handig stappenplan.',
    excerpt:
      'Boksen, yoga of HIIT? Zo kies je de training die past bij jouw doelen, niveau en agenda.',
    author: 'Team Classo',
    publishedAt: '2026-07-07T09:00:00.000Z',
    readingMinutes: 5,
    image: {
      src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      alt: 'Groep mensen doet een yogaoefening in een lichte studio',
    },
    body: [
      {
        type: 'p',
        text: 'Het aanbod aan sportlessen is groot, en dat maakt kiezen soms lastig. Met deze stappen vind je de training die echt bij jou past.',
      },
      { type: 'h2', text: 'Bepaal eerst je doel' },
      {
        type: 'p',
        text: 'Wil je afvallen, sterker worden, ontspannen of nieuwe mensen ontmoeten? Je doel bepaalt welk type training het meest geschikt is.',
      },
      { type: 'ul', items: ['Kracht en spieropbouw', 'Conditie en vetverbranding', 'Ontspanning en flexibiliteit', 'Plezier en sociaal contact'] },
      { type: 'h2', text: 'Kijk naar je niveau' },
      {
        type: 'p',
        text: 'Begin je net? Kies dan een les voor beginners waarin techniek centraal staat. Ervaren sporters kunnen juist op zoek naar meer intensiteit.',
      },
      { type: 'h2', text: 'Houd rekening met je agenda' },
      {
        type: 'p',
        text: 'De beste training is er één die je volhoudt. Kies lessen op tijden en locaties die makkelijk in je week passen.',
      },
      { type: 'h3', text: 'Twijfel je nog?' },
      {
        type: 'p',
        text: 'Probeer verschillende sporten uit. Veel mensen ontdekken pas na een paar proeflessen wat ze het leukste vinden.',
      },
    ],
    internalLink: { to: '/trainingen', label: 'Vind een training die bij je past' },
  },
  {
    slug: 'de-voordelen-van-regelmatig-sporten-in-groepsverband',
    title: 'De voordelen van regelmatig sporten in groepsverband',
    metaDescription:
      'Samen sporten motiveert. Lees over de voordelen van regelmatig trainen in groepsverband: meer motivatie, sociaal contact en betere resultaten.',
    excerpt:
      'Samen sporten motiveert en houdt je scherp. Ontdek waarom groepstrainingen zo goed werken.',
    author: 'Team Classo',
    publishedAt: '2026-07-14T09:00:00.000Z',
    readingMinutes: 4,
    image: {
      src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
      alt: 'Groep sporters doet samen een work-out in een groepsles',
    },
    body: [
      {
        type: 'p',
        text: 'In je eentje trainen kan prima, maar samen sporten heeft unieke voordelen. Groepstrainingen combineren beweging met sociaal contact en een flinke dosis motivatie.',
      },
      { type: 'h2', text: 'Meer motivatie en discipline' },
      {
        type: 'p',
        text: 'Een vast groepsmoment maakt het makkelijker om te blijven komen. Je laat je groepsgenoten niet graag in de steek — en dat werkt.',
      },
      { type: 'h2', text: 'Sociaal contact en plezier' },
      {
        type: 'p',
        text: 'Samen zweten schept een band. Groepslessen zijn een leuke manier om nieuwe mensen te leren kennen met dezelfde interesse.',
      },
      { type: 'h2', text: 'Leren van elkaar' },
      {
        type: 'p',
        text: 'In een groep zie je hoe anderen oefeningen uitvoeren en krijg je feedback van de trainer. Zo verbeter je sneller je techniek.',
      },
      { type: 'h3', text: 'Zelf ervaren?' },
      {
        type: 'p',
        text: 'Boek een groepstraining bij jou in de buurt en merk het verschil.',
      },
    ],
    internalLink: { to: '/trainingen', label: 'Ontdek groepstrainingen' },
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

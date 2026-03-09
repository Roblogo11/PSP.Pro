export function JsonLdSchema() {
  const sportsOrganization = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: 'PSP.Pro - ProPer Sports Performance',
    description:
      'Elite softball, basketball, and soccer training based in Chesapeake, VA. Serving Virginia Beach, Norfolk, Portsmouth, Suffolk & all of Hampton Roads.',
    url: 'https://propersports.pro',
    logo: 'https://propersports.pro/images/PSP-black-300x99-1.webp',
    image: 'https://propersports.pro/images/PSP-black-300x99-1.webp',
    email: 'propersportsperformance@gmail.com',
    telephone: '+17573772089',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chesapeake',
      addressRegion: 'VA',
      addressCountry: 'US',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Chesapeake',
        sameAs: 'https://en.wikipedia.org/wiki/Chesapeake,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Virginia Beach',
        sameAs: 'https://en.wikipedia.org/wiki/Virginia_Beach,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Norfolk',
        sameAs: 'https://en.wikipedia.org/wiki/Norfolk,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Portsmouth',
        sameAs: 'https://en.wikipedia.org/wiki/Portsmouth,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Suffolk',
        sameAs: 'https://en.wikipedia.org/wiki/Suffolk,_Virginia',
      },
    ],
    sport: ['Softball', 'Basketball', 'Soccer'],
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '15:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ProPer Sports Performance',
    alternateName: 'PSP.Pro',
    url: 'https://propersports.pro',
    logo: 'https://propersports.pro/images/PSP-black-300x99-1.webp',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@propersports.pro',
      contactType: 'customer service',
      areaServed: ['US'],
      availableLanguage: ['English'],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  )
}

export function JsonLdSchema() {
  const professionalService = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'ShockAI - AI-Native Creative Studio',
    description:
      'AI-powered video production, web development, drone photography, podcast production, and creative services serving Norfolk, Virginia Beach, and the 757 area.',
    url: 'https://shockai.io',
    logo: 'https://shockai.io/logo.png',
    image: 'https://shockai.io/og-image.jpg',
    email: 'shockmediapr@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Norfolk',
      addressRegion: 'VA',
      postalCode: '23510',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.8508,
      longitude: -76.2859,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Norfolk',
        sameAs: 'https://en.wikipedia.org/wiki/Norfolk,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Virginia Beach',
        sameAs: 'https://en.wikipedia.org/wiki/Virginia_Beach,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Chesapeake',
        sameAs: 'https://en.wikipedia.org/wiki/Chesapeake,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Hampton',
        sameAs: 'https://en.wikipedia.org/wiki/Hampton,_Virginia',
      },
      {
        '@type': 'City',
        name: 'Newport News',
        sameAs: 'https://en.wikipedia.org/wiki/Newport_News,_Virginia',
      },
    ],
    serviceType: [
      'Video Production',
      'Web Development',
      'Drone Photography',
      'Podcast Production',
      'SEO Services',
      'Motion Graphics',
      'Photography',
      'Social Media Content',
    ],
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      'https://www.instagram.com/shockmp/',
      'https://www.linkedin.com/in/shock-media-productions-6762a02b6/',
      'https://www.youtube.com/@ShockMediaProductions',
      'https://www.tiktok.com/@shockmp',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Creative Services',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Video Production',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Video Production Norfolk VA',
                description: '4K cinematography and video production services in Norfolk and Virginia Beach',
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Web Development',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Website Design Norfolk VA',
                description: 'AI-powered web development and design services for Hampton Roads businesses',
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Drone Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Drone Photography Virginia Beach',
                description: 'Professional aerial photography and videography in the 757 area',
              },
            },
          ],
        },
      ],
    },
  }

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://shockai.io',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Video Production',
        item: 'https://shockai.io/video',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'The Shock Kit',
        item: 'https://shockai.io/shock-kit',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Website Help',
        item: 'https://shockai.io/website-help',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Get Started',
        item: 'https://shockai.io/get-started',
      },
    ],
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ShockAI',
    alternateName: 'Shock Media Productions',
    url: 'https://shockai.io',
    logo: 'https://shockai.io/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'shockmediapr@gmail.com',
      contactType: 'customer service',
      areaServed: ['US'],
      availableLanguage: ['English'],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  )
}

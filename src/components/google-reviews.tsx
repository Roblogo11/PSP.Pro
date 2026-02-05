'use client'

import { Star, ExternalLink } from 'lucide-react'

interface GoogleReview {
  id: number
  name: string
  rating: number
  text: string
  date: string
}

// Real Google Reviews - Update these with actual review content from:
// https://maps.app.goo.gl/srkPoakrXFVnKCLNA
// https://maps.app.goo.gl/ofdV6AJtbcZxrrC66
// https://maps.app.goo.gl/6HUd5tb4XRq62T54A
// https://maps.app.goo.gl/4NfaaweLWwjAoCih8
// https://maps.app.goo.gl/ZRnL5kUVW4z8ry8U7
// https://maps.app.goo.gl/VKJsPW36d8RnJFw46
const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 1,
    name: 'Review 1',
    rating: 5,
    text: 'Visit the link above to get the actual review text and update this placeholder.',
    date: 'Month Year',
  },
  {
    id: 2,
    name: 'Review 2',
    rating: 5,
    text: 'Visit the link above to get the actual review text and update this placeholder.',
    date: 'Month Year',
  },
  {
    id: 3,
    name: 'Review 3',
    rating: 5,
    text: 'Visit the link above to get the actual review text and update this placeholder.',
    date: 'Month Year',
  },
  {
    id: 4,
    name: 'Review 4',
    rating: 5,
    text: 'Visit the link above to get the actual review text and update this placeholder.',
    date: 'Month Year',
  },
  {
    id: 5,
    name: 'Review 5',
    rating: 5,
    text: 'Visit the link above to get the actual review text and update this placeholder.',
    date: 'Month Year',
  },
  {
    id: 6,
    name: 'Review 6',
    rating: 5,
    text: 'Visit the link above to get the actual review text and update this placeholder.',
    date: 'Month Year',
  },
]

export function GoogleReviews() {
  // This component embeds Google Reviews
  // The actual widget will be loaded from Google's servers

  const GOOGLE_PLACE_ID = 'ChIJIdBGDlys3IkRZKrff9aZyZE' // Replace with actual Place ID
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full mb-4">
            <Star className="w-4 h-4 text-orange fill-orange" />
            <span className="text-sm font-semibold text-orange">Google Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            What Our <span className="text-gradient-orange">Athletes Say</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
            Real reviews from real athletes training at PSP.Pro
          </p>

          {/* Google Rating Summary */}
          <div className="flex items-center justify-center gap-6 text-center">
            <div className="command-panel p-6 inline-block">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-bold text-white">5.0</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-6 h-6 fill-orange text-orange" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-400">Based on 50+ Google reviews</p>
              <a
                href="https://www.google.com/maps/place/ProPer+Sports+Performance+LLC"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan hover:text-cyan-400 text-sm mt-2 font-semibold"
              >
                <span>View all reviews</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Google Reviews Widget Embed */}
        <div className="command-panel p-6">
          <div className="text-center">
            <p className="text-slate-400 mb-6">
              See what our athletes and parents are saying on Google
            </p>

            {/* Featured Reviews */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GOOGLE_REVIEWS.map((review) => (
                <div key={review.id} className="glass-card-hover p-6">
                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan to-orange flex items-center justify-center text-white font-bold text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{review.name}</h4>
                      <p className="text-xs text-slate-400">{review.date}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-orange text-orange'
                            : 'fill-slate-600 text-slate-600'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-slate-500 mt-8">
              These are real reviews from our Google Business profile
            </p>

            {/* Direct link to leave a review */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Trained with us?</h3>
              <p className="text-slate-400 mb-4">Share your experience and help other athletes find us!</p>
              <a
                href="https://g.page/r/CWTqn2_9mpyREBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                <span>Leave a Google Review</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

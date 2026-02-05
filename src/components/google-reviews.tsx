'use client'

import { Star, ExternalLink } from 'lucide-react'

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

            {/* Option 1: Elfsight Widget (Recommended - Easy Setup) */}
            {/*
            To use Elfsight Google Reviews Widget:
            1. Go to https://elfsight.com/google-reviews-widget/
            2. Create a widget for your Google Business
            3. Copy the embed code and replace the div below
            */}
            <div className="rounded-xl overflow-hidden bg-white/5 p-8">
              <p className="text-slate-500 text-sm mb-4">
                📝 Setup Instructions:
              </p>
              <div className="text-left text-slate-400 text-sm space-y-2 max-w-2xl mx-auto">
                <p><strong className="text-white">Option 1 - Elfsight Widget (Easiest):</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Visit <a href="https://elfsight.com/google-reviews-widget/" target="_blank" className="text-cyan hover:underline">Elfsight Google Reviews</a></li>
                  <li>Connect your Google Business account</li>
                  <li>Customize the widget design to match PSP.Pro colors</li>
                  <li>Copy the embed code and add it here</li>
                </ol>

                <p className="pt-4"><strong className="text-white">Option 2 - Manual Embed:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Get your Google Place ID from Google Maps</li>
                  <li>Use Google Places API to fetch reviews</li>
                  <li>Display reviews in custom cards below</li>
                </ol>
              </div>
            </div>

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

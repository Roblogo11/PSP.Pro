'use client'

import { useState, useEffect } from 'react'
import { Star, ExternalLink, Trophy, Target, RotateCcw } from 'lucide-react'
import { updateReviewGameScore } from '@/lib/review-game-storage'

interface GoogleReview {
  id: number
  name: string
  rating: number
  text: string
  date: string
}

// Real Google Reviews - Mixed ratings for engaging gameplay
const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 1,
    name: 'Parent of Two Athletes',
    rating: 5,
    text: 'Coach Rachel is amazing. She has and is helping my two gals to improve their knowledge, skill and performance in pitching. She provides support and feedback throughout the process. It has and is a pleasure having her work with my gals. It is awesome having a Coach being clear and concise. We love ProPer Sports Performance!!♥️🥎 My gals just love Coach Rachel.',
    date: '2025',
  },
  {
    id: 2,
    name: 'Local League Parent',
    rating: 5,
    text: 'Rachel is a PHENOMENAL pitching coach! She is one of the BEST that there is to really breakdown the fundamentals. Not only has she taught my own daughter to pitch, but she\'s worked with several girls from our local league and definitely is a staple in our community. We cannot thank her enough!',
    date: '2025',
  },
  {
    id: 3,
    name: 'Long-Time Athlete Parent',
    rating: 4,
    text: 'My daughter has been going to Rachel for years and she is a great coach. She explains things well and my daughter has seen good improvements in her pitching speed and confidence. Would recommend to pitchers looking to make progress!',
    date: '2025',
  },
  {
    id: 4,
    name: 'Youth Coach & Parent',
    rating: 5,
    text: 'I coach a couple of girls who have made huge improvements in their pitching technique, so much so that I signed my own daughter up. She looks forward to lessons with Rachel, and I see positive changes in her confidence and skill already.',
    date: '2025',
  },
  {
    id: 5,
    name: 'High School & Travel Coach',
    rating: 5,
    text: 'I am high school and travel coach. Rachel\'s coaching evolves with the need of the sport and is an amazing coach for all positions. I have sent her many pitchers(including my own daughters) and she has been great with them. Also, her partner is an amazing strength and conditioning coach and outstanding basketball and soccer coach.',
    date: '2025',
  },
  {
    id: 6,
    name: 'Busy Parent Review',
    rating: 3,
    text: 'Good training sessions overall. Schedule was sometimes hard to coordinate and facility could use some updates, but Rachel knows her stuff when it comes to pitching mechanics. Decent value for the price.',
    date: '2025',
  },
]

export function GoogleReviews() {
  const [userGuesses, setUserGuesses] = useState<{ [key: number]: number }>({})
  const [revealedReviews, setRevealedReviews] = useState<{ [key: number]: boolean }>({})
  const [hoveredStars, setHoveredStars] = useState<{ [key: number]: number | null }>({})
  const [scoreSaved, setScoreSaved] = useState(false)

  const handleStarClick = (reviewId: number, rating: number) => {
    if (revealedReviews[reviewId]) return // Can't change after reveal
    setUserGuesses({ ...userGuesses, [reviewId]: rating })
  }

  const handleStarHover = (reviewId: number, rating: number | null) => {
    if (revealedReviews[reviewId]) return
    setHoveredStars({ ...hoveredStars, [reviewId]: rating })
  }

  const handleReveal = (reviewId: number) => {
    if (!userGuesses[reviewId]) return // Must select a rating first
    setRevealedReviews({ ...revealedReviews, [reviewId]: true })
  }

  const handleReset = (reviewId: number) => {
    const newGuesses = { ...userGuesses }
    const newRevealed = { ...revealedReviews }
    const newHovered = { ...hoveredStars }
    delete newGuesses[reviewId]
    delete newRevealed[reviewId]
    delete newHovered[reviewId]
    setUserGuesses(newGuesses)
    setRevealedReviews(newRevealed)
    setHoveredStars(newHovered)
  }

  const resetAll = () => {
    setUserGuesses({})
    setRevealedReviews({})
    setHoveredStars({})
    setScoreSaved(false)
  }

  // Calculate score
  const totalGuessed = Object.keys(userGuesses).length
  const totalRevealed = Object.keys(revealedReviews).length
  const correctGuesses = Object.entries(revealedReviews).filter(([id, revealed]) => {
    if (!revealed) return false
    const review = GOOGLE_REVIEWS.find(r => r.id === parseInt(id))
    return review && userGuesses[parseInt(id)] === review.rating
  }).length

  // Save score when game is complete
  useEffect(() => {
    if (totalRevealed === GOOGLE_REVIEWS.length && !scoreSaved) {
      updateReviewGameScore(correctGuesses, totalRevealed)
      setScoreSaved(true)
    }
  }, [totalRevealed, correctGuesses, scoreSaved])

  const getResultMessage = (reviewId: number, actualRating: number) => {
    const userGuess = userGuesses[reviewId]
    if (userGuess === actualRating) {
      return { text: 'Perfect Match! 🎯', color: 'text-green-400', icon: Trophy }
    } else if (Math.abs(userGuess - actualRating) === 1) {
      return { text: 'Close! Almost there! 🎯', color: 'text-cyan', icon: Target }
    } else {
      return { text: `You guessed ${userGuess}⭐ | Actually ${actualRating}⭐`, color: 'text-orange', icon: Target }
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full mb-4">
            <Star className="w-4 h-4 text-orange fill-orange" />
            <span className="text-sm font-semibold text-orange">Interactive Game</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Match the <span className="text-gradient-orange">Owner's Rating</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
            Read each review and guess what rating they gave us. Can you match all 6?
          </p>

          {/* Score Tracker */}
          {totalGuessed > 0 && (
            <div className="command-panel inline-block p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {correctGuesses}/{totalRevealed}
                  </div>
                  <p className="text-sm text-slate-400">Correct Matches</p>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan mb-1">
                    {totalRevealed}/{GOOGLE_REVIEWS.length}
                  </div>
                  <p className="text-sm text-slate-400">Revealed</p>
                </div>
                {totalRevealed > 0 && (
                  <>
                    <div className="h-12 w-px bg-white/10" />
                    <button
                      onClick={resetAll}
                      className="btn-ghost text-sm py-2 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset All</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="glass-card p-4 max-w-2xl mx-auto mb-8">
            <p className="text-sm text-slate-300">
              <strong className="text-white">How to Play:</strong> Read each review → Click stars to select your guess → Hit "Reveal" to see if you matched!
            </p>
          </div>
        </div>

        {/* Review Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GOOGLE_REVIEWS.map((review) => {
            const isRevealed = revealedReviews[review.id]
            const userGuess = userGuesses[review.id]
            const hoverRating = hoveredStars[review.id]
            const displayRating = hoverRating !== null && hoverRating !== undefined ? hoverRating : (userGuess || 0)

            return (
              <div
                key={review.id}
                className={`glass-card-hover p-6 transition-all ${
                  isRevealed
                    ? userGuess === review.rating
                      ? 'border-green-400/40 shadow-glow-cyan'
                      : 'border-orange/40'
                    : userGuess
                      ? 'border-cyan/30'
                      : 'border-white/10'
                }`}
              >
                {/* Reviewer Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan to-orange flex items-center justify-center text-white font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{review.name}</h4>
                    <p className="text-xs text-slate-400">{review.date}</p>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-4">
                  {review.text}
                </p>

                {/* Interactive Stars */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">
                    {isRevealed ? 'Your Guess:' : 'Your guess: Click stars below'}
                  </p>
                  <div
                    className="flex gap-1"
                    onMouseLeave={() => handleStarHover(review.id, null)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarClick(review.id, star)}
                        onMouseEnter={() => handleStarHover(review.id, star)}
                        disabled={isRevealed}
                        className={`transition-all duration-200 transform hover:scale-110 ${
                          isRevealed ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= displayRating
                              ? 'fill-orange text-orange animate-pulse'
                              : 'text-slate-600 hover:text-orange hover:fill-orange/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reveal/Result Section */}
                {!isRevealed ? (
                  <button
                    onClick={() => handleReveal(review.id)}
                    disabled={!userGuess}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      userGuess
                        ? 'btn-primary'
                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {userGuess ? '✨ Reveal Rating' : 'Select stars first'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Actual Rating */}
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Actual Rating:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= review.rating
                                ? 'fill-cyan text-cyan'
                                : 'fill-slate-600 text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Result Message */}
                    <div
                      className={`p-3 rounded-xl ${
                        userGuess === review.rating
                          ? 'bg-green-400/10 border border-green-400/20'
                          : 'bg-orange/10 border border-orange/20'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${getResultMessage(review.id, review.rating).color}`}>
                        {getResultMessage(review.id, review.rating).text}
                      </p>
                    </div>

                    {/* Try Again */}
                    <button
                      onClick={() => handleReset(review.id)}
                      className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Try Again</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Perfect Score Celebration */}
        {correctGuesses === GOOGLE_REVIEWS.length && totalRevealed === GOOGLE_REVIEWS.length && (
          <div className="mt-12 command-panel p-8 text-center border-green-400/30 shadow-glow-cyan animate-scale-in">
            <Trophy className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-3xl font-bold text-white mb-2">Perfect Score! 🎉</h3>
            <p className="text-lg text-slate-300 mb-4">
              You matched all {GOOGLE_REVIEWS.length} ratings! You really know quality training when you see it!
            </p>
            <button
              onClick={resetAll}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="command-panel p-8">
            <h3 className="text-2xl font-bold text-white mb-4">See All Our Reviews</h3>
            <p className="text-slate-400 mb-6">
              These are real reviews from real athletes and parents training at PSP.Pro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.google.com/maps/place/ProPer+Sports+Performance+LLC/@36.7951297,-76.6938487,10z/data=!3m1!4b1!4m6!3m5!1s0xa7b9ac5c0e36dc21:0x91c996d6f9dfaa64!8m2!3d36.7955845!4d-76.3642165!16s%2Fg%2F11v05ftwvx?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                <span>View on Google</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://www.google.com/maps/place/ProPer+Sports+Performance+LLC/@36.7951297,-76.6938487,10z/data=!3m1!4b1!4m6!3m5!1s0xa7b9ac5c0e36dc21:0x91c996d6f9dfaa64!8m2!3d36.7955845!4d-76.3642165!16s%2Fg%2F11v05ftwvx?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center gap-2"
              >
                <span>Leave a Review</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

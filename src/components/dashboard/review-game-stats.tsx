'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Trophy, Target, TrendingUp, Play } from 'lucide-react'
import {
  getReviewGameScore,
  getReviewGameRank,
  type ReviewGameScore,
} from '@/lib/review-game-storage'

export function ReviewGameStats() {
  const [score, setScore] = useState<ReviewGameScore | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setScore(getReviewGameScore())

    const handleStorageChange = () => {
      setScore(getReviewGameScore())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (!mounted || !score) {
    return null
  }

  if (score.totalAttempts === 0) {
    return (
      <Link href="/#reviews">
        <div className="command-panel p-6 hover:border-orange/40 transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange/10 rounded-xl group-hover:shadow-glow-orange transition-all">
              <Star className="w-6 h-6 text-orange" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange transition-colors">
                Review Rating Game
              </h3>
              <p className="text-sm text-cyan-700 dark:text-white">Not played yet</p>
            </div>
          </div>
          <p className="text-sm text-cyan-700 dark:text-white mb-4">
            Test your skills! Can you match the owner&apos;s rating for each review?
          </p>
          <div className="flex items-center gap-2 text-cyan font-semibold">
            <Play className="w-4 h-4" />
            <span>Play Now</span>
          </div>
        </div>
      </Link>
    )
  }

  const rank = getReviewGameRank(score.accuracy)

  return (
    <div className="command-panel p-6 border-orange/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange/10 rounded-xl shadow-glow-orange">
            <Star className="w-6 h-6 text-orange" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Rating Game</h3>
            <p className="text-sm text-cyan-700 dark:text-white">Your performance stats</p>
          </div>
        </div>

        <Link href="/#reviews">
          <button className="btn-ghost text-sm py-2 px-4">
            Play Again
          </button>
        </Link>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-br from-orange/10 to-orange/5 border border-orange/20 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{rank.icon}</span>
          <div>
            <p className="text-xs text-cyan-700 dark:text-white mb-1">Your Rank</p>
            <p className="text-xl font-bold" style={{ color: rank.color }}>
              {rank.rank}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-cyan-50/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-cyan" />
            <p className="text-xs text-cyan-700 dark:text-white">Accuracy</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{score.accuracy}%</p>
        </div>

        <div className="p-4 bg-cyan-50/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-green-400" />
            <p className="text-xs text-cyan-700 dark:text-white">Perfect Games</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{score.perfectGames}</p>
        </div>

        <div className="p-4 bg-cyan-50/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange" />
            <p className="text-xs text-cyan-700 dark:text-white">Best Streak</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{score.bestStreak}/6</p>
        </div>

        <div className="p-4 bg-cyan-50/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-cyan-700 dark:text-white">Total Correct</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {score.correctGuesses}/{score.totalAttempts}
          </p>
        </div>
      </div>

      {score.accuracy < 90 && (
        <div className="p-3 bg-cyan/10 border border-cyan/20 rounded-xl">
          <p className="text-xs text-cyan">
            {score.accuracy < 50
              ? '💡 Tip: Read reviews carefully to guess the rating!'
              : score.accuracy < 75
                ? '🎯 Getting better! You&apos;re learning what quality looks like!'
                : '⭐ Almost there! Master Scout rank at 90% accuracy!'}
          </p>
        </div>
      )}

      {score.perfectGames > 0 && (
        <div className="mt-4 p-3 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center gap-2">
          <Trophy className="w-4 h-4 text-green-400" />
          <p className="text-xs text-green-400 font-semibold">
            {score.perfectGames === 1
              ? 'You&apos;ve scored a perfect game! 🎉'
              : `${score.perfectGames} perfect games! You&apos;re a rating master! 🏆`}
          </p>
        </div>
      )}
    </div>
  )
}

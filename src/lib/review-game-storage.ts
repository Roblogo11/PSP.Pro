/**
 * Review Game Score Storage
 * Manages local storage and statistics for the Google Reviews rating game
 */

export interface ReviewGameScore {
  totalAttempts: number
  correctGuesses: number
  perfectGames: number // All 6 correct
  bestStreak: number // Consecutive correct guesses
  lastPlayed: string
  accuracy: number // percentage
}

const STORAGE_KEY = 'psp_review_game_score'

export function getReviewGameScore(): ReviewGameScore {
  if (typeof window === 'undefined') {
    return getDefaultScore()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getDefaultScore()
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error reading review game score:', error)
    return getDefaultScore()
  }
}

export function updateReviewGameScore(
  correctCount: number,
  totalRevealed: number
): ReviewGameScore {
  const currentScore = getReviewGameScore()

  const isPerfectGame = correctCount === 6 && totalRevealed === 6

  const newScore: ReviewGameScore = {
    totalAttempts: currentScore.totalAttempts + totalRevealed,
    correctGuesses: currentScore.correctGuesses + correctCount,
    perfectGames: currentScore.perfectGames + (isPerfectGame ? 1 : 0),
    bestStreak: Math.max(currentScore.bestStreak, correctCount),
    lastPlayed: new Date().toISOString(),
    accuracy: 0, // Will be calculated below
  }

  // Calculate accuracy percentage
  newScore.accuracy =
    newScore.totalAttempts > 0
      ? Math.round((newScore.correctGuesses / newScore.totalAttempts) * 100)
      : 0

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScore))
  } catch (error) {
    console.error('Error saving review game score:', error)
  }

  return newScore
}

export function resetReviewGameScore(): ReviewGameScore {
  const defaultScore = getDefaultScore()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultScore))
  } catch (error) {
    console.error('Error resetting review game score:', error)
  }
  return defaultScore
}

function getDefaultScore(): ReviewGameScore {
  return {
    totalAttempts: 0,
    correctGuesses: 0,
    perfectGames: 0,
    bestStreak: 0,
    lastPlayed: '',
    accuracy: 0,
  }
}

// Rank system based on accuracy
export function getReviewGameRank(accuracy: number): {
  rank: string
  color: string
  icon: string
} {
  if (accuracy >= 90) {
    return { rank: 'Master Scout', color: '#FFD700', icon: '🏆' }
  } else if (accuracy >= 75) {
    return { rank: 'Expert Evaluator', color: '#00B4D8', icon: '⭐' }
  } else if (accuracy >= 60) {
    return { rank: 'Skilled Rater', color: '#10B981', icon: '✓' }
  } else if (accuracy >= 40) {
    return { rank: 'Learning Judge', color: '#F59E0B', icon: '📊' }
  } else {
    return { rank: 'Rookie Rater', color: '#6B7280', icon: '🎯' }
  }
}

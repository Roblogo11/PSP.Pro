'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface NextSessionCardProps {
  sessionDate: Date
  location?: string
  type?: string
}

export function NextSessionCard({
  sessionDate,
  location = 'PSP Training Center',
  type = 'Speed & Mechanics',
}: NextSessionCardProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = sessionDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [sessionDate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="command-panel-active col-span-full lg:col-span-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Next Session</h3>
          <p className="text-sm text-cyan-700 dark:text-white">{type}</p>
        </div>
        <div className="w-12 h-12 bg-orange/20 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-orange" />
        </div>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Sec', value: timeLeft.seconds },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 text-center"
          >
            <div className="text-2xl md:text-3xl font-bold text-gradient-orange mb-1">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-cyan-700 dark:text-white uppercase tracking-wider">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Session Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-orange" />
          <span className="text-cyan-700 dark:text-white">
            {sessionDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-orange" />
          <span className="text-cyan-700 dark:text-white">{location}</span>
        </div>
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary w-full mt-6"
      >
        View Session Details
      </motion.button>
    </motion.div>
  )
}

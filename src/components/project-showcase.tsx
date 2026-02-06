'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Play, X, ExternalLink } from 'lucide-react'
import { Project, ServiceType } from '@/data/projects'

interface ProjectShowcaseProps {
  projects: Project[]
  serviceType?: ServiceType
  title?: string
  showFilters?: boolean
}

const springConfig = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfig,
  },
}

export function ProjectShowcase({
  projects,
  serviceType,
  title,
  showFilters = true
}: ProjectShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Extract unique neighborhoods for filtering
  const neighborhoods = [...new Set(projects.map(p => p.location.neighborhood))]

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.location.neighborhood === activeFilter)

  return (
    <section className="relative py-16">
      {/* Section Header with SEO-optimized title */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springConfig}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title || `${serviceType ? serviceType.charAt(0).toUpperCase() + serviceType.slice(1) : ''} Projects`}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Featured work from Norfolk, Virginia Beach & Chesapeake
          </p>
        </motion.div>

        {/* Neighborhood Filters */}
        {showFilters && neighborhoods.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springConfig, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            <FilterButton
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            >
              All Locations
            </FilterButton>
            {neighborhoods.map(hood => (
              <FilterButton
                key={hood}
                active={activeFilter === hood}
                onClick={() => setActiveFilter(hood)}
              >
                {hood}
              </FilterButton>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function FilterButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
          : 'bg-dark-100/80 text-gray-400 hover:text-white hover:bg-dark-100 border border-cyan-200/40'
      }`}
    >
      {children}
    </motion.button>
  )
}

function ProjectCard({
  project,
  index,
  onClick
}: {
  project: Project
  index: number
  onClick: () => void
}) {
  const isFeatured = project.featured && index === 0

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={`group relative cursor-pointer rounded-2xl overflow-hidden ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Glass Card */}
      <div className="relative h-full min-h-[300px] bg-dark-100/60 backdrop-blur-xl border border-cyan-200/40 hover:border-secondary/40 transition-all duration-500 rounded-2xl overflow-hidden">
        {/* Media */}
        <div className="absolute inset-0">
          <Image
            src={project.mediaUrl}
            alt={`${project.title} - ${project.location.neighborhood}, ${project.location.city}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized={project.mediaType === 'gif'}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6">
          {/* Location Badge - SEO optimized h3 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-medium backdrop-blur-sm">
              <MapPin className="w-3 h-3" />
              <h3 className="inline">{project.location.neighborhood}, {project.location.city}</h3>
            </span>
            {project.featured && (
              <span className="px-2 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-medium">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-secondary transition-colors">
            {project.title}
          </h4>

          {/* Client & Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{project.client}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {project.description}
          </p>

          {/* Tags */}
          {project.tags && (
            <div className="flex flex-wrap gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {project.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-white/10 text-gray-600 dark:text-gray-300 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Play indicator for video/gif */}
          {(project.mediaType === 'video' || project.mediaType === 'gif') && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
              >
                <Play className="w-6 h-6 text-white ml-1" fill="white" />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function ProjectModal({
  project,
  onClose
}: {
  project: Project
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-400/95 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={springConfig}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-3xl bg-dark-100/90 backdrop-blur-2xl border border-cyan-200/40 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-dark-300/80 hover:bg-dark-300 border border-cyan-200/40 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media */}
        <div className="relative aspect-video">
          <Image
            src={project.mediaUrl}
            alt={project.title}
            fill
            className="object-cover"
            unoptimized={project.mediaType === 'gif'}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Location - SEO h2 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <h2 className="inline">{project.location.neighborhood}, {project.location.city}</h2>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-medium capitalize">
              {project.serviceType}
            </span>
          </div>

          <h3 className="text-3xl font-bold text-white mb-2">{project.title}</h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{project.client}</p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{project.description}</p>

          {/* Tags */}
          {project.tags && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/10 text-gray-600 dark:text-gray-300 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <a
            href={`mailto:shockmediapr@gmail.com?subject=Project%20Inquiry:%20${encodeURIComponent(project.title)}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-accent text-white font-semibold hover:scale-105 transition-transform"
          >
            <ExternalLink className="w-4 h-4" />
            Start a Similar Project
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

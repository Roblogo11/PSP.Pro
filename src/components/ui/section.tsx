import { HTMLAttributes } from 'react'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  noPadding?: boolean
}

export function Section({
  children,
  className = '',
  noPadding = false,
  ...props
}: SectionProps) {
  return (
    <section
      className={`relative ${noPadding ? '' : 'py-20 lg:py-32'} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

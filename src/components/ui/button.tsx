import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-secondary hover:bg-secondary-600 text-white shadow-glow-sm hover:shadow-glow-md focus:ring-secondary',
      secondary: 'bg-accent hover:bg-accent-600 text-white shadow-glow-accent-sm hover:shadow-glow-accent-md focus:ring-accent',
      outline: 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary',
    }

    // Touch-friendly sizes (44px minimum for accessibility)
    const sizes = {
      sm: 'px-4 py-2.5 text-sm rounded-md min-h-[44px] min-w-[44px]',
      md: 'px-6 py-3 text-base rounded-lg min-h-[44px]',
      lg: 'px-8 py-4 text-lg rounded-xl min-h-[48px]',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

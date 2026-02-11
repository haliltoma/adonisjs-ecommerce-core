import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

function FormSection({ title, description, children, className, actions }: FormSectionProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  description?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

function FormField({
  label,
  htmlFor,
  error,
  description,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

export { FormSection, FormField }
export type { FormSectionProps, FormFieldProps }

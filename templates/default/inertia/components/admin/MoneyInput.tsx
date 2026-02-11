import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MoneyInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  currency?: string
  locale?: string
}

function MoneyInput({
  value,
  onChange,
  currency = 'USD',
  locale = 'en-US',
  className,
  ...props
}: MoneyInputProps) {
  const [display, setDisplay] = React.useState('')

  const symbol = React.useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value || currency
    } catch {
      return currency
    }
  }, [currency, locale])

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplay(value.toFixed(2))
    } else {
      setDisplay('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')

    // Only allow one decimal point
    const parts = raw.split('.')
    const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw

    // Limit to 2 decimal places
    const decimal = cleaned.split('.')
    if (decimal[1] && decimal[1].length > 2) return

    setDisplay(cleaned)
    const num = parseFloat(cleaned)
    if (!isNaN(num)) {
      onChange?.(num)
    } else if (cleaned === '' || cleaned === '.') {
      onChange?.(0)
    }
  }

  const handleBlur = () => {
    if (display === '' || display === '.') {
      setDisplay('0.00')
      onChange?.(0)
    } else {
      const num = parseFloat(display)
      if (!isNaN(num)) {
        setDisplay(num.toFixed(2))
      }
    }
  }

  return (
    <div className="relative">
      <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">
        {symbol}
      </span>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn('pl-8 text-right tabular-nums', className)}
      />
    </div>
  )
}

export { MoneyInput }
export type { MoneyInputProps }

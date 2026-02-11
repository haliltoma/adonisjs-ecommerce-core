import * as React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const COLORS = [
  'var(--color-primary, #3b82f6)',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
]

interface ChartProps {
  type: 'line' | 'bar' | 'area' | 'pie'
  data: Record<string, unknown>[]
  dataKeys: string[]
  xAxisKey?: string
  title?: string
  description?: string
  height?: number
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

function Chart({
  type,
  data,
  dataKeys,
  xAxisKey = 'name',
  title,
  description,
  height = 300,
  colors = COLORS,
  showGrid = true,
  showLegend = true,
  className,
}: ChartProps) {
  const content = (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'line' ? (
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis dataKey={xAxisKey} className="text-xs" tick={{ fill: 'var(--color-muted-foreground)' }} />
          <YAxis className="text-xs" tick={{ fill: 'var(--color-muted-foreground)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover, #fff)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      ) : type === 'bar' ? (
        <BarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis dataKey={xAxisKey} className="text-xs" tick={{ fill: 'var(--color-muted-foreground)' }} />
          <YAxis className="text-xs" tick={{ fill: 'var(--color-muted-foreground)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover, #fff)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      ) : type === 'area' ? (
        <AreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis dataKey={xAxisKey} className="text-xs" tick={{ fill: 'var(--color-muted-foreground)' }} />
          <YAxis className="text-xs" tick={{ fill: 'var(--color-muted-foreground)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover, #fff)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      ) : (
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKeys[0]}
            nameKey={xAxisKey}
            cx="50%"
            cy="50%"
            outerRadius={height / 3}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          {showLegend && <Legend />}
        </PieChart>
      )}
    </ResponsiveContainer>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{content}</div>
}

export { Chart, COLORS }
export type { ChartProps }

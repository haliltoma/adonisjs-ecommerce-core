export type PageType = 'custom' | 'home' | 'product' | 'category' | 'collection'

export interface PuckComponentConfig {
  fields: Record<string, any>
  defaultProps?: Record<string, any>
  render: (props: any) => JSX.Element
}

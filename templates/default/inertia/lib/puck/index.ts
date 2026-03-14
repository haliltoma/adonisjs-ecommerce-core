import type { Config } from '@puckeditor/core'
import type { PageType } from './types'
import { layoutComponents } from './components/layout'
import { typographyComponents } from './components/typography'
import { mediaComponents } from './components/media'
import { commerceComponents } from './components/commerce'
import { interactiveComponents } from './components/interactive'

const allComponents = {
  ...layoutComponents,
  ...typographyComponents,
  ...mediaComponents,
  ...commerceComponents,
  ...interactiveComponents,
}

const baseCategories = {
  layout: {
    title: 'Layout',
    components: ['Container', 'Columns', 'Spacer', 'Divider'],
  },
  typography: {
    title: 'Typography',
    components: ['Heading', 'Text', 'RichText'],
  },
  media: {
    title: 'Media',
    components: ['Image', 'Video', 'ImageGallery'],
  },
  commerce: {
    title: 'Commerce',
    components: ['ProductGrid', 'FeaturedProduct', 'CategoryGrid', 'CtaBanner'],
  },
  interactive: {
    title: 'Interactive',
    components: ['ButtonGroup', 'Accordion', 'Testimonials', 'ContactForm'],
  },
}

const pageTypeCategories: Record<PageType, typeof baseCategories> = {
  custom: baseCategories,
  home: baseCategories,
  product: {
    ...baseCategories,
    commerce: {
      title: 'Commerce',
      components: ['ProductGrid', 'FeaturedProduct', 'CtaBanner'],
    },
  },
  category: {
    ...baseCategories,
    commerce: {
      title: 'Commerce',
      components: ['ProductGrid', 'CategoryGrid', 'CtaBanner'],
    },
  },
  collection: {
    ...baseCategories,
    commerce: {
      title: 'Commerce',
      components: ['ProductGrid', 'FeaturedProduct', 'CtaBanner'],
    },
  },
}

export function createPuckConfig(pageType: PageType = 'custom'): Config {
  const categories = pageTypeCategories[pageType] || baseCategories

  return {
    categories,
    components: allComponents,
  } as Config
}

export const puckConfig = createPuckConfig('custom')

export { allComponents, baseCategories }
export type { PageType }

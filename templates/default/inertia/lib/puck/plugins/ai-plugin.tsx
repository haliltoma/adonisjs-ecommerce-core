import type { Plugin } from '@puckeditor/core'
import AiPanel from './AiPanel'

export function aiPlugin(): Plugin {
  return {
    overrides: {
      fields: ({ children, ...rest }) => {
        return (
          <div>
            <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '8px' }}>
              <AiPanel />
            </div>
            {children}
          </div>
        )
      },
    },
  }
}

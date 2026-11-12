/** Decorative occupant for the reader's sidebar entry. */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'

/**
 * Render an open-book glyph at the size the sidebar asks for; the sidebar owns the label.
 * @param props - the sidebar's icon share: the requested edge.
 * @returns decorative icon.
 */
export function ReaderIcon({ size }: PropsRuntime<'sidebar.panellist'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 5.2C8.4 4 6.2 3.6 3.5 3.8v10.6c2.700-.2 4.900.2 6.500 1.400 1.600-1.200 3.800-1.600 6.500-1.400V3.800C13.800 3.600 11.600 4 10 5.200Z" />
      <path d="M10 5.200v10.600" />
    </svg>
  )
}

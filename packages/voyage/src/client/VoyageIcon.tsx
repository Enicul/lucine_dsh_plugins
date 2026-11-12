/** Decorative occupant for the voyage sidebar entry. */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'

/**
 * Render a small sailing-boat glyph at the size the sidebar asks for; the sidebar owns the label.
 * @param props - the sidebar's icon share: the requested edge.
 * @returns decorative icon.
 */
export function VoyageIcon({ size }: PropsRuntime<'sidebar.panellist'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3v10M10 4.5c3 1.500 4.500 4 4.800 7.500H10M8.500 6.500 6 12h2.500" />
      <path d="M3.500 14.500h13l-1.800 2.500H5.300z" />
    </svg>
  )
}

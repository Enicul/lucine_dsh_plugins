/** Brand occupants for the sidebar and the New Session page: a moon-over-water mark and the product name. */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import css from './Voyage.module.css'

function Mark({ size, className }: { readonly size: number; readonly className?: string | undefined }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="5" fill="#f0c36d" />
      <path d="M2.500 17c2.400-1.600 4.700-1.600 7.100 0s4.700 1.600 7.100 0 3.200-1.300 4.800-.6" stroke="#4f8fa8" strokeWidth="1.600" strokeLinecap="round" />
      <path d="M4.500 20.500c1.900-1.200 3.800-1.200 5.700 0s3.800 1.200 5.700 0" stroke="#4f8fa8" strokeWidth="1.600" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

/**
 * Render the moon-over-water mark at the size the sidebar asks for.
 * @param props - the sidebar's share: the requested edge.
 * @returns decorative mark.
 */
export function BrandMark({ size }: PropsRuntime<'sidebar.brand.mark'>) {
  return <Mark size={size} />
}

/**
 * Render the same mark before the New Session headline.
 * @param props - the headline's share: the requested edge and the class that keeps the mark's place in the row.
 * @returns decorative mark.
 */
export function HeroMark({ size, className }: PropsRuntime<'conversation.hero.brand.mark'>) {
  return <Mark size={size} className={className} />
}

/**
 * Render the product name beside the mark.
 * @returns the name.
 */
export function BrandName(_props: PropsRuntime<'sidebar.brand.name'>) {
  // A product name is not translated.
  return <span className={css.brandName}>Deep Sea</span>
}

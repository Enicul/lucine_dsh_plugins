/**
 * Browser half of focus-reader: a left-sidebar entry and the main-column page
 * it opens, where one document is read with highlights and AI sessions.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import { ReaderIcon } from './ReaderIcon.tsx'
import { ReaderPage } from './ReaderPage.tsx'
import { en, NS, zh, type FocusReaderKey } from './locales.ts'

const PANEL_ID = 'focus-reader' as MainPanelId

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Focus reader page copy. */
    'focus-reader': FocusReaderKey
  }
}

/** Required browser services: slots and localized copy. */
export const inject = ['slots', 'locale']

/**
 * Register the dictionaries, the page, and its sidebar entry.
 * @param ctx - browser services used by these contributions.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'focus-reader: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
  }, ReaderPage)), 'focus-reader: page')
  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 6,
    locale: NS,
    label: () => t('panel'),
  }, ReaderIcon)), 'focus-reader: sidebar entry')
}

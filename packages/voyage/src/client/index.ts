/**
 * Browser half of voyage: the night-sea home page with its sidebar entry, the
 * capture box and its keyboard command, and the Glow tide theme.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type { ShortcutBinding, ShortcutCommandId } from '@deepseek-ai/dsh-client-shortcuts/client'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import { setCaptureOpen } from './capture.ts'
import { CaptureBox } from './CaptureBox.tsx'
import { en, NS, zh, type VoyageKey } from './locales.ts'
import { VoyageIcon } from './VoyageIcon.tsx'
import { VoyagePage } from './VoyagePage.tsx'

const PANEL_ID = 'voyage' as MainPanelId
const THEME_ID = 'glow-tide'

/** Desktop owns Command or Control + L. Web browsers keep that key for the address bar, so Web adds Shift. */
const DESKTOP_KEY: ShortcutBinding = { code: 'KeyL', modifiers: ['primary'] }
const WEB_KEY: ShortcutBinding = { code: 'KeyL', modifiers: ['primary', 'shift'] }

/** Night-sea surfaces laid over the built-in dark palette; the same value serves both palette modes. */
const GLOW_TIDE: Record<string, string> = {
  '--dsw-alias-bg-base': '#121a40',
  '--dsw-alias-bg-layer-1': '#18224f',
  '--dsw-alias-bg-layer-2': '#1d2a5e',
  '--dsw-alias-bg-overlay': '#1b2658',
  '--dsw-alias-border-l1': 'rgba(200, 215, 255, 0.1)',
  '--dsw-alias-border-l2': 'rgba(200, 215, 255, 0.18)',
  '--dsw-alias-label-primary': '#eef2ff',
  '--dsw-alias-label-secondary': '#b4bfdf',
  '--dsw-specific-sidebar-fill': '#0f1638',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Voyage page and capture box copy. */
    voyage: VoyageKey
  }
}

/** Required browser services: slots, localized copy, keyboard commands, the panel switcher, and themes. */
export const inject = ['slots', 'locale', 'shortcuts', 'layout', 'theme']

/**
 * Register the dictionaries, the theme, the page with its sidebar entry, and the capture box with its command.
 * @param ctx - browser services used by these contributions.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'voyage: dictionaries')
  const t = ctx.locale.bind(NS)

  ctx.effect(() => ctx.theme.overrideTokens(THEME_ID, Object.fromEntries(
    Object.entries(GLOW_TIDE).map(([token, value]) => [token, { light: value, dark: value }]),
  )), 'voyage: theme')
  // The night surfaces sit on the built-in dark palette, so every control this plugin does not recolour stays readable.
  ctx.theme.setTheme('dark')

  ctx.effect(() => ctx.slots.inject('main', () => {
    const dispose = ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, VoyagePage)
    // The app has no setting for its first page; opening this one here makes it the page the app starts on.
    ctx.layout.selectPanel(PANEL_ID)
    return dispose
  }), 'voyage: page')
  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 1,
    locale: NS,
    label: () => t('panel'),
  }, VoyageIcon)), 'voyage: sidebar entry')

  ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'voyage-capture',
    locale: NS,
  }, CaptureBox)), 'voyage: capture box')
  ctx.effect(() => ctx.shortcuts.register({
    id: 'voyage.capture' as ShortcutCommandId,
    label: () => t('capture.command'),
    aliases: ['capture a thought', 'park a thought', 'quick note'],
    defaults: {
      'desktop:macos': DESKTOP_KEY,
      'desktop:windows': DESKTOP_KEY,
      'desktop:linux': DESKTOP_KEY,
      'web:macos': WEB_KEY,
      'web:windows': WEB_KEY,
    },
    regions: ['page', 'editable', 'terminal'],
    modals: [],
    resolve: () => ({ status: 'handled', run: () => { setCaptureOpen(true) } }),
  }), 'voyage: capture command')
}

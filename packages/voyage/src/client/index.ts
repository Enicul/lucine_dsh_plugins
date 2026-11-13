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
import { BrandMark, BrandName } from './Brand.tsx'
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

/**
 * Sea-tinted surfaces as `[light value, dark value]`. The light values are pale, low-saturation blue-greys
 * for every page; the dark values are the night-sea surfaces, used only if the dark palette is chosen in settings.
 */
const SEA: Record<string, readonly [string, string]> = {
  '--dsw-alias-bg-base': ['#f3f5fa', '#121a40'],
  '--dsw-alias-bg-layer-1': ['#fbfcfe', '#18224f'],
  '--dsw-alias-bg-layer-2': ['#f6f8fc', '#1d2a5e'],
  '--dsw-alias-bg-overlay': ['#e6ebf5', '#1b2658'],
  '--dsw-alias-border-l1': ['rgba(40, 60, 120, 0.08)', 'rgba(200, 215, 255, 0.1)'],
  '--dsw-alias-border-l2': ['rgba(40, 60, 120, 0.16)', 'rgba(200, 215, 255, 0.18)'],
  '--dsw-alias-brand-primary': ['#24305c', '#f4f6ff'],
  '--dsw-alias-label-primary': ['#1e2742', '#eef2ff'],
  '--dsw-alias-label-secondary': ['#56617e', '#b4bfdf'],
  '--dsw-specific-sidebar-fill': ['#e8edf6', '#0f1638'],
}

/**
 * The dark end of the app's neutral scale, as `[built-in value, night-blue value]`. Buttons, inputs and
 * cards take their fills from this scale, so tinting it recolours them without naming each one. The
 * built-in value is kept for the light palette, where these steps are text colours.
 */
const NIGHT_NEUTRALS: Record<string, readonly [string, string]> = {
  '--dsw-static-neutral-bluish-1000': ['rgb(15, 17, 21)', '#0b1030'],
  '--dsw-static-neutral-bluish-950': ['rgb(21, 21, 23)', '#101737'],
  '--dsw-static-neutral-bluish-900': ['rgb(27, 27, 28)', '#141c44'],
  '--dsw-static-neutral-bluish-875': ['rgb(35, 35, 36)', '#18224f'],
  '--dsw-static-neutral-bluish-850': ['rgb(44, 44, 46)', '#1d2a5e'],
  '--dsw-static-neutral-bluish-800': ['rgb(53, 54, 56)', '#23316b'],
  '--dsw-static-neutral-bluish-750': ['rgb(67, 69, 74)', '#2b3b7a'],
  '--dsw-static-neutral-bluish-700': ['rgb(97, 102, 107)', '#40508f'],
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
 * Register the dictionaries, the theme, the page with its sidebar entry, the sidebar brand, and the capture box with its command.
 * @param ctx - browser services used by these contributions.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'voyage: dictionaries')
  const t = ctx.locale.bind(NS)

  ctx.effect(() => ctx.theme.overrideTokens(THEME_ID, {
    ...Object.fromEntries(Object.entries(NIGHT_NEUTRALS).map(([token, [light, dark]]) => [token, { light, dark }])),
    ...Object.fromEntries(Object.entries(SEA).map(([token, [light, dark]]) => [token, { light, dark }])),
  }), 'voyage: theme')
  // Pages other than Today are light. The Today page keeps its own night colours whatever the palette.
  ctx.theme.setTheme('light')

  ctx.effect(() => ctx.slots.inject('main', () => {
    const dispose = ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, VoyagePage)
    // The app has no setting for its first page; opening this one here makes it the page the app starts on.
    ctx.layout.selectPanel(PANEL_ID)
    return dispose
  }), 'voyage: page')
  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: -3,
    locale: NS,
    label: () => t('panel'),
  }, VoyageIcon)), 'voyage: sidebar entry')

  ctx.effect(() => ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({ name: 'sidebar.brand.mark' }, BrandMark)), 'voyage: brand mark')
  ctx.effect(() => ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({ name: 'sidebar.brand.name' }, BrandName)), 'voyage: brand name')

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

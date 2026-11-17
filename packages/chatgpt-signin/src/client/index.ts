/**
 * Browser half of chatgpt-signin: the sign-in card on this bundle's page of
 * the Plugins page.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import { SignInCard } from './SignInCard.tsx'
import { en, NS, zh, type ChatgptSigninKey } from './locales.ts'

/** Package name of this bundle; the Plugins page looks the card up by it. */
const BUNDLE = 'dsh-chatgpt-signin'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** ChatGPT sign-in card copy. */
    'chatgpt-signin': ChatgptSigninKey
  }
}

/** Required browser services: slots and localized copy. */
export const inject = ['slots', 'locale']

/**
 * Register the dictionaries and the card.
 * @param ctx - browser services used by these contributions.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'chatgpt-signin: dictionaries')
  ctx.effect(() => ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
    name: 'plugins.bundle.config',
    key: BUNDLE,
    locale: NS,
  }, SignInCard)), 'chatgpt-signin: card')
}

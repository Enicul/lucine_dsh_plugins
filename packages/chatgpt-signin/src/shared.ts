/** Wire types and route names shared by the Host routes and the browser card. */

/** Host route path returning the sign-in state. */
export const SIGNIN_STATE_PATH = '/chatgpt-signin/state'
/** Document-relative form of the state route, so deployment prefixes keep working. */
export const SIGNIN_STATE_ROUTE = 'chatgpt-signin/state'
/** Host route path starting one sign-in attempt. */
export const SIGNIN_START_PATH = '/chatgpt-signin/start'
/** Document-relative form of the start route. */
export const SIGNIN_START_ROUTE = 'chatgpt-signin/start'
/** Host route path handing the running attempt the address the browser ended on. */
export const SIGNIN_PASTE_PATH = '/chatgpt-signin/paste'
/** Document-relative form of the paste route. */
export const SIGNIN_PASTE_ROUTE = 'chatgpt-signin/paste'
/** Host route path stopping the running attempt. */
export const SIGNIN_CANCEL_PATH = '/chatgpt-signin/cancel'
/** Document-relative form of the cancel route. */
export const SIGNIN_CANCEL_ROUTE = 'chatgpt-signin/cancel'
/** Host route path adding the provider to the model picker. */
export const SIGNIN_PICKER_PATH = '/chatgpt-signin/picker'
/** Document-relative form of the picker route. */
export const SIGNIN_PICKER_ROUTE = 'chatgpt-signin/picker'
/** Host route path deleting the stored sign-in. */
export const SIGNIN_SIGNOUT_PATH = '/chatgpt-signin/signout'
/** Document-relative form of the sign-out route. */
export const SIGNIN_SIGNOUT_ROUTE = 'chatgpt-signin/signout'

/** How the person proves who they are: the browser returns to this computer, or they type a short code on a web page. */
export type SignInWay = 'browser' | 'code'

/** What the running attempt last asked the person to do. It never holds a token. */
export interface SignInStep {
  /** The sign-in flow's own sentence. */
  readonly message: string
  /** Page to open; always an `https:` address. */
  readonly url?: string
  /** Short code to type on that page. */
  readonly code?: string
}

/** How the most recent attempt ended. */
export interface SignInEnding {
  readonly status: 'authorized' | 'cancelled' | 'failed'
  /** Why it failed, or why the provider could not be added to the picker. */
  readonly message?: string
}

/** Everything the card shows. */
export interface SignInState {
  /** Whether this DSH can run the sign-in at all. */
  readonly available: boolean
  /** Name the sign-in flow gives the account. */
  readonly label: string
  /** Whether a sign-in is stored. */
  readonly signedIn: boolean
  /** Whether the provider's models are offered in the model picker. */
  readonly inPicker: boolean
  /** Whether an attempt is running. */
  readonly running: boolean
  /** The running attempt's way. */
  readonly way?: SignInWay
  /** The running attempt's current step. */
  readonly step?: SignInStep
  /** Whether the running attempt accepts a pasted address or code. */
  readonly canPaste: boolean
  /** The most recent attempt's ending, until the next attempt starts. */
  readonly last?: SignInEnding
}

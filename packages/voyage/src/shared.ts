/** Wire types and route names shared by the Host routes and the browser pages. */

/** Host route path returning one day's steps and every captured thought. */
export const VOYAGE_STATE_PATH = '/voyage/state'
/** Document-relative form of the state route, so deployment prefixes keep working. */
export const VOYAGE_STATE_ROUTE = 'voyage/state'
/** Host route path replacing one day's three steps. */
export const VOYAGE_DAY_PATH = '/voyage/day'
/** Document-relative form of the day route. */
export const VOYAGE_DAY_ROUTE = 'voyage/day'
/** Host route path adding (POST) or changing (PUT) one thought. */
export const VOYAGE_THOUGHT_PATH = '/voyage/thought'
/** Document-relative form of the thought route. */
export const VOYAGE_THOUGHT_ROUTE = 'voyage/thought'
/** Host route path asking the model to group the open thoughts. */
export const VOYAGE_SORT_PATH = '/voyage/sort'
/** Document-relative form of the sort route. */
export const VOYAGE_SORT_ROUTE = 'voyage/sort'

/** Number of steps in a day: deep sea, boat, fire, in that order. */
export const STEP_COUNT = 3

/** One of the day's three steps. */
export interface VoyageStep {
  readonly text: string
  readonly done: boolean
}

/** One calendar day's steps. */
export interface VoyageDay {
  /** Local calendar date, `YYYY-MM-DD`. */
  readonly date: string
  /** Exactly {@link STEP_COUNT} steps: deep sea, boat, fire. */
  readonly steps: readonly VoyageStep[]
}

/** One captured thought. */
export interface VoyageThought {
  readonly id: string
  readonly text: string
  /** ISO 8601 capture time. */
  readonly created: string
  /** Group name given by the last sort; empty until sorted. */
  readonly group: string
  readonly done: boolean
}

/** Response body of the state, day, thought and sort routes. */
export interface VoyageStatePayload {
  readonly day: VoyageDay
  readonly thoughts: readonly VoyageThought[]
  /** Group names the sort chooses from, in display order. */
  readonly groups: readonly string[]
}

/** Request body of the day route. */
export interface VoyageDayRequest {
  readonly date: string
  readonly steps: readonly VoyageStep[]
}

/** Request body of the thought route: POST takes `text`, PUT takes `id` and `done`. */
export interface VoyageThoughtRequest {
  readonly date: string
  readonly text?: string
  readonly id?: string
  readonly done?: boolean
}

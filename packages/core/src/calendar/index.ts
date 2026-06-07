// Calendar bridge — platform-neutral interface. Web implements via ICS feeds
// + Google Calendar OAuth; mobile uses expo-calendar.

import type { Event } from '../domain/event'

export type CalendarSource = 'apple' | 'google' | 'ics-url'

export interface NativeCalendarBridge {
  requestPermissions(): Promise<boolean>
  /** Push a confirmed event into the OS calendar */
  syncEvent(event: Event): Promise<{ externalId: string }>
  /** Remove a previously-synced event */
  unsync(externalId: string): Promise<void>
}

export interface IcsImporter {
  /** Pull an external feed and yield normalized event candidates */
  fetch(url: string): Promise<ImportedEvent[]>
}

export type ImportedEvent = {
  externalId: string
  title: string
  starts_at: string
  ends_at: string | null
  description: string | null
  location: string | null
}

export { detectConflicts } from './detectConflicts'

// Notification channel router — interface only. Real impls in apps:
//   - mobile: expo-notifications (push) + linking
//   - web:    web-push for installed PWAs, email fallback

export type NotificationKind =
  | 'event_invite'
  | 'event_confirmed'
  | 'event_cancelled'
  | 'conflict_detected'
  | 'new_message'
  | 'gig_bid_received'
  | 'gig_bid_accepted'
  | 'followed_artist_new_event'
  | 'followed_venue_new_event'

export type NotificationPayload = {
  kind: NotificationKind
  title: string
  body: string
  deeplink: string
  data?: Record<string, unknown>
}

export interface NotificationChannel {
  /** True if this channel can reach the user right now (granted permission, has token, etc.) */
  isAvailable(userId: string): Promise<boolean>
  send(userId: string, payload: NotificationPayload): Promise<void>
}

export interface NotificationRouter {
  channels: NotificationChannel[]
  route(userId: string, payload: NotificationPayload): Promise<void>
}

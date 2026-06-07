import { z } from 'zod'
import { Uuid } from './common'

export const Conversation = z.object({
  id: Uuid,
  /** Optional anchor — DMs linked to a gig or event keep context grouped */
  event_id: Uuid.nullable(),
  gig_listing_id: Uuid.nullable(),
  created_by: Uuid,
  created_at: z.string().datetime({ offset: true }),
  last_message_at: z.string().datetime({ offset: true }),
})
export type Conversation = z.infer<typeof Conversation>

export const ConversationParticipant = z.object({
  conversation_id: Uuid,
  user_id: Uuid,
  /** participant role: artist representative, venue owner, venue staff. Drives label in UI */
  role_at_join: z.string(),
  joined_at: z.string().datetime({ offset: true }),
  last_read_at: z.string().datetime({ offset: true }).nullable(),
})
export type ConversationParticipant = z.infer<typeof ConversationParticipant>

export const Message = z.object({
  id: Uuid,
  conversation_id: Uuid,
  sender_user_id: Uuid,
  body: z.string().min(1).max(4000),
  created_at: z.string().datetime({ offset: true }),
})
export type Message = z.infer<typeof Message>

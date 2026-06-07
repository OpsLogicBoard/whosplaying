import type { WhosPlayingClient } from '../client'

export async function listConversations(client: WhosPlayingClient, userId: string) {
  return client
    .from('conversation_participants')
    .select('conversation:conversations(*)')
    .eq('user_id', userId)
    .order('last_message_at', { foreignTable: 'conversations', ascending: false })
}

export async function listMessages(client: WhosPlayingClient, conversationId: string) {
  return client
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
}

export async function sendMessage(
  client: WhosPlayingClient,
  conversation_id: string,
  body: string,
) {
  return client.from('messages').insert({ conversation_id, body }).select().single()
}

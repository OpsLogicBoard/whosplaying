import type { Conversation, Message } from '../domain/messaging'

/** STUB */
export function useMessages(_conversationId: string) {
  return {
    conversation: null as Conversation | null,
    messages: [] as Message[],
    isLoading: false,
    error: null as Error | null,
    send: async (_body: string) => {
      throw new Error('not implemented')
    },
  }
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesQ } from '@whosplaying/supabase'
import type { Message } from '../domain/messaging'
import { useWhosPlayingClient } from '../provider'

/** Messages in a conversation, plus a send() that optimistically refetches. */
export function useMessages(conversationId: string | undefined, senderUserId: string | undefined) {
  const client = useWhosPlayingClient()
  const qc = useQueryClient()
  const key = ['messages', conversationId ?? null]

  const query = useQuery({
    queryKey: key,
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await messagesQ.listMessages(client, conversationId as string)
      if (error) throw error
      return (data ?? []) as unknown as Message[]
    },
  })

  const sendM = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await messagesQ.sendMessage(
        client,
        conversationId as string,
        senderUserId as string,
        body,
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
    send: (body: string) => sendM.mutateAsync(body),
    sending: sendM.isPending,
  }
}

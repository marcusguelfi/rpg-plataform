'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useDiceStore } from '@/stores/dice.store'
import { useAuthStore } from '@/stores/auth.store'
import { v4 as uuidv4 } from 'uuid'

let socketInstance: Socket | null = null

export function useSocket(campaignId?: string) {
  const socketRef = useRef<Socket | null>(null)
  const { addRoll } = useDiceStore()
  const { user } = useAuthStore()

  const getToken = useCallback(async () => {
    // Token is in httpOnly cookie, we pass username as identifier
    // In a real implementation, you'd have a separate token endpoint
    return document.cookie.match(/rpg_session=([^;]+)/)?.[1] || ''
  }, [])

  useEffect(() => {
    if (!campaignId || !user) return

    const initSocket = async () => {
      const token = await getToken()
      
      if (!socketInstance) {
        socketInstance = io({
          auth: { token },
          transports: ['websocket', 'polling'],
        })
      }
      socketRef.current = socketInstance

      socketInstance.on('connect', () => {
        console.log('[Socket] Connected')
        socketInstance?.emit('join:campaign', campaignId)
        if (user.role === 'GM' || user.role === 'ADMIN') {
          socketInstance?.emit('join:gm', campaignId)
        }
      })

      socketInstance.on('dice:rolled', (data) => {
        addRoll({
          id: uuidv4(),
          expression: data.expression,
          result: data.result,
          label: data.label,
          username: data.username,
          characterName: data.characterName,
          timestamp: data.timestamp,
          isSecret: data.isSecret,
          isMine: data.userId === user.id,
        })
      })
    }

    initSocket()

    return () => {
      if (campaignId) {
        socketInstance?.emit('leave:campaign', campaignId)
      }
    }
  }, [campaignId, user, addRoll, getToken])

  const emitDiceRoll = useCallback((data: {
    expression: string
    result: object
    label?: string
    characterName?: string
    isSecret?: boolean
  }) => {
    if (!campaignId || !socketInstance) return
    socketInstance.emit('dice:roll', { ...data, campaignId, isSecret: data.isSecret || false })
  }, [campaignId])

  const emitSocket = useCallback((event: string, data?: unknown) => {
    if (!socketInstance) return
    socketInstance.emit(event, data)
  }, [])

  const on = useCallback((event: string, handler: (data: unknown) => void) => {
    socketInstance?.on(event, handler)
    return () => { socketInstance?.off(event, handler) }
  }, [])

  return { socket: socketRef.current, emitDiceRoll, emitSocket, on }
}

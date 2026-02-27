import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { verifyToken } from './src/lib/auth'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
    },
  })

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))
    
    const payload = verifyToken(token)
    if (!payload) return next(new Error('Invalid token'))
    
    socket.data.user = payload
    next()
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    console.log(`[Socket] ${user.username} connected`)

    // Join campaign room
    socket.on('join:campaign', (campaignId: string) => {
      socket.join(`campaign:${campaignId}`)
      socket.to(`campaign:${campaignId}`).emit('user:joined', {
        userId: user.userId,
        username: user.username,
      })
    })

    socket.on('leave:campaign', (campaignId: string) => {
      socket.leave(`campaign:${campaignId}`)
    })

    // Real-time dice roll broadcast
    socket.on('dice:roll', (data: {
      expression: string
      result: object
      label?: string
      characterName?: string
      campaignId: string
      isSecret: boolean
    }) => {
      const payload = {
        ...data,
        userId: user.userId,
        username: user.username,
        timestamp: new Date().toISOString(),
      }

      if (data.isSecret) {
        // Only broadcast to GMs in the room
        socket.to(`campaign:${data.campaignId}:gm`).emit('dice:rolled', payload)
        socket.emit('dice:rolled', payload) // echo to self
      } else {
        io.to(`campaign:${data.campaignId}`).emit('dice:rolled', payload)
      }
    })

    // Join GM room
    socket.on('join:gm', (campaignId: string) => {
      if (user.role === 'GM' || user.role === 'ADMIN') {
        socket.join(`campaign:${campaignId}:gm`)
      }
    })

    // Character sheet update (live sync during session)
    socket.on('character:update', (data: { characterId: string; campaignId: string; sheetData: object }) => {
      socket.to(`campaign:${data.campaignId}:gm`).emit('character:updated', {
        ...data,
        userId: user.userId,
        username: user.username,
      })
    })

    // GM broadcasts to all players
    socket.on('gm:announce', (data: { campaignId: string; message: string; type: string }) => {
      if (user.role === 'GM' || user.role === 'ADMIN') {
        io.to(`campaign:${data.campaignId}`).emit('announcement', data)
      }
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] ${user.username} disconnected`)
    })
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})

import { Socket } from "socket.io"
// import zap from "./zap"
import { Server as SocketIoServer } from "socket.io"
import { Server as HttpServer } from "http"
import { Server as HttpsServer } from "https"
import room from "./room"

let io: SocketIoServer | null = null

export const initializeIoServer = (server: HttpServer | HttpsServer) => {
    io = new SocketIoServer(server, {
        cors: { origin: "*" },
        maxHttpBufferSize: 1e8
    })
}

export const getIoInstance = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Please call initializeIoServer first.")
    }
    return io
}

export const handleSocket = (socket: Socket) => {
    console.log(`new connection: ${socket.id}`)

    socket.on("disconnect", () => {
        console.log(`disconnected: ${socket.id}`)
        room.onPlayerDisconnected(socket)
    })

    socket.on('room:list', () => room.list(socket))
    socket.on('room:new', (data: {player: NewPlayer, room: NewRoom}) => room.create(socket, data.player, data.room))
    socket.on('room:join', (data: {player: NewPlayer, room_id: string}) => room.join(socket, data.room_id, data.player))
    socket.on('room:leave', (data: {player_id: string, room_id: string}) => room.leave(socket, data.room_id, data.player_id))

    socket.on('game:start', (data: {room_id: string}) => room.startGame(socket, data.room_id))
}

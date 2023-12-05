import { Socket } from "socket.io"
import { Room } from "../class/Room"

const start = (socket: Socket) => {
    const { room } = Room.findSocket(socket)
    room?.startGame()
}

const stop = (socket: Socket) => {
    const { room } = Room.findSocket(socket)
    room?.game?.stop()
}

const attempt = (socket: Socket, attempt: string) => {
    const { room, player } = Room.findSocket(socket)
    if (player) {
        room?.game?.makeAttempt(attempt, player)
    }
}

const nextRound = (socket: Socket) => {
    const { room } = Room.findSocket(socket)
    room?.game?.nextRound()
}

export default { start, stop, attempt, nextRound }

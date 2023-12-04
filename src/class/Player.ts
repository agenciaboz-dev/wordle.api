import { Socket } from "socket.io"
import { uid } from "uid"

export class Player {
    id: string
    name: string
    avatar: string
    score: number = 0
    history: string[] = []
    ready: boolean = false

    socket: Socket

    constructor(data: NewPlayer, socket: Socket) {
        this.id = uid()
        this.name = data.name
        this.avatar = data.avatar
        this.socket = socket
    }

    toJSON() {
        return { ...this, socket: null }
    }

    win = (difficulty: number) => {
        const score = 10 * difficulty - 10 * this.history.length + 10
        this.score += score
        this.ready = true

        this.socket.emit("game:win", score)
    }

    lose = () => {
        this.ready = true
        this.socket.emit("game:lose")
    }
}
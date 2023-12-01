import { Socket } from "socket.io"
import { uid } from "uid"

export class Player {
    id: string
    name: string
    avatar: string
    score: number = 0
    history: string[] = []

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
}
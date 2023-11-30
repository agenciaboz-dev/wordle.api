import { uid } from "uid"
import { Player } from "./Player"
import { Socket } from "socket.io"
import { Game } from "./Game"

let rooms: Room[] = []

export class Room {
    id: string
    host: Player
    name: string
    created_at: Date
    password?: string
    game?: Game

    players: Player[] = []

    static list = () => rooms
    static find = (id: string) => rooms.find((room) => room.id == id)
    static findSocket = (socket: Socket) => {
        const room = rooms.find((room) => room.players.find((player) => player.socket.id == socket.id))
        const player = room?.players.find((player) => player.socket.id == socket.id)

        return { room, player }
    }
    static print = (message: any) => {
        const log = true
        if (log) console.log(`room: ${message}`)
    }

    constructor(host: Player, data: NewRoom) {
        this.id = uid()
        this.host = host
        this.name = data.name
        this.password = data.password
        this.created_at = new Date()

        this.addPlayer(host)

        rooms.push(this)
    }

    addPlayer = (player: Player) => {
        Room.print(`adding ${player.name} to room ${this.name}`)
        this.players.push(player)

        player.socket.join(this.id)
        player.socket.emit('room:join', {room: this, player})
        player.socket.to(this.id).emit('room:player', player)
    }

    findPlayer = (player_id: string) => {
        return this.players.find((player) => player.id == player_id)
    }

    removePlayer = (player: Player) => {
        Room.print(`removing player ${player.name} from ${this.name}`)

        this.players = this.players.filter(item => item != player)
        if (this.players.length == 0) {
            Room.print(`room is empty, self destroying`)
            rooms = rooms.filter(room => room != this)
        } else {
            if (this.host == player) {
                Room.print(`${player.name} was the host`)
                this.host = this.players[0]

                Room.print(`new host ${this.host.name}`)
            }
        }
    }

    startGame = () => {
        this.game = new Game(this, 5)
    }
}

import { uid } from "uid"
import { Player } from "./Player"
import { Socket } from "socket.io"
import { Game } from "./Game"
import { getIoInstance } from "../io/socket"

let rooms: Room[] = []

export class Room {
    id: string
    host: Player
    name: string
    created_at: Date
    playing: boolean = false

    password?: string
    game?: Game

    difficulty: number = 5

    players: Player[] = []

    static list = () => rooms
    static resetRooms = () => {
        rooms.map((room) => {
            room.players.map((player) => room.removePlayer(player))
        })

        rooms = []
        return rooms
    }
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
        // host.socket.emit("room:new:success", { player: host, room: this })
        host.socket.broadcast.emit("room:new", this)
        Room.print(`room id ${this.id}`)
    }

    addPlayer = (player: Player) => {
        Room.print(`adding ${player.name} to room ${this.name}`)
        this.players.push(player)

        player.socket.join(this.id)
        player.socket.emit("room:join", { room: this, player })
        player.socket.to(this.id).emit("room:update", this)
    }

    findPlayer = (player_id: string) => {
        return this.players.find((player) => player.id == player_id)
    }

    removePlayer = (player: Player) => {
        Room.print(`removing player ${player.name} from ${this.name}`)
        player.socket.emit("room:leave", { room: this, player })

        this.players = this.players.filter((item) => item != player)
        if (this.players.length == 0) {
            Room.print(`room is empty, self destroying`)
            rooms = rooms.filter((room) => room != this)
            const io = getIoInstance()
            io.emit("room:remove", this)
        } else {
            if (this.host == player) {
                Room.print(`${player.name} was the host`)
                this.host = this.players[0]

                Room.print(`new host ${this.host.name}`)
            }
            this.host.socket.emit("room:update", this)
            this.host.socket.to(this.id).emit("room:update", this)
        }

        player.socket.leave(this.id)
    }

    startGame = () => {
        this.game = new Game(this, this.difficulty)
        this.game.nextRound()

        this.game.io.to(this.id).emit("room:update", this)
    }

    update = (data: UpdateRoom) => {
        this.name = data.name
        this.password = data.password
        this.difficulty = data.difficulty

        this.host.socket.to(this.id).emit("room:update", this)
        Room.print(`room ${this.id} updating`)
    }

    readyCheck = () => {
        const all_ready = this.players.every((player) => player.ready)
        return all_ready
    }
}

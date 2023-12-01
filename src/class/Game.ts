import { Server } from "socket.io"
import { getIoInstance } from "../io/socket"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { Room } from "./Room"
import { words } from "../words"
import { Player } from "./Player"

export class Game {
    round: number = 1
    difficulty: number
    word: string

    history: string[] = []

    // DESERIALIZAR
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    room: Room

    static print = (message: any) => {
        const log = true
        if (log) console.log(`game: ${message}`)
    }

    static randomWord = (difficulty: number) => {
        // to do: get word with lengh matching diff
        const random = Math.floor(Math.random() * words.length)
        return words[random]
    }

    constructor(room: Room, difficulty: number) {
        this.room = room
        this.difficulty = difficulty
        this.io = getIoInstance()
        this.word = Game.randomWord(difficulty)
        this.history.push(this.word)

        Game.print(`started new game. Word: ${this.word}`)
    }

    stop = () => {
        Game.print("stoped game")
        this.io.to(this.room.id).emit("game:stop")
        this.room.game = undefined
    }

    toJSON() {
        return { ...this, io: null, room: null }
    }

    attempt = (word: string, player: Player) => {
        player.history.push(word)
        Game.print(`${player.name} attempted ${word}`)

        if (this.word == word) {
            player.win(this.room.difficulty)
            Game.print(`${player.name} won`)
        }

        this.io.to(this.room.id).emit("room:update", this.room)
        player.socket.emit("game:attempt")
    }
}
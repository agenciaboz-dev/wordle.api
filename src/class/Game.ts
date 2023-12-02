import { Server } from "socket.io"
import { getIoInstance } from "../io/socket"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { Room } from "./Room"
import { Player } from "./Player"
import { words } from "../words2"
import { normalize } from "path"

export class Game {
    round: number = 0
    difficulty: number
    word: string = ""

    history: string[] = []

    // DESERIALIZAR
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    room: Room

    static print = (message: any, priority?: boolean) => {
        const log = true
        if (log) {
            priority && console.log()
            console.log(`game: ${message}`)
            priority && console.log()
        }
    }

    static randomWord = (difficulty: number) => {
        // to do: get word with lengh matching diff
        const random = Math.floor(Math.random() * words.length)
        return normalize(words[random])
    }

    constructor(room: Room, difficulty: number) {
        this.room = room
        this.difficulty = difficulty
        this.io = getIoInstance()
    }

    stop = () => {
        Game.print("stoped game")
        this.room.game = undefined
        this.io.to(this.room.id).emit("room:update", this.room)
    }

    toJSON() {
        return { ...this, io: null, room: null }
    }

    attempt = (word: string, player: Player) => {
        player.history.push(word)
        Game.print(`${player.name} attempted ${word}`)

        const won = this.word == word

        if (won) {
            player.win(this.room.difficulty)
            player.socket.to(this.room.id).emit("player:win", player)
            Game.print(`${player.name} won`)
        }

        if (player.history.length == 5 && !won) {
            player.socket.to(this.room.id).emit("player:lose", player)
            player.lose()
        }

        this.io.to(this.room.id).emit("room:update", this.room)
        player.socket.emit("game:attempt")

        const ready = this.room.readyCheck()
        if (ready) {
            this.io.emit("game:ready")
            this.room.playing = false
            this.io.to(this.room.id).emit("room:update", this.room)
        }
    }

    nextRound = () => {
        this.round += 1
        this.room.players.map((player) => {
            player.ready = false
            player.history = []
        })

        this.word = Game.randomWord(this.room.difficulty)
        this.history.push(this.word)
        this.room.playing = true

        Game.print(`new word: ${this.word}`)

        this.io.to(this.room.id).emit("room:update", this.room)
    }
}
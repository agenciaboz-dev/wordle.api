import { Socket } from "socket.io";
import { Room } from "../class/Room";
import { Player } from "../class/Player";

const alreadyConnected = (socket: Socket) => {
    const existing = Room.findSocket(socket)
    if (existing.player || existing.room) {
        socket.emit('room:error', {error: 'socket já conectado'})
        return true
    }
}

const list = (socket: Socket) => {
    const rooms = Room.list()
    socket.emit('room:list', rooms)
}

const create = (socket: Socket, playerForm: NewPlayer, roomForm: NewRoom) => {
    if (alreadyConnected(socket)) return

    const player = new Player(playerForm, socket)
    const room = new Room(player, roomForm)
}

const join = (socket: Socket, room_id: string, playerForm: NewPlayer) => {
    if (alreadyConnected(socket)) return
    const room = Room.find(room_id)
    
    if (room) {
        const player = new Player(playerForm, socket)
        room.addPlayer(player)
    }

}

const leave = (socket: Socket, room_id: string, player_id: string) => {
    const room = Room.find(room_id)
    const player = room?.findPlayer(player_id)

    if (player) {
        room?.removePlayer(player)
        socket.emit('room:leave', {room, player})
    }
}

const onPlayerDisconnected = (socket: Socket) => {
    const { room, player } = Room.findSocket(socket)
    
    if (room && player) {
        room.removePlayer(player)
    } else {
        console.log('room or player not found for this socket')
    }
}

const startGame = (socket: Socket, room_id: string) => {
    const room = Room.find(room_id)
    if (room) {
        room.startGame()
    }
}

export default {list, create, join, onPlayerDisconnected, leave, startGame}
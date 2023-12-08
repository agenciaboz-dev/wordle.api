import { Socket } from "socket.io";
import { Room } from "../class/Room";
import { Player } from "../class/Player";
import { getIoInstance } from "./socket"

const alreadyConnected = (socket: Socket) => {
    const existing = Room.findSocket(socket)
    if (existing.player || existing.room) {
        // socket.emit("room:error", { error: "socket já conectado" })
        return true
    }
}

const list = (socket: Socket) => {
    const rooms = Room.list()
    socket.emit("room:list", rooms)
}

const create = (socket: Socket, playerForm: NewPlayer, roomForm: NewRoom) => {
    if (alreadyConnected(socket)) onPlayerDisconnected(socket)

    const player = new Player(playerForm, socket)
    const room = new Room(player, roomForm)
}

const join = (socket: Socket, room_id: string, playerForm: NewPlayer) => {
    if (alreadyConnected(socket)) onPlayerDisconnected(socket)
    const room = Room.find(room_id)

    if (room) {
        const player = new Player(playerForm, socket)
        room.addPlayer(player)
    }
}

const leave = (socket: Socket) => {
    const { room, player } = Room.findSocket(socket)

    if (player) {
        room?.removePlayer(player)
    }
}

const onPlayerDisconnected = (socket: Socket) => {
    const { room, player } = Room.findSocket(socket)

    if (room && player) {
        room.removePlayer(player)
    } else {
        console.log("room or player not found for this socket")
    }
}

const update = (socket: Socket, data: UpdateRoom) => {
    const room = Room.find(data.id)
    if (room) {
        room.update(data)

        const io = getIoInstance()
        io.emit("room:list:update", room)
    }
}

const reset = (socket: Socket) => {
    const rooms = Room.resetRooms()
    const io = getIoInstance()
    io.emit("room:list", rooms)
}

export default { list, create, join, onPlayerDisconnected, leave, update, reset }
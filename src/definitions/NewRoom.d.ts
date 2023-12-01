declare interface NewRoom {
    name: string
    password?: string
}

declare interface UpdateRoom extends NewRoom {
    id: string
    difficulty: number
}
import * as fs from "fs"
import * as readline from "readline"

const processFile = async (difficulty: number) => {
    const all_words = fs.readFileSync("dist/src/palavras.txt", "utf8").split("\n")

    console.log(`total words: ${all_words.length}`)

    const words = all_words.filter((word) => word.length == difficulty)

    console.log(words)
    console.log(`${difficulty} letter words: ${words.length}`)
}

processFile(5).catch((e) => console.error(e))

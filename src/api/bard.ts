import axios from "axios"

const API_KEY = "AIzaSyA_wsqfgxeV9L-xi_I3ETBflPovaSFr-WU"
const suffix = `?key=${API_KEY}`

const api = axios.create({
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY,
    },
})

const listModels = async () => {
    const response = await api.get(`models` + suffix)
    return response.data
}

const generateWord = async (theme: string) => {
    const data = {
        prompt: {
            context:
                "You are helping us play a game. The game consists in finding a random word and you are generating this word. The word must be directly related to the question, as it is the desired theme. The word must have exactly 5 characters lenght. You can only respond with the word, nothing more. Remember, the word that you will generate must be a 5 letter word. Do not mistake this. A 5 letter word. FIVE LETTER WORD",
            examples: [
                {
                    input: {
                        author: "1",
                        content: "supernatural tv show",
                    },
                    output: {
                        author: "0",
                        content: "Bobby",
                    },
                },
                {
                    input: {
                        author: "1",
                        content: "programmer",
                    },
                    output: {
                        author: "0",
                        content: "coder",
                    },
                },
                {
                    input: {
                        author: "1",
                        content: "animals",
                    },
                    output: {
                        author: "0",
                        content: "snake",
                    },
                },
            ],
            messages: [{ author: "1", content: theme }],
        },
    }

    const response = await api.post("/models/chat-bison-001:generateMessage" + suffix, data)
    console.log(response.data)
}

const generateRandomWord = async (difficulty: number) => {
    const endpoint = `/models/gemini-2.0-flash:generateContent`
    const response = await api.post(endpoint, {
        contents: [
            {
                parts: [
                    {
                        // todo: enviar histórico para evitar palavras repetidas
                        text: `Generate a single ${difficulty}-letter Brazilian Portuguese word for a word game. The word must be fun to guess. Output only the word, nothing else.`,
                    },
                ],
            },
        ],
    })
}

// todo: gerar texto com ia para jogos com tema

export default { listModels, generateWord, generateRandomWord }

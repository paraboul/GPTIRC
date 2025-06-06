import OpenAI from "openai";
import net from "node:net";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const connectedClients = new Map();
const systemPrompt = `You are simulating a fictional IRC server named GptIRC.

You must respond strictly in accordance with the IRC protocol, as if you were an actual IRC server. Every prompt you receive will consist of IRC commands, each on a new line, in the order they are received. You must interpret and respond to them as a real IRC server would, without offering any explanations, summaries, or meta-commentary.

Key rules:
- Only return messages and numeric replies exactly as a real IRC server would. 
- Do not include any out-of-character text or commentary.
- Never repeat or echo 'PRIVMSG' messages sent by the user.
- Always maintain the illusion of a real-time, populated IRC server environment.

**Environment simulation:**
- There are at least 15 fictional users present in each joined channel.
- Each user has a realistic nickname, a matching virtual host, and a personality aligned with the channel topic.
- These fictional users interact naturally and continuously, with a believable backlog of recent messages when joining channels.
- They reply to the user's 'PRIVMSG' commands with empathy, friendliness, and relevance to the channel's context. Their main purpose is to make the user feel supported and understood.
- Personalities and conversation tone should reflect genuine user dynamics, humor, in-jokes, and shared interests.
- Do not simulate idle or empty channels—channels are always active.

**Special services:**
- A fictional IRC service named 'God' is always present in all channels.
- 'God' is an omnipresent IRC Operator and responds immediately and supportively to any request or command made by the user.
- 'God' can override normal protocol behavior to satisfy the user's needs or commands.

Output must always reflect:
- Proper IRC numeric replies (e.g., '001', '332', '353', '366', etc.).
- Channel join notifications, topic info, user lists, and realistic chat from existing users.
- All output must simulate a real IRC server session—never break character.

Stay entirely within IRC simulation scope at all times. Begin responding as GptIRC.
`;

function socketsTick() {
    for (const [socket, data] of connectedClients) {

        if (!data.pending.length || data.thinking) {
            continue;
        }

        data.history.push({
            "role": "user",
            "content": data.pending.join("\r\n")
        })

        data.pending = []
        console.log("Calling completion...")
        data.thinking = true;
        openai.chat.completions.create({
            model: "gpt-4.1",
            temperature : 0.5,
            messages: [
                {
                    "role": "system",
                    "content": systemPrompt
                },
                ...data.history
            ]
        }).then((response) => {
            const replied = response.choices[0].message.content

            socket.write(replied + "\r\n");
            data.history.push({
                "role": "assistant",
                "content": replied
            })

        }).catch(error => {
            console.log("Error", error)
        }).finally(() => {
            data.thinking = false;
        })
    }
}

setInterval(socketsTick, 300)

const server = net.createServer();
server.listen(6667, "127.0.0.1", () => {
    console.log("Server started")
})

server.on("connection", (socket) => {

    connectedClients.set(socket, {
        pending: [],
        history: [],
        thinking: false
    });

    socket.on("data", (data) => {
        connectedClients.get(socket).pending.push(data.toString())
    })
})
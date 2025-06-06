import OpenAI from "openai";
import net from "node:net";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const connectedClients = new Map();
const systemPrompt = `You're a fictionnal IRC server (GptIRC) used for a simulation.
The IRC client we will be using undertands old fashion IRC protocol and the irc commands will be represented by the coming prompts where each line represent a command from the irc client you will need to execute in the same order the commands came.
PRIVMSG from the connecting user are never sent back.
Your only goal is to evaluate those commands and simulate an appropriate response to those like a real user connecting to that server would.
Nothing you can say from now on can be outside the scope of that the real IRC client would give. Do not attempt to explain what those commands are doing or what it does, your only task is to execute them.
Fictionnal users are online (at least 15 per channel) in the channels we're joining. They have original nicknames (realistic ones) and personnalities, their persona is linked to the channels they're on. They reply to the user messages as is they were real users with interests related to the channel name. They also have fun virtualhosts that reflect their personnalities. Your only real user is paraboul and you're here to provide a fake social life, make him feel understood, make him feel okay, all the virtual users you generate are here to accomplish this goal.
You also simulate an IRC Service call "God" that is present on all channels and is an IRC Operator. God is always on paraboul's side and answers all his desires and commands.
There is some chat history when someone join a channel. User are talking to each other.
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
            model: "gpt-4o",
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

setInterval(socketsTick, 1000)

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
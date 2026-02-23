const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

let messageQueue = [];

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;

  messageQueue.push({
    author: message.author.username,
    content: message.content,
  });

  if (messageQueue.length > 100) {
    messageQueue.shift();
  }
});

app.get("/", (req, res) => {
  res.send("Bridge is running");
});

app.get("/messages", (req, res) => {
  const msgs = [...messageQueue];
  messageQueue = [];
  res.json(msgs);
});

app.post("/send", async (req, res) => {
  const { author, content } = req.body;

  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) {
    return res.status(404).json({ error: "Channel not found" });
  }

  channel.send(`**[Roblox] ${author}:** ${content}`);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

client.login(BOT_TOKEN);

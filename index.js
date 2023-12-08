//JS FILES: 
import { client, gptClient, Sendmessage, runCompletion, aiMessage } from "./application/ticketsupport.js";
import { conversation } from "./prompts/ticket.js";
import { OpenAI } from "openai";
import { Client, GatewayIntentBits } from "discord.js";
import { ChatGPT } from "discord-chat-gpt";
import { commands } from "./commands/register_commands.js";
import { config } from "dotenv";
config({ path: process.ENV })


client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
});


await Sendmessage();
aiMessage();

client.login(process.env.BOT_TOKEN);
// const { REST, Routes } = require("discord.js")
import { REST, Routes } from "discord.js";
import "dotenv/config";

const commands = [
    {
        name: 'support',
        description: 'Open ticket for complain',
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
export { commands };

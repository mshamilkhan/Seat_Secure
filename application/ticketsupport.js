import { OpenAI } from "openai";
import { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonComponent, ButtonStyle } from "discord.js";
// import { button_interaction } from "./ButtonInteraction.js";
import { ChatGPT } from "discord-chat-gpt";
import { commands } from "../commands/register_commands.js";
import { conversation } from "../prompts/ticket.js";
import { config } from "dotenv";
import { channel } from "diagnostics_channel";
config({ path: process.ENV })

let ticketid;
let completionResponse
//DISCORD APPLICATION START
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    allowedMentions: {
        repliedUser: false,
    }
});

//OPEN AI API
const gptClient = new OpenAI({
    // apiKey: import.meta.env.OPENAI_API_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});


let input;
async function runCompletion(message) {
    // Add the user's message to the conversation history
    conversation.push({ role: 'user', content: message });
    console.log("prompt function run")
    try {
        let history = message;
        console.log("DICTIONARY: ", message);
        const completion = await gptClient.chat.completions.create({
            // model: "gpt-3.5-turbo",
            model: "gpt-3.5-turbo-16k",
            messages: conversation,
            max_tokens: 500,
        });

        // Extract the assistant's reply from the completion
        completionResponse = completion.choices[0].message.content;
        console.log("Completion Response : ", completionResponse)
        conversation.push({ role: 'system', content: completionResponse });
    } catch (error) {
        console.error('Error sending message to the assistant:', error);
    }
};

// Event handler for incoming messages
function Sendmessage() {
    client.on("messageCreate", async function handleMessage(message) {
        // Empty the chathistory array

        if (!message.guild || message.author.bot) return;
        let channelid = message.channel.id;
        let category = message.channel.parentId;
        if (category === process.env.TICKET_CATEGORY) {
            console.log("inside the openai function")
            const channel = message.guild.channels.cache.get(channelid);
            if (!channel) return;
            if (message.channel.id === channel.id) {
                const input = message.content;

                // Send the user's message to the assistant
                await runCompletion(input);
                console.log("Latest: ", completionResponse);

                channel.sendTyping().then((resolve) => {
                    // console.log("Typing...")

                    resolve;
                    message.reply({
                        content: ` ${completionResponse}`,
                    });
                });
            }
        }
    });
}


function aiMessage() {
    client.on("messageCreate", async function handleMessage(message) {
        if (!message.guild || message.author.bot) return;
        const channel = message.guild.channels.cache.get(process.env.AI_CHAT);
        if (!channel) return;
        if (message.channel.id === channel.id) {
            console.log(message.author.username);
            const input = message.content;
            // Send the user's message to the assistant
            await runCompletion(input);
            console.log("Latest: ", completionResponse);
            channel.sendTyping().then((resolve) => {
                resolve;
                message.reply({
                    content: ` ${completionResponse}`,
                });
            })
            // let msg = await message.reply({
            //     content: ` ${completionResponse}`,
            // });
        }
    });
}

//USING SLASH COMMANDS
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'support') {

        const open = new ButtonBuilder()
            .setCustomId('open')
            .setLabel('Open Ticket')
            .setStyle(ButtonStyle.Primary);
        const track = new ButtonBuilder()
            .setCustomId('track')
            .setLabel('Track Ticket')
            .setStyle(ButtonStyle.Success);
        const close = new ButtonBuilder()
            .setCustomId('close')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(open, track, close);

        interaction.channel.send({ components: [row] }).then()


        await interaction.reply("What do you want to do for your ticket?");
    }

    
    // else if(interaction.commandName === 'del_chat_history'){
    //     conversation = [];
    //     // conversation.push[conversation];
    //     await interaction.reply("Chat history");
    // }
});








//--------------------------------------------------------------------------------
//BUTTON INTERACTION

client.on('interactionCreate', async (interaction) => {
    try {


        if (interaction.isButton()) {
            if (interaction.customId === 'open') {
                interaction.guild.channels.create({
                    name: interaction.user.username,
                    parent: process.env.TICKET_CATEGORY,
                }).then((channel) => {



                    ticketid = channel.id;
                    console.log(`Created channel ${channel.name}`);
                    console.log(`Ticket id is : ${ticketid}`);

                    client.users.cache.get(interaction.user.id).createDM().then((dm) => {
                        dm.send(` Your ticket is created here <#${ticketid}>`);
                        const closeticket = new ButtonBuilder()
                            .setCustomId('closeticket')
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger);

                        const row = new ActionRowBuilder().addComponents(closeticket);

                        dm.send({ components: [row] }).then();
                    });



                });
                console.log('Ticket is created');
                interaction.reply({
                    content: `Ticket is created check your personal dm`,
                });
            } else if (interaction.customId === 'track') {
                console.log('Your following tickets are in progress');
                await interaction.reply({
                    content: `Check <#1165415819296120904>`,
                });

                client.users.cache.get(interaction.user.id).createDM().then((dm) => {
                    dm.send('Following tickets are in progress\n All pending and completed tickets will be shown after database connection. At this stage its just a proof of concept.');
                });
            }
            else if (interaction.customId === 'close') {
                const confirmyes = new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('confirm')
                    .setStyle(ButtonStyle.Danger);
                const confirmcancel = new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('cancel')
                    .setStyle(ButtonStyle.Success);

                const row = new ActionRowBuilder().addComponents(confirmyes, confirmcancel);

                interaction.channel.send({ components: [row] }).then()



                interaction.reply({
                    content: `Are you sure you want to close the ticket?`,
                });

            }

            if (interaction.customId === 'confirm') {
                console.log("Ticket deletion confirmed")

                // Delete the channel
                interaction.guild.channels.delete(ticketid)
                    .then(console.log)
                    .catch(console.error);

                await interaction.reply({
                    content: `Check <#1165415819296120904>`,
                });

                client.users.cache.get(interaction.user.id).createDM().then((dm) => {
                    dm.send('Your ticket has been closed');
                });
            }
            else if (interaction.customId === 'cancel') {
                await interaction.reply({
                    content: `Check <#1165415819296120904>`,
                });

                client.users.cache.get(interaction.user.id).createDM().then((dm) => {
                    dm.send('Your ticket is still undeleted you cancel the ticket deletion');
                });
            }
            else if (interaction.customId === 'closeticket') {
                console.log("closeticket button pressed")
                const confirmyes = new ButtonBuilder()
                    .setCustomId('confirmticketclose')
                    .setLabel('confirm')
                    .setStyle(ButtonStyle.Danger);
                const ticketcancel = new ButtonBuilder()
                    .setCustomId('cancelticketclose')
                    .setLabel('cancel')
                    .setStyle(ButtonStyle.Success);

                const row = new ActionRowBuilder().addComponents(confirmyes, ticketcancel);

                interaction.channel.send({ components: [row] }).then()



                interaction.reply({
                    content: `Are you sure you want to close the ticket?`,
                });

            }
            if (interaction.customId === 'confirmticketclose') {
                console.log("confirmticketclose fired")
                // Delete the channel
                // Delete the channel
                // interaction.guild.channels.delete(ticketid)
                //     .then(console.log)
                //     .catch(console.error);
                const channel = interaction.channel;


                interaction.channel.delete();

                client.users.cache.get(interaction.user.id).createDM().then((dm) => {
                    dm.send(`Your ticket of id ${ticketid} has been closed`);
                });
            }




        }
    } catch (err) {
        console.log("ERR : ", err)
    };
});





















//LOGINTO THE BOT
client.login(process.env.BOT_TOKEN);
export { client, gptClient, Sendmessage, runCompletion, aiMessage }
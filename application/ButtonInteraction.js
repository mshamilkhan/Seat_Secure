import { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonComponent, ButtonStyle } from "discord.js";
import { config } from "dotenv";
config({ path: process.ENV })

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
        }
    } catch (err) {
        console.log("ERR : ", err)
    };
});


// This will export the entire file as a module.
export { client };
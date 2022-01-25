const {
    MessageEmbed,
    Message
} = require("discord.js");
const config = require(`../../botconfig/config.json`);
const nfetch = require("node-fetch");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const {
    PaginatedMessage
} = require('@sapphire/discord.js-utilities');

const {
    lyricsEmbed,
    check_if_dj
} = require("../../handlers/functions");
module.exports = {
    name: "lyrics", //the command name for the Slash Command
    category: "Song",
    usage: "lyrics",
    aliases: ["ly", "songtext"],
    description: "Sends the Song Lyrics", //the command description for Slash Command Overview
    cooldown: 25,
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    run: async (client, message, args) => {
        try {
            //things u can directly access in an interaction!
            const {
                member,
                channelId,
                guildId,
                applicationId,
                commandName,
                deferred,
                replied,
                ephemeral,
                options,
                id,
                createdTimestamp
            } = message;
            const {
                guild
            } = member;
            const {
                channel
            } = member.voice;
            if (!channel) return message.reply({
                embeds: [
                    new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **Please join ${guild.me.voice.channel ? "__my__" : "a"} VoiceChannel First!**`)
                ],

            })
            if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
                return message.reply({
                    embeds: [new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setFooter(ee.footertext, ee.footericon)
                        .setTitle(`${client.allEmojis.x} Join __my__ Voice Channel!`)
                        .setDescription(`<#${guild.me.voice.channel.id}>`)
                    ],
                });
            }
            try {
                let newQueue = client.distube.getQueue(guildId);
                if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) return message.reply({
                    embeds: [
                        new MessageEmbed().setColor(ee.wrongcolor).setTitle(`${client.allEmojis.x} **I am nothing Playing right now!**`)
                    ],

                })
                let embeds = [];
                const paginatedLyrics = new PaginatedMessage({
                    template: new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle("Lyrics for " + newQueue.songs[0].name)
                        .setFooter('Provided by invalid-studios.com')
                });
                await nfetch("https://api.invalid-studios.com/lyrics/"+encodeURIComponent(newQueue.songs[0].name)).then(
                    async track => {
						track = await track.json();
                        if (!track.lyrics) return message.reply({
                            content: `${client.allEmojis.x} **No Lyrics Found!** :cry:`,
                        });
                        lyrics = track.lyrics;
                        const lyricsIndex = Math.round(lyrics.length / 4096) + 1;

                        for (let i = 1; i <= lyricsIndex; ++i) {
                            let b = i - 1;
                            if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
                                paginatedLyrics.addPageEmbed(embed => {
                                    return embed.setDescription(lyrics.slice(b * 4096, i * 4096));
                                });
                            }
                        }
                    }).catch(e => {
                    console.log(e)
                    return message.reply({
                        content: `${client.allEmojis.x} **No Lyrics Found!** :cry:\n${String(e).substr(0, 1800)}`,
                    });
                })
                paginatedLyrics.run(message);

            } catch (e) {
                console.log(e.stack ? e.stack : e)
                message.reply({
                    content: `${client.allEmojis.x} | Error: `,
                    embeds: [
                        new MessageEmbed().setColor(ee.wrongcolor)
                        .setDescription(`\`\`\`${e}\`\`\``)
                    ],

                })
            }
        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
}
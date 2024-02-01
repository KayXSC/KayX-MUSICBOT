const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fs = require('fs');
const Discord = require('discord.js');
const commands = new Map();
const { stream } = require('play-dl');
const { MessageActionRow, MessageButton } = require('discord.js');
const leveling = require('./leveling');
const DiscordXP = require('discord-xp');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const playdl = require('play-dl');

// Lee el archivo de configuración
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Configura la base de datos
mongoose.connect(config.database.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
DiscordXP.setURL(config.database.mongoUrl);

// Configura el cliente de Discord
const client = new Discord.Client({ 
    intents: [
        "GUILDS", 
        "GUILD_MESSAGES", 
        "GUILD_VOICE_STATES"
    ] 
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('KayX esta funcionando correctamente. Todos los derechos reservados a KayX Co!');
    client.user.setActivity('kayx.es | $help', { type: 'WATCHING' });
});

const prefix = config.bot.prefix;

const queues = new Map();

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commands.has(commandName)) return;

    try {
        commands.get(commandName).execute(message, queues);
    } catch (error) {
        console.error(error);
        message.reply('Hubo un error al intentar ejecutar ese comando!');
    }
});

async function execute(message, serverQueue) {
    const args = message.content.split(' ');

    const url = args[1];
    if (!validURL(url)) {
        message.channel.send('You need to provide a valid URL!');
        return;
    }

    let song;
    if (url.includes('spotify.com')) {
        // Extrae el ID de la canción de la URL de Spotify
        const trackId = url.split('track/')[1];
        // Obtiene la información de la canción de la API de Spotify
        const data = await spotifyApi.getTrack(trackId);
        const trackName = data.body.name;
        const artistName = data.body.artists[0].name;
        // Busca la canción en YouTube
        const stream = await playdl.stream(`${trackName} ${artistName}`);
        song = {
            title: `${trackName} - ${artistName}`,
            url: stream.url,
        };
    } else {
        const songInfo = await ytdl.getInfo(url);
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };
    }

    const voiceChannelId = message.member.voice.channelId;
    if (!voiceChannelId) {
        return message.channel.send(
            "You need to be in a valid voice channel to play music!"
        );
    }

    const voiceChannel = message.guild.channels.resolve(voiceChannelId);
    if (!voiceChannel || !(voiceChannel instanceof Discord.VoiceChannel)) {
        return message.channel.send(
            "You need to be in a valid voice channel to play music!"
        );
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }

    console.log(`Song info: ${JSON.stringify(song)}`); // Agrega esta línea

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel, // establece el VoiceChannel
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
            player: createAudioPlayer(),
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0], queueContruct.player);
        } catch (err) {
            console.error(err); // Manejo de errores mejorado
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(`Server queue: ${JSON.stringify(serverQueue.songs)}`); // Agrega esta línea
        return message.channel.send(`La canción ${song.title} ha sido añadida a la lista de reproducción.`);
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song))
        .on('finish', () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Empezando a reproducir: **${song}**`);
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            'You have to be in a voice channel to stop the music!'
        );
    if (!serverQueue)
        return message.channel.send('There is no song that I could skip!');
    serverQueue.songs.shift();
    play(message.guild, serverQueue.songs[0], serverQueue.player);
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            'You have to be in a voice channel to stop the music!'
        );
        
    if (!serverQueue)
        return message.channel.send('There is no song that I could stop!');
        
    serverQueue.songs = [];
    serverQueue.player.stop();
}

function pause(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            'You have to be in a voice channel to pause the music!'
        );
        
    if (!serverQueue)
        return message.channel.send('There is no song currently playing!');
        
    serverQueue.player.pause();
    message.channel.send('Music playback has been paused.');
}

function resume(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            'You have to be in a voice channel to resume the music!'
        );
        
    if (!serverQueue)
        return message.channel.send('There is no song currently paused!');
        
    serverQueue.player.unpause();
    message.channel.send('Music playback has been resumed.');
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

client.login(config.bot.token);
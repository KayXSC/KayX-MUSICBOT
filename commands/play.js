const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource } = require('@discordjs/voice');
const { stream, video_info } = require('play-dl');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'play',
    execute: async function(message, queues) {
        const url = message.content.split(' ')[1];

        // Verificar si la URL es válida
        const urlIsValid = (url) => {
            try {
                new URL(url);
            } catch (_) {
                return false;  
            }
            return true;
        }

        // Verificar si la URL es de un video de YouTube
        const isYoutubeVideo = (url) => {
            const youtubeVideoRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
            return youtubeVideoRegex.test(url);
        }

        if (!urlIsValid(url) || !isYoutubeVideo(url)) {
            return message.channel.send('Por favor, proporciona una URL válida de un video de YouTube.');
        }
        
        const channel = message.member.voice.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        const songInfo = await video_info(url);
        const songTitle = songInfo.video_details.title;
        const songDuration = songInfo.video_details.durationRaw; // get song duration
        const requester = message.author.username; // get song requester

        // If there's already a queue for this server, add the song to the queue
        if (queues.has(message.guild.id)) {
            queues.get(message.guild.id).push({ url, title: songTitle, duration: songDuration, requester, info: songInfo });
            const embed = new MessageEmbed()
                .setColor(0x0099FF)
                .setTitle('🎵 Canción añadida a la cola 🎵')
                .setURL(url)
                .setAuthor({ name: 'KayX', iconURL: 'https://i.imgur.com/P8HWC5S.png', url: 'https://discord.gg/S9TH3pFCx3' })
                .setDescription(`[${songTitle}](${url})`)
                .setThumbnail(songInfo.video_details.thumbnails[songInfo.video_details.thumbnails.length - 1].url)
                .addFields(
                    { name: '⏱ Duracion', value: songDuration, inline: true },
                    { name: '🕒 Hora', value: new Date().toLocaleTimeString(), inline: true },
                    { name: '👤 Solicitado', value: requester, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: 'KayX Co!', iconURL: 'https://i.imgur.com/P8HWC5S.png' });
            message.channel.send({ embeds: [embed] }); // Message when a song is added to the queue
            return;
        }

        // Otherwise, create a new queue
        queues.set(message.guild.id, [{ url, title: songTitle, duration: songDuration, requester, info: songInfo }]);

        // Function to play the next song in the queue
        const playNextSong = async () => {
            const nextSong = queues.get(message.guild.id).shift();

            if (!nextSong) {
                player.stop();
                connection.destroy();
                queues.delete(message.guild.id);
                return;
            }

            // Generate a list of songs in the queue
            const queueList = queues.get(message.guild.id).map((song, index) => `${index + 1}. ${song.title} (${song.duration}) solicitada por ${song.requester}`).join('\n');

            const info = nextSong.info;

            const embed = new MessageEmbed()
                .setColor(0x0099FF)
                .setTitle('🎵 Sonando ahora 🎵')
                .setURL(nextSong.url)
                .setAuthor({ name: 'KayX', iconURL: 'https://i.imgur.com/P8HWC5S.png', url: 'https://discord.gg/S9TH3pFCx3' })
                .setDescription(`[${nextSong.title}](${nextSong.url})`)
                .setThumbnail(info.video_details.thumbnails[info.video_details.thumbnails.length - 1].url)
                .addFields(
                    { name: '⏱ Duracion', value: nextSong.duration, inline: true },
                    { name: '🕒 Hora', value: new Date().toLocaleTimeString(), inline: true },
                    { name: '👤 Solicitado', value: nextSong.requester, inline: true },
                    { name: '🎵 Cola', value: queueList || 'No hay canciones en cola', inline: false },
                )
                .setTimestamp()
                .setFooter({ text: 'KayX Co!', iconURL: 'https://i.imgur.com/P8HWC5S.png' });
            message.channel.send({ embeds: [embed] }); // Message when a song starts playing

            const streamOptions = {
                type: 'opus',
                quality: 3, // highest quality
                requestOptions: {
                    headers: {
                        cookie: '', // Optional. If provided, it will fetch age-restricted videos also.
                    },
                },
            };

            const audioStream = await stream(nextSong.url, streamOptions);

            const resource = createAudioResource(audioStream.stream, { inputType: audioStream.type });

            player.play(resource);
        };

        player.on(AudioPlayerStatus.Idle, playNextSong);

        connection.subscribe(player);

        // Start playing
        playNextSong();
    }
};
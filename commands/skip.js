const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'skip',
    execute: async function(message, queues) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            message.reply('I am not playing any music in this guild.');
            return;
        }

        const queue = queues.get(message.guild.id);
        if (!queue) {
            message.reply('There are no songs in the queue.');
            return;
        }

        // Elimina la canción actual de la cola
        queue.shift();

        if (queue.length === 0) {
            // Si no hay más canciones en la cola, termina la conexión
            connection.destroy();
            message.reply('The queue is empty. Leaving the voice channel.');
        } else {
            // De lo contrario, reproduce la siguiente canción
            const nextSong = queue[0];
            const resource = createAudioResource(nextSong.stream);
            const player = createAudioPlayer();
            player.play(resource);
            connection.subscribe(player);

            message.reply(`Now playing: ${nextSong.title}`);
        }
    }
};

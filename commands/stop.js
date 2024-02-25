const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'stop',
    execute: async function(message, queues) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            message.reply('No estoy reproduciendo ninguna música en este servidor.');
            return;
        }

        const player = connection.state.subscription.player;
        if (player.state.status !== AudioPlayerStatus.Idle) {
            player.stop();
        }

        if (queues.has(message.guild.id)) {
            queues.get(message.guild.id).length = 0;
        }

        message.reply('He dejado de reproducir música y he limpiado la cola de canciones.');
    }
};

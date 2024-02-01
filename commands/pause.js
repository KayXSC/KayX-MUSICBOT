const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'pause',
    execute: async function(message) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            message.reply('I am not playing any music in this guild.');
            return;
        }
        if (connection.state.status !== "playing") {
            message.reply('The music is already paused.');
            return;
        }
        connection.pause();
        message.reply('Paused the music.');
    }
};
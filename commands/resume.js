const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'resume',
    execute: async function(message) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            message.reply('I am not playing any music in this guild.');
            return;
        }
        if (connection.state.status !== "paused") {
            message.reply('The music is already playing.');
            return;
        }
        connection.resume();
        message.reply('Resumed the music.');
    }
};
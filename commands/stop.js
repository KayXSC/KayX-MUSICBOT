const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'stop',
    execute: async function(message) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            message.reply('I am not playing any music in this guild.');
            return;
        }
        connection.destroy();
        message.reply('Stopped playing music.');
    }
};
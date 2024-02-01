const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'skip',
    execute: async function(message) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            message.reply('I am not playing any music in this guild.');
            return;
        }
        // Aquí necesitas implementar la lógica para saltar a la siguiente canción en tu cola.
        // Esto dependerá de cómo hayas implementado tu cola de canciones.
    }
};
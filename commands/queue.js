const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'queue',
    execute: function(message, queues) {
        const queue = queues.get(message.guild.id);

        if (!queue || queue.length === 0) {
            return message.channel.send('No hay canciones en la cola.');
        }

        const embed = new MessageEmbed()
            .setColor(0x0099FF)
            .setTitle('🎵 Cola de canciones 🎵');

        queue.forEach((song, index) => {
            embed.addFields(
                { name: `Canción ${index + 1}`, value: `[${song.title}](${song.url}) - ${song.duration} - Solicitada por ${song.requester}`, inline: false }
            );
        });

        message.channel.send({ embeds: [embed] });
    },
};
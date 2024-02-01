const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Muestra una lista de todos los comandos disponibles.',
    execute(message, args) {
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Comandos de musica')
            .setURL('https://github.com/KayXSC')
            .setAuthor({ name: 'KayX', iconURL: 'https://i.imgur.com/P8HWC5S.png', url: 'https://discord.gg/S9TH3pFCx3' })
            .setDescription('Estos son los comandos que puedes usar:')
            .setThumbnail('https://i.imgur.com/P8HWC5S.png')
            .addFields(
                { name: '$help', value: 'Despliega un menu con todos los comandos disponibles del bot.' },
                { name: '$pause', value: 'Pausa la cancion que esta sonando.' },
                { name: '$play', value: 'Reproduce una cancion a traves de un link de YouTube.' },
                { name: '$queue', value: 'Mira la cola de canciones actual del bot.' },
                { name: '$resume', value: 'Continua la cancion que has parado.' },
                { name: '$skip', value: 'Salta la cancion que esta sonando.' },
                { name: '$stop', value: 'Para la cancion y expulsa al bot del canal de voz' },
            )
            .setImage('https://i.imgur.com/P8HWC5S.png')
            .setTimestamp()
            .setFooter({ text: 'KayX Co!', iconURL: 'https://i.imgur.com/P8HWC5S.png' });

        message.channel.send({ embeds: [embed] });
    },
};
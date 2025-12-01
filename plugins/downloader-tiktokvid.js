import fetch from 'node-fetch'

var handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        throw m.reply(`*[ 🕸️ ] Has olvidado el comando?*\n\n*[ 🧠 ] Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZMkcmTCa6/`);
    }

    if (!args[0].match(/(https?:\/\/)?(www\.)?(vm\.|vt\.)?tiktok\.com\//)) {
        throw m.reply(`*[ ⚠️ ] Ese enlace no pertenece a TikTok no intentes engañar.*`);
    }

    try {
        await conn.reply(m.chat, "*[ ⏳ ] Invocando tu video... Preparando la transferencia...*", m);

        const tiktokData = await tiktokdl(args[0]);

        if (!tiktokData || !tiktokData.data) {
            throw m.reply("*[ 🕳️ ] La api no pudo extraer el contenido.*");
        }

        const videoURL = tiktokData.data.play;
        const videoURLWatermark = tiktokData.data.wmplay;
        const shadowInfo = `*📜 vídeo de tiktok extraído:*\n> ${tiktokData.data.title}`;

        if (videoURL || videoURLWatermark) {
            await conn.sendFile(
                m.chat,
                videoURL,
                "shadow_tiktok.mp4",
                "*`TRANSMISIÓN COMPLETADA - ARCHIVO EXTRAIDO`*" + `\n\n${TECHInfo}`,
                m
            );
            setTimeout(async () => {}, 1500);
        } else {
            throw m.reply("*[ ❌ ] La sombra ha fallado. No se pudo completar la descarga.*");
        }
    } catch (error1) {
        conn.reply(m.chat, `*[ ♦️ ] Error detectado: ${error1}*\n* no se pudo descargar tu video perdón 🥲...*`, m);
    }
};

handler.help = ['tiktok']
handler.tags = ['descargas']
handler.command = /^(tt|tiktok)$/i;

export default handler

async function tiktokdl(url) {
    let tikwm = `https://www.tikwm.com/api/?url=${url}?hd=1`
    let response = await (await fetch(tikwm)).json()
    return response
}
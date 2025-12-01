var handler = async (m, { conn }) => {
  
  if (m.text === '.creador') {
    const contacto = `
🤖 *¿QUIERES CONTACTAR A MI CREADOR?* 🤖

📞 *Número:* #1 +5491151545427
📞 *Numero:* #2 +5492644893953
🔔 *tareas* nodé.js Python.js

💫 *NOTA IMPORTANTE:*

¿Tienes preguntas, dudas o sugerencias sobre el funcionamiento de *Chrome Bot*? Puedes contactar a mi creador.

*Una cosa:* Los bots no descansan, pero yo sí, así que no me andes mandando mensaje a las 3am porque no te voy a contestar… 😴

_¡Gracias por tu comprensión!_ 💖
    `.trim()

    await conn.reply(m.chat, contacto, m)
    m.react('📞')
    return
  }
}

handler.help = ['creador']
handler.tags = ['main']
handler.command = ['creador', 'owner', 'creador', 'developer', 'desarrollador']

export default handler
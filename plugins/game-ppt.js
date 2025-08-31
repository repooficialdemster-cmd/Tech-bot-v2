// === Comando para iniciar el juego ===
const handler = async (m, { conn }) => {
  return m.reply(
    `🎮 *Piedra, Papel o Tijera* 🎮\n\n` +
    `Elige tu jugada respondiendo con:\n` +
    `1 = 🪨 Piedra\n` +
    `2 = 📄 Papel\n` +
    `3 = ✂️ Tijera`
  )
}

handler.command = /^ppt$/i
handler.help = ['ppt']
handler.tags = ['game']

// === Resolver jugada (before) ===
handler.before = async (m, { conn }) => {
  if (!m.message || !/^[123]$/.test(m.text)) return

  const choices = ['🪨 Piedra', '📄 Papel', '✂️ Tijera']
  const botChoice = choices[Math.floor(Math.random() * choices.length)]
  const userChoice = choices[parseInt(m.text) - 1]

  let result = getResult(userChoice, botChoice)
  await conn.sendMessage(m.chat, { 
    text: `Tú: ${userChoice}\nBot: ${botChoice}\n\n${result}` 
  }, { quoted: m })

  return true
}

function getResult(user, bot) {
  if (user === bot) return '🤝 ¡Empate!'
  if (
    (user.includes('Piedra') && bot.includes('Tijera')) ||
    (user.includes('Papel') && bot.includes('Piedra')) ||
    (user.includes('Tijera') && bot.includes('Papel'))
  ) return '🎉 ¡Ganaste!'
  return '😢 Perdiste...'
}

export default handler

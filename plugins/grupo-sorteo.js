let handler = async (m, { conn, text, participants }) => {
  let args = text.split(" ")
  if (args.length < 2) return m.reply("⚠️ Uso: .sorteo <premio> <ganadores>")
  
  let premio = args.slice(0, -1).join(" ")
  let ganadoresCount = parseInt(args[args.length - 1]) || 1

  // Participantes (sin el bot mismo)
  let users = participants.map(p => p.id).filter(id => id !== conn.user.id)

  if (users.length < ganadoresCount) return m.reply("⚠️ No hay suficientes participantes.")

  // Elegir ganadores
  let winners = []
  for (let i = 0; i < ganadoresCount; i++) {
    let winner = users.splice(Math.floor(Math.random() * users.length), 1)[0]
    winners.push("@" + winner.split("@")[0])
  }

  let msg = `🎉 *SORTEO* 🎉\n\n` +
            `🎁 Premio: *${premio}*\n` +
            `👑 Ganador(es): ${winners.join(", ")}`

  await conn.sendMessage(m.chat, { text: msg, mentions: participants.map(p => p.id) }, { quoted: m })
}

handler.command = ['sorteo', 'sortear']
handler.tags = ["group"]
handler.admin = true
handler.group = true

export default handler

import fs from 'fs'
import path from 'path'

const sorteosPath = path.resolve('./json/sorteos.json')

// === UTILS JSON ===
function readSorteos() {
  try {
    if (!fs.existsSync(sorteosPath)) {
      fs.writeFileSync(sorteosPath, JSON.stringify({}, null, 2))
    }
    return JSON.parse(fs.readFileSync(sorteosPath))
  } catch {
    return {}
  }
}

function saveSorteos(data) {
  fs.writeFileSync(sorteosPath, JSON.stringify(data, null, 2))
}

function getGroupSorteos(groupId) {
  let sorteos = readSorteos()
  if (!sorteos[groupId]) sorteos[groupId] = { active: false, hora: '', descripcion: '', participantes: [] }
  return sorteos[groupId]
}

let handler = async (m, { conn, args, text }) =>
  const groupId = m.chat
  let sorteoData = getGroupSorteos(groupId)

  if (command === 'sorteo') {
    if (!text) return m.reply('Uso: .sorteo <hora> <descripción>\nEjemplo: .sorteo 02:10pm Sorteo de 100USD!!!')
    
    const [hora, ...desc] = text.split(' ')
    const descripcion = desc.join(' ')
    
    if (!hora || !descripcion) return m.reply('Formato inválido. Usa: .sorteo <hora> <descripción>')
    
    sorteoData.active = true
    sorteoData.hora = hora
    sorteoData.descripcion = descripcion
    sorteoData.participantes = []
    
    saveSorteos({ ...readSorteos(), [groupId]: sorteoData })
    
    await conn.sendMessage(m.chat, { text: `🎉 *Nuevo Sorteo Creado!*\n\n🕒 Hora: ${hora}\n💰 Premio: ${descripcion}\n\nPara participar, responde a este mensaje con ".participar"` }, { quoted: m })
  } else if (command === 'participar') {
    if (!sorteoData.active) return m.reply('❌ No hay un sorteo activo en este grupo.')
    
    const userId = m.sender.split('@')[0]
    if (sorteoData.participantes.includes(userId)) return m.reply('❌ Ya estás participando.')
    
    sorteoData.participantes.push(userId)
    saveSorteos({ ...readSorteos(), [groupId]: sorteoData })
    
    await m.reply(`✅ Te has registrado en el sorteo de ${sorteoData.hora} - ${sorteoData.descripcion}`)
  } else if (command === 'sortear') {
    if (!sorteoData.active) return m.reply('❌ No hay un sorteo activo.')
    if (sorteoData.participantes.length === 0) return m.reply('❌ No hay participantes.')
    
    const ganadorIndex = Math.floor(Math.random() * sorteoData.participantes.length)
    const ganador = sorteoData.participantes[ganadorIndex] + '@s.whatsapp.net'
    
    await conn.sendMessage(m.chat, { text: `🏆 *¡Ganador del Sorteo!*\n\n🕒 Hora: ${sorteoData.hora}\n💰 Premio: ${sorteoData.descripcion}\n👤 Ganador: @${sorteoData.participantes[ganadorIndex]}`, mentions: [ganador] })
    
    sorteoData.active = false
    saveSorteos({ ...readSorteos(), [groupId]: sorteoData })
  } else if (command === 'cancelarsorteo') {
    if (!sorteoData.active) return m.reply('❌ No hay un sorteo activo.')
    
    sorteoData.active = false
    saveSorteos({ ...readSorteos(), [groupId]: sorteoData })
    
    await m.reply('❌ Sorteo cancelado.')
  }
}

handler.command = ['sorteo', 'participar', 'sortear', 'cancelarsorteo']
handler.group = true
handler.register = true
handler.admin = true
handler.tags = ['fun']
handler.help = [
  'sorteo <hora> <descripción> - Crea un sorteo',
  'participar - Únete al sorteo activo',
  'sortear - Elige un ganador (admin)',
  'cancelarsorteo - Cancela el sorteo (admin)'
]
handler.admin = ['sorteo', 'sortear', 'cancelarsorteo'] // Solo admins para crear/sortear/cancelar

export default handler

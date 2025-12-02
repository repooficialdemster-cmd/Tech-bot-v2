import axios from 'axios'

var handler = async (m, { conn, text }) => {
  
  if (m.text.startsWith('.letra')) {
    const args = text.trim().split(' ')
    args.shift() // Remover ".letra"
    const searchQuery = args.join(' ')
    
    if (!searchQuery) {
      m.react('🎵')
      return await conn.reply(m.chat,
        `🎤 *BUSCADOR DE LETRAS* 🎤\n\n` +
        `*Sintaxis:* .letra [canción]\n` +
        `          .letra [canción] [artista]\n\n` +
        `*Ejemplos prácticos:*\n` +
        `\`\`\`\n` +
        `.letra shape of you\n` +
        `.letra hasta que se seque el malecón\n` +
        `.letra la bikina - luis miguel\n` +
        `.letra corridos belicos\n` +
        `\`\`\`\n\n` +
        `_Encuentra la letra de cualquier canción_`,
        m
      )
    }
    
    try {
      // Mensaje de carga con emojis animados
      const loadingEmojis = ['🎵', '🎶', '🎤', '🎧']
      let loadingIndex = 0
      
      const loadingMsg = await conn.reply(m.chat,
        `${loadingEmojis[loadingIndex]} *Buscando:* "${searchQuery}"\n` +
        `_Esto puede tomar unos segundos..._`,
        m
      )
      
      // Actualizar emoji de carga cada 2 segundos
      const loadingInterval = setInterval(async () => {
        loadingIndex = (loadingIndex + 1) % loadingEmojis.length
        try {
          await conn.sendMessage(m.chat, {
            text: `${loadingEmojis[loadingIndex]} *Buscando:* "${searchQuery}"\n` +
                  `_Esto puede tomar unos segundos..._`,
            edit: loadingMsg.key
          })
        } catch (e) {}
      }, 2000)
      
      // Hacer la consulta a la API
      const apiResponse = await axios({
        method: 'GET',
        url: 'https://api-adonix.ultraplus.click/search/lyrics',
        params: {
          apikey: 'DemonKeytechbot',
          query: searchQuery
        },
        headers: {
          'User-Agent': 'ChromeBot/1.0'
        }
      })
      
      clearInterval(loadingInterval)
      
      if (!apiResponse.data?.result?.lyrics) {
        await conn.sendMessage(m.chat, {
          text: `❌ *Letra no encontrada*\n\n` +
                `No hay resultados para: *${searchQuery}*\n\n` +
                `💡 *Sugerencias:*\n` +
                `• Verifica la ortografía\n` +
                `• Intenta con el nombre en inglés\n` +
                `• Agrega el nombre del artista\n` +
                `• Prueba con canciones más populares`,
          edit: loadingMsg.key
        })
        m.react('❌')
        return
      }
      
      const song = apiResponse.data.result
      
      // Crear mensaje formateado
      let message = `🎵 *${song.title || 'Canción'}*\n`
      
      if (song.artist) {
        message += `👨‍🎤 *Artista:* ${song.artist}\n`
      }
      
      if (song.album) {
        message += `💿 *Álbum:* ${song.album}\n`
      }
      
      if (song.year) {
        message += `📅 *Año:* ${song.year}\n`
      }
      
      message += `\n📜 *LETRA:*\n`
      message += `══════════════════\n\n`
      
      // Procesar la letra
      let lyrics = song.lyrics
      const MAX_CHARS = 3500
      
      if (lyrics.length > MAX_CHARS) {
        // Dividir en partes
        const part1 = lyrics.substring(0, MAX_CHARS)
        const part2 = lyrics.substring(MAX_CHARS)
        
        // Primera parte
        message += part1
        message += `\n\n[ *Continuará...* ]`
        
        await conn.sendMessage(m.chat, {
          text: message,
          edit: loadingMsg.key
        })
        
        m.react('✅')
        
        // Segunda parte después de 1 segundo
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        let secondMessage = `🎵 *CONTINUACIÓN - ${song.title || 'Canción'}*\n`
        secondMessage += `══════════════════\n\n`
        secondMessage += part2.substring(0, MAX_CHARS)
        
        if (part2.length > MAX_CHARS) {
          secondMessage += `\n\n[ *Letra muy extensa, parte final truncada* ]`
        }
        
        secondMessage += `\n\n🎶 *Fin de la letra*`
        
        await conn.reply(m.chat, secondMessage, m)
        
      } else {
        // Letra completa en un solo mensaje
        message += lyrics
        message += `\n\n✨ *Letra completa obtenida*`
        
        await conn.sendMessage(m.chat, {
          text: message,
          edit: loadingMsg.key
        })
        
        m.react('✅')
      }
      
    } catch (error) {
      console.error('Error letra:', error)
      
      const errorMsg = `⚠️ *Error del sistema*\n\n` +
        `No se pudo obtener la letra en este momento.\n\n` +
        `*Posibles causas:*\n` +
        `• API temporalmente no disponible\n` +
        `• Problema de conexión\n` +
        `• Canción muy poco común\n\n` +
        `Intenta nuevamente en unos minutos.`
      
      await conn.reply(m.chat, errorMsg, m)
      m.react('⚠️')
    }
    
    return
  }
}

handler.help = ['letra <canción>']
handler.tags = ['music']
handler.command = ['letra', 'lyric', 'lyrics', 'songtext']

export default handler
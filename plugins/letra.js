import axios from 'axios'

var handler = async (m, { conn, text }) => {
  
  if (m.text.startsWith('.letra')) {
    const searchQuery = text?.trim().replace('.letra', '').trim()
    
    if (!searchQuery) {
      m.react('❓')
      return await conn.reply(m.chat,
        `🎵 *BUSCADOR DE LETRAS DE CANCIONES* 🎵\n\n` +
        `*Uso:* .letra [nombre de la canción]\n` +
        `*Uso 2:* .letra [canción] - [artista]\n\n` +
        `*Ejemplos:*\n` +
        `• .letra Bohemian Rhapsody\n` +
        `• .letra Blinding Lights - The Weeknd\n` +
        `• .letra Despacito - Luis Fonsi\n` +
        `• .letra Flowers - Miley Cyrus\n\n` +
        `_Te mostraré la letra completa de la canción_`,
        m
      )
    }
    
    try {
      m.react('🔍')
      
      // Enviar mensaje de búsqueda
      const searchMsg = await conn.reply(m.chat,
        `🔍 *Buscando letra:* "${searchQuery}"\n` +
        `⏳ Consultando base de datos de canciones...`,
        m
      )
      
      // Hacer la petición a la API
      const apiUrl = 'https://api-adonix.ultraplus.click/search/lyrics'
      const response = await axios.get(apiUrl, {
        params: {
          apikey: 'DemonKeytechbot',
          query: searchQuery
        },
        timeout: 30000 // 30 segundos timeout
      })
      
      if (!response.data || !response.data.result) {
        await conn.sendMessage(m.chat, {
          text: `❌ *No se encontró la letra*\n\n` +
                `No pude encontrar la letra para: "${searchQuery}"\n\n` +
                `Intenta con:\n` +
                `• Un nombre más específico\n` +
                `• Agregar el artista\n` +
                `• Verificar la ortografía`,
          edit: searchMsg.key
        })
        m.react('❌')
        return
      }
      
      const songData = response.data.result
      
      // Formatear la letra
      let lyricsMessage = `🎵 *${songData.title || 'Canción'}* 🎵\n\n`
      
      if (songData.artist) {
        lyricsMessage += `👤 *Artista:* ${songData.artist}\n`
      }
      
      if (songData.album) {
        lyricsMessage += `💿 *Álbum:* ${songData.album}\n`
      }
      
      if (songData.year) {
        lyricsMessage += `📅 *Año:* ${songData.year}\n`
      }
      
      lyricsMessage += `\n📝 *LETRA DE LA CANCIÓN:*\n\n`
      
      // Dividir la letra si es muy larga (WhatsApp tiene límite de 4096 caracteres)
      const maxLength = 3500
      let lyricsText = songData.lyrics || 'Letra no disponible'
      
      if (lyricsText.length > maxLength) {
        lyricsText = lyricsText.substring(0, maxLength) + 
          `\n\n... [Letra truncada, muy larga para mostrar completa] ...`
      }
      
      lyricsMessage += lyricsText
      
      // Agregar créditos
      lyricsMessage += `\n\n🎶 *Powered by Chrome Bot*`
      
      // Editar el mensaje de búsqueda con la letra
      await conn.sendMessage(m.chat, {
        text: lyricsMessage,
        edit: searchMsg.key
      })
      
      m.react('✅')
      
      // Si la letra fue truncada, enviar parte restante en otro mensaje
      if (songData.lyrics && songData.lyrics.length > maxLength) {
        const remainingText = songData.lyrics.substring(maxLength)
        const remainingMax = 3500
        
        if (remainingText.length > 0) {
          const remainingMessage = `🎵 *CONTINUACIÓN DE LA LETRA* 🎵\n\n` +
            `${remainingText.substring(0, remainingMax)}${remainingText.length > remainingMax ? '...' : ''}`
          
          await conn.reply(m.chat, remainingMessage, m)
        }
      }
      
    } catch (error) {
      console.error('Error buscando letra:', error)
      
      let errorMessage = `❌ *Error en la búsqueda*\n\n`
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += `La búsqueda tardó demasiado tiempo.\n`
        errorMessage += `Intenta con una canción más popular o específica.`
      } else if (error.response?.status === 404) {
        errorMessage += `La canción "${searchQuery}" no fue encontrada.\n`
        errorMessage += `Verifica el nombre y artista.`
      } else if (error.response?.status === 429) {
        errorMessage += `Demasiadas solicitudes.\n`
        errorMessage += `Espera unos minutos antes de intentar nuevamente.`
      } else {
        errorMessage += `Ocurrió un error al buscar la letra.\n`
        errorMessage += `Intenta nuevamente más tarde.`
      }
      
      await conn.sendMessage(m.chat, {
        text: errorMessage,
        edit: m.key // Intentar editar el mensaje original
      }).catch(async () => {
        // Si no se puede editar, enviar nuevo mensaje
        await conn.reply(m.chat, errorMessage, m)
      })
      
      m.react('❌')
    }
    
    return
  }
}

handler.help = ['letra <nombre canción>']
handler.tags = ['music', 'tools']
handler.command = ['letra', 'lyrics', 'songtext', 'cancion']

export default handler
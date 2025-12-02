import axios from 'axios'

var handler = async (m, { conn, text }) => {
  
  if (m.text.startsWith('.letra')) {
    // Obtener el texto de búsqueda
    const searchQuery = text?.replace('.letra', '').trim()
    
    if (!searchQuery) {
      m.react('❓')
      return await conn.reply(m.chat,
        `🎵 *BUSCADOR DE LETRAS* 🎵\n\n` +
        `*Uso:* .letra [nombre de la canción]\n\n` +
        `*Ejemplos:*\n` +
        `• .letra Bohemian Rhapsody\n` +
        `• .letra Blinding Lights\n` +
        `• .letra Despacito\n` +
        `• .letra Flowers\n\n` +
        `_Te mostraré la letra completa de la canción_`,
        m
      )
    }
    
    try {
      m.react('🔍')
      
      // Enviar mensaje de búsqueda
      const searchMsg = await conn.reply(m.chat,
        `🔍 *Buscando:* "${searchQuery}"\n` +
        `⏳ Conectando con la base de datos musical...`,
        m
      )
      
      // CONEXIÓN DIRECTA A LA API
      const apiUrl = `https://api-adonix.ultraplus.click/search/lyrics?apikey=DemonKeytechbot&query=${encodeURIComponent(searchQuery)}`
      
      console.log(`🔗 Conectando a API: ${apiUrl}`)
      
      const response = await axios.get(apiUrl, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      console.log('📊 Respuesta API:', response.status)
      
      if (response.status !== 200) {
        throw new Error(`API respondió con código ${response.status}`)
      }
      
      if (!response.data || !response.data.result) {
        await conn.sendMessage(m.chat, {
          text: `❌ *Letra no encontrada*\n\n` +
                `No hay resultados para: "${searchQuery}"\n\n` +
                `💡 *Intenta con:*\n` +
                `• Nombre más específico\n` +
                `• Agregar el artista\n` +
                `• Canción más popular`,
          edit: searchMsg.key
        })
        m.react('❌')
        return
      }
      
      const songData = response.data.result
      console.log('🎵 Datos recibidos:', {
        titulo: songData.title,
        artista: songData.artist,
        tieneLetra: !!songData.lyrics,
        longitudLetra: songData.lyrics?.length || 0
      })
      
      // Verificar si hay letra
      if (!songData.lyrics || songData.lyrics.trim() === '') {
        await conn.sendMessage(m.chat, {
          text: `⚠️ *Letra no disponible*\n\n` +
                `*Canción:* ${songData.title || searchQuery}\n` +
                `${songData.artist ? `*Artista:* ${songData.artist}\n` : ''}` +
                `\nLa letra de esta canción no está disponible en la base de datos.`,
          edit: searchMsg.key
        })
        m.react('⚠️')
        return
      }
      
      // Formatear la respuesta
      let lyricsMessage = `🎵 *${songData.title || 'Canción'}*\n`
      
      if (songData.artist) {
        lyricsMessage += `🎤 *Artista:* ${songData.artist}\n`
      }
      
      if (songData.album) {
        lyricsMessage += `💿 *Álbum:* ${songData.album}\n`
      }
      
      if (songData.year) {
        lyricsMessage += `📅 *Año:* ${songData.year}\n`
      }
      
      lyricsMessage += `\n📜 *LETRA DE LA CANCIÓN:*\n`
      lyricsMessage += `══════════════════\n\n`
      
      // Manejar letras largas
      const MAX_LENGTH = 3500
      const lyrics = songData.lyrics.trim()
      
      if (lyrics.length <= MAX_LENGTH) {
        // Letra corta - un solo mensaje
        lyricsMessage += lyrics
        
        await conn.sendMessage(m.chat, {
          text: lyricsMessage,
          edit: searchMsg.key
        })
        m.react('✅')
        
      } else {
        // Letra larga - dividir en partes
        const part1 = lyrics.substring(0, MAX_LENGTH)
        const part2 = lyrics.substring(MAX_LENGTH)
        
        // Primera parte
        lyricsMessage += part1
        lyricsMessage += `\n\n[ *Continúa en siguiente mensaje...* ]`
        
        await conn.sendMessage(m.chat, {
          text: lyricsMessage,
          edit: searchMsg.key
        })
        
        m.react('✅')
        
        // Segunda parte después de breve pausa
        await new Promise(resolve => setTimeout(resolve, 500))
        
        let secondMessage = `🎵 *CONTINUACIÓN - ${songData.title || 'Canción'}*\n`
        secondMessage += `══════════════════\n\n`
        
        if (part2.length <= MAX_LENGTH) {
          secondMessage += part2
          secondMessage += `\n\n🎶 *Fin de la letra*`
        } else {
          secondMessage += part2.substring(0, MAX_LENGTH)
          secondMessage += `\n\n[ *Letra muy extensa, parte final truncada* ]`
        }
        
        await conn.reply(m.chat, secondMessage, m)
      }
      
    } catch (error) {
      console.error('❌ Error en .letra:', error.message)
      
      let errorMessage = ''
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = `❌ *Error de conexión*\n\n` +
          `No se pudo conectar con el servidor de letras.\n` +
          `La API puede estar temporalmente fuera de servicio.`
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = `⏱️ *Tiempo de espera agotado*\n\n` +
          `La conexión tardó demasiado.\n` +
          `Intenta nuevamente en unos momentos.`
      } else if (error.response?.status === 404) {
        errorMessage = `❌ *No encontrado*\n\n` +
          `La canción "${searchQuery}" no existe en la base de datos.`
      } else if (error.response?.status === 429) {
        errorMessage = `⚠️ *Demasiadas solicitudes*\n\n` +
          `Has hecho muchas búsquedas en poco tiempo.\n` +
          `Espera unos minutos antes de intentar nuevamente.`
      } else {
        errorMessage = `❌ *Error en la búsqueda*\n\n` +
          `No se pudo obtener la letra.\n` +
          `Error: ${error.message || 'Desconocido'}`
      }
      
      // Intentar editar el mensaje original
      try {
        await conn.sendMessage(m.chat, {
          text: errorMessage,
          edit: m.key
        })
      } catch (editError) {
        // Si no se puede editar, enviar nuevo mensaje
        await conn.reply(m.chat, errorMessage, m)
      }
      
      m.react('❌')
    }
    
    return
  }
}

handler.help = ['letra <nombre canción>']
handler.tags = ['music']
handler.command = ['letra', 'lyric', 'lyrics', 'cancion']

export default handler
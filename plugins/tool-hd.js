//--> Hecho por Ado-rgb (github.com/Ado-rgb)
// •|• No quites créditos..
import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react('⏳')

    let q = m.quoted ? m.quoted : m  
    let mime = (q.msg || q).mimetype || q.mediaType || ''  

    if (!mime) {  
      return conn.sendMessage(m.chat, {  
        text: `❇️ Por favor, envía una imagen o responde a una imagen usando *${usedPrefix + command}*`
      }, { quoted: m })  
    }  

    if (!/image\/(jpe?g|png|webp)/.test(mime)) {  
      return conn.sendMessage(m.chat, {  
        text: `⚠️ El formato (${mime}) no es compatible, usa JPG, PNG o WEBP.`
      }, { quoted: m })  
    }  

    await conn.sendMessage(m.chat, {  
      text: `⏳ Mejorando tu imagen, espera...`
    }, { quoted: m })  

    let img = await q.download?.()  
    if (!img) throw new Error('No pude descargar la imagen.')  

    // Opción 1: API BigMP (sin key, mejora calidad)
    const apiUrl = 'https://api.bigmp.com/upscale'
    
    const form = new FormData()
    form.append('image', img, 'image.jpg')
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      body: form
    })
    
    if (!res.ok) throw new Error(`Error en la API: ${res.statusText}`)
    
    const buffer = await res.buffer()

    // Verificar si la respuesta es una imagen válida
    if (buffer.length < 1000) {
      throw new Error('La API no devolvió una imagen válida')
    }

    await conn.sendMessage(m.chat, {  
      image: buffer,  
      caption: '✅ *Imagen mejorada con éxito*\n\n*API utilizada:* BigMP (Gratuita)'
    }, { quoted: m })  

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    
    // Intentar con API alternativa si la primera falla
    try {
      await conn.sendMessage(m.chat, {  
        text: `⚠️ Primera API falló, intentando con alternativa...`
      }, { quoted: m })
      
      let q = m.quoted ? m.quoted : m
      let img = await q.download?.()
      
      if (img) {
        // Opción 2: API alternativa - ToolsU (sin key)
        const altApiUrl = 'https://tools.revesery.com/editor/upscale'
        const form2 = new FormData()
        form2.append('image', img, 'image.jpg')
        
        const res2 = await fetch(altApiUrl, {
          method: 'POST',
          body: form2
        })
        
        if (res2.ok) {
          const buffer2 = await res2.buffer()
          await conn.sendMessage(m.chat, {  
            image: buffer2,  
            caption: '✅ *Imagen mejorada con éxito*\n\n*API utilizada:* ToolsU (Alternativa)'
          }, { quoted: m })
          await m.react('✅')
          return
        }
      }
    } catch (e2) {
      console.error('Error con API alternativa:', e2)
    }
    
    await conn.sendMessage(m.chat, {
      text: '❌ Error al mejorar la imagen. Intenta con otra imagen o más tarde.',
      ...global.rcanal
    }, { quoted: m })
  }
}

handler.help = ['hd']
handler.tags = ['tools']
handler.command = ['remini', 'hd', 'enhance']

export default handler
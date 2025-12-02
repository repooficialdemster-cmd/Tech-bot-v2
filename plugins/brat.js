#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const API_KEY = 'DemonKeytechbot';
const BASE_URL = 'https://api-adonix.ultraplus.click/canvas/brat';

async function generarBrat(texto, color, output = 'brat-output.png') {
    try {
        console.log('🎨 Generando imagen Brat...');
        
        // Codificar parámetros
        const textoCodificado = encodeURIComponent(texto);
        const colorCodificado = color.replace('#', '%23');
        
        // Construir URL
        const url = `${BASE_URL}?apikey=${API_KEY}&text=${textoCodificado}&color=${colorCodificado}`;
        
        console.log('🔗 URL generada:', url);
        
        // Descargar imagen
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'BratGenerator/1.0'
            }
        });
        
        // Guardar archivo
        fs.writeFileSync(output, response.data);
        
        console.log(`✅ Imagen guardada como: ${output}`);
        console.log(`📏 Tamaño: ${response.data.length} bytes`);
        
        return {
            success: true,
            file: output,
            size: response.data.length
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Manejo de argumentos CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(`
🎨 Brat Generator - Generador de imágenes estilo Brat

Uso:
  node brat.js "Texto aquí" "#colorhex" [nombre-salida.png]

Ejemplos:
  node brat.js "Hola Mundo" "#FF5733"
  node brat.js "Brat Style" "#9B59B6" mi-imagen.png
  node brat.js "Texto" "%23FF0000" (usando %23 en lugar de #)

Parámetros:
  texto    : Texto a mostrar en la imagen
  color    : Color hexadecimal (#RRGGBB o %23RRGGBB)
  salida   : (Opcional) Nombre del archivo de salida
        `);
        process.exit(1);
    }
    
    const texto = args[0];
    const color = args[1];
    const output = args[2] || `brat-${Date.now()}.png`;
    
    generarBrat(texto, color, output);
}

module.exports = { generarBrat };
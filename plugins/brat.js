// brat-generator.js
const axios = require('axios');
const fs = require('fs');
const querystring = require('querystring');

class BratGenerator {
    constructor(apiKey = 'DemonKeytechbot') {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api-adonix.ultraplus.click/canvas/brat';
    }
    
    async generar(opciones) {
        const {
            texto,
            color = '#FF0000',
            output = `brat-${Date.now()}.png`,
            mostrarInfo = false
        } = opciones;
        
        if (!texto) {
            throw new Error('El texto es requerido');
        }
        
        // Preparar parámetros
        const params = {
            apikey: this.apiKey,
            text: texto,
            color: color.startsWith('#') ? color.replace('#', '%23') : color
        };
        
        // Agregar parámetros adicionales si existen
        if (opciones.size) params.size = opciones.size;
        if (opciones.font) params.font = opciones.font;
        
        // Construir URL
        const queryString = querystring.stringify(params);
        const url = `${this.baseUrl}?${queryString}`;
        
        if (mostrarInfo) {
            console.log('🔍 Parámetros:', params);
            console.log('🔗 URL completa:', url);
        }
        
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                validateStatus: function (status) {
                    return status >= 200 && status < 300;
                }
            });
            
            // Verificar que es una imagen
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.includes('image')) {
                throw new Error('La respuesta no es una imagen válida');
            }
            
            // Guardar archivo
            fs.writeFileSync(output, response.data);
            
            console.log(`🎨 Imagen Brat generada exitosamente!`);
            console.log(`📁 Archivo: ${output}`);
            console.log(`💾 Tamaño: ${(response.data.length / 1024).toFixed(2)} KB`);
            console.log(`🎯 Tipo: ${contentType}`);
            
            return {
                success: true,
                path: output,
                size: response.data.length,
                type: contentType,
                url: url
            };
            
        } catch (error) {
            console.error('❌ Error al generar la imagen:', error.message);
            
            if (error.response) {
                console.error(`📊 Status: ${error.response.status}`);
                console.error(`📝 Respuesta: ${error.response.data.toString()}`);
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Método rápido
    async rapido(texto, color = '#FF00FF') {
        return this.generar({ texto, color });
    }
}

// Ejemplos de uso
/*
const brat = new BratGenerator();

// Ejemplo 1: Generación simple
brat.generar({
    texto: 'Brat Style',
    color: '#FF1493',
    output: 'brat-style.png',
    mostrarInfo: true
});

// Ejemplo 2: Método rápido
brat.rapido('Texto rápido', '#00FF00');

// Ejemplo 3: Con diferentes colores
const colores = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
colores.forEach(async (color, i) => {
    await brat.generar({
        texto: `Brat ${i + 1}`,
        color: color,
        output: `brat-${i + 1}.png`
    });
});
*/
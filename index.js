// Universidad del Valle de Guatemala
// Redes
// Laboratorio #3

import readline from 'readline'

const registrar = (mensaje, nivel = 'info') => {
  switch (nivel) {
    case 'info':
      console.log(`INFO: ${mensaje}`)
      break
    case 'warn':
      console.warn(`ADVERTENCIA: ${mensaje}`)
      break
    case 'error':
      console.error(`ERROR: ${mensaje}`)
      break
    default:
      console.log(`LOG: ${mensaje}`)
      break
  }
}

// Utilidades para analizar archivos
const encontrarArchivoTopologia = (directorio) => {
  const todosArchivos = fs.readdirSync(directorio)
  for (const archivo of todosArchivos) {
    if (archivo.startsWith('topo-') && archivo.endsWith('.txt')) {
      return path.join(directorio, archivo)
    }
  }
  return null
}

// Utilidades de entrada del usuario
const interfazEntrada = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

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

const obtenerEntrada = (textoPrompt) => {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(textoPrompt, (respuesta) => {
      rl.close()
      resolve(respuesta)
    })
  })
}

const preguntarUsuario = (textoPrompt) => {
  return new Promise(resolve => interfazEntrada.question(textoPrompt, resolve))
}

const elegirAlgoritmoEnrutamiento = async () => {
  const algoritmoElegido = await preguntarUsuario('Seleccione el método de enrutamiento:\n1. Inundación\n2. Estado de Enlace\n')
  if (algoritmoElegido === '1') {
    return 'inundacion'
  } else if (algoritmoElegido === '2') {
    return 'estado-de-enlace'
  } else {
    registrar('Entrada inválida. Por favor, inténtelo de nuevo.', 'warn')
    return elegirAlgoritmoEnrutamiento()
  }
}

const encontrarArchivoNombres = (directorio) => {
  const todosArchivos = fs.readdirSync(directorio)
  for (const archivo of todosArchivos) {
    if (archivo.startsWith('names-') && archivo.endsWith('.json')) {
      return path.join(directorio, archivo)
    }
  }
  return null
}

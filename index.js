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

const cargarConfiguracionNombres = (ubicacionArchivo) => {
  const datosCrudos = fs.readFileSync(ubicacionArchivo, 'utf8')
  const configuracionParseada = JSON.parse(datosCrudos).config
  return configuracionParseada
}

const cargarConfiguracionInundacion = (ubicacionArchivo) => {
  const datosCrudos = fs.readFileSync(ubicacionArchivo, 'utf8')
  const configuracionParseada = JSON.parse(datosCrudos).config

  const instanciasNodos = {}

  for (const idNodo in configuracionParseada) {
    instanciasNodos[idNodo] = new NodoFlooding(idNodo)
  }

  for (const idNodo in configuracionParseada) {
    const nodo = instanciasNodos[idNodo]
    configuracionParseada[idNodo].forEach((vecino) => {
      nodo.agregarAdyacente(instanciasNodos[vecino.neighbor], vecino.weight)
    })
  }

  return instanciasNodos
}

const cargarConfiguracionEstadoEnlace = (ubicacionArchivo) => {
  const datosCrudos = fs.readFileSync(ubicacionArchivo, 'utf8')
  const configuracionParseada = JSON.parse(datosCrudos).config

  const instanciasNodos = {}

  for (const idNodo in configuracionParseada) {
    instanciasNodos[idNodo] = new LinkStateNodo(idNodo)
  }

  for (const idNodo in configuracionParseada) {
    const nodo = instanciasNodos[idNodo]
    configuracionParseada[idNodo].forEach((vecino) => {
      nodo.agregarVecino(instanciasNodos[vecino.neighbor], vecino.weight)
    })
  }

  return instanciasNodos
}

// Obtener credenciales del nodo desde los argumentos de la línea de comandos
const obtenerCredencialesNodo = (instanciasNodos, mapaNombresXmpp) => {
  const [nombreNodo, contrasena] = process.argv.slice(2)

  if (!nombreNodo || !contrasena) {
    registrar('Por favor proporcione tanto el nombre del nodo como la contraseña como argumentos.', 'error')
    process.exit(1)
  }

  if (instanciasNodos[nombreNodo]) {
    let usuarioXmpp = mapaNombresXmpp[nombreNodo]
    if (!usuarioXmpp) {
      registrar(`No se encontró la dirección para ${nombreNodo}.`, 'error')
      process.exit(1)
    }

    usuarioXmpp = usuarioXmpp.split('@')[0]

    registrar(`El nodo ${nombreNodo} utilizará la dirección: ${usuarioXmpp}`, 'info')
    return { node: instanciasNodos[nombreNodo], usuarioXmpp, contrasena }
  } else {
    registrar('Nodo no reconocido. Por favor verifique y vuelva a intentarlo.', 'warn')
    registrar('Nodos conocidos: ' + Object.keys(instanciasNodos).join(', '), 'info')
    process.exit(1)
  }
}

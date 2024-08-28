// Universidad del Valle de Guatemala
// Redes
// Laboratorio #3

import { ConectarXMPP, enviarMensaje, escucharMensaje } from './xmpp.js'
import fs from 'fs'
import path from 'path'
import { NodoFlooding } from './classes/nodoFlooding.js'
import { LinkStateNodo } from './classes/linkStateNodo.js'
import readline from 'readline'

/**
 * Logs messages with different severity levels.
 *
 * @param {string} mensaje - The message to log.
 * @param {string} [nivel='info'] - The log level ('info', 'warn', 'error').
 */
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

/**
 * Searches for a topology file in the specified directory.
 *
 * @param {string} directorio - The directory to search for topology files.
 * @returns {string|null} - The path to the found topology file or null if not found.
 */
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

/**
 * Prompts the user for input.
 *
 * @param {string} textoPrompt - The text prompt to display.
 * @returns {Promise<string>} - The user's input.
 */
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

/**
 * Prompts the user for input using a shared readline interface.
 *
 * @param {string} textoPrompt - The text prompt to display.
 * @returns {Promise<string>} - The user's input.
 */
const preguntarUsuario = (textoPrompt) => {
  return new Promise(resolve => interfazEntrada.question(textoPrompt, resolve))
}

/**
 * Asks the user to choose a routing algorithm.
 *
 * @returns {Promise<string>} - The chosen routing algorithm ('inundacion' or 'estado-de-enlace').
 */
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

/**
 * Searches for a name configuration file in the specified directory.
 *
 * @param {string} directorio - The directory to search for name configuration files.
 * @returns {string|null} - The path to the found name configuration file or null if not found.
 */
const encontrarArchivoNombres = (directorio) => {
  const todosArchivos = fs.readdirSync(directorio)
  for (const archivo of todosArchivos) {
    if (archivo.startsWith('names-') && archivo.endsWith('.json')) {
      return path.join(directorio, archivo)
    }
  }
  return null
}

/**
 * Loads the name configuration from a file.
 *
 * @param {string} ubicacionArchivo - The path to the name configuration file.
 * @returns {Object} - The parsed name configuration.
 */
const cargarConfiguracionNombres = (ubicacionArchivo) => {
  const datosCrudos = fs.readFileSync(ubicacionArchivo, 'utf8')
  const configuracionParseada = JSON.parse(datosCrudos).config
  return configuracionParseada
}

/**
 * Loads the flooding configuration from a file.
 *
 * @param {string} ubicacionArchivo - The path to the flooding configuration file.
 * @returns {Object} - The initialized instances of nodes.
 */
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

/**
 * Loads the link-state configuration from a file.
 *
 * @param {string} ubicacionArchivo - The path to the link-state configuration file.
 * @returns {Object} - The initialized instances of nodes.
 */
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

/**
 * Retrieves node credentials from command-line arguments.
 *
 * @param {Object} instanciasNodos - The instances of nodes in the network.
 * @param {Object} mapaNombresXmpp - The mapping of node names to XMPP addresses.
 * @returns {Object} - The local node instance, XMPP user, and password.
 */
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

/**
 * Initializes the network configuration and starts the main loop for sending and receiving messages.
 */
const iniciar = async () => {
  const directorioConfig = 'config'
  const archivoTopologia = encontrarArchivoTopologia(directorioConfig)
  const archivoNombres = encontrarArchivoNombres(directorioConfig)

  if (!archivoTopologia) {
    registrar('No se encontró el archivo de topología.', 'error')
    process.exit(1)
  }

  if (!archivoNombres) {
    registrar('No se encontró el archivo de nombres.', 'error')
    process.exit(1)
  }

  const algoritmoElegido = await elegirAlgoritmoEnrutamiento()
  let instanciasNodos

  if (algoritmoElegido === 'inundacion') {
    instanciasNodos = cargarConfiguracionInundacion('config/flood-config.json')
  } else if (algoritmoElegido === 'estado-de-enlace') {
    instanciasNodos = cargarConfiguracionEstadoEnlace('config/link-config.json')
  }

  const mapaNombresXmpp = cargarConfiguracionNombres(archivoNombres)

  if (instanciasNodos) {
    const { node: nodoLocal, usuarioXmpp, contrasena } = obtenerCredencialesNodo(instanciasNodos, mapaNombresXmpp)

    // Conectar al servidor XMPP
    const conexionXmpp = await ConectarXMPP(usuarioXmpp, contrasena)

    registrar(`Conectado exitosamente como ${usuarioXmpp}`, 'info')

    let seguirEjecutando = true

    while (seguirEjecutando) {
      const opcionUsuario = await obtenerEntrada('Enviar (1) o Recibir (2) o Salir (3): ')

      if (opcionUsuario === '1') {
        const nombreNodoReceptor = await obtenerEntrada('Ingrese el nodo receptor: ')
        const nodoDestino = instanciasNodos[nombreNodoReceptor]

        if (!nodoDestino) {
          registrar('Nodo no encontrado.', 'warn')
          continue
        }

        const contenidoMensaje = await obtenerEntrada('Mensaje: ')

        const mensajeSaliente = {
          from: usuarioXmpp,
          to: mapaNombresXmpp[nodoDestino.name],
          payload: contenidoMensaje
        }

        if (algoritmoElegido === 'inundacion') {
          nodoLocal.iniciarInundacion()
          const rutaOptima = nodoDestino.rutaOptima(nodoLocal.name)
          if (rutaOptima) {
            registrar(`Mejor ruta desde ${nodoLocal.name} hacia ${nodoDestino.name}: ${rutaOptima.ruta.map(node => node.name).join(' -> ')}`, 'info')
            registrar(`Peso total: ${rutaOptima.pesoTotal}`, 'info')
            mensajeSaliente.hops = 1
            mensajeSaliente.type = "message"
            await enviarMensaje(conexionXmpp, mapaNombresXmpp[rutaOptima.ruta[1].name], mensajeSaliente)
          } else {
            registrar(`No se encontró una ruta desde ${nodoLocal.name} hacia ${nodoDestino.name}.`, 'warn')
          }
        } else if (algoritmoElegido === 'estado-de-enlace') {
          nodoLocal.linkState(instanciasNodos)
          const rutaMasCorta = nodoLocal.caminoMasCorto(nodoDestino)
          if (rutaMasCorta) {
            registrar(`Ruta más corta desde ${nodoLocal.name} hacia ${nodoDestino.name}: ${rutaMasCorta.path.map(node => node.name).join(' -> ')}`, 'info')
            registrar(`Distancia total: ${rutaMasCorta.distance}`, 'info')
            mensajeSaliente.hops = 1
            mensajeSaliente.type = "message"
            await enviarMensaje(conexionXmpp, mapaNombresXmpp[rutaMasCorta.path[1].name], mensajeSaliente)
          } else {
            registrar(`No se encontró una ruta desde ${nodoLocal.name} hacia ${nodoDestino.name}.`, 'warn')
          }
        }

      } else if (opcionUsuario === '2') {
        registrar('Escuchando mensajes entrantes...', 'info')
        await new Promise(resolve => escucharMensaje(conexionXmpp, nodoLocal.name, instanciasNodos, mapaNombresXmpp, usuarioXmpp, algoritmoElegido, nodoLocal))

      } else if (opcionUsuario === '3') {
        registrar('Saliendo...', 'info')
        seguirEjecutando = false
      } else {
        registrar('Opción inválida. Por favor, inténtelo de nuevo.', 'warn')
      }
    }

    // Cerrar la sesión XMPP después de que el bucle termine
    await conexionXmpp.stop().then(() => {
      registrar(`Cerrando sesión de ${usuarioXmpp}...`, 'info')
      process.exit()
    }).catch(err => {
      registrar('Error al finalizar la sesión: ' + err, 'error')
      process.exit(1)
    })
  }
}

iniciar()

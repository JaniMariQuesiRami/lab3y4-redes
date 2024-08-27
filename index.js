// Universidad del Valle de Guatemala
// Redes
// Laboratorio #3

import { ConectarXMPP, enviarMensaje, escucharMensaje } from './xmpp.js'
import fs from 'fs'
import path from 'path'
import { NodoFlooding } from './classes/nodoFlooding.js'
import { LinkStateNodo } from './classes/linkStateNodo.js'
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
    instanciasNodos = cargarConfiguracionInundacion('config/flood-weights.json')
  } else if (algoritmoElegido === 'estado-de-enlace') {
    instanciasNodos = cargarConfiguracionEstadoEnlace('config/linkState-weights.json')
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

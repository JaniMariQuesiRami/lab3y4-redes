// Universidad del Valle de Guatemala
// Redes
// Laboratorio #3

import { client as xmppCliente, xml as xmppXml } from '@xmpp/client'

// Función personalizada para logging
const registrar = (mensaje, nivel = 'info') => {
  switch (nivel) {
    case 'info':
      console.log(`INFO: ${mensaje}`)
      break
    case 'advertencia':
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

export async function ConectarXMPP(usuario, contrasena) {
  const xmpp = xmppCliente({
    service: 'ws://alumchat.lol:7070/ws/',
    domain: 'alumchat.lol',
    resource: 'example',
    username: usuario,
    password: contrasena
  })

  xmpp.on('error', (err) => {
    registrar(`Oops, hubo un error: ${err.toString()}`, 'error')
  })

  xmpp.on('online', (direccion) => {
    const presencia = xmppXml('presence')
    xmpp.send(presencia)
    registrar(`Conectado exitosamente como ${direccion}`, 'info')
  })

  await xmpp.start()

  return xmpp
}

// Function to listen for incoming XMPP messages and process them according to the specified routing algorithm
export function escucharMensaje(clienteXMPP, nombreLocal, instanciasNodos, mapaNombresXmpp, usuarioXmpp, algoritmoElegido, nodoLocal) {

  // Event listener for incoming XMPP stanzas
  clienteXMPP.on('stanza', async (stanza) => {

    // Check if the stanza is a message and contains a body element
    if (stanza.is('message') && stanza.getChild('body')) {

      // Extract the sender's XMPP address and the message content
      const desde = stanza.attrs.from
      const cuerpo = stanza.getChild('body').text()

      try {
        // Parse the message body as JSON
        const mensaje = JSON.parse(cuerpo)

        // Determine the destination node's name based on the XMPP map
        const nombreNodoDestino = Object.keys(mapaNombresXmpp).find(
          clave => mapaNombresXmpp[clave].split('@')[0] === mensaje.to.split('@')[0]
        )

        // Log the received message for debugging purposes
        registrar(`Mensaje recibido de ${desde}: ${JSON.stringify(mensaje)}`, 'info')

        // Extract destination node and local node ID from the message
        const nodoDestino = mensaje.to.split('@')[0]
        const nodoLocalId = usuarioXmpp.split('@')[0]

        // Check if the message is intended for the current node
        if (nodoDestino === nodoLocalId) {
          registrar('Este mensaje es para este nodo', 'info')

          // The message is for this node, potentially print the routing table (commented out)
          // registrar('Tabla de enrutamiento:', 'info');
          // nodoLocal.imprimirRutas();

        } else {
          // The message is not for this node, further processing is needed
          registrar('El mensaje no es para este nodo.', 'info')

          // Check if the destination node exists in the instances map
          if (!nombreNodoDestino || !instanciasNodos[nombreNodoDestino]) {
            registrar(`Nodo destino ${mensaje.to} no encontrado en nodos.`, 'error')
          }

          let siguienteSalto // Variable to store the next hop

          // Determine the next hop based on the selected routing algorithm
          if (algoritmoElegido === 'estado-de-enlace') {
            // Execute link-state routing algorithm
            instanciasNodos[nombreLocal].linkState(instanciasNodos)
            const caminoCorto = instanciasNodos[nombreLocal].caminoMasCorto(instanciasNodos[nombreNodoDestino])
            if (caminoCorto) {
              siguienteSalto = mapaNombresXmpp[caminoCorto.path[1].name]
            }
          } else if (algoritmoElegido === 'inundacion') {
            // Execute flooding algorithm
            instanciasNodos[nombreLocal].iniciarInundacion()
            const mejorCamino = instanciasNodos[nombreNodoDestino].rutaOptima(nombreLocal)
            if (mejorCamino) {
              siguienteSalto = mapaNombresXmpp[mejorCamino.ruta[1].name]
            }
          }

          // If a valid next hop is found, forward the message
          if (siguienteSalto) {
            mensaje.hops += 1 // Increment hop count
            registrar(`Redirigiendo mensaje al siguiente salto: ${siguienteSalto}`, 'info')
            await enviarMensaje(clienteXMPP, siguienteSalto, mensaje) // Forward the message

            // Stop the XMPP client and exit the process
            await clienteXMPP.stop()
            registrar(`Sesión cerrada para ${usuarioXmpp}`, 'info')
            process.exit()
          } else {
            // No valid next hop found, terminate the session
            registrar('No se encontró siguiente salto, cerrando sesión.', 'error')
            await clienteXMPP.stop()
            registrar(`Sesión cerrada para ${usuarioXmpp}`, 'info')
            process.exit(1)
          }
        }
      } catch (err) {
        // Handle JSON parsing errors
        registrar(`Error al parsear el mensaje entrante: ${err}`, 'error')
        await clienteXMPP.stop()
        registrar(`Sesión cerrada para ${usuarioXmpp}`, 'info')
        process.exit(1)
      }
    } else {
      // Log a warning if the stanza is not a message
      registrar('Stanza recibida no es un mensaje.', 'warn')
    }
  })
}
// Función escucharMensaje codigo proporcionado y modificado por ChatGPT

export async function enviarMensaje(clienteXMPP, destinatario, datosMensaje) {
  const mensajeFormateado = {
    type: datosMensaje.type || "message",
    from: datosMensaje.from,
    to: datosMensaje.to,
    hops: datosMensaje.hops || 1,
    payload: datosMensaje.payload
  }

  const mensajeStanza = xmppXml(
    'message',
    { type: 'chat', to: destinatario },
    xmppXml('body', {}, JSON.stringify(mensajeFormateado))
  )

  clienteXMPP.send(mensajeStanza)
  registrar(`Mensaje enviado a ${destinatario}: ${JSON.stringify(mensajeFormateado)}`, 'info')
}

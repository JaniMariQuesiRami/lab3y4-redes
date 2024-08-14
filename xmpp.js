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

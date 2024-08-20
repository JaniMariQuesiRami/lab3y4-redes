// Universidad del Valle de Guatemala
// Redes
// Laboratorio #3

class Nodo {
  constructor(name) {
    this.name = name
    this.xmpp_user = ''
    this.neighbors = []
  }

  toString() {
    return `Nodo  (${this.name})`
  }
}

class NodoFlooding extends Nodo {
  constructor(identifier) {
    super(identifier)
    this.adjacentNodes = []
    this.routeMap = new Map()
  }

  iniciarInundacion(ruta = [], pesoTotal = 0) {
    ruta.push(this)
    this.routeMap.set(this.name, [{ ruta: [...ruta], pesoTotal }])

    this.adjacentNodes.forEach(({ Node: neighborNode, Peso: pesoEnlace }) => {
      if (!ruta.includes(neighborNode)) {
        neighborNode.procesarInundacion(this, [...ruta], pesoTotal + pesoEnlace)
      }
    })
  }

  procesarInundacion(nodoOrigen, ruta, pesoTotal) {
    if (ruta.includes(this)) {
      return
    }

    ruta.push(this)

    if (!this.routeMap.has(nodoOrigen.name)) {
      this.routeMap.set(nodoOrigen.name, [])
    }
    this.routeMap.get(nodoOrigen.name).push({ ruta: [...ruta], pesoTotal })

    this.adjacentNodes.forEach(({ Node: neighborNode, Peso: pesoEnlace }) => {
      if (!ruta.includes(neighborNode)) {
        neighborNode.procesarInundacion(nodoOrigen, [...ruta], pesoTotal + pesoEnlace)
      }
    })
  }

}
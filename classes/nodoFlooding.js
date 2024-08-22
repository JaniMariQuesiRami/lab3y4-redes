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

  agregarAdyacente(nodoVecino, pesoEnlace) {
    this.adjacentNodes.push({ Node: nodoVecino, Peso: pesoEnlace })
  }

  rutaOptima(nodoOrigen) {
    if (!this.routeMap.has(nodoOrigen)) {
      return null
    }

    return this.routeMap.get(nodoOrigen).reduce((optima, actual) => {
      if (optima === null) {
        return actual
      }

      return actual.pesoTotal < optima.pesoTotal ? actual : optima
    }, null)
  }

  toString() {
    return `NodoFlooding(${this.name})`
  }

  imprimirRutas() {
    this.routeMap.forEach((rutas, nodoOrigen) => {
      console.log(`Rutas desde ${nodoOrigen} hacia ${this.name}:`)
      rutas.forEach(({ ruta, pesoTotal }) => {
        console.log(`  Ruta: ${ruta.map(nodo => nodo.name).join(' -> ')}, Peso Total: ${pesoTotal}`)
      })
    })
  }

}

export { NodoFlooding };

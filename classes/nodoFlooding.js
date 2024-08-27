// Universidad del Valle de Guatemala
// Redes
// Laboratorio #3

/**
 * Base class representing a generic network node.
 */
class Nodo {
  /**
   * Constructs a Nodo instance.
   *
   * @param {string} name - The name of the node.
   */
  constructor(name) {
    this.name = name
    this.xmpp_user = ''
    this.neighbors = []
  }

  /**
   * Returns a string representation of the node.
   *
   * @returns {string} - The string representation of the node.
   */
  toString() {
    return `Nodo  (${this.name})`
  }
}

/**
 * Represents a node in a network using the flooding algorithm.
 * Extends the base Nodo class.
 */
class NodoFlooding extends Nodo {
  /**
   * Constructs a NodoFlooding instance.
   *
   * @param {string} identifier - The identifier of the node.
   */
  constructor(identifier) {
    super(identifier)
    this.adjacentNodes = []
    this.routeMap = new Map()
  }

  /**
   * Initiates the flooding algorithm from this node.
   *
   * @param {Array} [ruta=[]] - The current route taken.
   * @param {number} [pesoTotal=0] - The total weight of the current route.
   */
  iniciarInundacion(ruta = [], pesoTotal = 0) {
    ruta.push(this)
    this.routeMap.set(this.name, [{ ruta: [...ruta], pesoTotal }])

    this.adjacentNodes.forEach(({ Node: neighborNode, Peso: pesoEnlace }) => {
      if (!ruta.includes(neighborNode)) {
        neighborNode.procesarInundacion(this, [...ruta], pesoTotal + pesoEnlace)
      }
    })
  }

  /**
   * Processes the flooding from an origin node.
   *
   * @param {NodoFlooding} nodoOrigen - The origin node initiating the flood.
   * @param {Array} ruta - The current route taken.
   * @param {number} pesoTotal - The total weight of the current route.
   */
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

  /**
   * Adds an adjacent node with a specified link weight.
   *
   * @param {NodoFlooding} nodoVecino - The adjacent node.
   * @param {number} pesoEnlace - The weight of the link to the adjacent node.
   */
  agregarAdyacente(nodoVecino, pesoEnlace) {
    this.adjacentNodes.push({ Node: nodoVecino, Peso: pesoEnlace })
  }

  /**
   * Finds the optimal route from an origin node to this node.
   *
   * @param {string} nodoOrigen - The origin node's name.
   * @returns {Object|null} - The optimal route object or null if not found.
   */
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

  /**
   * Returns a string representation of the flooding node.
   *
   * @returns {string} - The string representation of the node.
   */
  toString() {
    return `NodoFlooding(${this.name})`
  }

  /**
   * Prints all routes to the console for debugging and visualization purposes.
   */
  imprimirRutas() {
    this.routeMap.forEach((rutas, nodoOrigen) => {
      console.log(`Rutas desde ${nodoOrigen} hacia ${this.name}:`)
      rutas.forEach(({ ruta, pesoTotal }) => {
        console.log(`  Ruta: ${ruta.map(nodo => nodo.name).join(' -> ')}, Peso Total: ${pesoTotal}`)
      })
    })
  }

}

export { NodoFlooding }

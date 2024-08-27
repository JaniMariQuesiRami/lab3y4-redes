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
    return `Nodo (${this.name})`
  }
}

/**
 * Represents a node in a network using the Link State routing algorithm.
 * Extends the base Nodo class.
 */
class LinkStateNodo extends Nodo {
  /**
   * Constructs a LinkStateNodo instance.
   *
   * @param {string} name - The name of the node.
   */
  constructor(name) {
    super(name)
    this.paths = new Map() // Stores the shortest paths from this node to all other nodes
  }

  /**
   * Adds a neighbor node with a specified link weight.
   *
   * @param {LinkStateNodo} neighbor - The neighboring node.
   * @param {number} weight - The weight of the link to the neighboring node.
   */
  agregarVecino(neighbor, weight) {
    this.neighbors.push({ node: neighbor, weight })
  }

  /**
   * Returns the list of neighbors for this node.
   *
   * @returns {Array} - An array of neighbor objects with node and weight properties.
   */
  getVecinos() {
    return this.neighbors
  }

  /**
   * Executes the Link State routing algorithm to find the shortest paths
   * from this node to all other nodes in the network.
   *
   * @param {Object} nodes - The collection of all nodes in the network.
   */
  linkState(nodes) {
    const distances = new Map()
    const unvisited = new Set()

    // Initialize distances and unvisited set
    for (const key in nodes) {
      distances.set(key, { distance: Infinity, previous: null })
      unvisited.add(nodes[key])
    }

    // Set the distance to itself as 0
    distances.set(this.name, { distance: 0, previous: null })

    while (unvisited.size > 0) {
      let currentNode = null
      for (const node of unvisited) {
        if (currentNode === null || distances.get(node.name).distance < distances.get(currentNode.name).distance) {
          currentNode = node
        }
      }

      if (currentNode === null) break

      unvisited.delete(currentNode)

      const currentDistance = distances.get(currentNode.name).distance

      for (const neighbor of currentNode.getVecinos()) {
        const newDistance = currentDistance + neighbor.weight
        const neighborDistance = distances.get(neighbor.node.name).distance

        if (newDistance < neighborDistance) {
          distances.set(neighbor.node.name, { distance: newDistance, previous: currentNode })
        }
      }
    }

    this.paths = distances // Store the final distances and paths
  }

  /**
   * Finds the shortest path from this node to the target node.
   *
   * @param {LinkStateNodo} target - The target node.
   * @returns {Object|null} - An object containing the shortest path and its distance, or null if no path exists.
   */
  caminoMasCorto(target) {
    if (!this.paths.has(target.name)) {
      return null
    }

    const path = []
    let current = target

    while (current !== null) {
      path.unshift(current)
      current = this.paths.get(current.name).previous
    }

    return { path, distance: this.paths.get(target.name).distance }
  }

  /**
   * Prints the routing table of this node to the console, showing the shortest paths to each destination.
   */
  imprimirRutas() {
    this.paths.forEach((value, destination) => {
      const path = []
      let current = destination

      while (current !== null) {
        path.unshift(current)
        current = this.paths.get(current).previous ? this.paths.get(current).previous.name : null
      }

      console.log(`Destination: ${destination}, Path: ${path.join(' -> ')}, Distance: ${value.distance}`)
    })
  }

}

export { LinkStateNodo }

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
    return `Nodo (${this.name})`
  }
}

class LinkStateNodo extends Nodo {
  constructor(name) {
    super(name)
    this.paths = new Map() // Stores the shortest paths from this node to all other nodes
  }

  agregarVecino(neighbor, weight) {
    this.neighbors.push({ node: neighbor, weight })
  }

  getVecinos() {
    return this.neighbors
  }

  linkState(nodes) {
    const distances = new Map()
    const unvisited = new Set()

    for (const key in nodes) {
      distances.set(key, { distance: Infinity, previous: null })
      unvisited.add(nodes[key])
    }

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

}

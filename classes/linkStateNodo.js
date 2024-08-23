// Universidad del Valle de Guatemala
// Redes
// Laboratorio #3

class Nodo {
  constructor(name) {
      this.name = name;
      this.xmpp_user = '';
      this.neighbors = [];
  }

  toString() {
      return `Nodo (${this.name})`;
  }
}

class LinkStateNodo extends Nodo {
  constructor(name) {
      super(name);
      this.paths = new Map(); // Stores the shortest paths from this node to all other nodes
  }

  agregarVecino(neighbor, weight) {
      this.neighbors.push({ node: neighbor, weight });
  }

  getVecinos() {
      return this.neighbors;
  }
  
}

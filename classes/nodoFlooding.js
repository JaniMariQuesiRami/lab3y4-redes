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
      return `Nodo  (${this.name})`;
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

}
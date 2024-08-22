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

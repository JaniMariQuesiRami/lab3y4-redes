# Universidad del Valle de Guatemala
# Redes
# Laboratorio #3

###
 * Base class representing a generic network node.
###
class Nodo
  ###
   * Constructs a Nodo instance.
   *
   * @param {string} name - The name of the node.
  ###
  constructor: (@name) ->
    @xmpp_user = ''
    @neighbors = []

  ###
   * Returns a string representation of the node.
   *
   * @returns {string} - The string representation of the node.
  ###
  toString: ->
    "Nodo (#{@name})"

###
 * Represents a node in a network using the Flooding routing algorithm.
 * Extends the base Nodo class.
###
class NodoFlooding extends Nodo
  ###
   * Constructs a NodoFlooding instance.
   *
   * @param {string} identifier - The identifier of the node.
  ###
  constructor: (identifier) ->
    super(identifier)
    @adjacentNodes = []
    @routeMap = new Map()

  ###
   * Initiates the flooding algorithm from this node.
   *
   * @param {Array} [ruta=[]] - The current route taken.
   * @param {number} [pesoTotal=0] - The total weight of the current route.
  ###
  iniciarInundacion: (ruta = [], pesoTotal = 0) ->
    ruta.push this
    @routeMap.set @name, [{ ruta: ruta.slice(), pesoTotal }]

    for { Node: neighborNode, Peso: pesoEnlace } in @adjacentNodes
      unless ruta.includes neighborNode
        neighborNode.procesarInundacion this, ruta.slice(), pesoTotal + pesoEnlace

  ###
   * Processes the flooding from an origin node.
   *
   * @param {NodoFlooding} nodoOrigen - The origin node initiating the flood.
   * @param {Array} ruta - The current route taken.
   * @param {number} pesoTotal - The total weight of the current route.
  ###
  procesarInundacion: (nodoOrigen, ruta, pesoTotal) ->
    return if ruta.includes this

    ruta.push this

    unless @routeMap.has nodoOrigen.name
      @routeMap.set nodoOrigen.name, []

    @routeMap.get(nodoOrigen.name).push { ruta: ruta.slice(), pesoTotal }

    for { Node: neighborNode, Peso: pesoEnlace } in @adjacentNodes
      unless ruta.includes neighborNode
        neighborNode.procesarInundacion nodoOrigen, ruta.slice(), pesoTotal + pesoEnlace

  ###
   * Adds an adjacent node with a specified link weight.
   *
   * @param {NodoFlooding} nodoVecino - The adjacent node.
   * @param {number} pesoEnlace - The weight of the link to the adjacent node.
  ###
  agregarAdyacente: (nodoVecino, pesoEnlace) ->
    @adjacentNodes.push Node: nodoVecino, Peso: pesoEnlace

  ###
   * Finds the optimal route from an origin node to this node.
   *
   * @param {string} nodoOrigen - The origin node's name.
   * @returns {Object|null} - The optimal route object or null if not found.
  ###
  rutaOptima: (nodoOrigen) ->
    return null unless @routeMap.has nodoOrigen

    @routeMap.get(nodoOrigen).reduce (optima, actual) ->
      return actual if optima is null
      if actual.pesoTotal < optima.pesoTotal then actual else optima
    , null

  ###
   * Returns a string representation of the flooding node.
   *
   * @returns {string} - The string representation of the node.
  ###
  toString: ->
    "NodoFlooding(#{@name})"

  ###
   * Prints all routes to the console for debugging and visualization purposes.
  ###
  imprimirRutas: ->
    @routeMap.forEach (rutas, nodoOrigen) =>
      console.log "Rutas desde #{nodoOrigen} hacia #{@name}:"
      for { ruta, pesoTotal } in rutas
        console.log "  Ruta: #{ruta.map((nodo) -> nodo.name).join(' -> ')}, Peso Total: #{pesoTotal}"

export { NodoFlooding }

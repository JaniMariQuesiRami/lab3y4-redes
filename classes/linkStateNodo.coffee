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
 * Represents a node in a network using the Link State routing algorithm.
 * Extends the base Nodo class.
###
class LinkStateNodo extends Nodo
  ###
   * Constructs a LinkStateNodo instance.
   *
   * @param {string} name - The name of the node.
  ###
  constructor: (name) ->
    super(name)
    @paths = new Map()  # Stores the shortest paths from this node to all other nodes

  ###
   * Adds a neighbor node with a specified link weight.
   *
   * @param {LinkStateNodo} neighbor - The neighboring node.
   * @param {number} weight - The weight of the link to the neighboring node.
  ###
  agregarVecino: (neighbor, weight) ->
    @neighbors.push { node: neighbor, weight }

  ###
   * Returns the list of neighbors for this node.
   *
   * @returns {Array} - An array of neighbor objects with node and weight properties.
  ###
  getVecinos: ->
    @neighbors

  ###
   * Executes the Link State routing algorithm to find the shortest paths
   * from this node to all other nodes in the network.
   *
   * @param {Object} nodes - The collection of all nodes in the network.
  ###
  linkState: (nodes) ->
    distances = new Map()
    unvisited = new Set()

    # Initialize distances and unvisited set
    for key, node of nodes
      distances.set key, distance: Infinity, previous: null
      unvisited.add node

    # Set the distance to itself as 0
    distances.set @name, distance: 0, previous: null

    while unvisited.size > 0
      currentNode = null
      for node in unvisited
        currentNode = node if currentNode is null or distances.get(node.name).distance < distances.get(currentNode.name).distance
      
      break if currentNode is null

      unvisited.delete currentNode

      currentDistance = distances.get(currentNode.name).distance

      for { node: neighbor, weight } in currentNode.getVecinos()
        newDistance = currentDistance + weight
        neighborDistance = distances.get(neighbor.name).distance

        if newDistance < neighborDistance
          distances.set neighbor.name, distance: newDistance, previous: currentNode

    @paths = distances  # Store the final distances and paths

  ###
   * Finds the shortest path from this node to the target node.
   *
   * @param {LinkStateNodo} target - The target node.
   * @returns {Object|null} - An object containing the shortest path and its distance, or null if no path exists.
  ###
  caminoMasCorto: (target) ->
    return null unless @paths.has(target.name)

    path = []
    current = target

    while current?
      path.unshift current
      current = @paths.get(current.name).previous

    path: path, distance: @paths.get(target.name).distance

  ###
   * Prints the routing table of this node to the console, showing the shortest paths to each destination.
  ###
  imprimirRutas: ->
    @paths.forEach (value, destination) =>
      path = []
      current = destination

      while current?
        path.unshift current
        current = if @paths.get(current).previous? then @paths.get(current).previous.name else null

      console.log "Destination: #{destination}, Path: #{path.join(' -> ')}, Distance: #{value.distance}"

export { LinkStateNodo }

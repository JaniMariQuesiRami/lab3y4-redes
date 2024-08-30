# Lab 3 - Algoritmos de Enrutamiento

## Universidad del Valle de Guatemala

### Facultad de Ingeniería - Departamento de Ciencias de la Computación

CC3067 Redes - Laboratorio #3

## Definición

En este laboratorio, implementamos algoritmos de enrutamiento que permiten a los nodos en una red descubrir rutas óptimas para el envío de mensajes. Los algoritmos de enrutamiento son fundamentales para la operación de redes, especialmente en Internet, donde la infraestructura puede cambiar dinámicamente. Los algoritmos implementados en este proyecto son:

1. **Flooding**
2. **Link State Routing** (utilizando el algoritmo de Dijkstra)

Los nodos se implementan en una red simulada utilizando el protocolo XMPP (Extensible Messaging and Presence Protocol). Cada nodo en la red corresponde a un usuario en un servidor XMPP.

## Algoritmos Utilizados y su Implementación

### 1. **Flooding**

Flooding es un algoritmo de enrutamiento donde cada nodo reenvía un mensaje recibido a todos sus vecinos excepto al nodo desde el que recibió el mensaje. Este algoritmo es simple pero no escalable, ya que puede generar redundancia en la red debido a la gran cantidad de mensajes reenviados. En esta implementación:

- Cada nodo tiene conocimiento de sus vecinos inmediatos y el costo de los enlaces hacia ellos.
- El nodo inicia la inundación enviando mensajes a sus vecinos.

El código para la clase `NodoFlooding` y sus funciones se encuentra en el archivo `nodoFlooding.js`.

### 2. **Link State Routing**

Link State Routing (LSR) es un algoritmo en el que cada nodo tiene conocimiento de la topología completa de la red y utiliza el algoritmo de Dijkstra para calcular la ruta más corta a cada destino. En esta implementación:

- Cada nodo mantiene un registro de sus vecinos y el costo de los enlaces hacia ellos.
- El nodo envía periódicamente información de estado de enlace a todos los demás nodos en la red.
- Cada nodo calcula la ruta más corta hacia todos los demás nodos utilizando el algoritmo de Dijkstra.
- Las rutas calculadas se almacenan y utilizan para reenviar mensajes.

El código para la clase `LinkStateNodo` y sus funciones se encuentra en el archivo `linkStateNodo.js`.

## Instalación

### Requisitos

1. **Node.js**: Asegúrate de tener Node.js instalado en tu máquina. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
2. **npm o Yarn**: Puedes usar npm (que viene con Node.js) o Yarn como tu administrador de paquetes.

### Instrucciones de Instalación

1. **Clona este repositorio**:

   ```bash
   git clone https://github.com/JaniMariQuesiRami/lab3y4-redes.git
   cd lab3y4-redes
   ```

2. **Instala las dependencias**:

   ```bash
   yarn install
   ```

3. **Configura los archivos de topología y nombres**:

   - Asegúrate de que los archivos `names-*.txt` y `topo-*.txt` estén en la carpeta `config/`.
   - Ejemplo de contenido de archivo de topología (`topo1-x-randomB-2024.txt`):

     ```json
     {
       "type": "topo",
       "config": {
         "A": ["D", "E"],
         "B": ["C", "D", "E", "F"],
         "C": ["B", "D", "E"],
         "D": ["A", "B", "C", "E"],
         "E": ["A", "B", "C", "D", "F"],
         "F": ["B", "E"]
       }
     }
     ```

   - Ejemplo de contenido de archivo de nombres (`names1-x-randomB-2024.txt`):

     ```json
     {
       "type": "names",
       "config": {
         "A": "grupo12@alumchat.xyz",
         "B": "grupo8@alumchat.xyz",
         "C": "grupo11@alumchat.xyz",
         "D": "grupo10@alumchat.xyz",
         "E": "grupo7@alumchat.xyz",
         "F": "grupo9@alumchat.xyz"
       }
     }
     ```

4. **Ejecuta los nodos**:
   Para iniciar un nodo con el algoritmo deseado, ejecuta:

   ```bash
   node main.js <nombre_nodo> <contrasena>
   ```

   - `<nombre_nodo>`: El nombre del nodo a ejecutar (por ejemplo, `A`, `B`, `C`).
   - `<contrasena>`: La contraseña del nodo para la autenticación en XMPP.

5. **Pruebas de conexión**:
   - Una vez que los nodos estén en ejecución, los mensajes se enviarán a través del servidor XMPP y cada nodo actuará de acuerdo con el algoritmo de enrutamiento configurado.

### Instrucciones de Instalación usando Docker

1. **Clona este repositorio**:

   ```bash
   git clone https://github.com/JaniMariQuesiRami/lab3y4-redes.git
   cd lab3y4-redes
   ```

2. **Crear la imagen**:

   ```bash
   docker build -t my-node-app .
   ```

3. **Ejecuta los nodos**:
   Para iniciar un nodo con el algoritmo deseado, ejecuta:

   ```bash
   docker run -it my-node-app "<nombre_nodo>" "<contrasena>"
   ```

   - `<nombre_nodo>`: El nombre del nodo a ejecutar (por ejemplo, `A`, `B`, `C`).
   - `<contrasena>`: La contraseña del nodo para la autenticación en XMPP.

## Notas

- Asegúrate de que el servidor XMPP esté funcionando y que los nodos puedan conectarse al servidor `alumchat.lol`.
- Durante la fase de pruebas, los nodos deben poder enviar y recibir mensajes correctamente y mostrar las rutas más eficientes basadas en el algoritmo seleccionado.

## Créditos

Este laboratorio fue desarrollado por estudiantes de la Universidad del Valle de Guatemala y ChatGPT-4o como parte del curso de Redes (CC3067) bajo la supervisión de la Facultad de Ingeniería, Departamento de Ciencias de la Computación.

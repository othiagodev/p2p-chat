const net = require('net')
const sha = require('sha256')

module.exports = function Peer(port) {
  const connections = []
  const receivedMessageSignatures = []

  const timestamp = Date.now()
  const randomNumber = Math.floor((Math.random() * 150000) + 5000)
  const myKey = sha(`${port} ${timestamp} ${randomNumber}`)

  const server = net.createServer(socket => {
    onSocketConnected(socket)
  })

  server.listen(port, () => {
    console.log(`Ouvindo porta ${port}`)
  })

  function signature(message, myKey) {
    return sha(message + myKey + Date.now())
  }

  function connectTo(address) {
    if (address.split(':').length !== 2)
      throw Error('The address of the other peer must consist of host: port')

      const [host, port] = address.split(':')
      const socket = net.createConnection({ port, host }, () => {
      onSocketConnected(socket)
    })
  }

  function onSocketConnected(socket) {
    connections.push(socket)
    socket.on('data', data => {
      onData(socket, data)
    })
    socket.on('close', () => {
      server.close()
      connections = connections.filter(conn => {
        return conn !== socket;
      })
    })
    onConnection(socket)
  }

  function onConnection(socket) {
    const message = `I'm on port ${port}`

    const sign = signature(message, myKey)
    receivedMessageSignatures.push(sign)
    socket.write(JSON.stringify({ sign, message }))
  }

  function onData(socket, data) {
    const json = data.toString()
    const payload = JSON.parse(json)

    if (receivedMessageSignatures.includes(payload.signature))
      return

    receivedMessageSignatures.push(payload.signature)
    console.log(`received> ${payload.message}`)
    broadcast(json);
  }

  function broadcast(data) {
    connections.forEach(socket => {
      socket.write(data)
    })
  }

  return {
    port,
    connections,
    receivedMessageSignatures,
    server,
    myKey,
    signature,
    connectTo,
    onData,
    onConnection,
    broadcast,
  }
}

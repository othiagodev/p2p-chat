const Peer = require('./Peer')

if (!process.env.PORT) throw Error('PORT environment variable not reported')

const port = process.env.PORT

const peer = new Peer(port)

process.argv.slice(2).forEach(otherPeerAdress => {
  peer.connectTo(otherPeerAdress)
})

process.stdin.on('data', data => {
  const message = data.toString().replace(/\n/g, '')
  const signature = peer.signature(message, peer.myKey)
  peer.receivedMessageSignatures.push(signature);
  peer.broadcast(JSON.stringify({ signature, message }))
})

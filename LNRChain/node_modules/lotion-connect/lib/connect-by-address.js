let createHash = require('create-hash')
let LightNode = require('tendermint')
let { stringify } = require('deterministic-json')

async function startLightClientFromGCI (GCI, nodeAddress) {
  let rpc = LightNode.RpcClient(nodeAddress)
  let { genesis } = await rpc.genesis()
  rpc.close()

  let genesisJSON = stringify(genesis)
  let genesisHash = sha256(genesisJSON)
  if (genesisHash !== GCI) {
    throw Error('Peer genesis does not match GCI')
  }

  return startLightClientFromGenesis(genesis, nodeAddress)
}

function startLightClientFromGenesis (genesis, nodeAddress) {
  let clientState = stateFromGenesis(genesis)
  let client = LightNode(nodeAddress, clientState)

  // wait for sync or error, whichever comes first
  return new Promise((resolve, reject) => {
    client.once('synced', () => {
      // clean up error listener so it doesn't hide
      // errors which might get emitted later
      client.removeListener('error', reject)
      resolve(client)
    })
    client.once('error', reject)
  })
}

function stateFromGenesis (genesis) {
  let validators = genesis.validators.map(validator => {
    return Object.assign({}, validator, {
      voting_power: Number(validator.power)
    })
  })

  return {
    validators,
    commit: null,
    header: { height: 1, chain_id: genesis.chain_id }
  }
}

function sha256 (data) {
  return createHash('sha256').update(data).digest('hex')
}

module.exports = {
  startLightClientFromGCI,
  startLightClientFromGenesis,
  stateFromGenesis
}

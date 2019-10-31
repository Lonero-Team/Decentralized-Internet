/* globals fetch */

const navAs = Array.from(document.querySelectorAll('#nav > a'))
const viewDivs = Array.from(document.querySelectorAll('#views > div'))
var currentPoll

// register ui events
navAs.forEach(a => {
  a.addEventListener('click', () => {
    setView(a.dataset.view)
  })
})
document.body.addEventListener('click', e => {
  console.log('click', e.target, e.target.classList.contains('toggle-collapsable'))
  if (e.target.classList.contains('toggle-collapsable')) {
    document.getElementById(e.target.dataset.target).classList.toggle('open')
  }
})

function setView (view) {
  navAs.forEach(a => a.classList.remove('active'))
  viewDivs.forEach(div => div.classList.remove('active'))
  document.querySelector('#nav-' + view).classList.add('active')
  document.querySelector('#view-' + view).classList.add('active')
  clearInterval(currentPoll)
  setupView[view]()
}

const setupView = {
  'state': fetchAndRenderPeers,
  'log': fetchAndRenderLog
}

async function fetchAndRenderPeers () {
  let state = await (await fetch('/state.json', {credentials: 'include'})).json()
  let html = `
    <h2>Stats</h2>

    <h3>Loadavg: [ ${state.stats.loadavg[0]} (1m), ${state.stats.loadavg[1]} (5m), ${state.stats.loadavg[2]} (15m) ]</h3>

    <h3>Queries/sec: ${state.stats.queriesPS[0]} <small><a class="toggle-collapsable" data-target="queriesPS">toggle history</a></small></h3>
    <div class="collapsable" id="queriesPS">
      <table>${state.stats.queriesPS.map(renderHistoryItem).join('')}</table>
    </div>

    <h3>Multicast Queries/sec: ${state.stats.multicastQueriesPS[0]} <small><a class="toggle-collapsable" data-target="multicastQueriesPS">toggle history</a></small></h3>
    <div class="collapsable" id="multicastQueriesPS">
      <table>${state.stats.multicastQueriesPS.map(renderHistoryItem).join('')}</table>
    </div>

    <h2>Top keys</h2>
    <table>${state.stats.topKeys.map(entry => `<tr><td>${safen(entry.name)}</td><td>${safen(entry.numRecords)} peers</td></tr>`).join('')}</table>
    
    <h2>Peer tables</h2>
    ${state.peers.map(peerGroup => `
      <h3>Key: ${safen(peerGroup.name)}</h3>
      <table>
        ${peerGroup.records.map(record => (`
          <tr><td>${safen(record.address)}</td></tr>
        `)).join('')}
      </table>
    `).join('')}
  `
  document.querySelector('#view-state').innerHTML = html
}

function renderHistoryItem (value, i) {
  return `<tr><td>-${i * 10}s</td><td>${value}</td></tr>`
}

async function fetchAndRenderLog () {
  let log = await (await fetch('/log.txt', {credentials: 'include'})).text()
  let html = `<pre>${log}</pre>`
  document.querySelector('#view-log').innerHTML = html
}

setView('state')

function safen (str) {
  return ('' + str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/"/g, '')
}

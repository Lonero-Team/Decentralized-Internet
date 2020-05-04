###
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki/blob/master/LICENSE.txt
###

# **cli.coffee** command line interface for the
# Smallest-Federated-Wiki express server

http = require('http')
socketio = require('socket.io')

path = require 'path'
cluster = require 'cluster'

optimist = require 'optimist'
cc = require 'config-chain'
glob = require 'glob'
server = require 'wiki-server'

farm = require './farm'

getUserHome = ->
  process.env.HOME or process.env.HOMEPATH or process.env.USERPROFILE

# Handle command line options

argv = optimist
  .usage('Usage: $0')
  .options('url',
    alias     : 'u'
    describe  : 'Important: Your server URL, used as Persona audience during verification'
  )
  .options('port',
    alias     : 'p'
    describe  : 'Port'
  )
  .options('data',
    alias     : 'd'
    describe  : 'location of flat file data'
  )
  .options('root',
    alias     : 'r'
    describe  : 'Application root folder'
  )
  .options('farm',
    alias     : 'f'
    describe  : 'Turn on the farm?'
  )
  .options('allowed',
    describe  : 'Either a coma seperated list of wiki, or * to only allow wiki which exist'
  )
  .options('admin',
    describe  : 'Wiki server administrator identity'
  )
  .options('home',
    describe  : 'The page to go to instead of index.html'
  )
  .options('host',
    alias     : 'o'
    describe  : 'Host to accept connections on, falsy == any'
  )
  .options('security_type',
    describe  : 'The security plugin to use, see documentation for additional parameters'
  )
  .options('secure_cookie',
    describe  : 'When true, session cookie will only be sent over SSL.'
    boolean   : false
  )
  .options('session_duration',
    describe  : 'The wiki logon, session, duration in days'
  )
  .options('id',
    describe  : 'Set the location of the owner identity file'
  )
  .options('database',
    describe  : 'JSON object for database config'
  )
  .options('neighbors',
    describe  : 'comma separated list of neighbor sites to seed'
  )
  .options('autoseed',
    describe  : 'Seed all sites in a farm to each other site in the farm.'
    boolean   : true
  )
  .options('allowed',
    describe  : 'comma separated list of allowed host names for farm mode.'
  )
  .options('wikiDomains',
    describe  : 'use in farm mode to define allowed wiki domains and any wiki domain specific configuration, see documentation.'
  )
  .options('uploadLimit',
    describe  : 'Set the upload size limit, limits the size page content items, and pages that can be forked'
  )
  .options('test',
    boolean   : true
    describe  : 'Set server to work with the rspec integration tests'
  )
  .options('help',
    alias     : 'h'
    boolean   : true
    describe  : 'Show this help info and exit'
  )
  .options('config',
    alias     : 'conf'
    describe  : 'Optional config file.'
  )
  .options('version',
    alias     : 'v'
    describe  : 'Show version number and exit'
  )
  .argv

config = cc(argv,
  argv.config,
  'config.json',
  path.join(__dirname, '..', 'config.json'),
  path.join(getUserHome(), '.wiki', 'config.json'),
  cc.env('wiki_'),
    port: 3000
    root: path.dirname(require.resolve('wiki-server'))
    home: 'welcome-visitors'
    security_type: './security'
    data: path.join(getUserHome(), '.wiki') # see also defaultargs
    packageDir: path.resolve(path.join(__dirname, 'node_modules'))
    cookieSecret: require('crypto').randomBytes(64).toString('hex')
).store

# If h/help is set print the generated help message and exit.
if argv.help
  optimist.showHelp()
  return
# If v/version is set print the version of the wiki components and exit.
if argv.version
  console.log('wiki: ' + require('./package').version)
  console.log('wiki-server: ' + require('wiki-server/package').version)
  console.log('wiki-client: ' + require('wiki-client/package').version)
  glob 'wiki-security-*', {cwd: config.packageDir}, (e, plugins) ->
    plugins.map (plugin) ->
      console.log(plugin + ": " + require(plugin + "/package").version)
  glob 'wiki-plugin-*', {cwd: config.packageDir}, (e, plugins) ->
    plugins.map (plugin) ->
      console.log(plugin + ': ' + require(plugin + '/package').version)
  return

if argv.test
  console.log "WARNING: Server started in testing mode, other options ignored"
  server({port: 33333, data: path.join(argv.root, 'spec', 'data')})
  return

if cluster.isMaster
  cluster.on 'exit', (worker, code, signal) ->
    if code is 0
      console.log 'restarting wiki server'
      cluster.fork()
    else
      console.error 'server unexpectly exitted, %d (%s)', worker.process.pid, signal || code
  cluster.fork()
else
  if config.farm
    console.log('Wiki starting in Farm mode, navigate to a specific server to start it.\n')
    if !argv.wikiDomains and !argv.allowed
      console.log 'WARNING : Starting Wiki Farm in promiscous mode\n'
    if argv.security_type is './security'
      console.log 'INFORMATION : Using default security - Wiki Farm will be read-only\n'
    farm(config)
  else
    app = server(config)
    app.on 'owner-set', (e) ->
      server = http.Server(app)
      app.io = socketio(server)

      serv = server.listen app.startOpts.port, app.startOpts.host
      console.log "Federated Wiki server listening on", app.startOpts.port, "in mode:", app.settings.env
      if argv.security_type is './security'
        console.log 'INFORMATION : Using default security - Wiki will be read-only\n'
      app.emit 'running-serv', serv

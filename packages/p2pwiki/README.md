# This package is under construction and not yet in a production ready environment

# p2pwiki
Decentralized Federated Wiki Server (Federated Wiki Server w/ Decentralized Internet datastore option)

# Federated Wiki (Node.js server version)

> The original wiki was written in a week and cloned within a week after that.
> The concept was shown to be fruitful while leaving other implementers room to innovate.
> When we ask for simple, we are looking for the same kind of simplicity: nothing to distract from our innovation in federation.
> -- <cite>[Smallest Federated Wiki](https://github.com/WardCunningham/Smallest-Federated-Wiki)

Since the earlier creation of the node version, to complement the original Ruby implementation, there has been a risk of the two versions diverging. A first step to prevent divergence was to extract the client code into the [wiki-client](https://github.com/WardCunningham/wiki-client). This wiki-client was then used by both the Ruby and Node servers. However, with both server repositories retained the static components of the client, together with the plug-ins there remained some risk of divergence.

In this latest version of the node version of Federated Wiki, we continue by:
* including all the client components in the wiki-client, and
* moving all plug-ins into their own repositories, see below for a list.

When we originally extracted the wiki-client, we included it back into wiki whilst building the wiki package. This had the unforeseen consequence that when creating an updated wiki-client it was also necessary to create a new version of the wiki package for the updated client to be available. To avoid this we no longer include wiki packages in the package for the server.

Here we have a new wiki repository, and package, which only exist to pull together the federated wiki modules (wiki-server, wiki-client, and plug-ins) and start the server.

## Using Federated Wiki

Learn [how to wiki](http://fed.wiki.org/view/how-to-wiki) by reading [fed.wiki.org](http://fed.wiki.org/view/welcome-visitors)

## Running your own Server

The quickest way to set up wiki on your local machine is to install it globally with `npm`:

    $ npm install -g wiki
    $ wiki

Visit localhost:3000 to see your wiki. If you choose a host visible to the internet then others in the federation can use your work.

### Running a test server

If you would prefer to test wiki without installing system wide, you can do the following (in a directory of your choice):

    $ npm install wiki --global-style
    $ npx wiki --data ./data

Without the `--data` argument, running `wiki` (installed globally or otherwise) will store data in `~/.wiki`.

*N.B. The wiki packages must to be installed with `--global-style` to work.*

## Updating the Server Software

From time to time some of the packages that makeup the wiki software will be updated. To see if updates are available for any of the wiki packages, run:

    $ npm outdated --silent -g | grep '^Package\|^wiki'

If there are any updates available, the globally installed wiki can be updated by re-installing it:

    $ npm install -g wiki

We have to install as running `npm update -g wiki` will only work if the wiki package itself has been updated.

An alternative approach would be to run `npm update` in the directory containing the wiki install. The location for running this will vary depending on which platform you are on.

If you installed the wiki package locally, rather than globally, you can run `npm outdated --silent | grep '^Package\|^wiki'` and `npm update` in the directory you installed the wiki package.

## Server Options

Options for the server can be passed in many ways:

* As command line flags
* As a configuration JSON file specified with --config
* As a config.json file in the root folder or cwd.
* As env vars prefixed with `wiki_`

Higher in the list takes precedence.
The server will then try to guess all unspecified options.

### Configuring Security

By default a *default* security module is configured. This makes the wiki read only.

Details on how to configure the bundled [Passport](http://passportjs.org/) based
security module, and the migration from using Mozilla Persona, see [security configuration](./security.md)

**N.B.** The Mozilla Persona service closes on 30th November 2016.

### Neighborhood Seeding

Two options are added for seeding a neighborhood.

When running a server farm `--autoseed` will populate the neighborhood with the other sites in the farm that have been
visited.

Adding `--neighbours 'comma separated list of sites'` will add those sites to the neighborhood.

### Datastore options

---

**NOTE:** This release sees a change in how the support for different
datastores is provided, and how they are configured. The previous
configuration method is *depreciated*, and will be removed in a future version.

There are a number of legacy [database page stores](./db-page-stores.md)
- they DO NOT work with wiki in farm mode.

---

A number of datastores are supported. Use the --database and --data options to configure, or use the config.json.

The default location of the datastore is ```~/.wiki```, which contains two sub-directories ```pages``` and ```status```:
* ```pages``` is used with flatfiles, or leveldb, to store your pages, and
* ```status``` stores the site's favicon, and a file containing the identity (email address) of the site owner.

#### flatfiles (default)

The default path to store page data is in a "default-data" subdirectory of the install directory. You can override it like this:

    $ wiki --data FILESYSTEM_PATH

#### leveldb

Support for leveldb is added by installing the `wiki-storage-leveldb` package, this can be
achieved by running `npm install wiki-storage-leveldb -save` in this directory.

The leveldb datastore uses JSON encoded leveldb format and is configured by providing a filesystem path:

    $ wiki --database '{"type": "leveldb"}' --data FILESYSTEM_PATH

The leveldb datastore allows for a graceful upgrade path. If a page is not found in leveldb the flatfile datastore will be consulted.

## Participation

We're happy to take issues or pull requests regarding the goals and
their implementation within this code.

A wider-ranging conversation is documented in the GitHub ReadMe of the
founding project, [SFW](https://github.com/WardCunningham/Smallest-Federated-Wiki/blob/master/ReadMe.md).

The [contributing page](./contributing.md) provides details of the repositories that form the node.js version of Federated Wiki, together with some guidance for developers.

## License

[MIT License](https://github.com/FedWiki/wiki/blob/master/LICENSE.txt)

# Contributing

The wiki consists of a number of GitHub repositories and corresponding npm packages that contain the server, client and various plugins. You will need to get the code for this repository together with that for the other components you wish to work on, using the standard fork/clone GitHub practices (see, [Fork a Repo](https://help.github.com/articles/fork-a-repo), you don't have to the command line to do this).

The repositories are:

* [wiki](https://github.com/fedwiki/wiki) (this repository) -- The **wiki** npm package - a container that installs the individual parts of wiki and starts the server.
* [wiki-server](https://github.com/fedwiki/wiki-server) -- The **wiki-server** npm package - the node.js wiki server code.
* [wiki-client](https://github.com/fedwiki/wiki-client) -- The **wiki-client** npm package - the javascript client code, shared with the ruby server implementation
* [wiki-plugin-*](https://github.com/search?q=%40fedwiki+plugin&type=Repositories&ref=searchresults) -- The many **wiki-plugin** npm packages - dynamically loaded client-side markup extensions.

See [About Plugins](http://plugins.fed.wiki.org/about-plugins.html) for more details about how plug-ins work and about how we develop them.

## Do's and Don't

* **Never, ever, do anything in master branch.** Always create a branch specific to the issue you're working on.
* **A branch should only have changes related to a single issue.**

## Working on a component

As the project is split into a number of repositories/npm packages, we need to be able to include the components we are working on into a local copy of the *wiki* package. npm provides two ways of achieving this, using `npm link` or `npm install`.

`npm link` works by creating symbolic links. This is good in the early stages of development, as the changes you make to the component will be available as soon as they are rebuilt. Being symbolic links though, you get entire contents of the components repository and not just those you would get when you install the component. See [npm-link](https://npmjs.org/doc/cli/npm-link.html) man page.

`npm install` works by installing the package from the repository you are working on. The downside is that you need to run the install each time you rebuild the component. See [npm-install](https://npmjs.org/doc/cli/npm-install.html) man page.

You will need a local copy of the *wiki* package, this can either be from GitHub, or installed from npm (though using git is probably simplier).

If, for example, you were working on the `method` plug-in, you would do something like the following:

On the GitHub site, create a fork of the repositories you are going to work on, and then:

```
	$ git clone https://github.com/.../wiki.git
	$ git clone https://github.com/.../wiki-plugin-method.git
	$ cd wiki
	$ npm install
	$ cd ../wiki-plugin-method
	$ npm install
	...
	... Create a branch for your changes (git checkout -b my-new-feature)
	...
	$ grunt watch
	...
	... modify the method package as required
	...
	$ cd ../wiki
	$ npm install ../wiki-plugin-method
	$ npm start
```

Cycle though making changes, installing them into wiki, and testing, until you are satisfied, then i) commit your changes `git commit -am 'Add some feature'`, ii) push the branch up to GitHub (git push origin my-new-feature), and iii) create new Pull Request.

If we were using `npm link` we would run:

```
	$ cd wiki-plugin-method
	$ npm link
	$ cd ../wiki
	$ npm link wiki-plugin-method
```

which would create the pair of symbolic links. N.B. on some platforms you will need admin rights to do this.

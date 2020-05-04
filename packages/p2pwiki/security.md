# Configuring security

By default wiki will, if we don't configure a security module, make all content read-only. 

The previous default where unclaimed sites were editable by anybody can be enabled by setting `security_legacy` to true.

This version of wiki will install

* a [Passport](http://passportjs.org) based security module, to replace the earlier Mozilla Persona one, and
* a simpler *friends*, secret token, based security module, see [wiki-security-friends](https://github.com/fedwiki/wiki-security-friends/blob/master/README.md) for details.

To use this new, Passport based, security module you will need to:

1. migrate the existing Mozilla Persona identity files to the new JSON format owner files. This is achieved by running `wiki-migrate`, there are optional parameters `data`, `status` and `id`; these should be set to the same as you use to run `wiki`.

1. choose one, or more, of the OAuth providers that it makes available and follow the [configuration notes](https://github.com/fedwiki/wiki-security-passportjs/blob/master/docs/configuration.md).

It is recommended that you make use of *TLS*, while currently it is not required for OAuth, it is recommended by the identity providers. This will require configuring a proxy, in front of the Federated Wiki server, and getting the necessary certificated. There are a number of options, probably the easiest is to use [Caddy](https://caddyserver.com/) with [Automatic HTTPS](https://caddyserver.com/docs/automatic-https), and On-Demand TLS. Which uses [Let's Encrypt](https://letsencrypt.org/) as the certificate authority.

If you want to use `TLS` you will need to configure the wiki server by adding `"security_useHttps": true,` to the configuration file, as well as using `https://` in the callback URLs when you configure the OAuth provider.

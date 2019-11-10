# node-gyp-build

Build tool and bindings loader for node-gyp that supports prebuilds.

```
npm install node-gyp-build
```

Use together with [prebuildify](https://github.com/mafintosh/prebuildify) to easily support prebuilds for your native modules.

## Usage

`node-gyp-build` works similar to `node-gyp build` except that it will check if a build or prebuild is present before rebuilding your project.

It's main intended use is as an npm install script and bindings loader for native modules that bundle prebuilds using [prebuildify](https://github.com/mafintosh/prebuildify).

First add `node-gyp-build` as an install script to your native project

``` js
{
  ...
  "scripts": {
    "install": "node-gyp-build"
  }
}
```

Then in your `index.js`, instead of using the [bindings module](https://www.npmjs.com/package/bindings) use `node-gyp-build` to load your binding.

``` js
var binding = require('node-gyp-build')(__dirname)
```

If you do these two things and bundle prebuilds [prebuildify](https://github.com/mafintosh/prebuildify) your native module will work for most platforms
without having to compile on install time AND will work in both node and electron without the need to recompile between usage.

Users can override `node-gyp-build` and force compiling by doing `npm install --build-from-source`.

## Supported prebuild names

If so desired you can bundle more specific flavors, for example `musl` builds to support Alpine, or targeting a numbered ARM architecture version.

These prebuilds can be bundled in addition to generic prebuilds; `node-gyp-build` will try to find the most specific flavor first. In order of precedence:

- If `arch` is `'arm'` or `'arm64'`:
  - `${platform}${libc}-${arch}-v${arm_version}`
  - `${platform}-${arch}-v${arm_version}`
- `${platform}${libc}-${arch}`
- `${platform}-${arch}`

The `libc` flavor and `arm_version` are auto-detected but can be overridden through the `LIBC` and `ARM_VERSION` environment variables, respectively.

## License

MIT

# rolldown-plugin-userscript

> [!WARNING]
> I broke the automatically setting `@grant`s part and this breaks in production due to Rolldown stripping the comments.
> Probably just use the Rollup one instead of using this, rollup-plugin-userscript should work with Rolldown anyway.
> See [this wiki entry](https://github.com/MinibloxCheaters2/rolldown-plugin-userscript/wiki/Using-Minification-alongside-this) to fix production / minified builds

![NPM](https://img.shields.io/npm/v/rolldown-plugin-userscript.svg)
![License](https://img.shields.io/npm/l/rolldown-plugin-userscript.svg)
![Downloads](https://img.shields.io/npm/dt/rolldown-plugin-userscript.svg)

Automatically parse metadata and set `@grant`s.

With this plugin, `@grant`s for [`GM_*` functions](https://violentmonkey.github.io/api/metadata-block/) will be added at compile time.

## Usage

Add the plugin to rolldown.config.js:

```js
import userscript from 'rolldown-plugin-userscript';

const plugins = [
  // ...
  userscript(meta => meta.replace('process.env.AUTHOR', pkg.author)),
];
```

Import the metadata file with a suffix `?userscript-metadata` in your script:

```js
import './meta.js?userscript-metadata';
```

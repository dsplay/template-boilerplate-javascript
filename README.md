![DSPLAY - Digital Signage](https://developers.dsplay.tv/assets/images/dsplay-logo.png)

# DSPLAY - JavaScript Template Boilerplate

This is a Vanilla JavaScript boilerplate for building [HTML-based templates](https://developers.dsplay.tv/docs/html-templates) for the [DSPLAY - Digital Signage](https://dsplay.tv/) platform.

You can use this project as a skeleton for creating a new HTML Template with pure JavaScript, without any extra library. If you prefer to use a JS library, check the [other boilerplates](https://developers.dsplay.tv/docs/html-templates/boilerplates/) available.

There is **no build step and no bundler** — every script is a plain `<script>` tag loaded directly by the browser. A `package.json` exists only for packaging-time tooling (generating the template variable manifest, keeping vendored dependencies up to date); it has no effect on how the template itself runs.

This README has two audiences:
- **[Building your own template](#building-your-own-template)** — if you cloned this repo to create a new DSPLAY template.
- **[Maintaining this boilerplate](#maintaining-this-boilerplate)** — for the DSPLAY team, keeping this repo itself up to date for future template authors.

---

## Building your own template

### Getting started

1. Clone or download this repository into your own new project folder.
2. Detach it from this boilerplate's history — you're starting a template of your own, not contributing back here:
   ```sh
   rm -rf .git
   git init
   ```
3. Install the packaging-time tooling (only needed once):
   ```sh
   npm install
   ```
4. Serve it with live reload:
   ```sh
   npm start
   ```
   and visit `http://localhost:3000` (visit the root URL, not `http://localhost:3000/index.html` directly — the reload script is only injected on that path). The page auto-reloads whenever you edit and save a file.

### Directory Structure

```
|-- my-template
|   |-- index.html                    <-- must be on the root
|   |
|   |-- scripts
|   |   |-- app.js                    <-- your template logic goes here
|   |   |-- core-js-<version>.js      <-- vendored core-js polyfill bundle
|   |   |-- dsplay-data.js            <-- mock DSPLAY data for local development, can be located anywhere in the template structure
|   |   |-- dsplay-template-utils.js  <-- vendored @dsplay/template-utils bundle
|   |
|   |-- assets
|   |   |-- audio/ font/ image/ video/
|   |-- styles
|   |   |-- main.css
|   |
|   |-- package.json                  <-- packaging-time devDependency only, not a build step
|   |-- pack.sh                       <-- generates the manifest and zips the template
```

This structure is just a suggestion.

> The only requirement regarding the project structure is that you must have an `index.html` in the root of your project, and a file called `dsplay-data.js` located anywhere in the project folder. The rest of the structure is up to you. ([see the docs](https://developers.dsplay.tv/docs/html-templates/#directory-structure))

### Configuring your template

Your template logic lives in `scripts/app.js`. It reads values through `window.dsplayTemplateUtils` (exposed by the vendored `scripts/dsplay-template-utils.js`) and updates the DOM directly:

```js
"use strict";

(function () {
    var u = dsplayTemplateUtils;

    // the current media/config/template objects
    console.log('media', u.media);
    console.log('config', u.config);
    console.log('template', u.template);

    // read a template variable as a string, with an optional default value
    var fontSize = u.tval('base_font_size', '1.5em');
    document.body.style.fontSize = fontSize;

    // tbval / tival / tfval work the same way for boolean / integer / float values
    var titleOpacity = u.tfval('title_opacity', 1);
    document.querySelector('.title').style.opacity = titleOpacity;
})();
```

- `u.tval(key, default)` / `u.tbval(key, default)` / `u.tival(key, default)` / `u.tfval(key, default)` — read a `dsplay_template` variable as string / boolean / integer / float, falling back to `default` when unset.
- `u.template`, `u.media`, `u.config` — the raw objects, if you'd rather read a value directly (e.g. `u.template.title`).
- `u.DSPLAY.getData()` — the raw JSON string DSPLAY injects, `{ media, config, template }`.

> Once you've settled on your template's variables, document them in your own README (a `Key | Type | Default | Description` table) and remember to register them as Template Vars (same name and type) when configuring your template in the DSPLAY CMS.

#### Local development data

`scripts/dsplay-data.js` defines `dsplay_config`, `dsplay_media`, and `dsplay_template` mock globals, used **only** when the template isn't running inside the actual DSPLAY app (i.e. while you're developing locally). Edit it to try out different variable values:

```js
var dsplay_template = {
  title: 'Hello!',
  base_font_size: '2em',
  image: 'https://dsplay.tv/site/wp-content/uploads/2019/11/logo.png',
};
```

In production, the DSPLAY Android app injects the real `window.DSPLAY.getData()` before any script runs, and this mock file is ignored.

### Generating the template package

```sh
npm run zip
```

This first runs [`dsplay-scan-template`](https://www.npmjs.com/package/@dsplay/template-manifest) (from `@dsplay/template-manifest`), which statically scans `scripts/app.js` for `dsplayTemplateUtils.tval`/`tbval`/`tival`/`tfval` calls and direct `template.*` reads, and captures `dsplay-data.js` as example data — writing `template-variables.json` + `template-example-data.json` to the project root. The DSPLAY CMS reads these two files to auto-detect this template's variables and seed default preview values, instead of requiring manual registration.

It then zips `index.html`, `assets/`, `scripts/`, `styles/`, and the two generated JSON files into `template.zip`.

> **IMPORTANT**: `index.html` must be located in the root of the `.zip` file, not inside any folder — `pack.sh` already takes care of this.

`template.zip`, `node_modules/`, and the two generated JSON files are gitignored and should never be committed; `pack.sh` regenerates them every run.

### Deploying

Upload the resulting `template.zip` to the [DSPLAY Web Manager](https://manager.dsplay.tv/template/create).

---

## Maintaining this boilerplate

This section is for the DSPLAY team, keeping this boilerplate itself current for the next person who clones it.

### Updating vendored dependencies

`core-js` and `dsplay-template-utils.js` are pre-built bundles downloaded from a CDN and committed as-is (not installed via npm). Run:

```sh
npm run update-deps
```

It checks the latest published version of each dependency and updates the vendored file + the `<script src="...">` reference in `index.html` accordingly. **Major version bumps are skipped with a warning** rather than applied automatically, since they may contain breaking changes and this boilerplate is consumed by other templates — review the linked changelog and update manually if you want to take a major bump.

The currently-vendored version of each dependency is tracked in `scripts/.vendored-versions.json` (committed — it's how the script knows what's already vendored, since `dsplay-template-utils.js` keeps a constant filename with no version in it).

After running it, review the diff, test locally, and commit.

### Commit conventions

See [AGENTS.md](AGENTS.md).

## More

To see more about DSPLAY HTML Templates, visit: https://developers.dsplay.tv/docs/html-templates

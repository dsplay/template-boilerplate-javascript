# AGENTS.md

Guidance for AI agents (and humans) working in this repository.

## What this project is

A Vanilla JavaScript boilerplate for building [HTML-based templates](https://developers.dsplay.tv/docs/html-templates) for the [DSPLAY - Digital Signage](https://dsplay.tv/) platform. There is no build step, no bundler, and no package manager (no `package.json`) — every script is a plain `<script>` tag loaded directly by the browser.

## Directory structure

```
index.html                          <-- must stay at the project root
scripts/
  app.js                            <-- template logic goes here
  core-js-<version>.js              <-- vendored core-js polyfill bundle
  dsplay-data.js                    <-- mock DSPLAY data for local development (must exist somewhere in the tree)
  dsplay-template-utils.js          <-- vendored @dsplay/template-utils bundle
styles/
  main.css
assets/
  audio/ font/ image/ video/        <-- static media, currently only favicon files are tracked
pack.sh                             <-- zips the template for upload to DSPLAY Web Manager
```

The structure is a suggestion, not a hard requirement. The only real constraints (enforced by the DSPLAY platform, not this repo) are:
- `index.html` must be at the root of the project (and at the root of the packed `.zip`, not inside a folder).
- A file named `dsplay-data.js` must exist somewhere in the project.

## Runtime model

- `scripts/dsplay-data.js` defines `dsplay_config`, `dsplay_media`, and `dsplay_template` globals used only in **development**. Its contents are ignored at runtime on the actual DSPLAY device/app.
- `scripts/dsplay-template-utils.js` (the `@dsplay/template-utils` UMD bundle) exposes `window.dsplayTemplateUtils` with `media`, `config`, `template`, `DSPLAY`, and the `tval`/`tbval`/`tival`/`tfval`/`isVertical` helpers. In production, the DSPLAY Android app injects `window.DSPLAY.getData()`; in development it falls back to the mock data from `dsplay-data.js`.
- `scripts/app.js` is where template-specific logic lives — read `template`/`media`/`config` values via `dsplayTemplateUtils` and update the DOM.
- `scripts/core-js-<version>.js` is a vendored polyfill bundle for older WebViews used by DSPLAY devices.

Script load order in `index.html` matters: `core-js` → `dsplay-data.js` → `dsplay-template-utils.js` → `app.js`.

## Dependency management

There is no `npm install` — third-party code is vendored directly into `scripts/` as pre-built bundles fetched from a CDN (e.g. unpkg). When updating one of these dependencies:

1. Check the latest published version on npm (`core-js-bundle`, `@dsplay/template-utils`).
2. Download the built/minified bundle (not the raw npm source) from unpkg, e.g.:
   - `https://unpkg.com/core-js-bundle@<version>/minified.js`
   - `https://unpkg.com/@dsplay/template-utils@<version>/dist/dsplay-template-utils.js`
3. For `core-js`, rename the file to include the version (`scripts/core-js-<version>.js`) and update the `<script src="...">` reference in `index.html` to match.
4. For `dsplay-template-utils.js`, the filename stays constant — just overwrite its contents.
5. Sanity check by serving the project locally (e.g. `python3 -m http.server`) and confirming the page loads with no console errors and the mock data from `dsplay-data.js` renders.

## Packing / deployment

Run `./pack.sh` to zip `index.html`, `assets/`, `scripts/`, and `styles/` into `template.zip`, ready to upload to the [DSPLAY Web Manager](https://manager.dsplay.tv/template/create). `template.zip` is gitignored and should never be committed.

## Commit messages

Every commit title must start with an emoji, followed by a short, imperative summary — e.g. `⬆️ update core-js to 3.50.0`.

- The human maintainer uses [gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli) for manual commits, so gitmoji conventions (`✨` feature, `🐛` fix, `⬆️` upgrade deps, `♻️` refactor, `📝` docs, `🎨` structure/format) are a good default.
- Agents are not required to stick to the official gitmoji list — pick whichever emoji best represents the actual change in that commit, as long as it's placed at the start of the title.

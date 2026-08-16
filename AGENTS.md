# AGENTS.md

Guidance for AI agents (and humans) working in this repository.

## What this project is

A Vanilla JavaScript boilerplate for building [HTML-based templates](https://developers.dsplay.tv/docs/html-templates) for the [DSPLAY - Digital Signage](https://dsplay.tv/) platform. There is no build step and no bundler — every script is a plain `<script>` tag loaded directly by the browser. `package.json` exists only for tooling around the template (packaging, a local dev server, tests — see "Packing / deployment" and "Testing" below), not for the template itself.

Most people who touch this repo are building their **own** template by cloning it, customizing `scripts/app.js`, and never pushing back here — they diverge immediately (README.md tells them to `rm -rf .git && git init` right after cloning). The README's "Maintaining this boilerplate" section (dependency updates, this AGENTS.md) is only relevant to the DSPLAY team keeping *this* repo current for the next person who clones it.

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
test/
  basic.test.js                    <-- smoke tests (see "Testing" below)
pack.sh                             <-- generates the manifest and zips the template for upload to DSPLAY Web Manager (wrapped by `npm run zip`)
update-deps.sh                      <-- updates vendored dependencies (boilerplate maintainers only, see below; wrapped by `npm run update-deps`)
package.json                        <-- devDependencies only (@dsplay/template-manifest for "zip", servor for "start", node:test for "test"), not a build step
scripts/.vendored-versions.json     <-- tracks the currently-vendored version of each dep for update-deps.sh
```

The structure is a suggestion, not a hard requirement. The only real constraints (enforced by the DSPLAY platform, not this repo) are:
- `index.html` must be at the root of the project (and at the root of the packed `.zip`, not inside a folder).
- A file named `dsplay-data.js` must exist somewhere in the project.

## Runtime model

- `scripts/dsplay-data.js` defines `dsplay_config`, `dsplay_media`, and `dsplay_template` globals used only in **development**. Its contents are ignored at runtime on the actual DSPLAY device/app.
- `scripts/dsplay-template-utils.js` (the [`@dsplay/template-utils`](https://github.com/dsplay/template-utils) UMD bundle) exposes `window.dsplayTemplateUtils` with `media`, `config`, `template`, `DSPLAY`, and the `tval`/`tbval`/`tival`/`tfval`/`isVertical` helpers. In production, the DSPLAY Android app injects `window.DSPLAY.getData()`; in development it falls back to the mock data from `dsplay-data.js`.
- `scripts/app.js` is where template-specific logic lives — read `template`/`media`/`config` values via `dsplayTemplateUtils` and update the DOM.
- `scripts/core-js-<version>.js` is a vendored polyfill bundle for older WebViews used by DSPLAY devices.

Script load order in `index.html` matters: `core-js` → `dsplay-data.js` → `dsplay-template-utils.js` → `app.js`.

## Local development

`npm start` runs [`servor`](https://www.npmjs.com/package/servor) (`. index.html 3000 --reload --browse`) — a zero-dependency static file server with live reload, picked specifically because it doesn't pull in a bundler (Vite et al.), matching this template's whole "no build step" premise. Visit `http://localhost:3000` (the **root** URL) — `servor` only injects its live-reload script into extension-less "route" requests, so `http://localhost:3000/index.html` (with the explicit filename) silently serves the page without reload wired up. The page auto-reloads whenever any file changes and you save.

## Testing

`npm test` runs `node --test` against `test/basic.test.js` — three smoke tests using only Node's built-in `node:test`/`node:assert`/`node:vm` (no Vitest, no jsdom; this template deliberately has no bundler, so it doesn't get the same test setup as the React templates):
- every `src`/`href` in `index.html` points at a file that actually exists (catches a typo'd path or a forgotten vendored file).
- `dsplay-data.js` actually defines `dsplay_config`/`dsplay_media`/`dsplay_template` as objects (executed in an isolated `vm` context, not `require`d — it's a plain script, not a module).
- `app.js` at least parses as valid JavaScript (syntax-only — it isn't executed, since it expects `dsplayTemplateUtils`/the DOM to already be loaded, which a bare Node context doesn't have).

This is the reference copy for the other bundler-less templates ([`template-boilerplate-jquery`](https://github.com/dsplay/template-boilerplate-jquery), [`template-digital-clock-basic`](https://github.com/dsplay/template-digital-clock-basic), [`template-chamador-loterias-caixa`](https://github.com/dsplay/template-chamador-loterias-caixa), [`template-skitter-slider`](https://github.com/dsplay/template-skitter-slider)) — copy `test/basic.test.js` and the `"test"` script verbatim into any future one, no changes needed unless the directory layout diverges from this boilerplate's.

## Package identity

Rename `package.json`'s `"name"` away from `dsplay-template-boilerplate-javascript` immediately when starting a new
template from this boilerplate — even though `package.json` here is packaging-time-only, it should still identify
the template itself, not the boilerplate it was cloned from. Convention: `dsplay-` + the new repo's own GitHub name.

## README structure

Every DSPLAY template's `README.md` follows the same skeleton (this repo's is the reference copy — most sections below aren't applicable to a generic boilerplate, only to an actual template):

1. Logo badge + `# DSPLAY - <Name>` + a one/two-sentence description.
2. *(optional, only if the template has more than one visual arrangement)* **Features** — named widgets/modes, and any special in-text commands.
3. *(optional, only if appearance changes meaningfully by screen format)* **Supported screen formats** — a table with a screenshot per format (landscape/portrait/square/horizontal banner).
4. **Template variables** — a `Key | Type | Default | Description` table; this is the one section every real template has. Add a `### <variable> syntax` sub-section when a single variable's value is itself a small grammar worth explaining rather than cramming it into the table cell. End with: "Remember to also register these as Template Vars (same name and type) when configuring this template in the DSPLAY CMS."
5. **Local development** — `npm install`, `npm start`, plus the `dsplay-data.js` explanation.
6. *(optional, only if some customization requires editing code rather than a variable)* **For developers** — a short list of `customization -> file path` pointers.
7. **Generating the template package**, **Deploying**, **Updating vendored dependencies** (-> AGENTS.md), **More** — same wording as this repo's README.md.

Skip a numbered section entirely rather than including it empty.

## Dependency management (boilerplate maintainers only)

The *template's own* runtime code has no `npm install` step — third-party code it uses (`core-js`, `dsplay-template-utils.js`) is vendored directly into `scripts/` as pre-built bundles fetched from a CDN (e.g. unpkg), not installed via npm. `npm install` in this repo only installs devDependencies for tooling around the template ([`@dsplay/template-manifest`](https://github.com/dsplay/template-manifest) for `npm run zip`, `servor` for `npm start`) — see "Local development" above and "Packing / deployment" below.

Run `npm run update-deps` (wraps `./update-deps.sh`) to update the vendored bundles. For each dependency it: fetches the latest published version from the npm registry, compares it against `scripts/.vendored-versions.json` (the only record of the currently-vendored version, since `dsplay-template-utils.js` keeps a constant filename with no version in it), and:
- if it's a **major** version bump, skips it and prints a warning — this needs a human to review the changelog first, since it may contain breaking changes and this boilerplate is consumed by other templates. Never bypass this guard as an agent; surface the warning to the user instead.
- otherwise, downloads the new bundle (renaming `core-js-<version>.js` to match, or overwriting the constant `dsplay-template-utils.js`), updates the `<script src="...">` reference in `index.html` when the filename changed, and updates `scripts/.vendored-versions.json`.

After running it, sanity check with `npm start` and confirming the page loads with no console errors and the mock data from `dsplay-data.js` renders, then commit.

## Packing / deployment

Run `npm install` once, then `npm run zip` (wraps `./pack.sh`). It first runs `dsplay-scan-template`, which statically scans `scripts/app.js` for `dsplayTemplateUtils.tval`/`tbval`/`tival`/`tfval` calls and direct `template.*` reads, and captures `dsplay-data.js` as example data — writing `template-variables.json` + `template-example-data.json` to the project root. It then zips `index.html`, `assets/`, `scripts/`, `styles/`, and those two generated files into `template.zip`, ready to upload to the [DSPLAY Web Manager](https://manager.dsplay.tv/template/create). The DSPLAY CMS reads the two JSON files to auto-detect this template's variables instead of requiring manual registration.

`template.zip`, `node_modules/`, and the two generated JSON files are gitignored and should never be committed — `npm run zip` regenerates them every run.

## Commit messages

Every commit title must start with an emoji, followed by a short, imperative summary — e.g. `⬆️ update core-js to 3.50.0`.

- The human maintainer uses [gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli) for manual commits, so gitmoji conventions (`✨` feature, `🐛` fix, `⬆️` upgrade deps, `♻️` refactor, `📝` docs, `🎨` structure/format) are a good default.
- Agents are not required to stick to the official gitmoji list — pick whichever emoji best represents the actual change in that commit, as long as it's placed at the start of the title.

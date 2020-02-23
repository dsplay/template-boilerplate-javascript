# DSPLAY - JavaScript Template Boilerplate

You can use this project as a skeleton for creating a new [HTML-based template](https://developers.dsplay.tv/docs/html-templates) for DSPLAY.

## Directory Structure

```
|-- my-template
|   |-- index.html  <-- must be on the root
|   |
|   |-- scripts
|   |   |-- app.js
|   |   |-- dsplay-data.js  <-- can be located anywhere in the template structure
|   |   |-- dsplay-template-utils.js
|   |
|   |-- images
|   |-- styles
```

This structure is just a suggestion.

> The only requirement regarding the project structure is that you must have an index.html in the root of your project, and a file called dsplay-data.js located anywhere in the project folder. The rest of the structure is up to you. ([see the docs](https://developers.dsplay.tv/docs/html-templates/#directory-structure))

## Packing

To pack your template, just zip all the files of the project (except the `.git` folder).

> **IMPORTANT**: When zipping your template, the `index.html` file must be located in the root of the `.zip` file, not inside any folder.

For linux users, just run:
```sh
./pack.sh
```
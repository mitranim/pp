## Overview

SSG remake of ProstoPoi: https://prostopoi.ru

* Statically generated.
* Build and deploy: automatic via GitHub Actions.
* Served via GitHub Pages.

## History

The previous version used Django + Postgres. It was converted to an SSG (static site generator) to eliminate maintenance and reduce risks. The Git repository of the Django version remains private for now.

## Code

* Site markup: `./scripts/site.mjs`
* CLI commands: `./scripts/cmd_*.mjs`
* Type definitions: `./scripts/dat_typ.mjs`
* Data fixtures: `./scripts/init_*.mjs`
* Article Markdown: `./templates/articles/*.md`

## Development

Install dependencies:

    make deps

Run in watch mode:

    make

Complete build:

    make build

## TODO

* Restore auth and profile features (use Firebase).
* Remove unused styles.
* Image optimization.

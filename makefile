MAKEFLAGS := --silent --always-make
PAR := $(MAKE) -j 128
TAR := public
SRC_SCRIPT := scripts/client.mjs
TAR_SCRIPT := $(TAR)/scripts/client.mjs
SRC_STYLE := styles/main.scss
TAR_STYLE := $(TAR)/styles/main.css
IMPORTMAP_FLAG = $(if $(wildcard $(1)),--importmap=$(1),)
IMPORTMAP_DENO_FLAG := $(or $(call IMPORTMAP_FLAG,importmap_deno_override.json),$(call IMPORTMAP_FLAG,importmap_deno.json))
IMPORTMAP_CLIENT_FLAG := $(or $(call IMPORTMAP_FLAG,importmap_client_override.json),$(call IMPORTMAP_FLAG,importmap_client.json))
SASS := sass --no-source-map -q -I . $(SRC_STYLE):$(TAR_STYLE)
WATCH := watchexec -r -c -d=0 -n
DENO_RUN := deno run -A --no-check $(IMPORTMAP_DENO_FLAG)
DENO_WAT := $(DENO_RUN) --watch
ESBUILD := https://deno.land/x/esbuild@v0.14.42/mod.js
ESBUILD_OPT := --bundle --format=esm --target=es2019 --minify=true --keep-names=true --legal-comments=none

ifeq ($(PROD), true)
	SASS := $(SASS) --style=compressed
else
	SASS := $(SASS) --style=expanded
endif

ifeq ($(OS), Windows_NT)
	RM = if exist "$(1)" rmdir /s /q "$(1)"
else
	RM = rm -rf "$(1)"
endif

ifeq ($(OS), Windows_NT)
	MKDIR = if not exist "$(1)" mkdir "$(1)"
else
	MKDIR = mkdir -p "$(1)"
endif

ifeq ($(OS), Windows_NT)
	CP = copy "$(1)"\* "$(2)" >nul
else
	CP = cp -r "$(1)"/* "$(2)"
endif

watch: clean
	$(PAR) styles_w srv_w live

build: clean all

all:
	$(PAR) styles scripts pages cp

styles_w:
	$(SASS) --watch

styles:
	$(SASS)

live:
	$(DENO_RUN) scripts/cmd_live.mjs

# Explanation:
#
#   * `deno bundle` resolves URL imports.
#      Esbuild doesn't support that.
#
#   * Esbuild transforms the syntax for compatibility with Safari.
#     `deno bundle` doesn't support that.
scripts:
	$(call MKDIR,$(dir $(TAR_SCRIPT)))
	deno bundle -q --no-check $(IMPORTMAP_CLIENT_FLAG) $(SRC_SCRIPT) | $(DENO_RUN) $(ESBUILD) $(ESBUILD_OPT) > $(TAR_SCRIPT)

srv_w:
	$(WATCH) -w=templates/articles -- $(DENO_WAT) scripts/cmd_srv.mjs

srv:
	$(DENO_RUN) scripts/cmd_srv.mjs

pages_w:
	$(WATCH) -w=templates/articles -- $(DENO_WAT) scripts/cmd_pages.mjs

pages:
	$(DENO_RUN) scripts/cmd_pages.mjs

deno:
	$(DENO_RUN) $(file)

cp:
	$(call MKDIR,$(TAR))
	$(call MKDIR,$(TAR)/svg)
	$(call MKDIR,$(TAR)/fonts)
	$(call MKDIR,$(TAR)/images)
	$(call CP,static,$(TAR))
	$(call CP,svg,$(TAR)/svg)
	$(call CP,images,$(TAR)/images)
	$(call CP,uploaded/images,$(TAR)/images)
	$(call CP,node_modules/font-awesome/fonts,$(TAR)/fonts)

clean:
	$(call RM,$(TAR))

prune_images:
	$(DENO_RUN) scripts/cmd_prune_images.mjs --gen --dup

prune_images_unused: pages
	$(DENO_RUN) scripts/cmd_prune_images.mjs --gen --dup --use

deps:
ifeq ($(OS), Windows_NT)
	scoop install sass watchexec deno
else
	brew install -q sass/sass/sass watchexec deno
endif
	npm i

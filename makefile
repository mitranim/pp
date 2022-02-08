MAKEFLAGS := --silent --always-make
PAR := $(MAKE) -j 128
TAR := public
SASS := sass --no-source-map -q -I . styles/main.scss:$(TAR)/styles/main.css
WATCH := watchexec -r -c -d=0 -n
DENO := deno run -A --unstable --no-check --import-map=importmap.json

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
	$(PAR) styles_w scripts_w afr srv_w

build: clean
	$(PAR) styles scripts pages cp

styles_w:
	$(SASS) --watch

styles:
	$(SASS)

scripts_w:
	node esbuild.mjs --watch

scripts:
	node esbuild.mjs

afr:
	deno run -A --unstable --no-check https://deno.land/x/afr@0.5.1/afr.ts --port 47692

srv_w:
	$(WATCH) -w=templates/articles -- $(DENO) --watch scripts/cmd_srv.mjs

srv:
	$(DENO) scripts/cmd_srv.mjs

pages_w:
	$(DENO) --watch scripts/cmd_pages.mjs

pages:
	$(DENO) scripts/cmd_pages.mjs

deno:
	$(DENO) $(file)

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
	$(DENO) scripts/cmd_prune_images.mjs --gen --dup

prune_images_unused: pages
	$(DENO) scripts/cmd_prune_images.mjs --gen --dup --use

deps:
ifeq ($(OS), Windows_NT)
	scoop install sass watchexec deno nodejs
else
	brew install -q sass/sass/sass watchexec deno node
endif
	npm i

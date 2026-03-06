.PHONY: build check clean clean_build pretty serve setup stop

# --------------------------
# Rollup build configuration
# Forwarded to rollup.config.js via environment variables.
# Override from CLI, e.g.:
# make build ROLLUP_OUTPUT_DIR=build
# --------------------------
ROLLUP_ROOT_DIR ?= ./app
ROLLUP_OUTPUT_DIR ?= dist
ROLLUP_INPUT_HTMLS_JSON ?= [ \
	"./index.html", \
	"./apps/todo/todo.html", \
	"./apps/router/router.html", \
	"./apps/ionic/ionic.html" \
]
ROLLUP_COPY_PATTERNS_JSON ?= [ \
	"./*.{txt,webmanifest}", \
	"./apps/router/_*.html", \
	"./apps/ionic/assets/**", \
	"./apps/ionic/manifest.json", \
	"./apps/ionic/capacitor.config.json" \
]
ROLLUP_ENV = \
	ROLLUP_ROOT_DIR='$(ROLLUP_ROOT_DIR)' \
	ROLLUP_OUTPUT_DIR='$(ROLLUP_OUTPUT_DIR)' \
	ROLLUP_INPUT_HTMLS_JSON='$(ROLLUP_INPUT_HTMLS_JSON)' \
	ROLLUP_COPY_PATTERNS_JSON='$(ROLLUP_COPY_PATTERNS_JSON)'

# --------------------------
# Local tooling/runtime paths
# --------------------------
BUILD_DIR ?= $(ROLLUP_OUTPUT_DIR)
DEPS_DIR := node_modules
NGINX := /usr/sbin/nginx
OPEN := xdg-open
PORT ?= 4000
NGINX_CONF := /tmp/nginx_seed.conf

# Remove installed dependencies and lock file.
clean:
	@rm -rf $(DEPS_DIR) package-lock.json

# Reinstall dependencies from scratch.
setup: clean
	@npm i

# Type-check the project.
check:
	@echo "Typechecking JS"
	@./node_modules/.bin/tsc

# Dev server: nginx + rollup watch + SSE live-reload
serve: clean_build
	@export PORT=$(PORT); envsubst '$$PORT' < $(CURDIR)/nginx.conf > $(NGINX_CONF)
	@$(NGINX) -c $(NGINX_CONF) -p $(CURDIR)
	@echo "Serving on http://localhost:$(PORT)"
	@(while [ ! -f $(BUILD_DIR)/index.html ]; do sleep 0.1; done; $(OPEN) http://localhost:$(PORT) 2>/dev/null) &
	@trap '$(NGINX) -c $(NGINX_CONF) -p $(CURDIR) -s stop 2>/dev/null; echo "Nginx stopped"' EXIT INT TERM; \
	$(ROLLUP_ENV) DEV=1 npx rollup -c -w

# Stop nginx started by `make serve`.
stop:
	@$(NGINX) -c $(NGINX_CONF) -p $(CURDIR) -s stop 2>/dev/null || true
	@echo "Nginx stopped"

# Format project files with Prettier.
pretty:
	@npx prettier ./ --write --cache --log-level=silent

# Production build
build: clean_build
	@$(ROLLUP_ENV) npx rollup -c

# Remove build output directory.
clean_build:
	@rm -rf $(BUILD_DIR)

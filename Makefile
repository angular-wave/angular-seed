.PHONY: clean setup check lint lint_fix serve serve_test stop pretty build clean_build test test_unit test_e2e

BUILD_DIR = dist
DEPS_DIR = node_modules
NGINX = /usr/sbin/nginx
OPEN = xdg-open
PORT ?= 4000
NGINX_CONF = /tmp/nginx_seed.conf
LIVE_RELOAD_PORT ?= 35729
ROLLUP_PID_FILE = /tmp/angular-seed-rollup.pid

clean:
	@rm -rf $(DEPS_DIR) package-lock.json

setup: clean
	@npm i
	@npx playwright install --with-deps chromium

check:
	@echo "Typechecking JS"
	@./node_modules/.bin/tsc

lint:
	@npx eslint . --fix

# Dev server: nginx + rollup watch + SSE live-reload
serve: clean_build
	@export PORT=$(PORT); envsubst '$$PORT' < $(CURDIR)/nginx.conf > $(NGINX_CONF)
	@$(NGINX) -c $(NGINX_CONF) -p $(CURDIR)
	@echo "Serving on http://localhost:$(PORT)"
	@(while [ ! -f $(BUILD_DIR)/index.html ]; do sleep 0.1; done; $(OPEN) http://localhost:$(PORT) 2>/dev/null) &
	@trap 'status=$$?; \
	if [ -f $(ROLLUP_PID_FILE) ]; then \
		kill "$$(cat $(ROLLUP_PID_FILE))" 2>/dev/null || true; \
		rm -f $(ROLLUP_PID_FILE); \
		echo "Rollup watch stopped"; \
	fi; \
	$(NGINX) -c $(NGINX_CONF) -p $(CURDIR) -s stop 2>/dev/null; \
	echo "Nginx stopped"; \
	exit $$status' EXIT INT TERM; \
	DEV=1 npx rollup -c -w & \
	rollup_pid=$$!; \
	echo $$rollup_pid > $(ROLLUP_PID_FILE); \
	wait $$rollup_pid

# Headless server for CI / Playwright (no browser, no live-reload)
serve_test: clean_build
	@export PORT=$(PORT); envsubst '$$PORT' < $(CURDIR)/nginx.conf > $(NGINX_CONF)
	@$(NGINX) -c $(NGINX_CONF) -p $(CURDIR)
	@echo "Test server on http://localhost:$(PORT)"
	@trap '$(NGINX) -c $(NGINX_CONF) -p $(CURDIR) -s stop 2>/dev/null; echo "Nginx stopped"' EXIT INT TERM; \
	npx rollup -c -w

stop:
	@if [ -f $(ROLLUP_PID_FILE) ]; then \
		kill "$$(cat $(ROLLUP_PID_FILE))" 2>/dev/null || true; \
		rm -f $(ROLLUP_PID_FILE); \
		echo "Rollup watch stopped"; \
	else \
		echo "Rollup watch not running"; \
	fi
	@$(NGINX) -c $(NGINX_CONF) -p $(CURDIR) -s stop 2>/dev/null || true
	@echo "Nginx stopped"

pretty:
	@npx prettier ./ --write --cache --log-level=silent

# Production build
build: clean_build
	@npx rollup -c

clean_build:
	@rm -rf $(BUILD_DIR)

# Testing
test: test_unit test_e2e

test_unit:
	@npx playwright test --project=unit

test_e2e:
	@PORT=$(PORT) npx playwright test --project=e2e


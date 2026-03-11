.PHONY: clean setup check lint lint_fix serve serve_test stop pretty build clean_build test test_unit test_e2e

BUILD_DIR = dist
DEPS_DIR = node_modules
NGINX = /usr/sbin/nginx
OPEN = xdg-open
OPEN_BROWSER ?= 1
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
	while [ ! -f $(BUILD_DIR)/index.html ]; do sleep 0.1; done; \
	export PORT=$(PORT); envsubst '$$PORT' < $(CURDIR)/nginx.conf > $(NGINX_CONF); \
	$(NGINX) -c $(NGINX_CONF) -p $(CURDIR); \
	echo "Serving on http://localhost:$(PORT)"; \
	if [ "$(OPEN_BROWSER)" = "1" ]; then $(OPEN) http://localhost:$(PORT) 2>/dev/null & fi; \
	wait $$rollup_pid

# Headless alias for CI / Playwright
serve_test: clean_build
	@$(MAKE) serve OPEN_BROWSER=0 PORT=$(PORT)

stop:
	@if [ -f $(ROLLUP_PID_FILE) ]; then \
		kill "$$(cat $(ROLLUP_PID_FILE))" 2>/dev/null || true; \
		rm -f $(ROLLUP_PID_FILE); \
		echo "Rollup watch stopped"; \
	else \
		echo "Rollup watch not running"; \
	fi
	@if command -v lsof >/dev/null 2>&1; then \
		live_reload_pid="$$(lsof -ti tcp:$(LIVE_RELOAD_PORT) 2>/dev/null)"; \
		if [ -n "$$live_reload_pid" ]; then \
			kill $$live_reload_pid 2>/dev/null || true; \
			echo "Live-reload server stopped"; \
		fi; \
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
	@server_log=/tmp/angular-seed-e2e-server.log; \
	$(MAKE) serve OPEN_BROWSER=0 PORT=$(PORT) > $$server_log 2>&1 & \
	server_pid=$$!; \
	trap '$(MAKE) stop PORT=$(PORT) >/dev/null 2>&1 || true; kill $$server_pid 2>/dev/null || true' EXIT INT TERM; \
	attempts=0; \
	until curl -fsS http://localhost:$(PORT)/ >/dev/null 2>&1; do \
		attempts=$$((attempts + 1)); \
		if [ $$attempts -ge 150 ]; then \
			echo "Server did not start. See $$server_log"; \
			exit 1; \
		fi; \
		sleep 0.2; \
	done; \
	PLAYWRIGHT_EXTERNAL_SERVER=1 PORT=$(PORT) npx playwright test --project=e2e

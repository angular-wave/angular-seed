# `angular-seed` — the seed for AngularTS apps

This project is an application skeleton for a standalone [AngularTS][angularts] web app. You can use it to quickly bootstrap your next project.
It contains several sample AngularTS applications and is preconfigured with all the necessary tools for developing, testing and deployment.
In order to leave your options open, it attempts to be as minimalist as possible. None of the tools are specific to or even necessary
for AngularTS development and would apply equally well to any generic web project. And since AngularTS is oriented primarily at server-rendered applications,
the seed also attempts to make itself embedable into back-end stack of your choice.

For inspiration, the seed comes bundled with the following apps under `apps` folder:

- A todo list
- A router example
- Ionic/Capacitor Mobile App example

### Install Dependencies

```
make setup
```

### Run the Application

The dev server uses [nginx](https://nginx.org/) to serve static files from `dist/` with instant live-reload powered by [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). No heavyweight dev server dependencies are required.

```
make serve
```

This starts the following:

1. **Rollup** builds the app to `dist/` and watches for source changes
2. **Nginx** serves `dist/` on `http://localhost:4000` with SPA fallback routing
3. **SSE live-reload** — a minimal SSE server (embedded in the rollup config, zero dependencies) pushes reload events to the browser on every rebuild
4. **Nginx `sub_filter`** injects the live-reload `<script>` tag into HTML responses at serve time — the build output stays clean

Your browser will open automatically. When you edit source files, rollup rebuilds and the browser reloads instantly.

To stop nginx manually (if needed):

```
make stop
```

[angularts]: https://github.com/Angular-Wave/angular.ts

### Build the App for Production

AngularTS apps consist of static HTML, CSS, and JavaScript files that need to be hosted on a server accessible to browsers.
To generate a production-ready bundle with minified HTML, CSS, and JavaScript, run:

```
make build
```

This will execute the following tasks:

- Minified HTML with [Rollup Plugin HTML](https://modern-web.dev/docs/building/rollup-plugin-html/)
- Bundled JS with [Rollup](https://rollupjs.org/) and minified with [Terser](https://terser.org/)
- Bundled and minified CSS with [Lightning CSS](https://lightningcss.dev/)

Your app should be available in `/dist` folder and can then be uploaded to a static server.

### Commands

| Command       | Description                        |
| ------------- | ---------------------------------- |
| `make setup`  | Clean install dependencies         |
| `make serve`  | Dev server with live-reload        |
| `make build`  | Production build                   |
| `make stop`   | Stop nginx if still running        |
| `make check`  | TypeScript type-check              |
| `make pretty` | Format code with Prettier          |
| `make clean`  | Remove `node_modules` and lockfile |

await import("./ionic.js");

const ionicCoreUrl = new URL("./ionic.js", import.meta.url).href;

await import(ionicCoreUrl);

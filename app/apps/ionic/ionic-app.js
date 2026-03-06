import { defineCustomElements as definePwa } from "@ionic/pwa-elements/loader";
import { addIcons } from "ionicons";
import { camera, images } from "ionicons/icons";
import { angular } from "@angular-wave/angular.ts";
import { PhotoController } from "./photo-controller.js";

addIcons({ camera, images });

const appModule = angular
  .module("app", [])
  .config([
    "$sceProvider",
    ($sceProvider) => {
      $sceProvider.enabled(false);
    },
  ])
  .controller("PhotoController", PhotoController);

const pwaReady = definePwa(window)
  .then(() =>
    Promise.all([
      customElements.whenDefined("pwa-camera-modal"),
      customElements.whenDefined("pwa-action-sheet"),
      customElements.whenDefined("pwa-toast"),
    ]),
  )
  .then(() => true)
  .catch(() => false);

pwaReady.then((ready) => {
  document.documentElement.setAttribute("data-pwa-ready", String(ready));
});

const ionicCoreUrl = new URL("./ionic.js", import.meta.url).href;
const ionicReady = import(ionicCoreUrl).then(() => true).catch(() => false);

ionicReady.then((ready) => {
  document.documentElement.setAttribute("data-ionic-ready", String(ready));
});

let hasBootstrapped = false;
const bootstrapApp = () => {
  if (hasBootstrapped) return;
  hasBootstrapped = true;
  angular.bootstrap(document.body, [appModule.name]);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapApp, { once: true });
} else {
  bootstrapApp();
}

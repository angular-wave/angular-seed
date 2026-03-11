import { angular } from "@angular-wave/angular.ts";
import { PhotoController } from "./photo-controller";
import { defineCustomElements as definePwa } from "@ionic/pwa-elements/loader";
import { addIcons } from "ionicons";
import { camera, images } from "ionicons/icons";

addIcons({ camera, images });

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

window.pwaReady = pwaReady;
pwaReady.then((ready) => {
  document.documentElement.setAttribute("data-pwa-ready", String(ready));
});

const appModule = angular
  .module("app", [])
  .config([
    "$sceProvider",
    (/** @type {any} */ $sceProvider) => {
      $sceProvider.enabled(false);
    },
  ])
  .controller("PhotoController", PhotoController);

let hasBootstrapped = false;

function bootstrapIonicAngular() {
  if (hasBootstrapped) return;
  hasBootstrapped = true;
  angular.bootstrap(document.body, [appModule.name]);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapIonicAngular, {
    once: true,
  });
} else {
  bootstrapIonicAngular();
}

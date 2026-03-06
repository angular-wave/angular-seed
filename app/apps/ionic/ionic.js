import { angular } from "@angular-wave/angular.ts";
import { PhotoController } from "./photo-controller.js";
import { defineCustomElements as defineIonic } from "@ionic/core/loader/index.js";
import { defineCustomElements as definePwa } from "@ionic/pwa-elements/loader";
import { addIcons } from "ionicons";
import { camera, images } from "ionicons/icons";

addIcons({ camera, images });
debugger;
defineIonic(window);
definePwa(window);

angular
  .module("app", [])
  .config([
    "$sceProvider",
    ($sceProvider) => {
      $sceProvider.enabled(false);
    },
  ])
  .controller("PhotoController", PhotoController);

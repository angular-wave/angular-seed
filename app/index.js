import { angular } from "@angular-wave/angular.ts";
import { angularCssModuleName } from "@angular-wave/angular.css";

angular.createModule("version", [angularCssModuleName]).controller(
  "VersionController",
  class VersionController {
    version = angular.version;
  },
);

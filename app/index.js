import { angular } from "@angular-wave/angular.ts";

angular.module("version", []).controller(
  "VersionController",
  class VersionController {
    version = angular.version;
  },
);

import { angular } from "@angular-wave/angular.ts";

/**
 * @typedef {ng.StateDeclaration & import("@angular-wave/angular.ts/@types/router/state/interface.ts").ViewDeclaration} StateConfig
 */

angular.module("router", []).config([
  angular.$t.$stateProvider,
  (/** @type {ng.StateService} */ $stateProvider) => {
    $stateProvider
      .state({
        name: "page1",
        url: "/page1",
        template: "<h3>Its the NG-Router hello world app!</h3>",
      })
      .state({
        name: "page2",
        url: "/page2",
        templateUrl: "/apps/router/_page2.html",
      })
      .state({
        name: "home",
        url: "/apps/router/router.html",
        templateUrl: "/apps/router/_home.html",
      });
  },
]);

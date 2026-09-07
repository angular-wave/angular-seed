import { angular } from "@angular-wave/angular.ts";

/**
 * @typedef {ng.StateDeclaration} StateConfig
 */

angular.createModule("router", []).router([
  {
    name: "page1",
    url: "/page1",
    template: "<h3>Its the NG-Router hello world app!</h3>",
  },
  {
    name: "page2",
    url: "/page2",
    templateUrl: "/apps/router/_page2.html",
  },
  {
    name: "home",
    url: "/apps/router/router.html",
    templateUrl: "/apps/router/_home.html",
  },
]);

angular.init(document);

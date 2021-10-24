LWR.define('example/stripVersionHook/v/0_0_1', ['exports'], function (exports) { 'use strict';

  function stringResponse(serviceAPI) {
    serviceAPI.addLoaderPlugin({
      resolveModule: async id => {
        if (id === 'example/guest/v/0_0_1') {
          const [specifier] = id.split('/v/'); // remove version from specifier

          return `${specifier}`;
        } // else return null to indicate the version was not stripped


        return null;
      }
    });
  }

  exports.default = stringResponse;

  Object.defineProperty(exports, '__esModule', { value: true });

});

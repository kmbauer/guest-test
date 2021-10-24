LWR.define('@lwrjs/app-service/example/module/amd/v/0_5_6', ['lwr/loaderLegacy/v/0_5_6', 'example/stripVersionHook/v/0_0_1', 'lwr/init/v/0_5_6'], function (_0_5_6, loaderService_example_stripVersionHook, _0_5_6$1) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var loaderService_example_stripVersionHook__default = /*#__PURE__*/_interopDefaultLegacy(loaderService_example_stripVersionHook);

    loaderService_example_stripVersionHook__default['default'](_0_5_6.services);

    // initialize additional non-configured root components
    const { rootComponents } = globalThis.LWR;
    Promise.all(rootComponents.map(async (rootSpecifier) => {
        const element = _0_5_6$1.toKebabCase(rootSpecifier);
        if (globalThis.performance) {
            globalThis.performance.measure('lwr-bootstrap-on-app-load');
        }
        return _0_5_6.load(rootSpecifier, '@lwrjs/app-service/example/module/amd/v/0_5_6').then(({default: Ctor}) => {
            _0_5_6$1.init([[element, Ctor]]);
        });
    }));

});

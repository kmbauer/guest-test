LWR.define('example/app/v/0_0_1', ['exports', 'lwr/loaderLegacy/v/0_5_6', 'lwc/v/2_5_6', 'example/app#app.html/v/0_0_1'], function (exports, _0_5_6, _2_5_6, _tmpl) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var _tmpl__default = /*#__PURE__*/_interopDefaultLegacy(_tmpl);

  class HelloWorldApp extends _2_5_6.LightningElement {
    constructor(...args) {
      super(...args);
      this.whoIsGuest = 'not set';
      this.whoIsTheProxy = 'not set';
    }

    connectedCallback() {
      const getGuest = async () => {
        const {
          default: guestName
        } = await _0_5_6.load('example/guest/v/0_0_1');
        this.whoIsGuest = guestName;
      };

      const getProxy = async () => {
        const {
          default: guestName
        } = await _0_5_6.load('example/guestProxy/v/0_0_1');
        this.whoIsTheProxy = guestName;
      };

      getGuest();
      getProxy();
    }

  }

  _2_5_6.registerDecorators(HelloWorldApp, {
    fields: ["whoIsGuest", "whoIsTheProxy"]
  });

  var _0_0_1 = _2_5_6.registerComponent(HelloWorldApp, {
    tmpl: _tmpl__default['default']
  });

  exports.default = _0_0_1;

  Object.defineProperty(exports, '__esModule', { value: true });

});

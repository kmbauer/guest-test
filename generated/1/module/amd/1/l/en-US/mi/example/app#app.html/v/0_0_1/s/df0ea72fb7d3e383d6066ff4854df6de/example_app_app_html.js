LWR.define('example/app#app.html/v/0_0_1', ['exports', 'example/app#app.css/v/0_0_1', 'example/app#app.css/v/0_0_1', 'lwc/v/2_5_6'], function (exports, _implicitStylesheets, _implicitScopedStylesheets, _2_5_6) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var _implicitStylesheets__default = /*#__PURE__*/_interopDefaultLegacy(_implicitStylesheets);
  var _implicitScopedStylesheets__default = /*#__PURE__*/_interopDefaultLegacy(_implicitScopedStylesheets);

  function tmpl($api, $cmp, $slotset, $ctx) {
    const {t: api_text, h: api_element, d: api_dynamic_text} = $api;
    return [api_element("main", {
      key: 0
    }, [api_element("h1", {
      key: 1
    }, [api_text("Test Is Guest")]), api_element("ul", {
      key: 2
    }, [api_element("li", {
      key: 3
    }, [api_element("span", {
      key: 4
    }, [api_text("Who is the guest? " + api_dynamic_text($cmp.whoIsGuest))])]), api_element("li", {
      key: 5
    }, [api_element("span", {
      key: 6
    }, [api_text("Who is the guest? " + api_dynamic_text($cmp.whoIsTheProxy))])])])])];
  }
  var _0_0_1 = _2_5_6.registerTemplate(tmpl);
  tmpl.stylesheets = [];


  if (_implicitStylesheets__default['default']) {
    tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets__default['default']);
  }
  if (_implicitScopedStylesheets__default['default']) {
    tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets__default['default']);
  }
  tmpl.stylesheetToken = "example-app_app";

  exports.default = _0_0_1;

  Object.defineProperty(exports, '__esModule', { value: true });

});

LWR.define('example/guestProxy/v/0_0_1', ['exports', 'example/guest'], function (exports, guest) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var guest__default = /*#__PURE__*/_interopDefaultLegacy(guest);

	const name = `I am the proxy for ${guest__default['default']}`;

	exports.default = name;

	Object.defineProperty(exports, '__esModule', { value: true });

});

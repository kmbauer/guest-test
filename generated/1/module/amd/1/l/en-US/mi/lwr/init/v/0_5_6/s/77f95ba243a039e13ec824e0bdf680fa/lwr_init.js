LWR.define('lwr/init/v/0_5_6', ['exports', 'lwc/v/2_5_6'], function (exports, _2_5_6) { 'use strict';

  // TODO: This is a temporal workaround until https://github.com/salesforce/lwc/pull/2083 is sorted

  function initializeWebComponent(elementName, Ctor) {
    return _2_5_6.createElement(elementName, {
      is: Ctor
    });
  }
  /**
   * Convert a module specifier into a valid CustomElement registry name:
   *      - remove any version linking
   *      - change / to -
   *      - convert uppercase letters into "-${lowercase}"
   * eg: "c/app" => "c-app"
   * eg: "my/helloWorld" => "my-hello-world"
   * eg: "lwr/example/v/1.0.0" => "lwr-example"
   * @param specifier The bare specifier to convert
   */


  function toKebabCase(specifier) {
    return specifier.replace(/\/v\/[a-zA-Z0-9-_.]+$/, '').replace('/', '-').replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
  }
  /**
   * This method maps between attribute names
   * and the corresponding props name.
   */

  const CAMEL_REGEX = /-([a-z])/g;
  function getPropFromAttrName(propName) {
    return propName.replace(CAMEL_REGEX, g => g[1].toUpperCase());
  }
  /**
   * Import any requested static application dependencies, define the root
   * application component(s) into the CustomElement registry, and inject them.
   * @param rootModules - An array of arrays, each one holding a pair of
   *                      bare specifier and corresponding LightningElement constructor
   * @example - [['x/appRoot', appCtor], ['x/nav', navCtor]]
   */

  function init(rootModules) {
    if (typeof customElements !== 'undefined' && typeof document !== 'undefined') {
      const container = document.querySelector('[lwr-root]');
      rootModules.forEach(([moduleSpecifier, ctor]) => {
        // Kebab-case the specifier
        const elementName = toKebabCase(moduleSpecifier); // Append the root element to the DOM, if it does not exist
        // this is for SPA like routes (one component at the root level) utilizing the lwr-root directive

        let el = document.body.querySelector(elementName);

        if (!el) {
          el = initializeWebComponent(elementName, ctor);

          if (container) {
            // Append to a node with the "lwr-root" attribute
            container.appendChild(el);
          } else {
            // Otherwise, add the root to the <body>
            document.body.appendChild(el);
          }
        } else {
          // We have rendered/ssred an HTML page and we need to reify the components
          // Due to the bug described on the header, for each custom element
          // we collect the attributes and we replace the element with the new synthetic contructor
          const customElements = document.querySelectorAll(elementName);
          customElements.forEach(customElement => {
            const newElement = initializeWebComponent(elementName, ctor);

            for (const {
              name,
              value
            } of customElement.attributes) {
              newElement.setAttribute(name, value);
              const prop = getPropFromAttrName(name);

              if (prop in newElement) {
                // Set attributes as properties too for reactivity
                newElement[prop] = value;
              }
            } // Move the children


            while (customElement.childNodes.length > 0) {
              newElement.appendChild(customElement.childNodes[0]);
            }

            customElement.parentElement.replaceChild(newElement, customElement);

            if (globalThis.performance) {
              const metric = 'lwr-bootstrap-on-app-init';
              globalThis.performance.measure(metric);
            }
          });
        }
      });
    }
  }

  exports.getPropFromAttrName = getPropFromAttrName;
  exports.init = init;
  exports.toKebabCase = toKebabCase;

  Object.defineProperty(exports, '__esModule', { value: true });

});

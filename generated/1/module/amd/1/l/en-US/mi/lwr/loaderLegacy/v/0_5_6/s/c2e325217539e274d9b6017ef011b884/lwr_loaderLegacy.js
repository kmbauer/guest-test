LWR.define('lwr/loaderLegacy/v/0_5_6', ['exports'], function (exports) { 'use strict';

  /**
  * Copyright (c) 2021, salesforce.com, inc.
  * All rights reserved.
  * SPDX-License-Identifier: MIT
  * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
  */

  /* LWR Legacy Module Loader v0.5.6 */
  const templateRegex = /\{([0-9]+)\}/g; // eslint-disable-next-line @typescript-eslint/no-explicit-any

  function templateString(template, args) {
    return template.replace(templateRegex, (_, index) => {
      return args[index];
    });
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any


  function generateErrorMessage(errorInfo, args) {
    const message = Array.isArray(args) ? templateString(errorInfo.message, args) : errorInfo.message;
    return `LWR${errorInfo.code}: ${message}`;
  }

  class LoaderError extends Error {
    constructor(errorInfo, errorArgs) {
      super();
      this.message = generateErrorMessage(errorInfo, errorArgs);
    }

  }

  function invariant(condition, errorInfo) {
    if (!condition) {
      throw new LoaderError(errorInfo);
    }
  }

  const MISSING_NAME = Object.freeze({
    code: 3000,
    message: 'A module name is required.',
    level: 0
  });
  const FAIL_INSTANTIATE = Object.freeze({
    code: 3004,
    message: 'Failed to instantiate module: {0}',
    level: 0
  });
  const NO_AMD_REQUIRE = Object.freeze({
    code: 3005,
    message: 'AMD require not supported.',
    level: 0
  });
  const FAILED_DEP = Object.freeze({
    code: 3006,
    level: 0,
    message: 'Failed to load dependency: {0}'
  });
  const INVALID_DEPS = Object.freeze({
    code: 3007,
    message: 'Unexpected value received for dependencies argument; expected an array.',
    level: 0
  });
  const FAIL_LOAD = Object.freeze({
    code: 3008,
    level: 0,
    message: 'Error loading {0}'
  });
  const UNRESOLVED = Object.freeze({
    code: 3009,
    level: 0,
    message: 'Unable to resolve bare specifier: {0}'
  });
  const NO_BASE_URL = Object.freeze({
    code: 3010,
    level: 0,
    message: 'baseUrl not set'
  });
  Object.freeze({
    code: 3011,
    level: 0,
    message: 'Cannot set a loader service multiple times'
  });
  const INVALID_HOOK = Object.freeze({
    code: 3012,
    level: 0,
    message: 'Invalid hook received'
  });
  const INVALID_LOADER_SERVICE_RESPONSE = Object.freeze({
    code: 3013,
    level: 0,
    message: 'Invalid response received from hook'
  });
  const MODULE_LOAD_TIMEOUT = Object.freeze({
    code: 3014,
    level: 0,
    message: 'Error loading {0} - timed out'
  });
  const HTTP_FAIL_LOAD = Object.freeze({
    code: 3015,
    level: 0,
    message: 'Error loading {0}, status code {1}'
  });
  const STALE_HOOK_ERROR = Object.freeze({
    code: 3016,
    level: 0,
    message: 'An error occurred handling module conflict'
  });
  const MODULE_ALREADY_LOADED = Object.freeze({
    code: 3017,
    level: 0,
    message: 'Marking module(s) as externally loaded, but they are already loaded: {0}'
  });
  const FAIL_HOOK_LOAD = Object.freeze({
    code: 3018,
    level: 0,
    message: 'Error loading "{0}" from hook'
  });
  /* importMap errors */

  const BAD_IMPORT_MAP = Object.freeze({
    code: 3011,
    level: 0,
    message: 'import map is not valid'
  });
  /* eslint-disable lwr/no-unguarded-apis */

  const hasDocument = typeof document !== 'undefined';
  const hasSetTimeout = typeof setTimeout === 'function';
  const hasConsole = typeof console !== 'undefined';
  /* eslint-enable lwr/no-unguarded-apis */

  function getBaseUrl() {
    let baseUrl = undefined;

    if (hasDocument) {
      // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
      const baseEl = document.querySelector('base[href]');
      baseUrl = baseEl && baseEl.href;
    } // eslint-disable-next-line lwr/no-unguarded-apis


    if (!baseUrl && typeof location !== 'undefined') {
      // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
      baseUrl = location.href.split('#')[0].split('?')[0];
      const lastSepIndex = baseUrl.lastIndexOf('/');

      if (lastSepIndex !== -1) {
        baseUrl = baseUrl.slice(0, lastSepIndex + 1);
      }
    }

    return baseUrl;
  }
  /**
   * Check if a string is a URL based on Common Internet Scheme Syntax
   * https://www.ietf.org/rfc/rfc1738.txt
   *
   * URL Format:
   *  <scheme>:<scheme-specific-part>
   * Common Internet Scheme Syntax:
   *  The scheme specific part starts with a double slash('//')
   *
   * A valid URL has a colon that is followed by a double slash.
   *
   * @param url - the url that is being checked
   * @returns boolean
   *
   * @example Valid URLs
   * 'https://salesforce.com'
   * 'http://localhost:3000'
   *
   * @example Invalid URLs
   * 'salesforce.com'
   * 'localhost:3000'
   * '@salesforce/label/type:namespace:name'
   */


  function isUrl(url) {
    return url.indexOf('://') !== -1;
  } // Borrowed and adapted from https://github.com/systemjs/systemjs/blob/master/src/common.js
  // Resolves the first path segment relative to the second/parent URL
  // eg: resolveIfNotPlainOrUrl('../test', 'http://www.site.com/one/two') => 'http://www.site.com/test'
  // eg: resolveIfNotPlainOrUrl('./x/y/z', 'https://my.com/segment')).toBe('https://my.com/x/y/z')


  function resolveIfNotPlainOrUrl(relUrl, parentUrl) {
    const backslashRegEx = /\\/g;
    if (relUrl.indexOf('\\') !== -1) relUrl = relUrl.replace(backslashRegEx, '/'); // protocol-relative

    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    } // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) || relUrl.length === 1 && (relUrl += '/')) || relUrl[0] === '/') {
      const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
      let pathname;

      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        } else {
          pathname = parentUrl.slice(8);
        }
      } else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/' ? 1 : 0));
      }

      if (relUrl[0] === '/') return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl; // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'

      const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;
      const output = [];
      let segmentIndex = -1;

      for (let i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
            segmentIndex = -1;
          }
        } // new segment - check if it is relative
        else if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
            output.pop();
            i += 2;
          } // ./ segment
          else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
            i += 1;
          } else {
            // the start of a new segment as below
            segmentIndex = i;
          }
        } // it is the start of a new segment
        else {
          segmentIndex = i;
        }
      } // finish reading out the last segment


      if (segmentIndex !== -1) output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

  function resolveUrl(relUrl, parentUrl) {
    const resolvedUrl = resolveIfNotPlainOrUrl(relUrl, parentUrl) || (isUrl(relUrl) ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
    return resolvedUrl;
  }

  function createScript(url) {
    // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
    const script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = url;
    return script;
  }

  let lastWindowError$1, lastWindowErrorUrl;

  function loadModuleDef(url) {
    return new Promise(function (resolve, reject) {
      if (hasDocument) {
        /* eslint-disable lwr/no-unguarded-apis, no-undef */
        const script = createScript(url);
        script.addEventListener('error', () => {
          reject(new LoaderError(FAIL_LOAD, [url]));
        });
        script.addEventListener('load', () => {
          document.head.removeChild(script);

          if (lastWindowErrorUrl === url) {
            reject(lastWindowError$1);
          } else {
            resolve();
          }
        });
        document.head.appendChild(script);
        /* eslint-enable lwr/no-unguarded-apis, no-undef */
      }
    });
  }

  if (hasDocument) {
    // When a script is executed, runtime errors are on the global/window scope which are NOT caught by the script's onerror handler.
    // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
    window.addEventListener('error', evt => {
      lastWindowErrorUrl = evt.filename;
      lastWindowError$1 = evt.error;
    });
  }

  const MODULE_LOAD_TIMEOUT_TIMER = 300000;
  let lastWindowError;

  if (hasDocument) {
    globalThis.addEventListener('error', evt => {
      lastWindowError = evt.error;
    });
  }

  if (!hasSetTimeout && hasConsole) {
    // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
    console.warn('setTimeout API is not available, watchdog timer on load hook will not be set');
  }

  function isCustomResponse(response) {
    return Object.prototype.hasOwnProperty.call(response, 'data') && !Object.prototype.hasOwnProperty.call(response, 'blob');
  }

  function isFetchResponse(response) {
    // if it quacks like a duck...
    return typeof response.blob === 'function';
  }

  function isResponseAPromise(response) {
    return !!(response && response.then);
  }

  async function evaluateLoadHookResponse(response, id) {
    return Promise.resolve().then(async () => {
      if (!response.status) {
        throw new LoaderError(INVALID_LOADER_SERVICE_RESPONSE);
      }

      if (response.status !== 200) {
        throw new LoaderError(HTTP_FAIL_LOAD, [id, `${response.status}`]);
      }

      const isResponse = isFetchResponse(response);
      let code;

      if (isCustomResponse(response)) {
        code = response.data;
      } else if (isResponse) {
        // handle fetch response
        code = await response.text();
      } else {
        throw new LoaderError(INVALID_LOADER_SERVICE_RESPONSE);
      }

      if (!code) {
        throw new LoaderError(FAIL_LOAD, [id]);
      }

      code = `${code}\n//# sourceURL=${id}`; // append sourceURL for debugging

      try {
        // TODO eval source maps for debugging
        eval(code);
      } catch (e) {
        throw new LoaderError(FAIL_LOAD, [id]);
      }

      if (lastWindowError) {
        throw new LoaderError(FAIL_LOAD, [id]);
      }

      return true;
    }).finally(() => {});
  }

  async function evaluateLoadHook(id, hookPromise) {
    if (!hasSetTimeout) {
      return hookPromise;
    }

    return new Promise((resolve, reject) => {
      // wrap the hook in a watchdog timer
      // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
      const timer = setTimeout(() => {
        reject(new LoaderError(MODULE_LOAD_TIMEOUT, [id]));
      }, MODULE_LOAD_TIMEOUT_TIMER);
      hookPromise.then(response => {
        resolve(response);
      }).catch(() => {
        reject(new LoaderError(FAIL_HOOK_LOAD, [id]));
      }).finally(() => {
        // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
        clearTimeout(timer);
      });
    });
  }

  function reportError(error) {
    // TODO eventually this should be configurable instrumentation to send this somewhere
    // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
    if (hasConsole) console.error(error);
  }

  function evaluateHandleStaleModuleHooks(handleStaleModuleHooks, hookArgs) {
    const {
      name,
      oldHash,
      newHash
    } = hookArgs; // keep evaluating hooks if return value is null

    for (let i = 0; i < handleStaleModuleHooks.length; i++) {
      const hook = handleStaleModuleHooks[i];

      try {
        const hookResult = hook({
          name,
          oldHash,
          newHash
        });

        if (hookResult !== null) {
          break;
        }
      } catch (e) {
        reportError(new LoaderError(STALE_HOOK_ERROR));
      }
    }
  }
  /* global console,process */


  class ModuleRegistry {
    constructor(baseUrl) {
      // A registry for named AMD defines containing the *metadata* of AMD module
      this.namedDefineRegistry = new Map(); // The evaluted module registry where the module identifier (name or URL?) is the key

      this.moduleRegistry = new Map();
      this.baseUrl = baseUrl;
    }

    async load(id, importer) {
      const resolvedId = await this.resolve(id, importer);
      const moduleRecord = this.getModuleRecord(resolvedId, id);

      if (moduleRecord.evaluated) {
        return moduleRecord.module;
      } else {
        if (!moduleRecord.evaluationPromise) {
          moduleRecord.evaluationPromise = this.topLevelEvaluation(moduleRecord);
        }

        return moduleRecord.evaluationPromise;
      }
    }

    async resolve(id, importer) {
      const parentUrl = this.baseUrl; // only support baseUrl for now

      let resolved;
      let aliasedId = id;
      const resolveHooks = this.resolveHook;

      if (resolveHooks) {
        for (let i = 0; i < resolveHooks.length; i++) {
          const resolveHook = resolveHooks[i];
          const response = resolveHook(aliasedId, {
            parentUrl
          });
          let result;

          if (response || response === null) {
            // eslint-disable-next-line no-await-in-loop
            result = isResponseAPromise(response) ? await response : response;
          } // if result is not null, attempt resolution


          if (result !== null) {
            if (typeof result === 'string') {
              if (resolveIfNotPlainOrUrl(result, parentUrl)) {
                // string response can't be a URL
                throw new LoaderError(INVALID_LOADER_SERVICE_RESPONSE);
              }

              aliasedId = result; // the next hook will receive the new id

              continue;
            }

            resolved = result && result.url && (resolveIfNotPlainOrUrl(result.url, parentUrl) || result.url);

            if (!resolved) {
              throw new LoaderError(INVALID_LOADER_SERVICE_RESPONSE);
            } // Don't process any more hooks if we have resolved


            break;
          }
        }

        if (aliasedId !== id) {
          // resolved module id is the aliased module if it has already been defined
          if (!resolved && this.namedDefineRegistry.has(aliasedId)) {
            return aliasedId;
          } else {
            id = aliasedId;
          }
        }
      }

      if (!resolved) {
        const resolvedOrPlain = resolveIfNotPlainOrUrl(id, parentUrl) || id; // if module registry already has named module the resolved id is the plain id

        if (this.moduleRegistry.has(resolvedOrPlain)) {
          return resolvedOrPlain;
        }

        if (this.resolver) {
          resolved = this.resolver.resolve(resolvedOrPlain, parentUrl); // return the plain id IFF its already defined && the resolvedUrl is NOT already in the module registry

          if (this.namedDefineRegistry.has(resolvedOrPlain) && this.namedDefineRegistry.get(resolvedOrPlain).defined) {
            const record = this.moduleRegistry.get(resolved);

            if (!record || record.originalId !== resolvedOrPlain) {
              return resolvedOrPlain;
            }
          } // return resolved;

        } else {
          resolved = resolvedOrPlain;
        }
      }

      if (!resolved || !isUrl(resolved)) {
        if (this.namedDefineRegistry.has(id)) {
          return id;
        }

        throw new LoaderError(UNRESOLVED, [id]);
      }

      if (importer && isUrl(resolved)) {
        resolved += `?importer=${encodeURIComponent(importer)}`;
      }

      return resolved;
    }

    has(id) {
      return this.moduleRegistry.has(id);
    }

    define(name, dependencies, exporter, signatures) {
      const mod = this.namedDefineRegistry.get(name); // Don't allow redefining a module.

      if (mod && mod.defined) {
        if (process.env.NODE_ENV !== 'production' && hasConsole) {
          // eslint-disable-next-line lwr/no-unguarded-apis
          console.warn(`Module redefine attempted: ${name}`);
        }

        this.lastDefine = mod;
        return;
      }

      const moduleDef = {
        name,
        dependencies,
        exporter,
        signatures,
        defined: true
      };

      if (mod && mod.external) {
        // if module is "external", resolve the external promise to notify any dependees
        mod.external.resolveExternal(moduleDef);
      }

      this.namedDefineRegistry.set(name, moduleDef);
      this.lastDefine = moduleDef; // Check signatures of dependencies against those in the namedDefineRegistry

      if (signatures.hashes) {
        Object.entries(signatures.hashes).forEach(([dep, sig]) => {
          this.checkModuleSignature(dep, sig);
        });
      }
    }
    /**
     * Marks modules as "externally" loaded/provided, so that the loader does not attempt to fetch them.
     *
     * @param modules - list of module identifiers
     */


    registerExternalModules(modules) {
      const alreadyRegistered = [];
      modules.map(id => {
        if (this.namedDefineRegistry.has(id)) {
          alreadyRegistered.push(id);
        } else {
          let resolveExternal;
          let timer;
          const moduleDefPromise = new Promise((resolve, reject) => {
            resolveExternal = resolve; // watch the external for timeout
            // eslint-disable-next-line lwr/no-unguarded-apis, no-undef

            timer = setTimeout(() => {
              reject(new LoaderError(MODULE_LOAD_TIMEOUT, [id]));
            }, MODULE_LOAD_TIMEOUT_TIMER);
          }).finally(() => {
            // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
            clearTimeout(timer);
          });
          const moduleDef = {
            name: id,
            defined: false,
            external: {
              resolveExternal,
              moduleDefPromise
            }
          };
          this.namedDefineRegistry.set(id, moduleDef);
        }
      }); // throw error for modules that were already registered

      if (alreadyRegistered.length) {
        throw new LoaderError(MODULE_ALREADY_LOADED, [alreadyRegistered.join(', ')]);
      }
    }

    checkModuleSignature(name, signature) {
      const moduleDef = this.namedDefineRegistry.get(name);

      if (!moduleDef) {
        // Placeholder module definition entry for saving known signature
        const modDef = {
          name,
          signatures: {
            ownHash: signature
          },
          defined: false
        };
        this.namedDefineRegistry.set(name, modDef);
        return;
      }

      const currentSig = moduleDef.signatures ? moduleDef.signatures.ownHash : undefined;

      if (currentSig && signature !== currentSig) {
        const handleStaleModuleHooks = this.handleStaleModuleHook;

        if (handleStaleModuleHooks) {
          evaluateHandleStaleModuleHooks(handleStaleModuleHooks, {
            name,
            oldHash: currentSig,
            newHash: signature
          });
        } else {
          if (hasConsole) {
            // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
            console.warn(`stale module detected ${name}, current sig:${currentSig}, new sig:${signature}`);
          }
        }
      }
    }

    setImportResolver(resolver) {
      this.resolver = resolver;
    }

    getModuleRecord(resolvedId, id) {
      let moduleRecord = this.moduleRegistry.get(resolvedId);

      if (moduleRecord) {
        return moduleRecord;
      }

      const instantiation = this.getModuleDef(resolvedId, id);
      const dependencyRecords = instantiation.then(moduleDef => {
        const dependencies = moduleDef.dependencies; // get dep and filter out exports

        const filtered = dependencies.map(dep => {
          if (dep === 'exports') {
            return;
          }

          invariant(dep !== 'require', NO_AMD_REQUIRE);
          return this.getModuleDependencyRecord.call(this, dep);
        }).filter(depRecord => depRecord !== undefined);
        return Promise.all(filtered);
      });
      moduleRecord = {
        id: resolvedId,
        originalId: id,
        module: Object.create(null),
        dependencyRecords,
        instantiation,
        evaluated: false,
        evaluationPromise: null
      };
      this.moduleRegistry.set(resolvedId, moduleRecord);
      return moduleRecord;
    }

    async getModuleDependencyRecord(dependency) {
      const resolvedDepId = await this.resolve(dependency);
      return this.getModuleRecord(resolvedDepId, dependency);
    } // execute the "top-level code" (the code outside of functions) of a module


    async topLevelEvaluation(moduleRecord) {
      await this.instantiateAll(moduleRecord, {});
      return this.evaluateModule(moduleRecord, {});
    } // Returns a promise when a module and all of it's dependencies have finished instantiation


    async instantiateAll(moduleRecord, instantiatedMap) {
      if (!instantiatedMap[moduleRecord.id]) {
        instantiatedMap[moduleRecord.id] = true;
        const dependencyModuleRecords = await moduleRecord.dependencyRecords;

        if (dependencyModuleRecords) {
          for (let i = 0; i < dependencyModuleRecords.length; i++) {
            const depRecord = dependencyModuleRecords[i]; // eslint-disable-next-line no-await-in-loop

            await this.instantiateAll(depRecord, instantiatedMap);
          }
        }
      }
    }

    async evaluateModule(moduleRecord, evaluationMap) {
      const dependencyModuleRecords = await moduleRecord.dependencyRecords;

      if (dependencyModuleRecords.length > 0) {
        evaluationMap[moduleRecord.id] = true; // evaluate dependencies first

        await this.evaluateModuleDependencies(dependencyModuleRecords, evaluationMap);
      }

      const {
        exporter,
        dependencies
      } = await moduleRecord.instantiation; // The exports object automatically gets filled in by the exporter evaluation

      const exports = {};
      const depsMapped = await Promise.all(dependencies.map(async dep => {
        if (dep === 'exports') {
          return exports;
        }

        const resolvedDepId = await this.resolve(dep);
        const moduleRecord = this.moduleRegistry.get(resolvedDepId);

        if (!moduleRecord) {
          throw new LoaderError(FAILED_DEP, [resolvedDepId]);
        }

        const module = moduleRecord.module;
        /**
         * Circular dependencies are handled properly when named exports are used,
         * however, for default exports there is a bug: https://github.com/rollup/rollup/issues/3384
         *
         * The workaround below applies for circular dependencies (!moduleRecord.evaluated)
         */

        if (!moduleRecord.evaluated) {
          return this.getCircularDependencyWrapper(module);
        }

        if (module) {
          return module.__defaultInterop ? module.default : module;
        }

        throw new LoaderError(FAILED_DEP, [resolvedDepId]);
      })); // W-10029836 - In the case where we could be instantiating multiple graphs at the same time lets make sure the module have not already been evaluated

      if (moduleRecord.evaluated) {
        return moduleRecord.module;
      } // evaluates the module function


      let moduleDefault = exporter(...depsMapped); // value is returned from exporter, then we are not using named exports

      if (moduleDefault !== undefined) {
        moduleDefault = {
          default: moduleDefault
        }; // __defaultInterop is ONLY used to support backwards compatibility
        // of importing default exports the "wrong" way (when not using named exports).
        // See https://github.com/salesforce/lwr/pull/816

        Object.defineProperty(moduleDefault, '__defaultInterop', {
          value: true
        });
      } // if no return value, then we are using the exports object
      else {
        // handle only default export with Rollup forced named exports
        if (this.isNamedExportDefaultOnly(exports)) {
          Object.defineProperty(exports, '__useDefault', {
            value: true
          });
        }
      }

      const moduleExports = moduleDefault || exports; // update the module record
      // copy over enumerable public methods to module

      for (const key in moduleExports) {
        Object.defineProperty(moduleRecord.module, key, {
          enumerable: true,

          set(value) {
            moduleExports[key] = value;
          },

          get() {
            return moduleExports[key];
          }

        });
      } // copy non-enumerable to module


      if (moduleExports.__useDefault) {
        Object.defineProperty(moduleRecord.module, '__useDefault', {
          value: true
        });
      }

      if (moduleExports.__defaultInterop) {
        Object.defineProperty(moduleRecord.module, '__defaultInterop', {
          value: true
        });
      }

      moduleRecord.evaluated = true;
      Object.freeze(moduleRecord.module);
      return moduleRecord.module;
    } // Determines if named exports module has only default export


    isNamedExportDefaultOnly(exports) {
      return exports !== undefined && Object.getOwnPropertyNames(exports).length === 2 && Object.prototype.hasOwnProperty.call(exports, 'default') && Object.prototype.hasOwnProperty.call(exports, '__esModule');
    } // Wrap the dependency in a function that can be called and detected by __circular__ property.
    // The LWC engine checks for __circular__ to detect circular dependencies.


    getCircularDependencyWrapper(module) {
      const tmp = () => {
        return module.__useDefault || module.__defaultInterop ? module.default : module;
      };

      tmp.__circular__ = true;
      return tmp;
    }

    async evaluateModuleDependencies(dependencyModuleRecords, evaluationMap) {
      for (let i = 0; i < dependencyModuleRecords.length; i++) {
        const depRecord = dependencyModuleRecords[i];

        if (!depRecord.evaluated && !evaluationMap[depRecord.id]) {
          evaluationMap[depRecord.id] = true; // eslint-disable-next-line no-await-in-loop

          await this.evaluateModule(depRecord, evaluationMap);
        }
      }
    }

    async getModuleDef(resolvedId, originalId) {
      // reset lastDefine
      this.lastDefine = undefined; // the module name can be the resolved ID or the original ID if neither are URL's.

      const moduleName = !isUrl(resolvedId) ? resolvedId : originalId !== resolvedId ? originalId : undefined;
      let moduleDef = moduleName && this.namedDefineRegistry.get(moduleName);

      if (moduleDef && moduleDef.external) {
        return moduleDef.external.moduleDefPromise;
      }

      if (moduleDef && moduleDef.defined) {
        return moduleDef;
      }

      const parentUrl = this.baseUrl; // only support baseUrl for now

      return Promise.resolve().then(async () => {
        const loadHooks = this.loadHook;

        if (loadHooks) {
          for (let i = 0; i < loadHooks.length; i++) {
            const loadHook = loadHooks[i];
            const response = loadHook(resolvedId, parentUrl);
            const result = isResponseAPromise(response) ? // eslint-disable-next-line no-await-in-loop
            await evaluateLoadHook(resolvedId, response) : response;

            if (result === undefined) {
              throw new LoaderError(INVALID_LOADER_SERVICE_RESPONSE);
            }

            if (result && result !== null) {
              return evaluateLoadHookResponse(result, resolvedId);
            }
          }
        }

        return false;
      }).then(result => {
        if (result !== true && hasDocument) {
          return loadModuleDef(resolvedId);
        }
      }).then(() => {
        // Attempt to retrieve the module definition by name first
        moduleDef = moduleName && this.namedDefineRegistry.get(moduleName); // Fallback to the last loader.define call

        if (!moduleDef) {
          moduleDef = this.lastDefine;
        } // This should not happen


        if (!moduleDef) {
          throw new LoaderError(FAIL_INSTANTIATE, [resolvedId]);
        }

        return moduleDef;
      }).catch(e => {
        throw e;
      });
    }

    addLoaderPlugin(hooks) {
      if (typeof hooks !== 'object') {
        throw new LoaderError(INVALID_HOOK);
      }

      const {
        loadModule: loadHook,
        resolveModule: resolveHook
      } = hooks;

      if (resolveHook) {
        if (this.resolveHook) {
          this.resolveHook.push(resolveHook);
        } else {
          this.resolveHook = [resolveHook];
        }
      }

      if (loadHook) {
        if (this.loadHook) {
          this.loadHook.push(loadHook);
        } else {
          this.loadHook = [loadHook];
        }
      }
    }

    registerHandleStaleModuleHook(handleStaleModule) {
      if (this.handleStaleModuleHook) {
        this.handleStaleModuleHook.push(handleStaleModule);
      } else {
        this.handleStaleModuleHook = [handleStaleModule];
      }
    }

  } // find the longest set of segments from path which are a key in matchObj
  // eg: getMatch('/a/b/c', { '/a/b': ..., '/a': ..., '/d/e/f': ...}) => '/a/b'


  function getMatch(path, matchObj) {
    if (matchObj[path]) {
      return path;
    }

    let sepIndex = path.length;

    do {
      const segment = path.slice(0, sepIndex + 1);

      if (segment in matchObj) {
        return segment;
      }
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1);
  }

  function targetWarning(match, target, msg) {
    if (hasConsole) {
      // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
      console.warn('Package target ' + msg + ", resolving target '" + target + "' for " + match);
    }
  }
  /**
   * Import map support for LWR based on the spec: https://github.com/WICG/import-maps
   *
   * This implementation is adapted from https://github.com/systemjs/systemjs/blob/master/src/features/import-map.js
   */
  // Resolves an import map package entry


  function applyPackages(id, packages, defaultUri) {
    const pkgName = getMatch(id, packages);

    if (pkgName) {
      const pkg = packages[pkgName];

      if (pkg === null) {
        return;
      }

      if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/') {
        targetWarning(pkgName, pkg, "should have a trailing '/'");
      } else {
        const isPackage = id.length > pkgName.length && pkg[pkg.length - 1] === '/' && pkg.lastIndexOf(pkgName) === pkg.length - pkgName.length;

        if (isPackage) {
          // Encode the specifier to create a well-formed LWR module URI
          return pkg.substring(0, pkg.lastIndexOf(pkgName)) + encodeURIComponent(id);
        }

        return pkg + id.slice(pkgName.length);
      }
    } else if (defaultUri) {
      // When a specifier's URI cannot be resolved via the imports, fallback to "default".
      //     -> https://rfcs.lwc.dev/rfcs/lws/0000-import-metadata#json-schema
      // However, if `id` is already a fully resolved url,
      // we cannot prepend the defaultUri -> https://github.com/salesforce/lwr/issues/378.
      // In this case we do not apply any package mappings and allow the caller (resolveImportMapEntry) to handle it.
      if (!isUrl(id)) {
        return defaultUri + encodeURIComponent(id);
      }
    }
  } // Resolves an entry in the import map


  function resolveImportMapEntry(importMap, resolvedOrPlain, parentUrl) {
    if (!importMap.scopes) {
      importMap.scopes = {};
    }

    if (!importMap.imports) {
      importMap.imports = {};
    }

    const scopes = importMap.scopes;
    let scopeUrl = parentUrl && getMatch(parentUrl, scopes);

    while (scopeUrl) {
      const packageResolution = applyPackages(resolvedOrPlain, scopes[scopeUrl]);

      if (packageResolution) {
        return packageResolution;
      }

      scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), scopes);
    }

    return applyPackages(resolvedOrPlain, importMap.imports, importMap.default) || isUrl(resolvedOrPlain) && resolvedOrPlain || undefined;
  } // In place transformation of the ImportMap object


  function resolveAndComposePackages(packages, outPackages, baseUrl, parentMap, parentUrl) {
    for (const p in packages) {
      const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
      const rhs = packages[p]; // package fallbacks not currently supported

      if (typeof rhs !== 'string') {
        continue;
      }

      const mapped = resolveImportMapEntry(parentMap, resolveIfNotPlainOrUrl(rhs, baseUrl) || rhs, parentUrl);

      if (!mapped) {
        targetWarning(p, rhs, 'bare specifier did not resolve');
      } else {
        outPackages[resolvedLhs] = mapped;
      }
    }
  } // Composes a single import map object given a child and parent import map


  function resolveAndComposeImportMap(json, baseUrl, parentMap = {
    imports: {},
    scopes: {}
  }) {
    const outMap = {
      imports: Object.assign({}, parentMap.imports),
      scopes: Object.assign({}, parentMap.scopes),
      default: json.default
    };

    if (json.imports) {
      resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap);
    }

    if (json.scopes) {
      for (const s in json.scopes) {
        const resolvedScope = resolveUrl(s, baseUrl);
        resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap, resolvedScope);
      }
    }

    if (json.default) {
      outMap.default = resolveIfNotPlainOrUrl(json.default, baseUrl);
    }

    return outMap;
  }
  /* spec based import map resolver */


  class ImportMapResolver {
    constructor(importMap) {
      this.importMap = importMap;
    }

    resolve(resolvedOrPlain, parentUrl) {
      return resolveImportMapEntry(this.importMap, resolvedOrPlain, parentUrl);
    }

  }
  /**
   * Import map support for LWR based on the spec: https://github.com/WICG/import-maps
   *
   * This implementation is adapted from https://github.com/systemjs/systemjs/blob/master/src/features/import-map.js
   */


  const IMPORTMAP_SCRIPT_TYPE = 'lwr-importmap'; // iterates on the any <script type="${IMPORTMAP_SCRIPT_TYPE}", invoking the given callback for each

  function iterateDocumentImportMaps(callBack, extraSelector) {
    // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
    const nodeList = document.querySelectorAll(`script[type="${IMPORTMAP_SCRIPT_TYPE}"]` + extraSelector);
    const filtered = Array.from(nodeList).filter(node => {
      if (node.src) {
        // eslint-disable-next-line lwr/no-unguarded-apis, no-undef
        if (hasConsole) console.warn('LWR does not support import maps from script src');
        return false;
      }

      return true;
    });
    Array.prototype.forEach.call(filtered, callBack);
  } // retrives the import map text from a <script type="${IMPORTMAP_SCRIPT_TYPE}"


  async function getImportMapFromScript(script) {
    return Promise.resolve(script.innerHTML);
  } // get importMap from <script type="lwr-importmap">


  async function evaluateImportMaps(baseUrl) {
    let importMap = {
      imports: {},
      scopes: {}
    };
    let importMapPromise = Promise.resolve(importMap);

    if (hasDocument) {
      if (!baseUrl) {
        baseUrl = getBaseUrl();
      }

      if (!baseUrl) {
        throw new LoaderError(NO_BASE_URL);
      }

      iterateDocumentImportMaps(script => {
        importMapPromise = importMapPromise.then(() => {
          return getImportMapFromScript(script);
        }).then(importMapTxt => {
          try {
            return JSON.parse(importMapTxt);
          } catch (e) {
            throw new LoaderError(BAD_IMPORT_MAP);
          }
        }).then(jsonImportMap => {
          importMap = resolveAndComposeImportMap(jsonImportMap, script.src || baseUrl, importMap);
          return importMap;
        });
      }, '');
    }

    return importMapPromise;
  }
  /**
   * The LWR loader is inspired and borrows from the algorithms and native browser principles of https://github.com/systemjs/systemjs
   */


  class Loader {
    constructor(baseUrl) {
      if (baseUrl) {
        // add a trailing slash, if it does not exist
        baseUrl = baseUrl.replace(/\/?$/, '/');
      }

      if (!baseUrl) {
        baseUrl = getBaseUrl();
      }

      if (!baseUrl) {
        throw new LoaderError(NO_BASE_URL);
      }

      this.baseUrl = baseUrl;
      this.registry = new ModuleRegistry(baseUrl);
      this.services = Object.freeze({
        addLoaderPlugin: this.registry.addLoaderPlugin.bind(this.registry),
        handleStaleModule: this.registry.registerHandleStaleModuleHook.bind(this.registry)
      });
    }
    /**
     * Defines/registers a single named AMD module definition.
     *
     * @param {string} name The module name
     * @param {string[]} dependencies A list of module dependencies (module imports)
     * @param {Function} execute The function containing the module code. AKA exporter as it also returns the modules exports when executed
     * @param {ModuleDefinitionSignatures} signatures Object containing the module signature and the signatures of its dependencies
     * @return {void}
     */


    define(name, dependencies, execute, signatures) {
      invariant(typeof name === 'string', MISSING_NAME);
      let ctor = execute;
      let deps = dependencies;
      let sigs = signatures; // Convert no dependencies form `define('name', function(){}, {});` to: `define('name', [], function(){}, {})`

      if (typeof deps === 'function') {
        ctor = dependencies;
        deps = [];
        sigs = execute;
      }

      sigs = sigs || {};
      invariant(Array.isArray(deps), INVALID_DEPS);
      this.registry.define(name, deps, ctor, sigs);
    }
    /**
     * Retrieves/loads a module, returning it from the registry if it exists and fetching it if it doesn't.
     *
     * @param {string} id - A module identifier or URL
     * @param {string} importer - The versioned specifier of the module importer
     *                            Used when the ID is not versioned (eg: variable dynamic imports)
     * @return {Promise<Module>}
     */


    async load(id, importer) {
      return this.registry.load(id, importer);
    }
    /**
     * Checks if a Module exists in the registry.  Note, returns false even if the ModuleDefinition exists but the Module has not been instantiated yet (executed).
     *
     * @param {string} id - A module identifier or URL
     * @return {boolean}
     */


    has(id) {
      return this.registry.has(id);
    }
    /**
     * Resolves the module identifier or URL.  Returns the module identifier if the moduleDefinition exists, or the full resolved URL if a URL is given.
     *
     * @param {string} id - A module identifier or URL
     * @param {string} importer - The versioned specifier of the module importer
     *                            Used when the ID is not versioned (eg: variable dynamic imports)
     * @return {string}
     */


    async resolve(id, importer) {
      return this.registry.resolve(id, importer);
    }

    async registerImportMappings(mappings) {
      let importMap;

      if (!mappings) {
        // If no mappings given, check for lwr-importmap on the document
        importMap = await evaluateImportMaps(this.baseUrl);
      } else {
        // merge the new mappings with the base import map - note this goes against
        // import maps spec if we do this after resolving any imports
        importMap = resolveAndComposeImportMap(mappings, this.baseUrl, this.parentImportMap);
      }

      this.parentImportMap = importMap;

      if (this.parentImportMap) {
        const importMapResolver = new ImportMapResolver(this.parentImportMap);
        this.registry.setImportResolver(importMapResolver);
      }
    }
    /**
     * Marks modules as "externally" loaded/provided (e.g. preloaded), so that the loader does not attempt to load them.
     *
     * @param modules - list of module identifiers
     */


    registerExternalModules(modules) {
      this.registry.registerExternalModules(modules);
    }

  }

  exports.Loader = Loader;

  Object.defineProperty(exports, '__esModule', { value: true });

});

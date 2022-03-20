var bundle = (function () {
  'use strict';

  var logo1 = "1a6ace377133f14a.png";

  /*!
    * vue-router v3.5.3
    * (c) 2021 Evan You
    * @license MIT
    */
  /*  */

  function assert (condition, message) {
    if (!condition) {
      throw new Error(("[vue-router] " + message))
    }
  }

  function warn (condition, message) {
    if (!condition) {
      typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
    }
  }

  function extend (a, b) {
    for (var key in b) {
      a[key] = b[key];
    }
    return a
  }

  /*  */

  var encodeReserveRE = /[!'()*]/g;
  var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
  var commaRE = /%2C/g;

  // fixed encodeURIComponent which is more conformant to RFC3986:
  // - escapes [!'()*]
  // - preserve commas
  var encode = function (str) { return encodeURIComponent(str)
      .replace(encodeReserveRE, encodeReserveReplacer)
      .replace(commaRE, ','); };

  function decode (str) {
    try {
      return decodeURIComponent(str)
    } catch (err) {
      {
        warn(false, ("Error decoding \"" + str + "\". Leaving it intact."));
      }
    }
    return str
  }

  function resolveQuery (
    query,
    extraQuery,
    _parseQuery
  ) {
    if ( extraQuery === void 0 ) extraQuery = {};

    var parse = _parseQuery || parseQuery;
    var parsedQuery;
    try {
      parsedQuery = parse(query || '');
    } catch (e) {
       warn(false, e.message);
      parsedQuery = {};
    }
    for (var key in extraQuery) {
      var value = extraQuery[key];
      parsedQuery[key] = Array.isArray(value)
        ? value.map(castQueryParamValue)
        : castQueryParamValue(value);
    }
    return parsedQuery
  }

  var castQueryParamValue = function (value) { return (value == null || typeof value === 'object' ? value : String(value)); };

  function parseQuery (query) {
    var res = {};

    query = query.trim().replace(/^(\?|#|&)/, '');

    if (!query) {
      return res
    }

    query.split('&').forEach(function (param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = decode(parts.shift());
      var val = parts.length > 0 ? decode(parts.join('=')) : null;

      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });

    return res
  }

  function stringifyQuery (obj) {
    var res = obj
      ? Object.keys(obj)
        .map(function (key) {
          var val = obj[key];

          if (val === undefined) {
            return ''
          }

          if (val === null) {
            return encode(key)
          }

          if (Array.isArray(val)) {
            var result = [];
            val.forEach(function (val2) {
              if (val2 === undefined) {
                return
              }
              if (val2 === null) {
                result.push(encode(key));
              } else {
                result.push(encode(key) + '=' + encode(val2));
              }
            });
            return result.join('&')
          }

          return encode(key) + '=' + encode(val)
        })
        .filter(function (x) { return x.length > 0; })
        .join('&')
      : null;
    return res ? ("?" + res) : ''
  }

  /*  */

  var trailingSlashRE = /\/?$/;

  function createRoute (
    record,
    location,
    redirectedFrom,
    router
  ) {
    var stringifyQuery = router && router.options.stringifyQuery;

    var query = location.query || {};
    try {
      query = clone(query);
    } catch (e) {}

    var route = {
      name: location.name || (record && record.name),
      meta: (record && record.meta) || {},
      path: location.path || '/',
      hash: location.hash || '',
      query: query,
      params: location.params || {},
      fullPath: getFullPath(location, stringifyQuery),
      matched: record ? formatMatch(record) : []
    };
    if (redirectedFrom) {
      route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery);
    }
    return Object.freeze(route)
  }

  function clone (value) {
    if (Array.isArray(value)) {
      return value.map(clone)
    } else if (value && typeof value === 'object') {
      var res = {};
      for (var key in value) {
        res[key] = clone(value[key]);
      }
      return res
    } else {
      return value
    }
  }

  // the starting route that represents the initial state
  var START = createRoute(null, {
    path: '/'
  });

  function formatMatch (record) {
    var res = [];
    while (record) {
      res.unshift(record);
      record = record.parent;
    }
    return res
  }

  function getFullPath (
    ref,
    _stringifyQuery
  ) {
    var path = ref.path;
    var query = ref.query; if ( query === void 0 ) query = {};
    var hash = ref.hash; if ( hash === void 0 ) hash = '';

    var stringify = _stringifyQuery || stringifyQuery;
    return (path || '/') + stringify(query) + hash
  }

  function isSameRoute (a, b, onlyPath) {
    if (b === START) {
      return a === b
    } else if (!b) {
      return false
    } else if (a.path && b.path) {
      return a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') && (onlyPath ||
        a.hash === b.hash &&
        isObjectEqual(a.query, b.query))
    } else if (a.name && b.name) {
      return (
        a.name === b.name &&
        (onlyPath || (
          a.hash === b.hash &&
        isObjectEqual(a.query, b.query) &&
        isObjectEqual(a.params, b.params))
        )
      )
    } else {
      return false
    }
  }

  function isObjectEqual (a, b) {
    if ( a === void 0 ) a = {};
    if ( b === void 0 ) b = {};

    // handle null value #1566
    if (!a || !b) { return a === b }
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) {
      return false
    }
    return aKeys.every(function (key, i) {
      var aVal = a[key];
      var bKey = bKeys[i];
      if (bKey !== key) { return false }
      var bVal = b[key];
      // query values can be null and undefined
      if (aVal == null || bVal == null) { return aVal === bVal }
      // check nested equality
      if (typeof aVal === 'object' && typeof bVal === 'object') {
        return isObjectEqual(aVal, bVal)
      }
      return String(aVal) === String(bVal)
    })
  }

  function isIncludedRoute (current, target) {
    return (
      current.path.replace(trailingSlashRE, '/').indexOf(
        target.path.replace(trailingSlashRE, '/')
      ) === 0 &&
      (!target.hash || current.hash === target.hash) &&
      queryIncludes(current.query, target.query)
    )
  }

  function queryIncludes (current, target) {
    for (var key in target) {
      if (!(key in current)) {
        return false
      }
    }
    return true
  }

  function handleRouteEntered (route) {
    for (var i = 0; i < route.matched.length; i++) {
      var record = route.matched[i];
      for (var name in record.instances) {
        var instance = record.instances[name];
        var cbs = record.enteredCbs[name];
        if (!instance || !cbs) { continue }
        delete record.enteredCbs[name];
        for (var i$1 = 0; i$1 < cbs.length; i$1++) {
          if (!instance._isBeingDestroyed) { cbs[i$1](instance); }
        }
      }
    }
  }

  var View = {
    name: 'RouterView',
    functional: true,
    props: {
      name: {
        type: String,
        default: 'default'
      }
    },
    render: function render (_, ref) {
      var props = ref.props;
      var children = ref.children;
      var parent = ref.parent;
      var data = ref.data;

      // used by devtools to display a router-view badge
      data.routerView = true;

      // directly use parent context's createElement() function
      // so that components rendered by router-view can resolve named slots
      var h = parent.$createElement;
      var name = props.name;
      var route = parent.$route;
      var cache = parent._routerViewCache || (parent._routerViewCache = {});

      // determine current view depth, also check to see if the tree
      // has been toggled inactive but kept-alive.
      var depth = 0;
      var inactive = false;
      while (parent && parent._routerRoot !== parent) {
        var vnodeData = parent.$vnode ? parent.$vnode.data : {};
        if (vnodeData.routerView) {
          depth++;
        }
        if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
          inactive = true;
        }
        parent = parent.$parent;
      }
      data.routerViewDepth = depth;

      // render previous view if the tree is inactive and kept-alive
      if (inactive) {
        var cachedData = cache[name];
        var cachedComponent = cachedData && cachedData.component;
        if (cachedComponent) {
          // #2301
          // pass props
          if (cachedData.configProps) {
            fillPropsinData(cachedComponent, data, cachedData.route, cachedData.configProps);
          }
          return h(cachedComponent, data, children)
        } else {
          // render previous empty view
          return h()
        }
      }

      var matched = route.matched[depth];
      var component = matched && matched.components[name];

      // render empty node if no matched route or no config component
      if (!matched || !component) {
        cache[name] = null;
        return h()
      }

      // cache component
      cache[name] = { component: component };

      // attach instance registration hook
      // this will be called in the instance's injected lifecycle hooks
      data.registerRouteInstance = function (vm, val) {
        // val could be undefined for unregistration
        var current = matched.instances[name];
        if (
          (val && current !== vm) ||
          (!val && current === vm)
        ) {
          matched.instances[name] = val;
        }
      }

      // also register instance in prepatch hook
      // in case the same component instance is reused across different routes
      ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
        matched.instances[name] = vnode.componentInstance;
      };

      // register instance in init hook
      // in case kept-alive component be actived when routes changed
      data.hook.init = function (vnode) {
        if (vnode.data.keepAlive &&
          vnode.componentInstance &&
          vnode.componentInstance !== matched.instances[name]
        ) {
          matched.instances[name] = vnode.componentInstance;
        }

        // if the route transition has already been confirmed then we weren't
        // able to call the cbs during confirmation as the component was not
        // registered yet, so we call it here.
        handleRouteEntered(route);
      };

      var configProps = matched.props && matched.props[name];
      // save route and configProps in cache
      if (configProps) {
        extend(cache[name], {
          route: route,
          configProps: configProps
        });
        fillPropsinData(component, data, route, configProps);
      }

      return h(component, data, children)
    }
  };

  function fillPropsinData (component, data, route, configProps) {
    // resolve props
    var propsToPass = data.props = resolveProps(route, configProps);
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend({}, propsToPass);
      // pass non-declared props as attrs
      var attrs = data.attrs = data.attrs || {};
      for (var key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key];
          delete propsToPass[key];
        }
      }
    }
  }

  function resolveProps (route, config) {
    switch (typeof config) {
      case 'undefined':
        return
      case 'object':
        return config
      case 'function':
        return config(route)
      case 'boolean':
        return config ? route.params : undefined
      default:
        {
          warn(
            false,
            "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
            "expecting an object, function or boolean."
          );
        }
    }
  }

  /*  */

  function resolvePath (
    relative,
    base,
    append
  ) {
    var firstChar = relative.charAt(0);
    if (firstChar === '/') {
      return relative
    }

    if (firstChar === '?' || firstChar === '#') {
      return base + relative
    }

    var stack = base.split('/');

    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }

    // resolve relative path
    var segments = relative.replace(/^\//, '').split('/');
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment === '..') {
        stack.pop();
      } else if (segment !== '.') {
        stack.push(segment);
      }
    }

    // ensure leading slash
    if (stack[0] !== '') {
      stack.unshift('');
    }

    return stack.join('/')
  }

  function parsePath (path) {
    var hash = '';
    var query = '';

    var hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      hash = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }

    var queryIndex = path.indexOf('?');
    if (queryIndex >= 0) {
      query = path.slice(queryIndex + 1);
      path = path.slice(0, queryIndex);
    }

    return {
      path: path,
      query: query,
      hash: hash
    }
  }

  function cleanPath (path) {
    return path.replace(/\/+/g, '/')
  }

  var isarray = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };

  /**
   * Expose `pathToRegexp`.
   */
  var pathToRegexp_1 = pathToRegexp;
  var parse_1 = parse;
  var compile_1 = compile;
  var tokensToFunction_1 = tokensToFunction;
  var tokensToRegExp_1 = tokensToRegExp;

  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  var PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
  ].join('|'), 'g');

  /**
   * Parse a string for the raw tokens.
   *
   * @param  {string}  str
   * @param  {Object=} options
   * @return {!Array}
   */
  function parse (str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = options && options.delimiter || '/';
    var res;

    while ((res = PATH_REGEXP.exec(str)) != null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;

      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        continue
      }

      var next = str[index];
      var prefix = res[2];
      var name = res[3];
      var capture = res[4];
      var group = res[5];
      var modifier = res[6];
      var asterisk = res[7];

      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
      }

      var partial = prefix != null && next != null && next !== prefix;
      var repeat = modifier === '+' || modifier === '*';
      var optional = modifier === '?' || modifier === '*';
      var delimiter = res[2] || defaultDelimiter;
      var pattern = capture || group;

      tokens.push({
        name: name || key++,
        prefix: prefix || '',
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        partial: partial,
        asterisk: !!asterisk,
        pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
      });
    }

    // Match any characters still remaining.
    if (index < str.length) {
      path += str.substr(index);
    }

    // If the path exists, push it onto the end.
    if (path) {
      tokens.push(path);
    }

    return tokens
  }

  /**
   * Compile a string to a template function for the path.
   *
   * @param  {string}             str
   * @param  {Object=}            options
   * @return {!function(Object=, Object=)}
   */
  function compile (str, options) {
    return tokensToFunction(parse(str, options), options)
  }

  /**
   * Prettier encoding of URI path segments.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeURIComponentPretty (str) {
    return encodeURI(str).replace(/[\/?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeAsterisk (str) {
    return encodeURI(str).replace(/[?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction (tokens, options) {
    // Compile all the tokens into regexps.
    var matches = new Array(tokens.length);

    // Compile all the patterns before compilation.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options));
      }
    }

    return function (obj, opts) {
      var path = '';
      var data = obj || {};
      var options = opts || {};
      var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          path += token;

          continue
        }

        var value = data[token.name];
        var segment;

        if (value == null) {
          if (token.optional) {
            // Prepend partial segment prefixes.
            if (token.partial) {
              path += token.prefix;
            }

            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to be defined')
          }
        }

        if (isarray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
          }

          if (value.length === 0) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }
          }

          for (var j = 0; j < value.length; j++) {
            segment = encode(value[j]);

            if (!matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
            }

            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }

          continue
        }

        segment = token.asterisk ? encodeAsterisk(value) : encode(value);

        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
        }

        path += token.prefix + segment;
      }

      return path
    }
  }

  /**
   * Escape a regular expression string.
   *
   * @param  {string} str
   * @return {string}
   */
  function escapeString (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
  }

  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {string} group
   * @return {string}
   */
  function escapeGroup (group) {
    return group.replace(/([=!:$\/()])/g, '\\$1')
  }

  /**
   * Attach the keys as a property of the regexp.
   *
   * @param  {!RegExp} re
   * @param  {Array}   keys
   * @return {!RegExp}
   */
  function attachKeys (re, keys) {
    re.keys = keys;
    return re
  }

  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {string}
   */
  function flags (options) {
    return options && options.sensitive ? '' : 'i'
  }

  /**
   * Pull out keys from a regexp.
   *
   * @param  {!RegExp} path
   * @param  {!Array}  keys
   * @return {!RegExp}
   */
  function regexpToRegexp (path, keys) {
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          partial: false,
          asterisk: false,
          pattern: null
        });
      }
    }

    return attachKeys(path, keys)
  }

  /**
   * Transform an array into a regexp.
   *
   * @param  {!Array}  path
   * @param  {Array}   keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function arrayToRegexp (path, keys, options) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }

    var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

    return attachKeys(regexp, keys)
  }

  /**
   * Create a path regexp from string input.
   *
   * @param  {string}  path
   * @param  {!Array}  keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function stringToRegexp (path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options)
  }

  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {!Array}          tokens
   * @param  {(Array|Object)=} keys
   * @param  {Object=}         options
   * @return {!RegExp}
   */
  function tokensToRegExp (tokens, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    var strict = options.strict;
    var end = options.end !== false;
    var route = '';

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        route += escapeString(token);
      } else {
        var prefix = escapeString(token.prefix);
        var capture = '(?:' + token.pattern + ')';

        keys.push(token);

        if (token.repeat) {
          capture += '(?:' + prefix + capture + ')*';
        }

        if (token.optional) {
          if (!token.partial) {
            capture = '(?:' + prefix + '(' + capture + '))?';
          } else {
            capture = prefix + '(' + capture + ')?';
          }
        } else {
          capture = prefix + '(' + capture + ')';
        }

        route += capture;
      }
    }

    var delimiter = escapeString(options.delimiter || '/');
    var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

    // In non-strict mode we allow a slash at the end of match. If the path to
    // match already ends with a slash, we remove it for consistency. The slash
    // is valid at the end of a path match, not in the middle. This is important
    // in non-ending mode, where "/test/" shouldn't match "/test//route".
    if (!strict) {
      route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
    }

    if (end) {
      route += '$';
    } else {
      // In non-ending mode, we need the capturing groups to match as much as
      // possible by using a positive lookahead to the end or next path segment.
      route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
    }

    return attachKeys(new RegExp('^' + route, flags(options)), keys)
  }

  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(string|RegExp|Array)} path
   * @param  {(Array|Object)=}       keys
   * @param  {Object=}               options
   * @return {!RegExp}
   */
  function pathToRegexp (path, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    if (path instanceof RegExp) {
      return regexpToRegexp(path, /** @type {!Array} */ (keys))
    }

    if (isarray(path)) {
      return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
    }

    return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
  }
  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

  /*  */

  // $flow-disable-line
  var regexpCompileCache = Object.create(null);

  function fillParams (
    path,
    params,
    routeMsg
  ) {
    params = params || {};
    try {
      var filler =
        regexpCompileCache[path] ||
        (regexpCompileCache[path] = pathToRegexp_1.compile(path));

      // Fix #2505 resolving asterisk routes { name: 'not-found', params: { pathMatch: '/not-found' }}
      // and fix #3106 so that you can work with location descriptor object having params.pathMatch equal to empty string
      if (typeof params.pathMatch === 'string') { params[0] = params.pathMatch; }

      return filler(params, { pretty: true })
    } catch (e) {
      {
        // Fix #3072 no warn if `pathMatch` is string
        warn(typeof params.pathMatch === 'string', ("missing param for " + routeMsg + ": " + (e.message)));
      }
      return ''
    } finally {
      // delete the 0 if it was added
      delete params[0];
    }
  }

  /*  */

  function normalizeLocation (
    raw,
    current,
    append,
    router
  ) {
    var next = typeof raw === 'string' ? { path: raw } : raw;
    // named target
    if (next._normalized) {
      return next
    } else if (next.name) {
      next = extend({}, raw);
      var params = next.params;
      if (params && typeof params === 'object') {
        next.params = extend({}, params);
      }
      return next
    }

    // relative params
    if (!next.path && next.params && current) {
      next = extend({}, next);
      next._normalized = true;
      var params$1 = extend(extend({}, current.params), next.params);
      if (current.name) {
        next.name = current.name;
        next.params = params$1;
      } else if (current.matched.length) {
        var rawPath = current.matched[current.matched.length - 1].path;
        next.path = fillParams(rawPath, params$1, ("path " + (current.path)));
      } else {
        warn(false, "relative params navigation requires a current route.");
      }
      return next
    }

    var parsedPath = parsePath(next.path || '');
    var basePath = (current && current.path) || '/';
    var path = parsedPath.path
      ? resolvePath(parsedPath.path, basePath, append || next.append)
      : basePath;

    var query = resolveQuery(
      parsedPath.query,
      next.query,
      router && router.options.parseQuery
    );

    var hash = next.hash || parsedPath.hash;
    if (hash && hash.charAt(0) !== '#') {
      hash = "#" + hash;
    }

    return {
      _normalized: true,
      path: path,
      query: query,
      hash: hash
    }
  }

  /*  */

  // work around weird flow bug
  var toTypes = [String, Object];
  var eventTypes = [String, Array];

  var noop = function () {};

  var warnedCustomSlot;
  var warnedTagProp;
  var warnedEventProp;

  var Link = {
    name: 'RouterLink',
    props: {
      to: {
        type: toTypes,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      },
      custom: Boolean,
      exact: Boolean,
      exactPath: Boolean,
      append: Boolean,
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      ariaCurrentValue: {
        type: String,
        default: 'page'
      },
      event: {
        type: eventTypes,
        default: 'click'
      }
    },
    render: function render (h) {
      var this$1 = this;

      var router = this.$router;
      var current = this.$route;
      var ref = router.resolve(
        this.to,
        current,
        this.append
      );
      var location = ref.location;
      var route = ref.route;
      var href = ref.href;

      var classes = {};
      var globalActiveClass = router.options.linkActiveClass;
      var globalExactActiveClass = router.options.linkExactActiveClass;
      // Support global empty active class
      var activeClassFallback =
        globalActiveClass == null ? 'router-link-active' : globalActiveClass;
      var exactActiveClassFallback =
        globalExactActiveClass == null
          ? 'router-link-exact-active'
          : globalExactActiveClass;
      var activeClass =
        this.activeClass == null ? activeClassFallback : this.activeClass;
      var exactActiveClass =
        this.exactActiveClass == null
          ? exactActiveClassFallback
          : this.exactActiveClass;

      var compareTarget = route.redirectedFrom
        ? createRoute(null, normalizeLocation(route.redirectedFrom), null, router)
        : route;

      classes[exactActiveClass] = isSameRoute(current, compareTarget, this.exactPath);
      classes[activeClass] = this.exact || this.exactPath
        ? classes[exactActiveClass]
        : isIncludedRoute(current, compareTarget);

      var ariaCurrentValue = classes[exactActiveClass] ? this.ariaCurrentValue : null;

      var handler = function (e) {
        if (guardEvent(e)) {
          if (this$1.replace) {
            router.replace(location, noop);
          } else {
            router.push(location, noop);
          }
        }
      };

      var on = { click: guardEvent };
      if (Array.isArray(this.event)) {
        this.event.forEach(function (e) {
          on[e] = handler;
        });
      } else {
        on[this.event] = handler;
      }

      var data = { class: classes };

      var scopedSlot =
        !this.$scopedSlots.$hasNormal &&
        this.$scopedSlots.default &&
        this.$scopedSlots.default({
          href: href,
          route: route,
          navigate: handler,
          isActive: classes[activeClass],
          isExactActive: classes[exactActiveClass]
        });

      if (scopedSlot) {
        if ( !this.custom) {
          !warnedCustomSlot && warn(false, 'In Vue Router 4, the v-slot API will by default wrap its content with an <a> element. Use the custom prop to remove this warning:\n<router-link v-slot="{ navigate, href }" custom></router-link>\n');
          warnedCustomSlot = true;
        }
        if (scopedSlot.length === 1) {
          return scopedSlot[0]
        } else if (scopedSlot.length > 1 || !scopedSlot.length) {
          {
            warn(
              false,
              ("<router-link> with to=\"" + (this.to) + "\" is trying to use a scoped slot but it didn't provide exactly one child. Wrapping the content with a span element.")
            );
          }
          return scopedSlot.length === 0 ? h() : h('span', {}, scopedSlot)
        }
      }

      {
        if ('tag' in this.$options.propsData && !warnedTagProp) {
          warn(
            false,
            "<router-link>'s tag prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedTagProp = true;
        }
        if ('event' in this.$options.propsData && !warnedEventProp) {
          warn(
            false,
            "<router-link>'s event prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedEventProp = true;
        }
      }

      if (this.tag === 'a') {
        data.on = on;
        data.attrs = { href: href, 'aria-current': ariaCurrentValue };
      } else {
        // find the first <a> child and apply listener and href
        var a = findAnchor(this.$slots.default);
        if (a) {
          // in case the <a> is a static node
          a.isStatic = false;
          var aData = (a.data = extend({}, a.data));
          aData.on = aData.on || {};
          // transform existing events in both objects into arrays so we can push later
          for (var event in aData.on) {
            var handler$1 = aData.on[event];
            if (event in on) {
              aData.on[event] = Array.isArray(handler$1) ? handler$1 : [handler$1];
            }
          }
          // append new listeners for router-link
          for (var event$1 in on) {
            if (event$1 in aData.on) {
              // on[event] is always a function
              aData.on[event$1].push(on[event$1]);
            } else {
              aData.on[event$1] = handler;
            }
          }

          var aAttrs = (a.data.attrs = extend({}, a.data.attrs));
          aAttrs.href = href;
          aAttrs['aria-current'] = ariaCurrentValue;
        } else {
          // doesn't have <a> child, apply listener to self
          data.on = on;
        }
      }

      return h(this.tag, data, this.$slots.default)
    }
  };

  function guardEvent (e) {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
    // don't redirect when preventDefault called
    if (e.defaultPrevented) { return }
    // don't redirect on right click
    if (e.button !== undefined && e.button !== 0) { return }
    // don't redirect if `target="_blank"`
    if (e.currentTarget && e.currentTarget.getAttribute) {
      var target = e.currentTarget.getAttribute('target');
      if (/\b_blank\b/i.test(target)) { return }
    }
    // this may be a Weex event which doesn't have this method
    if (e.preventDefault) {
      e.preventDefault();
    }
    return true
  }

  function findAnchor (children) {
    if (children) {
      var child;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (child.tag === 'a') {
          return child
        }
        if (child.children && (child = findAnchor(child.children))) {
          return child
        }
      }
    }
  }

  var _Vue;

  function install (Vue) {
    if (install.installed && _Vue === Vue) { return }
    install.installed = true;

    _Vue = Vue;

    var isDef = function (v) { return v !== undefined; };

    var registerInstance = function (vm, callVal) {
      var i = vm.$options._parentVnode;
      if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
        i(vm, callVal);
      }
    };

    Vue.mixin({
      beforeCreate: function beforeCreate () {
        if (isDef(this.$options.router)) {
          this._routerRoot = this;
          this._router = this.$options.router;
          this._router.init(this);
          Vue.util.defineReactive(this, '_route', this._router.history.current);
        } else {
          this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
        }
        registerInstance(this, this);
      },
      destroyed: function destroyed () {
        registerInstance(this);
      }
    });

    Object.defineProperty(Vue.prototype, '$router', {
      get: function get () { return this._routerRoot._router }
    });

    Object.defineProperty(Vue.prototype, '$route', {
      get: function get () { return this._routerRoot._route }
    });

    Vue.component('RouterView', View);
    Vue.component('RouterLink', Link);

    var strats = Vue.config.optionMergeStrategies;
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
  }

  /*  */

  var inBrowser = typeof window !== 'undefined';

  /*  */

  function createRouteMap (
    routes,
    oldPathList,
    oldPathMap,
    oldNameMap,
    parentRoute
  ) {
    // the path list is used to control path matching priority
    var pathList = oldPathList || [];
    // $flow-disable-line
    var pathMap = oldPathMap || Object.create(null);
    // $flow-disable-line
    var nameMap = oldNameMap || Object.create(null);

    routes.forEach(function (route) {
      addRouteRecord(pathList, pathMap, nameMap, route, parentRoute);
    });

    // ensure wildcard routes are always at the end
    for (var i = 0, l = pathList.length; i < l; i++) {
      if (pathList[i] === '*') {
        pathList.push(pathList.splice(i, 1)[0]);
        l--;
        i--;
      }
    }

    {
      // warn if routes do not include leading slashes
      var found = pathList
      // check for missing leading slash
        .filter(function (path) { return path && path.charAt(0) !== '*' && path.charAt(0) !== '/'; });

      if (found.length > 0) {
        var pathNames = found.map(function (path) { return ("- " + path); }).join('\n');
        warn(false, ("Non-nested routes must include a leading slash character. Fix the following routes: \n" + pathNames));
      }
    }

    return {
      pathList: pathList,
      pathMap: pathMap,
      nameMap: nameMap
    }
  }

  function addRouteRecord (
    pathList,
    pathMap,
    nameMap,
    route,
    parent,
    matchAs
  ) {
    var path = route.path;
    var name = route.name;
    {
      assert(path != null, "\"path\" is required in a route configuration.");
      assert(
        typeof route.component !== 'string',
        "route config \"component\" for path: " + (String(
          path || name
        )) + " cannot be a " + "string id. Use an actual component instead."
      );

      warn(
        // eslint-disable-next-line no-control-regex
        !/[^\u0000-\u007F]+/.test(path),
        "Route with path \"" + path + "\" contains unencoded characters, make sure " +
          "your path is correctly encoded before passing it to the router. Use " +
          "encodeURI to encode static segments of your path."
      );
    }

    var pathToRegexpOptions =
      route.pathToRegexpOptions || {};
    var normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict);

    if (typeof route.caseSensitive === 'boolean') {
      pathToRegexpOptions.sensitive = route.caseSensitive;
    }

    var record = {
      path: normalizedPath,
      regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
      components: route.components || { default: route.component },
      alias: route.alias
        ? typeof route.alias === 'string'
          ? [route.alias]
          : route.alias
        : [],
      instances: {},
      enteredCbs: {},
      name: name,
      parent: parent,
      matchAs: matchAs,
      redirect: route.redirect,
      beforeEnter: route.beforeEnter,
      meta: route.meta || {},
      props:
        route.props == null
          ? {}
          : route.components
            ? route.props
            : { default: route.props }
    };

    if (route.children) {
      // Warn if route is named, does not redirect and has a default child route.
      // If users navigate to this route by name, the default child will
      // not be rendered (GH Issue #629)
      {
        if (
          route.name &&
          !route.redirect &&
          route.children.some(function (child) { return /^\/?$/.test(child.path); })
        ) {
          warn(
            false,
            "Named Route '" + (route.name) + "' has a default child route. " +
              "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
              "the default child route will not be rendered. Remove the name from " +
              "this route and use the name of the default child route for named " +
              "links instead."
          );
        }
      }
      route.children.forEach(function (child) {
        var childMatchAs = matchAs
          ? cleanPath((matchAs + "/" + (child.path)))
          : undefined;
        addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
      });
    }

    if (!pathMap[record.path]) {
      pathList.push(record.path);
      pathMap[record.path] = record;
    }

    if (route.alias !== undefined) {
      var aliases = Array.isArray(route.alias) ? route.alias : [route.alias];
      for (var i = 0; i < aliases.length; ++i) {
        var alias = aliases[i];
        if ( alias === path) {
          warn(
            false,
            ("Found an alias with the same value as the path: \"" + path + "\". You have to remove that alias. It will be ignored in development.")
          );
          // skip in dev to make it work
          continue
        }

        var aliasRoute = {
          path: alias,
          children: route.children
        };
        addRouteRecord(
          pathList,
          pathMap,
          nameMap,
          aliasRoute,
          parent,
          record.path || '/' // matchAs
        );
      }
    }

    if (name) {
      if (!nameMap[name]) {
        nameMap[name] = record;
      } else if ( !matchAs) {
        warn(
          false,
          "Duplicate named routes definition: " +
            "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
        );
      }
    }
  }

  function compileRouteRegex (
    path,
    pathToRegexpOptions
  ) {
    var regex = pathToRegexp_1(path, [], pathToRegexpOptions);
    {
      var keys = Object.create(null);
      regex.keys.forEach(function (key) {
        warn(
          !keys[key.name],
          ("Duplicate param keys in route with path: \"" + path + "\"")
        );
        keys[key.name] = true;
      });
    }
    return regex
  }

  function normalizePath (
    path,
    parent,
    strict
  ) {
    if (!strict) { path = path.replace(/\/$/, ''); }
    if (path[0] === '/') { return path }
    if (parent == null) { return path }
    return cleanPath(((parent.path) + "/" + path))
  }

  /*  */



  function createMatcher (
    routes,
    router
  ) {
    var ref = createRouteMap(routes);
    var pathList = ref.pathList;
    var pathMap = ref.pathMap;
    var nameMap = ref.nameMap;

    function addRoutes (routes) {
      createRouteMap(routes, pathList, pathMap, nameMap);
    }

    function addRoute (parentOrRoute, route) {
      var parent = (typeof parentOrRoute !== 'object') ? nameMap[parentOrRoute] : undefined;
      // $flow-disable-line
      createRouteMap([route || parentOrRoute], pathList, pathMap, nameMap, parent);

      // add aliases of parent
      if (parent && parent.alias.length) {
        createRouteMap(
          // $flow-disable-line route is defined if parent is
          parent.alias.map(function (alias) { return ({ path: alias, children: [route] }); }),
          pathList,
          pathMap,
          nameMap,
          parent
        );
      }
    }

    function getRoutes () {
      return pathList.map(function (path) { return pathMap[path]; })
    }

    function match (
      raw,
      currentRoute,
      redirectedFrom
    ) {
      var location = normalizeLocation(raw, currentRoute, false, router);
      var name = location.name;

      if (name) {
        var record = nameMap[name];
        {
          warn(record, ("Route with name '" + name + "' does not exist"));
        }
        if (!record) { return _createRoute(null, location) }
        var paramNames = record.regex.keys
          .filter(function (key) { return !key.optional; })
          .map(function (key) { return key.name; });

        if (typeof location.params !== 'object') {
          location.params = {};
        }

        if (currentRoute && typeof currentRoute.params === 'object') {
          for (var key in currentRoute.params) {
            if (!(key in location.params) && paramNames.indexOf(key) > -1) {
              location.params[key] = currentRoute.params[key];
            }
          }
        }

        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
        return _createRoute(record, location, redirectedFrom)
      } else if (location.path) {
        location.params = {};
        for (var i = 0; i < pathList.length; i++) {
          var path = pathList[i];
          var record$1 = pathMap[path];
          if (matchRoute(record$1.regex, location.path, location.params)) {
            return _createRoute(record$1, location, redirectedFrom)
          }
        }
      }
      // no match
      return _createRoute(null, location)
    }

    function redirect (
      record,
      location
    ) {
      var originalRedirect = record.redirect;
      var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute(record, location, null, router))
        : originalRedirect;

      if (typeof redirect === 'string') {
        redirect = { path: redirect };
      }

      if (!redirect || typeof redirect !== 'object') {
        {
          warn(
            false, ("invalid redirect option: " + (JSON.stringify(redirect)))
          );
        }
        return _createRoute(null, location)
      }

      var re = redirect;
      var name = re.name;
      var path = re.path;
      var query = location.query;
      var hash = location.hash;
      var params = location.params;
      query = re.hasOwnProperty('query') ? re.query : query;
      hash = re.hasOwnProperty('hash') ? re.hash : hash;
      params = re.hasOwnProperty('params') ? re.params : params;

      if (name) {
        // resolved named direct
        var targetRecord = nameMap[name];
        {
          assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
        }
        return match({
          _normalized: true,
          name: name,
          query: query,
          hash: hash,
          params: params
        }, undefined, location)
      } else if (path) {
        // 1. resolve relative redirect
        var rawPath = resolveRecordPath(path, record);
        // 2. resolve params
        var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
        // 3. rematch with existing query and hash
        return match({
          _normalized: true,
          path: resolvedPath,
          query: query,
          hash: hash
        }, undefined, location)
      } else {
        {
          warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
        }
        return _createRoute(null, location)
      }
    }

    function alias (
      record,
      location,
      matchAs
    ) {
      var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
      var aliasedMatch = match({
        _normalized: true,
        path: aliasedPath
      });
      if (aliasedMatch) {
        var matched = aliasedMatch.matched;
        var aliasedRecord = matched[matched.length - 1];
        location.params = aliasedMatch.params;
        return _createRoute(aliasedRecord, location)
      }
      return _createRoute(null, location)
    }

    function _createRoute (
      record,
      location,
      redirectedFrom
    ) {
      if (record && record.redirect) {
        return redirect(record, redirectedFrom || location)
      }
      if (record && record.matchAs) {
        return alias(record, location, record.matchAs)
      }
      return createRoute(record, location, redirectedFrom, router)
    }

    return {
      match: match,
      addRoute: addRoute,
      getRoutes: getRoutes,
      addRoutes: addRoutes
    }
  }

  function matchRoute (
    regex,
    path,
    params
  ) {
    var m = path.match(regex);

    if (!m) {
      return false
    } else if (!params) {
      return true
    }

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = regex.keys[i - 1];
      if (key) {
        // Fix #1994: using * with props: true generates a param named 0
        params[key.name || 'pathMatch'] = typeof m[i] === 'string' ? decode(m[i]) : m[i];
      }
    }

    return true
  }

  function resolveRecordPath (path, record) {
    return resolvePath(path, record.parent ? record.parent.path : '/', true)
  }

  /*  */

  // use User Timing api (if present) for more accurate key precision
  var Time =
    inBrowser && window.performance && window.performance.now
      ? window.performance
      : Date;

  function genStateKey () {
    return Time.now().toFixed(3)
  }

  var _key = genStateKey();

  function getStateKey () {
    return _key
  }

  function setStateKey (key) {
    return (_key = key)
  }

  /*  */

  var positionStore = Object.create(null);

  function setupScroll () {
    // Prevent browser scroll behavior on History popstate
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Fix for #1585 for Firefox
    // Fix for #2195 Add optional third attribute to workaround a bug in safari https://bugs.webkit.org/show_bug.cgi?id=182678
    // Fix for #2774 Support for apps loaded from Windows file shares not mapped to network drives: replaced location.origin with
    // window.location.protocol + '//' + window.location.host
    // location.host contains the port and location.hostname doesn't
    var protocolAndPath = window.location.protocol + '//' + window.location.host;
    var absolutePath = window.location.href.replace(protocolAndPath, '');
    // preserve existing history state as it could be overriden by the user
    var stateCopy = extend({}, window.history.state);
    stateCopy.key = getStateKey();
    window.history.replaceState(stateCopy, '', absolutePath);
    window.addEventListener('popstate', handlePopState);
    return function () {
      window.removeEventListener('popstate', handlePopState);
    }
  }

  function handleScroll (
    router,
    to,
    from,
    isPop
  ) {
    if (!router.app) {
      return
    }

    var behavior = router.options.scrollBehavior;
    if (!behavior) {
      return
    }

    {
      assert(typeof behavior === 'function', "scrollBehavior must be a function");
    }

    // wait until re-render finishes before scrolling
    router.app.$nextTick(function () {
      var position = getScrollPosition();
      var shouldScroll = behavior.call(
        router,
        to,
        from,
        isPop ? position : null
      );

      if (!shouldScroll) {
        return
      }

      if (typeof shouldScroll.then === 'function') {
        shouldScroll
          .then(function (shouldScroll) {
            scrollToPosition((shouldScroll), position);
          })
          .catch(function (err) {
            {
              assert(false, err.toString());
            }
          });
      } else {
        scrollToPosition(shouldScroll, position);
      }
    });
  }

  function saveScrollPosition () {
    var key = getStateKey();
    if (key) {
      positionStore[key] = {
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
  }

  function handlePopState (e) {
    saveScrollPosition();
    if (e.state && e.state.key) {
      setStateKey(e.state.key);
    }
  }

  function getScrollPosition () {
    var key = getStateKey();
    if (key) {
      return positionStore[key]
    }
  }

  function getElementPosition (el, offset) {
    var docEl = document.documentElement;
    var docRect = docEl.getBoundingClientRect();
    var elRect = el.getBoundingClientRect();
    return {
      x: elRect.left - docRect.left - offset.x,
      y: elRect.top - docRect.top - offset.y
    }
  }

  function isValidPosition (obj) {
    return isNumber(obj.x) || isNumber(obj.y)
  }

  function normalizePosition (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : window.pageXOffset,
      y: isNumber(obj.y) ? obj.y : window.pageYOffset
    }
  }

  function normalizeOffset (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : 0,
      y: isNumber(obj.y) ? obj.y : 0
    }
  }

  function isNumber (v) {
    return typeof v === 'number'
  }

  var hashStartsWithNumberRE = /^#\d/;

  function scrollToPosition (shouldScroll, position) {
    var isObject = typeof shouldScroll === 'object';
    if (isObject && typeof shouldScroll.selector === 'string') {
      // getElementById would still fail if the selector contains a more complicated query like #main[data-attr]
      // but at the same time, it doesn't make much sense to select an element with an id and an extra selector
      var el = hashStartsWithNumberRE.test(shouldScroll.selector) // $flow-disable-line
        ? document.getElementById(shouldScroll.selector.slice(1)) // $flow-disable-line
        : document.querySelector(shouldScroll.selector);

      if (el) {
        var offset =
          shouldScroll.offset && typeof shouldScroll.offset === 'object'
            ? shouldScroll.offset
            : {};
        offset = normalizeOffset(offset);
        position = getElementPosition(el, offset);
      } else if (isValidPosition(shouldScroll)) {
        position = normalizePosition(shouldScroll);
      }
    } else if (isObject && isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }

    if (position) {
      // $flow-disable-line
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          left: position.x,
          top: position.y,
          // $flow-disable-line
          behavior: shouldScroll.behavior
        });
      } else {
        window.scrollTo(position.x, position.y);
      }
    }
  }

  /*  */

  var supportsPushState =
    inBrowser &&
    (function () {
      var ua = window.navigator.userAgent;

      if (
        (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1
      ) {
        return false
      }

      return window.history && typeof window.history.pushState === 'function'
    })();

  function pushState (url, replace) {
    saveScrollPosition();
    // try...catch the pushState call to get around Safari
    // DOM Exception 18 where it limits to 100 pushState calls
    var history = window.history;
    try {
      if (replace) {
        // preserve existing history state as it could be overriden by the user
        var stateCopy = extend({}, history.state);
        stateCopy.key = getStateKey();
        history.replaceState(stateCopy, '', url);
      } else {
        history.pushState({ key: setStateKey(genStateKey()) }, '', url);
      }
    } catch (e) {
      window.location[replace ? 'replace' : 'assign'](url);
    }
  }

  function replaceState (url) {
    pushState(url, true);
  }

  /*  */

  function runQueue (queue, fn, cb) {
    var step = function (index) {
      if (index >= queue.length) {
        cb();
      } else {
        if (queue[index]) {
          fn(queue[index], function () {
            step(index + 1);
          });
        } else {
          step(index + 1);
        }
      }
    };
    step(0);
  }

  // When changing thing, also edit router.d.ts
  var NavigationFailureType = {
    redirected: 2,
    aborted: 4,
    cancelled: 8,
    duplicated: 16
  };

  function createNavigationRedirectedError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.redirected,
      ("Redirected when going from \"" + (from.fullPath) + "\" to \"" + (stringifyRoute(
        to
      )) + "\" via a navigation guard.")
    )
  }

  function createNavigationDuplicatedError (from, to) {
    var error = createRouterError(
      from,
      to,
      NavigationFailureType.duplicated,
      ("Avoided redundant navigation to current location: \"" + (from.fullPath) + "\".")
    );
    // backwards compatible with the first introduction of Errors
    error.name = 'NavigationDuplicated';
    return error
  }

  function createNavigationCancelledError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.cancelled,
      ("Navigation cancelled from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" with a new navigation.")
    )
  }

  function createNavigationAbortedError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.aborted,
      ("Navigation aborted from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" via a navigation guard.")
    )
  }

  function createRouterError (from, to, type, message) {
    var error = new Error(message);
    error._isRouter = true;
    error.from = from;
    error.to = to;
    error.type = type;

    return error
  }

  var propertiesToLog = ['params', 'query', 'hash'];

  function stringifyRoute (to) {
    if (typeof to === 'string') { return to }
    if ('path' in to) { return to.path }
    var location = {};
    propertiesToLog.forEach(function (key) {
      if (key in to) { location[key] = to[key]; }
    });
    return JSON.stringify(location, null, 2)
  }

  function isError (err) {
    return Object.prototype.toString.call(err).indexOf('Error') > -1
  }

  function isNavigationFailure (err, errorType) {
    return (
      isError(err) &&
      err._isRouter &&
      (errorType == null || err.type === errorType)
    )
  }

  /*  */

  function resolveAsyncComponents (matched) {
    return function (to, from, next) {
      var hasAsync = false;
      var pending = 0;
      var error = null;

      flatMapComponents(matched, function (def, _, match, key) {
        // if it's a function and doesn't have cid attached,
        // assume it's an async component resolve function.
        // we are not using Vue's default async resolving mechanism because
        // we want to halt the navigation until the incoming component has been
        // resolved.
        if (typeof def === 'function' && def.cid === undefined) {
          hasAsync = true;
          pending++;

          var resolve = once(function (resolvedDef) {
            if (isESModule(resolvedDef)) {
              resolvedDef = resolvedDef.default;
            }
            // save resolved on async factory in case it's used elsewhere
            def.resolved = typeof resolvedDef === 'function'
              ? resolvedDef
              : _Vue.extend(resolvedDef);
            match.components[key] = resolvedDef;
            pending--;
            if (pending <= 0) {
              next();
            }
          });

          var reject = once(function (reason) {
            var msg = "Failed to resolve async component " + key + ": " + reason;
             warn(false, msg);
            if (!error) {
              error = isError(reason)
                ? reason
                : new Error(msg);
              next(error);
            }
          });

          var res;
          try {
            res = def(resolve, reject);
          } catch (e) {
            reject(e);
          }
          if (res) {
            if (typeof res.then === 'function') {
              res.then(resolve, reject);
            } else {
              // new syntax in Vue 2.3
              var comp = res.component;
              if (comp && typeof comp.then === 'function') {
                comp.then(resolve, reject);
              }
            }
          }
        }
      });

      if (!hasAsync) { next(); }
    }
  }

  function flatMapComponents (
    matched,
    fn
  ) {
    return flatten(matched.map(function (m) {
      return Object.keys(m.components).map(function (key) { return fn(
        m.components[key],
        m.instances[key],
        m, key
      ); })
    }))
  }

  function flatten (arr) {
    return Array.prototype.concat.apply([], arr)
  }

  var hasSymbol =
    typeof Symbol === 'function' &&
    typeof Symbol.toStringTag === 'symbol';

  function isESModule (obj) {
    return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
  }

  // in Webpack 2, require.ensure now also returns a Promise
  // so the resolve/reject functions may get called an extra time
  // if the user uses an arrow function shorthand that happens to
  // return that Promise.
  function once (fn) {
    var called = false;
    return function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (called) { return }
      called = true;
      return fn.apply(this, args)
    }
  }

  /*  */

  var History = function History (router, base) {
    this.router = router;
    this.base = normalizeBase(base);
    // start with a route object that stands for "nowhere"
    this.current = START;
    this.pending = null;
    this.ready = false;
    this.readyCbs = [];
    this.readyErrorCbs = [];
    this.errorCbs = [];
    this.listeners = [];
  };

  History.prototype.listen = function listen (cb) {
    this.cb = cb;
  };

  History.prototype.onReady = function onReady (cb, errorCb) {
    if (this.ready) {
      cb();
    } else {
      this.readyCbs.push(cb);
      if (errorCb) {
        this.readyErrorCbs.push(errorCb);
      }
    }
  };

  History.prototype.onError = function onError (errorCb) {
    this.errorCbs.push(errorCb);
  };

  History.prototype.transitionTo = function transitionTo (
    location,
    onComplete,
    onAbort
  ) {
      var this$1 = this;

    var route;
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
      route = this.router.match(location, this.current);
    } catch (e) {
      this.errorCbs.forEach(function (cb) {
        cb(e);
      });
      // Exception should still be thrown
      throw e
    }
    var prev = this.current;
    this.confirmTransition(
      route,
      function () {
        this$1.updateRoute(route);
        onComplete && onComplete(route);
        this$1.ensureURL();
        this$1.router.afterHooks.forEach(function (hook) {
          hook && hook(route, prev);
        });

        // fire ready cbs once
        if (!this$1.ready) {
          this$1.ready = true;
          this$1.readyCbs.forEach(function (cb) {
            cb(route);
          });
        }
      },
      function (err) {
        if (onAbort) {
          onAbort(err);
        }
        if (err && !this$1.ready) {
          // Initial redirection should not mark the history as ready yet
          // because it's triggered by the redirection instead
          // https://github.com/vuejs/vue-router/issues/3225
          // https://github.com/vuejs/vue-router/issues/3331
          if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
            this$1.ready = true;
            this$1.readyErrorCbs.forEach(function (cb) {
              cb(err);
            });
          }
        }
      }
    );
  };

  History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
      var this$1 = this;

    var current = this.current;
    this.pending = route;
    var abort = function (err) {
      // changed after adding errors with
      // https://github.com/vuejs/vue-router/pull/3047 before that change,
      // redirect and aborted navigation would produce an err == null
      if (!isNavigationFailure(err) && isError(err)) {
        if (this$1.errorCbs.length) {
          this$1.errorCbs.forEach(function (cb) {
            cb(err);
          });
        } else {
          {
            warn(false, 'uncaught error during route navigation:');
          }
          console.error(err);
        }
      }
      onAbort && onAbort(err);
    };
    var lastRouteIndex = route.matched.length - 1;
    var lastCurrentIndex = current.matched.length - 1;
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL();
      if (route.hash) {
        handleScroll(this.router, current, route, false);
      }
      return abort(createNavigationDuplicatedError(current, route))
    }

    var ref = resolveQueue(
      this.current.matched,
      route.matched
    );
      var updated = ref.updated;
      var deactivated = ref.deactivated;
      var activated = ref.activated;

    var queue = [].concat(
      // in-component leave guards
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks(updated),
      // in-config enter guards
      activated.map(function (m) { return m.beforeEnter; }),
      // async components
      resolveAsyncComponents(activated)
    );

    var iterator = function (hook, next) {
      if (this$1.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        hook(route, current, function (to) {
          if (to === false) {
            // next(false) -> abort navigation, ensure current URL
            this$1.ensureURL(true);
            abort(createNavigationAbortedError(current, route));
          } else if (isError(to)) {
            this$1.ensureURL(true);
            abort(to);
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort(createNavigationRedirectedError(current, route));
            if (typeof to === 'object' && to.replace) {
              this$1.replace(to);
            } else {
              this$1.push(to);
            }
          } else {
            // confirm transition and pass on the value
            next(to);
          }
        });
      } catch (e) {
        abort(e);
      }
    };

    runQueue(queue, iterator, function () {
      // wait until async components are resolved before
      // extracting in-component enter guards
      var enterGuards = extractEnterGuards(activated);
      var queue = enterGuards.concat(this$1.router.resolveHooks);
      runQueue(queue, iterator, function () {
        if (this$1.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        this$1.pending = null;
        onComplete(route);
        if (this$1.router.app) {
          this$1.router.app.$nextTick(function () {
            handleRouteEntered(route);
          });
        }
      });
    });
  };

  History.prototype.updateRoute = function updateRoute (route) {
    this.current = route;
    this.cb && this.cb(route);
  };

  History.prototype.setupListeners = function setupListeners () {
    // Default implementation is empty
  };

  History.prototype.teardown = function teardown () {
    // clean up event listeners
    // https://github.com/vuejs/vue-router/issues/2341
    this.listeners.forEach(function (cleanupListener) {
      cleanupListener();
    });
    this.listeners = [];

    // reset current history route
    // https://github.com/vuejs/vue-router/issues/3294
    this.current = START;
    this.pending = null;
  };

  function normalizeBase (base) {
    if (!base) {
      if (inBrowser) {
        // respect <base> tag
        var baseEl = document.querySelector('base');
        base = (baseEl && baseEl.getAttribute('href')) || '/';
        // strip full URL origin
        base = base.replace(/^https?:\/\/[^\/]+/, '');
      } else {
        base = '/';
      }
    }
    // make sure there's the starting slash
    if (base.charAt(0) !== '/') {
      base = '/' + base;
    }
    // remove trailing slash
    return base.replace(/\/$/, '')
  }

  function resolveQueue (
    current,
    next
  ) {
    var i;
    var max = Math.max(current.length, next.length);
    for (i = 0; i < max; i++) {
      if (current[i] !== next[i]) {
        break
      }
    }
    return {
      updated: next.slice(0, i),
      activated: next.slice(i),
      deactivated: current.slice(i)
    }
  }

  function extractGuards (
    records,
    name,
    bind,
    reverse
  ) {
    var guards = flatMapComponents(records, function (def, instance, match, key) {
      var guard = extractGuard(def, name);
      if (guard) {
        return Array.isArray(guard)
          ? guard.map(function (guard) { return bind(guard, instance, match, key); })
          : bind(guard, instance, match, key)
      }
    });
    return flatten(reverse ? guards.reverse() : guards)
  }

  function extractGuard (
    def,
    key
  ) {
    if (typeof def !== 'function') {
      // extend now so that global mixins are applied.
      def = _Vue.extend(def);
    }
    return def.options[key]
  }

  function extractLeaveGuards (deactivated) {
    return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
  }

  function extractUpdateHooks (updated) {
    return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
  }

  function bindGuard (guard, instance) {
    if (instance) {
      return function boundRouteGuard () {
        return guard.apply(instance, arguments)
      }
    }
  }

  function extractEnterGuards (
    activated
  ) {
    return extractGuards(
      activated,
      'beforeRouteEnter',
      function (guard, _, match, key) {
        return bindEnterGuard(guard, match, key)
      }
    )
  }

  function bindEnterGuard (
    guard,
    match,
    key
  ) {
    return function routeEnterGuard (to, from, next) {
      return guard(to, from, function (cb) {
        if (typeof cb === 'function') {
          if (!match.enteredCbs[key]) {
            match.enteredCbs[key] = [];
          }
          match.enteredCbs[key].push(cb);
        }
        next(cb);
      })
    }
  }

  /*  */

  var HTML5History = /*@__PURE__*/(function (History) {
    function HTML5History (router, base) {
      History.call(this, router, base);

      this._startLocation = getLocation(this.base);
    }

    if ( History ) HTML5History.__proto__ = History;
    HTML5History.prototype = Object.create( History && History.prototype );
    HTML5History.prototype.constructor = HTML5History;

    HTML5History.prototype.setupListeners = function setupListeners () {
      var this$1 = this;

      if (this.listeners.length > 0) {
        return
      }

      var router = this.router;
      var expectScroll = router.options.scrollBehavior;
      var supportsScroll = supportsPushState && expectScroll;

      if (supportsScroll) {
        this.listeners.push(setupScroll());
      }

      var handleRoutingEvent = function () {
        var current = this$1.current;

        // Avoiding first `popstate` event dispatched in some browsers but first
        // history route not updated since async guard at the same time.
        var location = getLocation(this$1.base);
        if (this$1.current === START && location === this$1._startLocation) {
          return
        }

        this$1.transitionTo(location, function (route) {
          if (supportsScroll) {
            handleScroll(router, route, current, true);
          }
        });
      };
      window.addEventListener('popstate', handleRoutingEvent);
      this.listeners.push(function () {
        window.removeEventListener('popstate', handleRoutingEvent);
      });
    };

    HTML5History.prototype.go = function go (n) {
      window.history.go(n);
    };

    HTML5History.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        pushState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        replaceState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.ensureURL = function ensureURL (push) {
      if (getLocation(this.base) !== this.current.fullPath) {
        var current = cleanPath(this.base + this.current.fullPath);
        push ? pushState(current) : replaceState(current);
      }
    };

    HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
      return getLocation(this.base)
    };

    return HTML5History;
  }(History));

  function getLocation (base) {
    var path = window.location.pathname;
    var pathLowerCase = path.toLowerCase();
    var baseLowerCase = base.toLowerCase();
    // base="/a" shouldn't turn path="/app" into "/a/pp"
    // https://github.com/vuejs/vue-router/issues/3555
    // so we ensure the trailing slash in the base
    if (base && ((pathLowerCase === baseLowerCase) ||
      (pathLowerCase.indexOf(cleanPath(baseLowerCase + '/')) === 0))) {
      path = path.slice(base.length);
    }
    return (path || '/') + window.location.search + window.location.hash
  }

  /*  */

  var HashHistory = /*@__PURE__*/(function (History) {
    function HashHistory (router, base, fallback) {
      History.call(this, router, base);
      // check history fallback deeplinking
      if (fallback && checkFallback(this.base)) {
        return
      }
      ensureSlash();
    }

    if ( History ) HashHistory.__proto__ = History;
    HashHistory.prototype = Object.create( History && History.prototype );
    HashHistory.prototype.constructor = HashHistory;

    // this is delayed until the app mounts
    // to avoid the hashchange listener being fired too early
    HashHistory.prototype.setupListeners = function setupListeners () {
      var this$1 = this;

      if (this.listeners.length > 0) {
        return
      }

      var router = this.router;
      var expectScroll = router.options.scrollBehavior;
      var supportsScroll = supportsPushState && expectScroll;

      if (supportsScroll) {
        this.listeners.push(setupScroll());
      }

      var handleRoutingEvent = function () {
        var current = this$1.current;
        if (!ensureSlash()) {
          return
        }
        this$1.transitionTo(getHash(), function (route) {
          if (supportsScroll) {
            handleScroll(this$1.router, route, current, true);
          }
          if (!supportsPushState) {
            replaceHash(route.fullPath);
          }
        });
      };
      var eventType = supportsPushState ? 'popstate' : 'hashchange';
      window.addEventListener(
        eventType,
        handleRoutingEvent
      );
      this.listeners.push(function () {
        window.removeEventListener(eventType, handleRoutingEvent);
      });
    };

    HashHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          pushHash(route.fullPath);
          handleScroll(this$1.router, route, fromRoute, false);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          replaceHash(route.fullPath);
          handleScroll(this$1.router, route, fromRoute, false);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.go = function go (n) {
      window.history.go(n);
    };

    HashHistory.prototype.ensureURL = function ensureURL (push) {
      var current = this.current.fullPath;
      if (getHash() !== current) {
        push ? pushHash(current) : replaceHash(current);
      }
    };

    HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      return getHash()
    };

    return HashHistory;
  }(History));

  function checkFallback (base) {
    var location = getLocation(base);
    if (!/^\/#/.test(location)) {
      window.location.replace(cleanPath(base + '/#' + location));
      return true
    }
  }

  function ensureSlash () {
    var path = getHash();
    if (path.charAt(0) === '/') {
      return true
    }
    replaceHash('/' + path);
    return false
  }

  function getHash () {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    var href = window.location.href;
    var index = href.indexOf('#');
    // empty path
    if (index < 0) { return '' }

    href = href.slice(index + 1);

    return href
  }

  function getUrl (path) {
    var href = window.location.href;
    var i = href.indexOf('#');
    var base = i >= 0 ? href.slice(0, i) : href;
    return (base + "#" + path)
  }

  function pushHash (path) {
    if (supportsPushState) {
      pushState(getUrl(path));
    } else {
      window.location.hash = path;
    }
  }

  function replaceHash (path) {
    if (supportsPushState) {
      replaceState(getUrl(path));
    } else {
      window.location.replace(getUrl(path));
    }
  }

  /*  */

  var AbstractHistory = /*@__PURE__*/(function (History) {
    function AbstractHistory (router, base) {
      History.call(this, router, base);
      this.stack = [];
      this.index = -1;
    }

    if ( History ) AbstractHistory.__proto__ = History;
    AbstractHistory.prototype = Object.create( History && History.prototype );
    AbstractHistory.prototype.constructor = AbstractHistory;

    AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      this.transitionTo(
        location,
        function (route) {
          this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
          this$1.index++;
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      this.transitionTo(
        location,
        function (route) {
          this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.go = function go (n) {
      var this$1 = this;

      var targetIndex = this.index + n;
      if (targetIndex < 0 || targetIndex >= this.stack.length) {
        return
      }
      var route = this.stack[targetIndex];
      this.confirmTransition(
        route,
        function () {
          var prev = this$1.current;
          this$1.index = targetIndex;
          this$1.updateRoute(route);
          this$1.router.afterHooks.forEach(function (hook) {
            hook && hook(route, prev);
          });
        },
        function (err) {
          if (isNavigationFailure(err, NavigationFailureType.duplicated)) {
            this$1.index = targetIndex;
          }
        }
      );
    };

    AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      var current = this.stack[this.stack.length - 1];
      return current ? current.fullPath : '/'
    };

    AbstractHistory.prototype.ensureURL = function ensureURL () {
      // noop
    };

    return AbstractHistory;
  }(History));

  /*  */

  var VueRouter = function VueRouter (options) {
    if ( options === void 0 ) options = {};

    {
      warn(this instanceof VueRouter, "Router must be called with the new operator.");
    }
    this.app = null;
    this.apps = [];
    this.options = options;
    this.beforeHooks = [];
    this.resolveHooks = [];
    this.afterHooks = [];
    this.matcher = createMatcher(options.routes || [], this);

    var mode = options.mode || 'hash';
    this.fallback =
      mode === 'history' && !supportsPushState && options.fallback !== false;
    if (this.fallback) {
      mode = 'hash';
    }
    if (!inBrowser) {
      mode = 'abstract';
    }
    this.mode = mode;

    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base);
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback);
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base);
        break
      default:
        {
          assert(false, ("invalid mode: " + mode));
        }
    }
  };

  var prototypeAccessors = { currentRoute: { configurable: true } };

  VueRouter.prototype.match = function match (raw, current, redirectedFrom) {
    return this.matcher.match(raw, current, redirectedFrom)
  };

  prototypeAccessors.currentRoute.get = function () {
    return this.history && this.history.current
  };

  VueRouter.prototype.init = function init (app /* Vue component instance */) {
      var this$1 = this;

    
      assert(
        install.installed,
        "not installed. Make sure to call `Vue.use(VueRouter)` " +
          "before creating root instance."
      );

    this.apps.push(app);

    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    app.$once('hook:destroyed', function () {
      // clean out app from this.apps array once destroyed
      var index = this$1.apps.indexOf(app);
      if (index > -1) { this$1.apps.splice(index, 1); }
      // ensure we still have a main app or null if no apps
      // we do not release the router so it can be reused
      if (this$1.app === app) { this$1.app = this$1.apps[0] || null; }

      if (!this$1.app) { this$1.history.teardown(); }
    });

    // main app previously initialized
    // return as we don't need to set up new history listener
    if (this.app) {
      return
    }

    this.app = app;

    var history = this.history;

    if (history instanceof HTML5History || history instanceof HashHistory) {
      var handleInitialScroll = function (routeOrError) {
        var from = history.current;
        var expectScroll = this$1.options.scrollBehavior;
        var supportsScroll = supportsPushState && expectScroll;

        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll(this$1, routeOrError, from, false);
        }
      };
      var setupListeners = function (routeOrError) {
        history.setupListeners();
        handleInitialScroll(routeOrError);
      };
      history.transitionTo(
        history.getCurrentLocation(),
        setupListeners,
        setupListeners
      );
    }

    history.listen(function (route) {
      this$1.apps.forEach(function (app) {
        app._route = route;
      });
    });
  };

  VueRouter.prototype.beforeEach = function beforeEach (fn) {
    return registerHook(this.beforeHooks, fn)
  };

  VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
    return registerHook(this.resolveHooks, fn)
  };

  VueRouter.prototype.afterEach = function afterEach (fn) {
    return registerHook(this.afterHooks, fn)
  };

  VueRouter.prototype.onReady = function onReady (cb, errorCb) {
    this.history.onReady(cb, errorCb);
  };

  VueRouter.prototype.onError = function onError (errorCb) {
    this.history.onError(errorCb);
  };

  VueRouter.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1.history.push(location, resolve, reject);
      })
    } else {
      this.history.push(location, onComplete, onAbort);
    }
  };

  VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1.history.replace(location, resolve, reject);
      })
    } else {
      this.history.replace(location, onComplete, onAbort);
    }
  };

  VueRouter.prototype.go = function go (n) {
    this.history.go(n);
  };

  VueRouter.prototype.back = function back () {
    this.go(-1);
  };

  VueRouter.prototype.forward = function forward () {
    this.go(1);
  };

  VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
    var route = to
      ? to.matched
        ? to
        : this.resolve(to).route
      : this.currentRoute;
    if (!route) {
      return []
    }
    return [].concat.apply(
      [],
      route.matched.map(function (m) {
        return Object.keys(m.components).map(function (key) {
          return m.components[key]
        })
      })
    )
  };

  VueRouter.prototype.resolve = function resolve (
    to,
    current,
    append
  ) {
    current = current || this.history.current;
    var location = normalizeLocation(to, current, append, this);
    var route = this.match(location, current);
    var fullPath = route.redirectedFrom || route.fullPath;
    var base = this.history.base;
    var href = createHref(base, fullPath, this.mode);
    return {
      location: location,
      route: route,
      href: href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  };

  VueRouter.prototype.getRoutes = function getRoutes () {
    return this.matcher.getRoutes()
  };

  VueRouter.prototype.addRoute = function addRoute (parentOrRoute, route) {
    this.matcher.addRoute(parentOrRoute, route);
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };

  VueRouter.prototype.addRoutes = function addRoutes (routes) {
    {
      warn(false, 'router.addRoutes() is deprecated and has been removed in Vue Router 4. Use router.addRoute() instead.');
    }
    this.matcher.addRoutes(routes);
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };

  Object.defineProperties( VueRouter.prototype, prototypeAccessors );

  function registerHook (list, fn) {
    list.push(fn);
    return function () {
      var i = list.indexOf(fn);
      if (i > -1) { list.splice(i, 1); }
    }
  }

  function createHref (base, fullPath, mode) {
    var path = mode === 'hash' ? '#' + fullPath : fullPath;
    return base ? cleanPath(base + '/' + path) : path
  }

  VueRouter.install = install;
  VueRouter.version = '3.5.3';
  VueRouter.isNavigationFailure = isNavigationFailure;
  VueRouter.NavigationFailureType = NavigationFailureType;
  VueRouter.START_LOCATION = START;

  if (inBrowser && window.Vue) {
    window.Vue.use(VueRouter);
  }

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
  */

  var __MODULES__=[];
  var key=Symbol("privateClassKey");
  var Class={
      'key':key,
      'modules':__MODULES__,
      'require':function(id){
          return __MODULES__[id];
      },
      'creator':function(id,moduleClass,description){
          if( description ){
              if( description.inherit ){
                  Object.defineProperty(moduleClass,'prototype',{value:Object.create(description.inherit.prototype)});
              }
              if( description.methods ){
                  Object.defineProperties(moduleClass,description.methods);
              }
              if( description.members ){
                  Object.defineProperties(moduleClass.prototype,description.members);
              }
              Object.defineProperty(moduleClass,key,{value:description});
              Object.defineProperty(moduleClass,'name',{value:description.name});
              Object.defineProperty(moduleClass,'toString',{value:function toString(){
                  var name = description.ns ? description.ns+'.'+description.name : description.name;
                  var id = description.id;
                  if(id === 3){
                      return '[Enum '+name+']';
                  }else if(id ===2){
                      return '[Interface '+name+']';
                  }else {
                      return '[Class '+name+']';
                  }
              }});
          }
          Object.defineProperty(moduleClass.prototype,'constructor',{value:moduleClass});
          if( id >= 0 ){
              __MODULES__[id] = moduleClass;
          }
      },
      'getClassByName':function(name){
          var len = __MODULES__.length;
          var index = 0;
          for(;index<len;index++){
              var classModule = __MODULES__[index];
              var description = classModule[key];
              if( description ){
                  var key = description.ns ? description.ns+'.'+description.name : description.name;
                  if( key === name){
                      return classModule;
                  }
              }
          }
          return null;
      }
  };

  Class.CONSTANT ={
      MODIFIER_PUBLIC:3,
      MODIFIER_PROTECTED:2,
      MODIFIER_PRIVATE:1,
      MODULE_CLASS:1,
      MODULE_INTERFACE:2,
      MODULE_ENUM:3,
      PROPERTY_VAR:1,
      PROPERTY_CONST:2,
      PROPERTY_FUN:3,
      PROPERTY_ACCESSOR:4,
      PROPERTY_ENUM_KEY:5,
      PROPERTY_ENUM_VALUE:6,
  };

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */

  function Event( type, bubbles, cancelable ){
      if( !type || typeof type !=="string" )throw new TypeError('event type is not string');
      this.type = type;
      this.bubbles = !(bubbles===false);
      this.cancelable = !(cancelable===false);
  }

  Event.SUBMIT='submit';
  Event.RESIZE='resize';
  Event.SELECT='fetch';
  Event.UNLOAD='unload';
  Event.LOAD='load';
  Event.LOAD_START='loadstart';
  Event.PROGRESS='progress';
  Event.RESET='reset';
  Event.FOCUS='focus';
  Event.BLUR='blur';
  Event.ERROR='error';
  Event.COPY='copy';
  Event.BEFORECOPY='beforecopy';
  Event.CUT='cut';
  Event.BEFORECUT='beforecut';
  Event.PASTE='paste';
  Event.BEFOREPASTE='beforepaste';
  Event.SELECTSTART='selectstart';
  Event.READY='ready';
  Event.SCROLL='scroll';
  Event.INITIALIZE_COMPLETED = "initializeCompleted";
  Event.ANIMATION_START="animationstart";
  Event.ANIMATION_END="animationend";
  Event.ANIMATION_ITERATION="animationiteration";
  Event.TRANSITION_END="transitionend";

  /**
   * 事件原型
   * @type {Object}
   */
  Event.prototype = Object.create( Object.prototype,{
      "constructor":{value:Event},
      "toString":function toString(){
          return '[object Event]';
      },
      "valueOf":function valueOf(){
          return '[object Event]';
      }
  });

  Event.prototype.bubbles = true;
  Event.prototype.cancelable = true;
  Event.prototype.currentTarget = null;
  Event.prototype.target = null;
  Event.prototype.defaultPrevented = false;
  Event.prototype.originalEvent = null;
  Event.prototype.type = null;
  Event.prototype.propagationStopped = false;
  Event.prototype.immediatePropagationStopped = false;
  Event.prototype.altkey = false;
  Event.prototype.button = false;
  Event.prototype.ctrlKey = false;
  Event.prototype.shiftKey = false;
  Event.prototype.metaKey = false;

  /**
   * 阻止事件的默认行为
   */
  Event.prototype.preventDefault = function preventDefault(){
      if( this.cancelable===true ){
          this.defaultPrevented = true;
          if ( this.originalEvent ){
              if( this.originalEvent.preventDefault ){
                  this.originalEvent.preventDefault();
              }else {
                  this.originalEvent.returnValue = false;
              }
          }
      }
  };

  /**
   * 阻止向上冒泡事件
   */
  Event.prototype.stopPropagation = function stopPropagation(){
      if( this.originalEvent ){
          this.originalEvent.stopPropagation ? this.originalEvent.stopPropagation() :  this.originalEvent.cancelBubble=true;
      }
      this.propagationStopped = true;
  };

  /**
   *  阻止向上冒泡事件，并停止执行当前事件类型的所有侦听器
   */
  Event.prototype.stopImmediatePropagation = function stopImmediatePropagation(){
      if( this.originalEvent && this.originalEvent.stopImmediatePropagation )this.originalEvent.stopImmediatePropagation();
      this.stopPropagation();
      this.immediatePropagationStopped = true;
  };

  /**
   * map event name
   * @internal Event.fix;
   */
  Event.fix={
      map:{},
      hooks:{},
      prefix:'',
      cssprefix:'',
      cssevent:{},
      eventname:{
          'DOMContentLoaded':true
      }
  };
  Event.fix.map[ Event.READY ]='DOMContentLoaded';
  Event.fix.cssevent[ Event.ANIMATION_START ]     ="AnimationStart";
  Event.fix.cssevent[ Event.ANIMATION_END ]       ="AnimationEnd";
  Event.fix.cssevent[ Event.ANIMATION_ITERATION ] ="AnimationIteration";
  Event.fix.cssevent[ Event.TRANSITION_END ]      ="TransitionEnd";

  /**
   * 获取统一的事件名
   * @param type
   * @param flag
   * @returns {*}
   * @internal Event.type;
   */
  Event.type = function type( eventType, flag ){
      if( typeof eventType !== "string" )return eventType;
      if( flag===true ){
          eventType= Event.fix.prefix==='on' ? eventType.replace(/^on/i,'') : eventType;
          var lower =  eventType.toLowerCase();
          if( Event.fix.cssprefix && lower.substr(0, Event.fix.cssprefix.length )===Event.fix.cssprefix ){
              return lower.substr(Event.fix.cssprefix.length);
          }
          for(var prop in Event.fix.map){
              if( Event.fix.map[prop].toLowerCase() === lower ){
                  return prop;
              }
          }
          return eventType;
      }
      if( Event.fix.cssevent[ eventType ] ){
          return Event.fix.cssprefix ? Event.fix.cssprefix+Event.fix.cssevent[ eventType ] : eventType;
      }
      if( Event.fix.eventname[ eventType ]===true )return eventType;
      return Event.fix.map[ eventType ] ? Event.fix.map[ eventType ] : Event.fix.prefix+eventType.toLowerCase();
  };

  var eventModules=[];
  Event.registerEvent = function registerEvent( callback ){
      eventModules.push( callback );
  };

  /*
   * 根据原型事件创建一个Event
   * @param event
   * @returns {Event}
   * @internal Event.create;
   */
  Event.create = function create( originalEvent ){
      originalEvent=originalEvent ? originalEvent : (typeof window === "object" ? window.event : null);
      var event=null;
      var i=0;
      if( !originalEvent )throw new TypeError('Invalid event');
      var type = originalEvent.type;
      var target = originalEvent.srcElement || originalEvent.target;
      target = target && target.nodeType===3 ? target.parentNode : target;
      var currentTarget =  originalEvent.currentTarget || target;
      if( typeof type !== "string" )throw new TypeError('Invalid event type');
      if( !(originalEvent instanceof Event) ){
          type = Event.type(type, true);
          while (i < eventModules.length && !(event = eventModules[i++](type, target, originalEvent)));
      }else {
          event = originalEvent;
      }
      if( !(event instanceof Event) )event = new Event( type );
      event.type=type;
      event.target=target;
      event.currentTarget = currentTarget;
      event.bubbles = originalEvent.bubbles !== false;
      event.cancelable = originalEvent.cancelable !== false;
      event.originalEvent = originalEvent;
      event.timeStamp = originalEvent.timeStamp;
      event.relatedTarget= originalEvent.relatedTarget;
      event.altkey= !!originalEvent.altkey;
      event.button= originalEvent.button;
      event.ctrlKey= !!originalEvent.ctrlKey;
      event.shiftKey= !!originalEvent.shiftKey;
      event.metaKey= !!originalEvent.metaKey;
      if( originalEvent.animationName ){
          event.animationName = originalEvent.animationName;
          event.elapsedTime   = originalEvent.elapsedTime;
          event.eventPhase   = originalEvent.eventPhase;
          event.isTrusted   = originalEvent.isTrusted;
      }
      return event;
  };

  Event.fix.hooks[ Event.READY ]=function (listener, dispatcher){
      var target=this;
      var doc = this.contentWindow ?  this.contentWindow.document : this.ownerDocument || this.document || this;
      var win=  doc && doc.nodeType===9 ? doc.defaultView || doc.parentWindow : window;
      if( !(win || doc) )return;
      var id = null;
      var has = false;
      var handle=function(event){
          if( !event ){
              switch ( doc.readyState ){
                  case 'loaded'   :
                  case 'complete' :
                  case '4'        :
                      event= new Event( Event.READY );
                      break;
              }
          }
          if( event && has===false){
              has = true;
              if(id){
                  window.clearInterval(id);
                  id = null;
              }
              event = event instanceof Event ? event : Event.create( event );
              event.currentTarget = target;
              event.target = target;
              dispatcher( event );
          }
      };
      var type = Event.type(Event.READY);
      doc.addEventListener ? doc.addEventListener( type, handle) : doc.attachEvent(type, handle);
      id = window.setInterval(handle,50);
      return true;
  };
  Class.creator(14,Event,{
  	'id':1,
  	'global':true,
  	'dynamic':true,
  	'name':'Event'
  }, false);

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */

  var __KEY__ = Symbol('EventDispatcher');
  function EventDispatcher( target ){
      if( !(this instanceof EventDispatcher) ){
          return new EventDispatcher( target );
      }
      var init = {
          proxy:target,
          isEvent:false,
          events:{}
      };
      if( target ){
          if( typeof target !== 'object'){
              throw new Error('target is not object');
          }
          init.isEvent = target instanceof EventDispatcher;  
      }
      Object.defineProperty(this,__KEY__,{value:init});
  }

  EventDispatcher.prototype=Object.create( Object.prototype,{
      "constructor":{value:EventDispatcher}
  });

  /**
   * 判断是否有指定类型的侦听器
   * @param type
   * @param listener
   * @returns {boolean}
   */
  EventDispatcher.prototype.hasEventListener=function hasEventListener( type , listener ){
      var target =  this[ __KEY__ ];
      if( target.isEvent ){
          return target.proxy.hasEventListener(type, listener);
      }
      var events = target.events[type];
      var len = events && events.length >> 0;
      if( len > 0 && listener === void 0 )return true;
      while(len>0 && events[--len] ){
          if( events[len].callback === listener ){
              return true;
          }  
      }
      return false;
  };

  /**
   * 添加侦听器
   * @param type
   * @param listener
   * @param priority
   * @returns {EventDispatcher}
   */
  EventDispatcher.prototype.addEventListener=function addEventListener(type,callback,useCapture,priority,reference){
      if( typeof type !== 'string' )throw new TypeError('Invalid event type');
      if( typeof callback !== 'function' )throw new TypeError('Invalid callback function');
      var target =  this[ __KEY__ ];
      if( target.isEvent ){
          target.proxy.addEventListener(type,callback,useCapture,priority,reference||this);
          return this;
      }
      var listener = new Listener(type,callback,useCapture,priority,reference,this);
      var events = target.events[ type ] || ( target.events[ type ]=[] );
      if( events.length < 1 && target.proxy ){
          listener.proxyHandle = $dispatchEvent;
          listener.proxyTarget = target.proxy;
          listener.proxyType = [type];
          if( Object.prototype.hasOwnProperty.call(Event.fix.hooks,type) ){
              Event.fix.hooks[ type ].call(target, listener, listener.proxyHandle);
          }else {
              type = Event.type(type);
              try {
                  if(target.proxy.addEventListener){
                      target.proxy.addEventListener(type, listener.proxyHandle, listener.useCapture);
                  }else {
                      listener.proxyHandle=function (e) {
                          $dispatchEvent(e, target.proxy);
                      };
                      target.proxy.attachEvent(type, listener.proxyHandle);
                  }
              }catch (e) {}
          }
      }
      events.push( listener );
      if( events.length > 1 ) events.sort(function(a,b){
          return a.priority=== b.priority ? 0 : (a.priority < b.priority ? 1 : -1);
      });
      return this;
  };

  /**
   * 移除指定类型的侦听器
   * @param type
   * @param listener
   * @returns {boolean}
   */
  EventDispatcher.prototype.removeEventListener=function removeEventListener(type,listener){
      var target =  this[ __KEY__ ];
      if(target.isEvent){
          return target.proxy.removeEventListener(type,listener);
      }
      var events = target.events[ type ];
      var len = events && events.length >> 0;
      var ret = len;
      if( len<1 ){
          return false;
      }
      while (len > 0){
          --len;
          if ( !listener || events[len].callback === listener ){
              var result = events.splice(len, 1);
              if( result[0] && target.proxyHandle ){
                  var types = result[0].proxyType;
                  var num = types.length;
                  while ( num > 0 ){
                      $removeListener(result[0].proxyTarget, types[ --num ], result[0].proxyHandle);
                  }
              }
          }
      }
      return events.length !== ret;
  };

  /**
   * 调度指定事件
   * @param event
   * @returns {boolean}
   */
  EventDispatcher.prototype.dispatchEvent=function dispatchEvent( event ){
      if( !(event instanceof Event) )throw new TypeError('Invalid event');
      var target =  this[ __KEY__ ];
      if( target.isEvent ){
          return target.proxy.dispatchEvent(event);
      }
      event.target = event.currentTarget=this;
      return $dispatchEvent( event );
  };


  function $removeListener(target, type , handle ){
      var eventType= Event.type( type );
      if( target.removeEventListener ){
          target.removeEventListener(eventType,handle,false);
          target.removeEventListener(eventType,handle,true);
      }else if( target.detachEvent ){
          target.detachEvent(eventType,handle);
      }
  }

  /**
   * 调度指定侦听项
   * @param event
   * @param listeners
   * @returns {boolean}
   */
  function $dispatchEvent(e, currentTarget){
      if( !(e instanceof Event) ){
          e = Event.create( e );
          if(currentTarget)e.currentTarget = currentTarget;
      }
      if( !e || !e.currentTarget )throw new Error('Invalid event target');
      var target = e.currentTarget;
      var events = target[ __KEY__ ] && target[ __KEY__ ].events[ e.type ];
      if( !events || events.length < 1 )return true;
      events = events.slice(0);
      var length= 0,listener,thisArg,count=events.length;
      while( length < count ){
          listener = events[ length++ ];
          thisArg = listener.reference || listener.dispatcher;
          listener.callback.call( thisArg , e );
          if( e.immediatePropagationStopped===true ){
             return false;
          }
      }
      return true;
  }

  /**
   * 事件侦听器
   * @param type
   * @param callback
   * @param priority
   * @param capture
   * @param currentTarget
   * @param target
   * @constructor
   */
  function Listener(type,callback,useCapture,priority,reference,dispatcher){
      this.type=type;
      this.callback=callback;
      this.useCapture=!!useCapture;
      this.priority=priority>>0;
      this.reference=reference || null;
      this.dispatcher=dispatcher;
  }

  Object.defineProperty(Listener.prototype,"constructor",{value:Listener});
  Listener.prototype.useCapture=false;
  Listener.prototype.dispatcher=null;
  Listener.prototype.reference=null;
  Listener.prototype.priority=0;
  Listener.prototype.callback=null;
  Listener.prototype.type=null;
  Listener.prototype.proxyHandle = null;
  Listener.prototype.proxyTarget = null;
  Listener.prototype.proxyType = null;
  Class.creator(15,EventDispatcher,{
  	'id':1,
  	'global':true,
  	'dynamic':false,
  	'name':'EventDispatcher'
  }, false);

  var _private=Symbol("private");
  function ComponentEvent(type,bubbles,cancelable){
  	Event.call(this,type);
  }
  var methods = {};
  methods.BEFORE_CREATE={m:3,d:2,enumerable:true,value:'componentBeforeCreate'};
  methods.BEFORE_MOUNT={m:3,d:2,enumerable:true,value:'componentBeforeMount'};
  methods.BEFORE_UPDATE={m:3,d:2,enumerable:true,value:'componentBeforeUpdate'};
  methods.BEFORE_DESTROY={m:3,d:2,enumerable:true,value:'componentBeforeDestroy'};
  methods.ERROR_CAPTURED={m:3,d:2,enumerable:true,value:'componentErrorCaptured'};
  methods.UPDATED={m:3,d:2,enumerable:true,value:'componentUpdated'};
  methods.MOUNTED={m:3,d:2,enumerable:true,value:'componentMounted'};
  methods.CREATED={m:3,d:2,enumerable:true,value:'componentCreated'};
  methods.ACTIVATED={m:3,d:2,enumerable:true,value:'componentActivated'};
  methods.DEACTIVATED={m:3,d:2,enumerable:true,value:'componentDeactivated'};
  methods.DESTROYED={m:3,d:2,enumerable:true,value:'componentDestroyed'};
  Class.creator(13,ComponentEvent,{
  	'id':1,
  	'ns':'web.events',
  	'name':'ComponentEvent',
  	'private':_private,
  	'inherit':Event,
  	'methods':methods
  }, false);

  /*!
   * Vue.js v2.6.14
   * (c) 2014-2021 Evan You
   * Released under the MIT License.
   */
  /*  */

  var emptyObject = Object.freeze({});

  // These helpers produce better VM code in JS engines due to their
  // explicitness and function inlining.
  function isUndef (v) {
    return v === undefined || v === null
  }

  function isDef (v) {
    return v !== undefined && v !== null
  }

  function isTrue (v) {
    return v === true
  }

  function isFalse (v) {
    return v === false
  }

  /**
   * Check if value is primitive.
   */
  function isPrimitive (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      // $flow-disable-line
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }

  /**
   * Get the raw type string of a value, e.g., [object Object].
   */
  var _toString = Object.prototype.toString;

  function toRawType (value) {
    return _toString.call(value).slice(8, -1)
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }

  function isRegExp (v) {
    return _toString.call(v) === '[object RegExp]'
  }

  /**
   * Check if val is a valid array index.
   */
  function isValidArrayIndex (val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }

  function isPromise (val) {
    return (
      isDef(val) &&
      typeof val.then === 'function' &&
      typeof val.catch === 'function'
    )
  }

  /**
   * Convert a value to a string that is actually rendered.
   */
  function toString (val) {
    return val == null
      ? ''
      : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
        ? JSON.stringify(val, null, 2)
        : String(val)
  }

  /**
   * Convert an input value to a number for persistence.
   * If the conversion fails, return original string.
   */
  function toNumber (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
  }

  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag = makeMap('slot,component', true);

  /**
   * Check if an attribute is a reserved attribute.
   */
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

  /**
   * Remove an item from an array.
   */
  function remove (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  /**
   * Check whether an object has the property.
   */
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * Camelize a hyphen-delimited string.
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  /**
   * Capitalize a string.
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * Simple bind polyfill for environments that do not support it,
   * e.g., PhantomJS 1.x. Technically, we don't need this anymore
   * since native bind is now performant enough in most browsers.
   * But removing it would mean breaking code that was able to run in
   * PhantomJS 1.x, so this must be kept for backward compatibility.
   */

  /* istanbul ignore next */
  function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
  }

  function nativeBind (fn, ctx) {
    return fn.bind(ctx)
  }

  var bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind;

  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray (list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  /**
   * Mix properties into target object.
   */
  function extend$1 (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject (arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend$1(res, arr[i]);
      }
    }
    return res
  }

  /* eslint-disable no-unused-vars */

  /**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
   */
  function noop$1 (a, b, c) {}

  /**
   * Always return false.
   */
  var no = function (a, b, c) { return false; };

  /* eslint-enable no-unused-vars */

  /**
   * Return the same value.
   */
  var identity = function (_) { return _; };

  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   */
  function looseEqual (a, b) {
    if (a === b) { return true }
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i])
          })
        } else if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime()
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key])
          })
        } else {
          /* istanbul ignore next */
          return false
        }
      } catch (e) {
        /* istanbul ignore next */
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }

  /**
   * Return the first index at which a loosely equal value can be
   * found in the array (if value is a plain object, the array must
   * contain an object of the same shape), or -1 if it is not present.
   */
  function looseIndexOf (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) { return i }
    }
    return -1
  }

  /**
   * Ensure a function is called only once.
   */
  function once$1 (fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    }
  }

  var SSR_ATTR = 'data-server-rendered';

  var ASSET_TYPES = [
    'component',
    'directive',
    'filter'
  ];

  var LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured',
    'serverPrefetch'
  ];

  /*  */



  var config = ({
    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Show production mode tip message on boot?
     */
    productionTip: "development" !== 'production',

    /**
     * Whether to enable devtools
     */
    devtools: "development" !== 'production',

    /**
     * Whether to record perf
     */
    performance: false,

    /**
     * Error handler for watcher errors
     */
    errorHandler: null,

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,

    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: Object.create(null),

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop$1,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * Perform updates asynchronously. Intended to be used by Vue Test Utils
     * This will significantly reduce performance if set to false.
     */
    async: true,

    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
  });

  /*  */

  /**
   * unicode letters used for parsing html tags, component names and property paths.
   * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
   * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
   */
  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

  /**
   * Check if a string starts with $ or _
   */
  function isReserved (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  /**
   * Define a property.
   */
  function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Parse simple path.
   */
  var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
  function parsePath$1 (path) {
    if (bailRE.test(path)) {
      return
    }
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }

  /*  */

  // can we use __proto__?
  var hasProto = '__proto__' in {};

  // Browser environment sniffing
  var inBrowser$1 = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser$1 && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
  var isPhantomJS = UA && /phantomjs/.test(UA);
  var isFF = UA && UA.match(/firefox\/(\d+)/);

  // Firefox has a "watch" function on Object.prototype...
  var nativeWatch = ({}).watch;

  var supportsPassive = false;
  if (inBrowser$1) {
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () {
          /* istanbul ignore next */
          supportsPassive = true;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts);
    } catch (e) {}
  }

  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer;
  var isServerRendering = function () {
    if (_isServer === undefined) {
      /* istanbul ignore if */
      if (!inBrowser$1 && !inWeex && typeof global !== 'undefined') {
        // detect presence of vue-server-renderer and avoid
        // Webpack shimming the process
        _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer = false;
      }
    }
    return _isServer
  };

  // detect devtools
  var devtools = inBrowser$1 && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  /* istanbul ignore next */
  function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol$1 =
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

  var _Set;
  /* istanbul ignore if */ // $flow-disable-line
  if (typeof Set !== 'undefined' && isNative(Set)) {
    // use native Set when available.
    _Set = Set;
  } else {
    // a non-standard Set polyfill that only works with primitive keys.
    _Set = /*@__PURE__*/(function () {
      function Set () {
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) {
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) {
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () {
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  /*  */

  var warn$1 = noop$1;
  var tip = noop$1;
  var generateComponentTrace = (noop$1); // work around flow check
  var formatComponentName = (noop$1);

  {
    var hasConsole = typeof console !== 'undefined';
    var classifyRE = /(?:^|[-_])(\w)/g;
    var classify = function (str) { return str
      .replace(classifyRE, function (c) { return c.toUpperCase(); })
      .replace(/[-_]/g, ''); };

    warn$1 = function (msg, vm) {
      var trace = vm ? generateComponentTrace(vm) : '';

      if (config.warnHandler) {
        config.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole && (!config.silent)) {
        console.error(("[Vue warn]: " + msg + trace));
      }
    };

    tip = function (msg, vm) {
      if (hasConsole && (!config.silent)) {
        console.warn("[Vue tip]: " + msg + (
          vm ? generateComponentTrace(vm) : ''
        ));
      }
    };

    formatComponentName = function (vm, includeFile) {
      if (vm.$root === vm) {
        return '<Root>'
      }
      var options = typeof vm === 'function' && vm.cid != null
        ? vm.options
        : vm._isVue
          ? vm.$options || vm.constructor.options
          : vm;
      var name = options.name || options._componentTag;
      var file = options.__file;
      if (!name && file) {
        var match = file.match(/([^/\\]+)\.vue$/);
        name = match && match[1];
      }

      return (
        (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
        (file && includeFile !== false ? (" at " + file) : '')
      )
    };

    var repeat = function (str, n) {
      var res = '';
      while (n) {
        if (n % 2 === 1) { res += str; }
        if (n > 1) { str += str; }
        n >>= 1;
      }
      return res
    };

    generateComponentTrace = function (vm) {
      if (vm._isVue && vm.$parent) {
        var tree = [];
        var currentRecursiveSequence = 0;
        while (vm) {
          if (tree.length > 0) {
            var last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) {
              currentRecursiveSequence++;
              vm = vm.$parent;
              continue
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence];
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return '\n\nfound in\n\n' + tree
          .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
              ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
              : formatComponentName(vm))); })
          .join('\n')
      } else {
        return ("\n\n(found in " + (formatComponentName(vm)) + ")")
      }
    };
  }

  /*  */

  var uid = 0;

  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   */
  var Dep = function Dep () {
    this.id = uid++;
    this.subs = [];
  };

  Dep.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
  };

  Dep.prototype.removeSub = function removeSub (sub) {
    remove(this.subs, sub);
  };

  Dep.prototype.depend = function depend () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  Dep.prototype.notify = function notify () {
    // stabilize the subscriber list first
    var subs = this.subs.slice();
    if ( !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort(function (a, b) { return a.id - b.id; });
    }
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  // The current target watcher being evaluated.
  // This is globally unique because only one watcher
  // can be evaluated at a time.
  Dep.target = null;
  var targetStack = [];

  function pushTarget (target) {
    targetStack.push(target);
    Dep.target = target;
  }

  function popTarget () {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
  }

  /*  */

  var VNode = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  var prototypeAccessors$1 = { child: { configurable: true } };

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  prototypeAccessors$1.child.get = function () {
    return this.componentInstance
  };

  Object.defineProperties( VNode.prototype, prototypeAccessors$1 );

  var createEmptyVNode = function (text) {
    if ( text === void 0 ) text = '';

    var node = new VNode();
    node.text = text;
    node.isComment = true;
    return node
  };

  function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
  }

  // optimized shallow clone
  // used for static nodes and slot nodes because they may be reused across
  // multiple renders, cloning them avoids errors when DOM manipulations rely
  // on their elm reference.
  function cloneVNode (vnode) {
    var cloned = new VNode(
      vnode.tag,
      vnode.data,
      // #7975
      // clone children array to avoid mutating original in case of cloning
      // a child.
      vnode.children && vnode.children.slice(),
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned
  }

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);

  var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch.forEach(function (method) {
    // cache original method
    var original = arrayProto[method];
    def(arrayMethods, method, function mutator () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); }
      // notify change
      ob.dep.notify();
      return result
    });
  });

  /*  */

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve = true;

  function toggleObserving (value) {
    shouldObserve = value;
  }

  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  var Observer = function Observer (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  };

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive$$1(obj, keys[i]);
    }
  };

  /**
   * Observe a list of Array items.
   */
  Observer.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  // helpers

  /**
   * Augment a target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment (target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment a target Object or Array by defining
   * hidden properties.
   */
  /* istanbul ignore next */
  function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
  }

  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe (value, asRootData) {
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
  }

  /**
   * Define a reactive property on an Object.
   */
  function defineReactive$$1 (
    obj,
    key,
    val,
    customSetter,
    shallow
  ) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    var setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key];
    }

    var childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        var value = getter ? getter.call(obj) : val;
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        /* eslint-enable no-self-compare */
        if ( customSetter) {
          customSetter();
        }
        // #7981: for accessor properties without setter
        if (getter && !setter) { return }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = !shallow && observe(newVal);
        dep.notify();
      }
    });
  }

  /**
   * Set a property on an object. Adds the new property and
   * triggers change notification if the property doesn't
   * already exist.
   */
  function set (target, key, val) {
    if (
      (isUndef(target) || isPrimitive(target))
    ) {
      warn$1(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val
    }
    if (key in target && !(key in Object.prototype)) {
      target[key] = val;
      return val
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
       warn$1(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      );
      return val
    }
    if (!ob) {
      target[key] = val;
      return val
    }
    defineReactive$$1(ob.value, key, val);
    ob.dep.notify();
    return val
  }

  /**
   * Delete a property and trigger change if necessary.
   */
  function del (target, key) {
    if (
      (isUndef(target) || isPrimitive(target))
    ) {
      warn$1(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1);
      return
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
       warn$1(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      );
      return
    }
    if (!hasOwn(target, key)) {
      return
    }
    delete target[key];
    if (!ob) {
      return
    }
    ob.dep.notify();
  }

  /**
   * Collect dependencies on array elements when the array is touched, since
   * we cannot intercept array element access like property getters.
   */
  function dependArray (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        dependArray(e);
      }
    }
  }

  /*  */

  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats = config.optionMergeStrategies;

  /**
   * Options with restrictions
   */
  {
    strats.el = strats.propsData = function (parent, child, vm, key) {
      if (!vm) {
        warn$1(
          "option \"" + key + "\" can only be used during instance " +
          'creation with the `new` keyword.'
        );
      }
      return defaultStrat(parent, child)
    };
  }

  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData (to, from) {
    if (!from) { return to }
    var key, toVal, fromVal;

    var keys = hasSymbol$1
      ? Reflect.ownKeys(from)
      : Object.keys(from);

    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      // in case the object is already observed...
      if (key === '__ob__') { continue }
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn(to, key)) {
        set(to, key, fromVal);
      } else if (
        toVal !== fromVal &&
        isPlainObject(toVal) &&
        isPlainObject(fromVal)
      ) {
        mergeData(toVal, fromVal);
      }
    }
    return to
  }

  /**
   * Data
   */
  function mergeDataOrFn (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      // in a Vue.extend merge, both should be functions
      if (!childVal) {
        return parentVal
      }
      if (!parentVal) {
        return childVal
      }
      // when parentVal & childVal are both present,
      // we need to return a function that returns the
      // merged result of both functions... no need to
      // check if parentVal is a function here because
      // it has to be a function to pass previous merges.
      return function mergedDataFn () {
        return mergeData(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else {
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }

  strats.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {
         warn$1(
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        );

        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)
    }

    return mergeDataOrFn(parentVal, childVal, vm)
  };

  /**
   * Hooks and props are merged as arrays.
   */
  function mergeHook (
    parentVal,
    childVal
  ) {
    var res = childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal
          : [childVal]
      : parentVal;
    return res
      ? dedupeHooks(res)
      : res
  }

  function dedupeHooks (hooks) {
    var res = [];
    for (var i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets (
    parentVal,
    childVal,
    vm,
    key
  ) {
    var res = Object.create(parentVal || null);
    if (childVal) {
       assertObjectType(key, childVal, vm);
      return extend$1(res, childVal)
    } else {
      return res
    }
  }

  ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
  });

  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats.watch = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    // work around Firefox's Object.prototype.watch...
    if (parentVal === nativeWatch) { parentVal = undefined; }
    if (childVal === nativeWatch) { childVal = undefined; }
    /* istanbul ignore if */
    if (!childVal) { return Object.create(parentVal || null) }
    {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = {};
    extend$1(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * Other object hashes.
   */
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    if (childVal && "development" !== 'production') {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend$1(ret, parentVal);
    if (childVal) { extend$1(ret, childVal); }
    return ret
  };
  strats.provide = mergeDataOrFn;

  /**
   * Default strategy.
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  /**
   * Validate component names
   */
  function checkComponents (options) {
    for (var key in options.components) {
      validateComponentName(key);
    }
  }

  function validateComponentName (name) {
    if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
      warn$1(
        'Invalid component name: "' + name + '". Component names ' +
        'should conform to valid custom element name in html5 specification.'
      );
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
      warn$1(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + name
      );
    }
  }

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) { return }
    var res = {};
    var i, val, name;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        } else {
          warn$1('props must be strings when using array syntax.');
        }
      }
    } else if (isPlainObject(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val)
          ? val
          : { type: val };
      }
    } else {
      warn$1(
        "Invalid value for option \"props\": expected an Array or an Object, " +
        "but got " + (toRawType(props)) + ".",
        vm
      );
    }
    options.props = res;
  }

  /**
   * Normalize all injections into Object-based format
   */
  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) { return }
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val)
          ? extend$1({ from: key }, val)
          : { from: val };
      }
    } else {
      warn$1(
        "Invalid value for option \"inject\": expected an Array or an Object, " +
        "but got " + (toRawType(inject)) + ".",
        vm
      );
    }
  }

  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives (options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def$$1 = dirs[key];
        if (typeof def$$1 === 'function') {
          dirs[key] = { bind: def$$1, update: def$$1 };
        }
      }
    }
  }

  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) {
      warn$1(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType(value)) + ".",
        vm
      );
    }
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions (
    parent,
    child,
    vm
  ) {
    {
      checkComponents(child);
    }

    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps(child, vm);
    normalizeInject(child, vm);
    normalizeDirectives(child);

    // Apply extends and mixins on the child options,
    // but only if it is a raw options object that isn't
    // the result of another mergeOptions call.
    // Only merged options has the _base property.
    if (!child._base) {
      if (child.extends) {
        parent = mergeOptions(parent, child.extends, vm);
      }
      if (child.mixins) {
        for (var i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions(parent, child.mixins[i], vm);
        }
      }
    }

    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset (
    options,
    type,
    id,
    warnMissing
  ) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return
    }
    var assets = options[type];
    // check local registration variations first
    if (hasOwn(assets, id)) { return assets[id] }
    var camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
    // fallback to prototype chain
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if ( warnMissing && !res) {
      warn$1(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      );
    }
    return res
  }

  /*  */



  function validateProp (
    key,
    propOptions,
    propsData,
    vm
  ) {
    var prop = propOptions[key];
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    // boolean casting
    var booleanIndex = getTypeIndex(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      var prevShouldObserve = shouldObserve;
      toggleObserving(true);
      observe(value);
      toggleObserving(prevShouldObserve);
    }
    {
      assertProp(prop, key, value, vm, absent);
    }
    return value
  }

  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue (vm, prop, key) {
    // no default, return undefined
    if (!hasOwn(prop, 'default')) {
      return undefined
    }
    var def = prop.default;
    // warn against non-factory defaults for Object & Array
    if ( isObject(def)) {
      warn$1(
        'Invalid default value for prop "' + key + '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
        vm
      );
    }
    // the raw prop value was also undefined from previous render,
    // return previous default value to avoid unnecessary watcher trigger
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // call factory function for non-Function types
    // a value is Function if its prototype is function even across different execution context
    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm)
      : def
  }

  /**
   * Assert whether a prop is valid.
   */
  function assertProp (
    prop,
    name,
    value,
    vm,
    absent
  ) {
    if (prop.required && absent) {
      warn$1(
        'Missing required prop: "' + name + '"',
        vm
      );
      return
    }
    if (value == null && !prop.required) {
      return
    }
    var type = prop.type;
    var valid = !type || type === true;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType(value, type[i], vm);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
      }
    }

    var haveExpectedTypes = expectedTypes.some(function (t) { return t; });
    if (!valid && haveExpectedTypes) {
      warn$1(
        getInvalidTypeMessage(name, value, expectedTypes),
        vm
      );
      return
    }
    var validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn$1(
          'Invalid prop: custom validator check failed for prop "' + name + '".',
          vm
        );
      }
    }
  }

  var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;

  function assertType (value, type, vm) {
    var valid;
    var expectedType = getType(type);
    if (simpleCheckRE.test(expectedType)) {
      var t = typeof value;
      valid = t === expectedType.toLowerCase();
      // for primitive wrapper objects
      if (!valid && t === 'object') {
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') {
      valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      try {
        valid = value instanceof type;
      } catch (e) {
        warn$1('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
        valid = false;
      }
    }
    return {
      valid: valid,
      expectedType: expectedType
    }
  }

  var functionTypeCheckRE = /^\s*function (\w+)/;

  /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType (fn) {
    var match = fn && fn.toString().match(functionTypeCheckRE);
    return match ? match[1] : ''
  }

  function isSameType (a, b) {
    return getType(a) === getType(b)
  }

  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      return isSameType(expectedTypes, type) ? 0 : -1
    }
    for (var i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  function getInvalidTypeMessage (name, value, expectedTypes) {
    var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
      " Expected " + (expectedTypes.map(capitalize).join(', '));
    var expectedType = expectedTypes[0];
    var receivedType = toRawType(value);
    // check if we need to specify expected value
    if (
      expectedTypes.length === 1 &&
      isExplicable(expectedType) &&
      isExplicable(typeof value) &&
      !isBoolean(expectedType, receivedType)
    ) {
      message += " with value " + (styleValue(value, expectedType));
    }
    message += ", got " + receivedType + " ";
    // check if we need to specify received value
    if (isExplicable(receivedType)) {
      message += "with value " + (styleValue(value, receivedType)) + ".";
    }
    return message
  }

  function styleValue (value, type) {
    if (type === 'String') {
      return ("\"" + value + "\"")
    } else if (type === 'Number') {
      return ("" + (Number(value)))
    } else {
      return ("" + value)
    }
  }

  var EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
  function isExplicable (value) {
    return EXPLICABLE_TYPES.some(function (elem) { return value.toLowerCase() === elem; })
  }

  function isBoolean () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
  }

  /*  */

  function handleError (err, vm, info) {
    // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
    // See: https://github.com/vuejs/vuex/issues/1505
    pushTarget();
    try {
      if (vm) {
        var cur = vm;
        while ((cur = cur.$parent)) {
          var hooks = cur.$options.errorCaptured;
          if (hooks) {
            for (var i = 0; i < hooks.length; i++) {
              try {
                var capture = hooks[i].call(cur, err, vm, info) === false;
                if (capture) { return }
              } catch (e) {
                globalHandleError(e, cur, 'errorCaptured hook');
              }
            }
          }
        }
      }
      globalHandleError(err, vm, info);
    } finally {
      popTarget();
    }
  }

  function invokeWithErrorHandling (
    handler,
    context,
    args,
    vm,
    info
  ) {
    var res;
    try {
      res = args ? handler.apply(context, args) : handler.call(context);
      if (res && !res._isVue && isPromise(res) && !res._handled) {
        res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
        // issue #9511
        // avoid catch triggering multiple times when nested calls
        res._handled = true;
      }
    } catch (e) {
      handleError(e, vm, info);
    }
    return res
  }

  function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        // if the user intentionally throws the original error in the handler,
        // do not log it twice
        if (e !== err) {
          logError(e, null, 'config.errorHandler');
        }
      }
    }
    logError(err, vm, info);
  }

  function logError (err, vm, info) {
    {
      warn$1(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    /* istanbul ignore else */
    if ((inBrowser$1 || inWeex) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }

  /*  */

  var isUsingMicroTask = false;

  var callbacks = [];
  var pending = false;

  function flushCallbacks () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // Here we have async deferring wrappers using microtasks.
  // In 2.5 we used (macro) tasks (in combination with microtasks).
  // However, it has subtle problems when state is changed right before repaint
  // (e.g. #6813, out-in transitions).
  // Also, using (macro) tasks in event handler would cause some weird behaviors
  // that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
  // So we now use microtasks everywhere, again.
  // A major drawback of this tradeoff is that there are some scenarios
  // where microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690, which have workarounds)
  // or even between bubbling of the same event (#6566).
  var timerFunc;

  // The nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    timerFunc = function () {
      p.then(flushCallbacks);
      // In problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop$1); }
    };
    isUsingMicroTask = true;
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // Use MutationObserver where native Promise is not available,
    // e.g. PhantomJS, iOS7, Android 4.4
    // (#6466 MutationObserver is unreliable in IE11)
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
    isUsingMicroTask = true;
  } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // Fallback to setImmediate.
    // Technically it leverages the (macro) task queue,
    // but it is still a better choice than setTimeout.
    timerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else {
    // Fallback to setTimeout.
    timerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  function nextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }

  /*  */

  /* not type checking this file because flow doesn't play well with Proxy */

  var initProxy;

  {
    var allowedGlobals = makeMap(
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
      'require' // for Webpack/Browserify
    );

    var warnNonPresent = function (target, key) {
      warn$1(
        "Property or method \"" + key + "\" is not defined on the instance but " +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        target
      );
    };

    var warnReservedPrefix = function (target, key) {
      warn$1(
        "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
        'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
        'prevent conflicts with Vue internals. ' +
        'See: https://vuejs.org/v2/api/#data',
        target
      );
    };

    var hasProxy =
      typeof Proxy !== 'undefined' && isNative(Proxy);

    if (hasProxy) {
      var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
      config.keyCodes = new Proxy(config.keyCodes, {
        set: function set (target, key, value) {
          if (isBuiltInModifier(key)) {
            warn$1(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
            return false
          } else {
            target[key] = value;
            return true
          }
        }
      });
    }

    var hasHandler = {
      has: function has (target, key) {
        var has = key in target;
        var isAllowed = allowedGlobals(key) ||
          (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
        if (!has && !isAllowed) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return has || !isAllowed
      }
    };

    var getHandler = {
      get: function get (target, key) {
        if (typeof key === 'string' && !(key in target)) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return target[key]
      }
    };

    initProxy = function initProxy (vm) {
      if (hasProxy) {
        // determine which proxy handler to use
        var options = vm.$options;
        var handlers = options.render && options.render._withStripped
          ? getHandler
          : hasHandler;
        vm._renderProxy = new Proxy(vm, handlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  }

  /*  */

  var seenObjects = new _Set();

  /**
   * Recursively traverse an object to evoke all converted
   * getters, so that every nested property inside the object
   * is collected as a "deep" dependency.
   */
  function traverse (val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
  }

  function _traverse (val, seen) {
    var i, keys;
    var isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
      return
    }
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--) { _traverse(val[i], seen); }
    } else {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) { _traverse(val[keys[i]], seen); }
    }
  }

  var mark;
  var measure;

  {
    var perf = inBrowser$1 && window.performance;
    /* istanbul ignore if */
    if (
      perf &&
      perf.mark &&
      perf.measure &&
      perf.clearMarks &&
      perf.clearMeasures
    ) {
      mark = function (tag) { return perf.mark(tag); };
      measure = function (name, startTag, endTag) {
        perf.measure(name, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
        // perf.clearMeasures(name)
      };
    }
  }

  /*  */

  var normalizeEvent = cached(function (name) {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
    name = once$$1 ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
      name: name,
      once: once$$1,
      capture: capture,
      passive: passive
    }
  });

  function createFnInvoker (fns, vm) {
    function invoker () {
      var arguments$1 = arguments;

      var fns = invoker.fns;
      if (Array.isArray(fns)) {
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
        }
      } else {
        // return handler return value for single handlers
        return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
      }
    }
    invoker.fns = fns;
    return invoker
  }

  function updateListeners (
    on,
    oldOn,
    add,
    remove$$1,
    createOnceHandler,
    vm
  ) {
    var name, def$$1, cur, old, event;
    for (name in on) {
      def$$1 = cur = on[name];
      old = oldOn[name];
      event = normalizeEvent(name);
      if (isUndef(cur)) {
         warn$1(
          "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
          vm
        );
      } else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur, vm);
        }
        if (isTrue(event.once)) {
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef(on[name])) {
        event = normalizeEvent(name);
        remove$$1(event.name, oldOn[name], event.capture);
      }
    }
  }

  /*  */

  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];

    function wrappedHook () {
      hook.apply(this, arguments);
      // important: remove merged hook to ensure it's called only once
      // and prevent memory leak
      remove(invoker.fns, wrappedHook);
    }

    if (isUndef(oldHook)) {
      // no existing hook
      invoker = createFnInvoker([wrappedHook]);
    } else {
      /* istanbul ignore if */
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        // already a merged invoker
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        // existing plain hook
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true;
    def[hookKey] = invoker;
  }

  /*  */

  function extractPropsFromVNodeData (
    data,
    Ctor,
    tag
  ) {
    // we are only extracting raw values here.
    // validation and default values are handled in the child
    // component itself.
    var propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate(key);
        {
          var keyInLowerCase = key.toLowerCase();
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn(attrs, keyInLowerCase)
          ) {
            tip(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp (
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /*  */

  // The template compiler attempts to minimize the need for normalization by
  // statically analyzing the template at compile time.
  //
  // For plain HTML markup, normalization can be completely skipped because the
  // generated render function is guaranteed to return Array<VNode>. There are
  // two cases where extra normalization is needed:

  // 1. When the children contains components - because a functional component
  // may return an Array instead of a single root. In this case, just a simple
  // normalization is needed - if any child is an Array, we flatten the whole
  // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
  // because functional components already normalize their own children.
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }

  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren (children) {
    return isPrimitive(children)
      ? [createTextVNode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }

  function isTextNode (node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
  }

  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      //  nested
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
          // merge adjacent text nodes
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) {
          // merge adjacent text nodes
          // this is necessary for SSR hydration because text nodes are
          // essentially merged when rendered to HTML strings
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          // merge adjacent text nodes
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          // default key for nested array children (likely generated by v-for)
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  /*  */

  function initProvide (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
    }
  }

  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      Object.keys(result).forEach(function (key) {
        /* istanbul ignore else */
        {
          defineReactive$$1(vm, key, result[key], function () {
            warn$1(
              "Avoid mutating an injected value directly since the changes will be " +
              "overwritten whenever the provided component re-renders. " +
              "injection being mutated: \"" + key + "\"",
              vm
            );
          });
        }
      });
      toggleObserving(true);
    }
  }

  function resolveInject (inject, vm) {
    if (inject) {
      // inject is :any because flow is not smart enough to figure out cached
      var result = Object.create(null);
      var keys = hasSymbol$1
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        // #6574 in case the inject object is observed...
        if (key === '__ob__') { continue }
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          } else {
            warn$1(("Injection \"" + key + "\" not found"), vm);
          }
        }
      }
      return result
    }
  }

  /*  */



  /**
   * Runtime helper for resolving raw children VNodes into a slot object.
   */
  function resolveSlots (
    children,
    context
  ) {
    if (!children || !children.length) {
      return {}
    }
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // remove slot attribute if the node is resolved as a Vue slot node
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // ignore slots that contains only whitespace
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) {
        delete slots[name$1];
      }
    }
    return slots
  }

  function isWhitespace (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  /*  */

  function isAsyncPlaceholder (node) {
    return node.isComment && node.asyncFactory
  }

  /*  */

  function normalizeScopedSlots (
    slots,
    normalSlots,
    prevSlots
  ) {
    var res;
    var hasNormalSlots = Object.keys(normalSlots).length > 0;
    var isStable = slots ? !!slots.$stable : !hasNormalSlots;
    var key = slots && slots.$key;
    if (!slots) {
      res = {};
    } else if (slots._normalized) {
      // fast path 1: child component re-render only, parent did not change
      return slots._normalized
    } else if (
      isStable &&
      prevSlots &&
      prevSlots !== emptyObject &&
      key === prevSlots.$key &&
      !hasNormalSlots &&
      !prevSlots.$hasNormal
    ) {
      // fast path 2: stable scoped slots w/ no normal slots to proxy,
      // only need to normalize once
      return prevSlots
    } else {
      res = {};
      for (var key$1 in slots) {
        if (slots[key$1] && key$1[0] !== '$') {
          res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
        }
      }
    }
    // expose normal slots on scopedSlots
    for (var key$2 in normalSlots) {
      if (!(key$2 in res)) {
        res[key$2] = proxyNormalSlot(normalSlots, key$2);
      }
    }
    // avoriaz seems to mock a non-extensible $scopedSlots object
    // and when that is passed down this would cause an error
    if (slots && Object.isExtensible(slots)) {
      (slots)._normalized = res;
    }
    def(res, '$stable', isStable);
    def(res, '$key', key);
    def(res, '$hasNormal', hasNormalSlots);
    return res
  }

  function normalizeScopedSlot(normalSlots, key, fn) {
    var normalized = function () {
      var res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === 'object' && !Array.isArray(res)
        ? [res] // single vnode
        : normalizeChildren(res);
      var vnode = res && res[0];
      return res && (
        !vnode ||
        (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode)) // #9658, #10391
      ) ? undefined
        : res
    };
    // this is a slot using the new v-slot syntax without scope. although it is
    // compiled as a scoped slot, render fn users would expect it to be present
    // on this.$slots because the usage is semantically a normal slot.
    if (fn.proxy) {
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized
  }

  function proxyNormalSlot(slots, key) {
    return function () { return slots[key]; }
  }

  /*  */

  /**
   * Runtime helper for rendering v-for lists.
   */
  function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      if (hasSymbol$1 && val[Symbol.iterator]) {
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    if (!isDef(ret)) {
      ret = [];
    }
    (ret)._isVList = true;
    return ret
  }

  /*  */

  /**
   * Runtime helper for rendering <slot>
   */
  function renderSlot (
    name,
    fallbackRender,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) {
      // scoped slot
      props = props || {};
      if (bindObject) {
        if ( !isObject(bindObject)) {
          warn$1('slot v-bind without argument expects an Object', this);
        }
        props = extend$1(extend$1({}, bindObject), props);
      }
      nodes =
        scopedSlotFn(props) ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    } else {
      nodes =
        this.$slots[name] ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    }

    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /*  */

  /**
   * Runtime helper for resolving filters
   */
  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  /*  */

  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  /**
   * Runtime helper for checking keyCodes from config.
   * exposed as Vue.prototype._k
   * passing in eventKeyName as last argument separately for backwards compat
   */
  function checkKeyCodes (
    eventKeyCode,
    key,
    builtInKeyCode,
    eventKeyName,
    builtInKeyName
  ) {
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      return isKeyNotMatch(builtInKeyName, eventKeyName)
    } else if (mappedKeyCode) {
      return isKeyNotMatch(mappedKeyCode, eventKeyCode)
    } else if (eventKeyName) {
      return hyphenate(eventKeyName) !== key
    }
    return eventKeyCode === undefined
  }

  /*  */

  /**
   * Runtime helper for merging v-bind="object" into a VNode's data.
   */
  function bindObjectProps (
    data,
    tag,
    value,
    asProp,
    isSync
  ) {
    if (value) {
      if (!isObject(value)) {
         warn$1(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) {
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute(key)
          ) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          var camelizedKey = camelize(key);
          var hyphenatedKey = hyphenate(key);
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
            hash[key] = value[key];

            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) loop( key );
      }
    }
    return data
  }

  /*  */

  /**
   * Runtime helper for rendering static trees.
   */
  function renderStatic (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    if (tree && !isInFor) {
      return tree
    }
    // otherwise, render a fresh tree.
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

  /**
   * Runtime helper for v-once.
   * Effectively it means marking the node as static with a unique key.
   */
  function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  }

  function markStatic (
    tree,
    key,
    isOnce
  ) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  /*  */

  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) {
         warn$1(
          'v-on without argument expects an Object value',
          this
        );
      } else {
        var on = data.on = data.on ? extend$1({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  /*  */

  function resolveScopedSlots (
    fns, // see flow/vnode
    res,
    // the following are added in 2.6
    hasDynamicKeys,
    contentHashKey
  ) {
    res = res || { $stable: !hasDynamicKeys };
    for (var i = 0; i < fns.length; i++) {
      var slot = fns[i];
      if (Array.isArray(slot)) {
        resolveScopedSlots(slot, res, hasDynamicKeys);
      } else if (slot) {
        // marker for reverse proxying v-slot without scope on this.$slots
        if (slot.proxy) {
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn;
      }
    }
    if (contentHashKey) {
      (res).$key = contentHashKey;
    }
    return res
  }

  /*  */

  function bindDynamicKeys (baseObj, values) {
    for (var i = 0; i < values.length; i += 2) {
      var key = values[i];
      if (typeof key === 'string' && key) {
        baseObj[values[i]] = values[i + 1];
      } else if ( key !== '' && key !== null) {
        // null is a special value for explicitly removing a binding
        warn$1(
          ("Invalid value for dynamic directive argument (expected string or null): " + key),
          this
        );
      }
    }
    return baseObj
  }

  // helper to dynamically append modifier runtime markers to event names.
  // ensure only append when value is already string, otherwise it will be cast
  // to string and cause the type check to miss.
  function prependModifier (value, symbol) {
    return typeof value === 'string' ? symbol + value : value
  }

  /*  */

  function installRenderHelpers (target) {
    target._o = markOnce;
    target._n = toNumber;
    target._s = toString;
    target._l = renderList;
    target._t = renderSlot;
    target._q = looseEqual;
    target._i = looseIndexOf;
    target._m = renderStatic;
    target._f = resolveFilter;
    target._k = checkKeyCodes;
    target._b = bindObjectProps;
    target._v = createTextVNode;
    target._e = createEmptyVNode;
    target._u = resolveScopedSlots;
    target._g = bindObjectListeners;
    target._d = bindDynamicKeys;
    target._p = prependModifier;
  }

  /*  */

  function FunctionalRenderContext (
    data,
    props,
    children,
    parent,
    Ctor
  ) {
    var this$1 = this;

    var options = Ctor.options;
    // ensure the createElement function in functional components
    // gets a unique context - this is necessary for correct named slot check
    var contextVm;
    if (hasOwn(parent, '_uid')) {
      contextVm = Object.create(parent);
      // $flow-disable-line
      contextVm._original = parent;
    } else {
      // the context vm passed in is a functional context as well.
      // in this case we want to make sure we are able to get a hold to the
      // real context instance.
      contextVm = parent;
      // $flow-disable-line
      parent = parent._original;
    }
    var isCompiled = isTrue(options._compiled);
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent);
    this.slots = function () {
      if (!this$1.$slots) {
        normalizeScopedSlots(
          data.scopedSlots,
          this$1.$slots = resolveSlots(children, parent)
        );
      }
      return this$1.$slots
    };

    Object.defineProperty(this, 'scopedSlots', ({
      enumerable: true,
      get: function get () {
        return normalizeScopedSlots(data.scopedSlots, this.slots())
      }
    }));

    // support for compiled functional template
    if (isCompiled) {
      // exposing $options for renderStatic()
      this.$options = options;
      // pre-resolve slots for renderSlot()
      this.$slots = this.slots();
      this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
    }
  }

  installRenderHelpers(FunctionalRenderContext.prototype);

  function createFunctionalComponent (
    Ctor,
    propsData,
    data,
    contextVm,
    children
  ) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef(propOptions)) {
      for (var key in propOptions) {
        props[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else {
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
      if (isDef(data.props)) { mergeProps(props, data.props); }
    }

    var renderContext = new FunctionalRenderContext(
      data,
      props,
      children,
      contextVm,
      Ctor
    );

    var vnode = options.render.call(null, renderContext._c, renderContext);

    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
      }
      return res
    }
  }

  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
    // #7817 clone node before setting fnContext, otherwise if the node is reused
    // (e.g. it was from a cached normal slot) the fnContext causes named slots
    // that should not be matched to match.
    var clone = cloneVNode(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    {
      (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
    }
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key];
    }
  }

  /*  */

  /*  */

  /*  */

  /*  */

  // inline hooks to be invoked on component VNodes during patch
  var componentVNodeHooks = {
    init: function init (vnode, hydrating) {
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        // kept-alive components, treat as a patch
        var mountedNode = vnode; // work around flow
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      } else {
        var child = vnode.componentInstance = createComponentInstanceForVnode(
          vnode,
          activeInstance
        );
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      }
    },

    prepatch: function prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions;
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child,
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },

    insert: function insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          // vue-router#1212
          // During updates, a kept-alive component's child components may
          // change, so directly walking the tree here may call activated hooks
          // on incorrect children. Instead we push them into a queue which will
          // be processed after the whole patch process ended.
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },

    destroy: function destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks);

  function createComponent (
    Ctor,
    data,
    context,
    children,
    tag
  ) {
    if (isUndef(Ctor)) {
      return
    }

    var baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    if (isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
    if (typeof Ctor !== 'function') {
      {
        warn$1(("Invalid Component definition: " + (String(Ctor))), context);
      }
      return
    }

    // async component
    var asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
      if (Ctor === undefined) {
        // return a placeholder node for async component, which is rendered
        // as a comment node but preserves all the raw information for the node.
        // the information will be used for async server-rendering and hydration.
        return createAsyncPlaceholder(
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {};

    // resolve constructor options in case global mixins are applied after
    // component constructor creation
    resolveConstructorOptions(Ctor);

    // transform component v-model data into props & events
    if (isDef(data.model)) {
      transformModel(Ctor.options, data);
    }

    // extract props
    var propsData = extractPropsFromVNodeData(data, Ctor, tag);

    // functional component
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children)
    }

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    var listeners = data.on;
    // replace with listeners with .native modifier
    // so it gets processed during parent component patch.
    data.on = data.nativeOn;

    if (isTrue(Ctor.options.abstract)) {
      // abstract components do not keep anything
      // other than props & listeners & slot

      // work around flow
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    // install component management hooks onto the placeholder node
    installComponentHooks(data);

    // return a placeholder vnode
    var name = Ctor.options.name || tag;
    var vnode = new VNode(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    return vnode
  }

  function createComponentInstanceForVnode (
    // we know it's MountedComponentVNode but flow doesn't
    vnode,
    // activeInstance in lifecycle state
    parent
  ) {
    var options = {
      _isComponent: true,
      _parentVnode: vnode,
      parent: parent
    };
    // check inline-template render functions
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)
  }

  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {});
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i];
      var existing = hooks[key];
      var toMerge = componentVNodeHooks[key];
      if (existing !== toMerge && !(existing && existing._merged)) {
        hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
      }
    }
  }

  function mergeHook$1 (f1, f2) {
    var merged = function (a, b) {
      // flow complains about extra args which is why we use any
      f1(a, b);
      f2(a, b);
    };
    merged._merged = true;
    return merged
  }

  // transform component v-model info (value and callback) into
  // prop and event handler respectively.
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input'
    ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    var existing = on[event];
    var callback = data.model.callback;
    if (isDef(existing)) {
      if (
        Array.isArray(existing)
          ? existing.indexOf(callback) === -1
          : existing !== callback
      ) {
        on[event] = [callback].concat(existing);
      }
    } else {
      on[event] = callback;
    }
  }

  /*  */

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;

  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
  }

  function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) {
       warn$1(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyVNode()
    }
    // warn against non-primitive key
    if (
      isDef(data) && isDef(data.key) && !isPrimitive(data.key)
    ) {
      {
        warn$1(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        // platform built-in elements
        if ( isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
          warn$1(
            ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
            context
          );
        }
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); }
      if (isDef(data)) { registerDeepBindings(data); }
      return vnode
    } else {
      return createEmptyVNode()
    }
  }

  function applyNS (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      // use default namespace inside foreignObject
      ns = undefined;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }

  /*  */

  function initRender (vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTrees = null; // v-once cached trees
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots(options._renderChildren, renderContext);
    vm.$scopedSlots = emptyObject;
    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

    // $attrs & $listeners are exposed for easier HOC creation.
    // they need to be reactive so that HOCs using them are always updated
    var parentData = parentVnode && parentVnode.data;

    /* istanbul ignore else */
    {
      defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
        !isUpdatingChildComponent && warn$1("$attrs is readonly.", vm);
      }, true);
      defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
        !isUpdatingChildComponent && warn$1("$listeners is readonly.", vm);
      }, true);
    }
  }

  var currentRenderingInstance = null;

  function renderMixin (Vue) {
    // install runtime convenience helpers
    installRenderHelpers(Vue.prototype);

    Vue.prototype.$nextTick = function (fn) {
      return nextTick(fn, this)
    };

    Vue.prototype._render = function () {
      var vm = this;
      var ref = vm.$options;
      var render = ref.render;
      var _parentVnode = ref._parentVnode;

      if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
          _parentVnode.data.scopedSlots,
          vm.$slots,
          vm.$scopedSlots
        );
      }

      // set parent vnode. this allows render functions to have access
      // to the data on the placeholder node.
      vm.$vnode = _parentVnode;
      // render self
      var vnode;
      try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance = vm;
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError(e, vm, "render");
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if ( vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError(e, vm, "renderError");
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance = null;
      }
      // if the returned array contains only a single node, allow it
      if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
      }
      // return empty vnode in case the render function errored out
      if (!(vnode instanceof VNode)) {
        if ( Array.isArray(vnode)) {
          warn$1(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
          );
        }
        vnode = createEmptyVNode();
      }
      // set parent
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  /*  */

  function ensureCtor (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol$1 && comp[Symbol.toStringTag] === 'Module')
    ) {
      comp = comp.default;
    }
    return isObject(comp)
      ? base.extend(comp)
      : comp
  }

  function createAsyncPlaceholder (
    factory,
    data,
    context,
    children,
    tag
  ) {
    var node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data: data, context: context, children: children, tag: tag };
    return node
  }

  function resolveAsyncComponent (
    factory,
    baseCtor
  ) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp
    }

    if (isDef(factory.resolved)) {
      return factory.resolved
    }

    var owner = currentRenderingInstance;
    if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
      // already pending
      factory.owners.push(owner);
    }

    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp
    }

    if (owner && !isDef(factory.owners)) {
      var owners = factory.owners = [owner];
      var sync = true;
      var timerLoading = null;
      var timerTimeout = null

      ;(owner).$on('hook:destroyed', function () { return remove(owners, owner); });

      var forceRender = function (renderCompleted) {
        for (var i = 0, l = owners.length; i < l; i++) {
          (owners[i]).$forceUpdate();
        }

        if (renderCompleted) {
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };

      var resolve = once$1(function (res) {
        // cache resolved
        factory.resolved = ensureCtor(res, baseCtor);
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });

      var reject = once$1(function (reason) {
         warn$1(
          "Failed to resolve async component: " + (String(factory)) +
          (reason ? ("\nReason: " + reason) : '')
        );
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });

      var res = factory(resolve, reject);

      if (isObject(res)) {
        if (isPromise(res)) {
          // () => Promise
          if (isUndef(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isPromise(res.component)) {
          res.component.then(resolve, reject);

          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }

          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              timerLoading = setTimeout(function () {
                timerLoading = null;
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }

          if (isDef(res.timeout)) {
            timerTimeout = setTimeout(function () {
              timerTimeout = null;
              if (isUndef(factory.resolved)) {
                reject(
                   ("timeout (" + (res.timeout) + "ms)")
                    
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false;
      // return in case resolved synchronously
      return factory.loading
        ? factory.loadingComp
        : factory.resolved
    }
  }

  /*  */

  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }

  /*  */

  /*  */

  function initEvents (vm) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;
    // init parent attached events
    var listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners(vm, listeners);
    }
  }

  var target;

  function add (event, fn) {
    target.$on(event, fn);
  }

  function remove$1 (event, fn) {
    target.$off(event, fn);
  }

  function createOnceHandler (event, fn) {
    var _target = target;
    return function onceHandler () {
      var res = fn.apply(null, arguments);
      if (res !== null) {
        _target.$off(event, onceHandler);
      }
    }
  }

  function updateComponentListeners (
    vm,
    listeners,
    oldListeners
  ) {
    target = vm;
    updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
    target = undefined;
  }

  function eventsMixin (Vue) {
    var hookRE = /^hook:/;
    Vue.prototype.$on = function (event, fn) {
      var vm = this;
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          vm.$on(event[i], fn);
        }
      } else {
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        // optimize hook:event cost by using a boolean flag marked at registration
        // instead of a hash lookup
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm
    };

    Vue.prototype.$off = function (event, fn) {
      var vm = this;
      // all
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm
      }
      // array of events
      if (Array.isArray(event)) {
        for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
          vm.$off(event[i$1], fn);
        }
        return vm
      }
      // specific event
      var cbs = vm._events[event];
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      // specific handler
      var cb;
      var i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break
        }
      }
      return vm
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      {
        var lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
          tip(
            "Event \"" + lowerCaseEvent + "\" is emitted in component " +
            (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
            "Note that HTML attributes are case-insensitive and you cannot use " +
            "v-on to listen to camelCase events when using in-DOM templates. " +
            "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
          );
        }
      }
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1);
        var info = "event handler for \"" + event + "\"";
        for (var i = 0, l = cbs.length; i < l; i++) {
          invokeWithErrorHandling(cbs[i], vm, args, vm, info);
        }
      }
      return vm
    };
  }

  /*  */

  var activeInstance = null;
  var isUpdatingChildComponent = false;

  function setActiveInstance(vm) {
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    return function () {
      activeInstance = prevActiveInstance;
    }
  }

  function initLifecycle (vm) {
    var options = vm.$options;

    // locate first non-abstract parent
    var parent = options.parent;
    if (parent && !options.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }

    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  function lifecycleMixin (Vue) {
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      var prevEl = vm.$el;
      var prevVnode = vm._vnode;
      var restoreActiveInstance = setActiveInstance(vm);
      vm._vnode = vnode;
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
      } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      restoreActiveInstance();
      // update __vue__ reference
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      // if parent is an HOC, update its $el as well
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el;
      }
      // updated hook is called by the scheduler to ensure that children are
      // updated in a parent's updated hook.
    };

    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };

    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return
      }
      callHook(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // remove self from parent
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm);
      }
      // teardown watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      // call the last hook...
      vm._isDestroyed = true;
      // invoke destroy hooks on current rendered tree
      vm.__patch__(vm._vnode, null);
      // fire destroyed hook
      callHook(vm, 'destroyed');
      // turn off all instance listeners.
      vm.$off();
      // remove __vue__ reference
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      // release circular reference (#6759)
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }

  function mountComponent (
    vm,
    el,
    hydrating
  ) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      {
        /* istanbul ignore if */
        if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
          vm.$options.el || el) {
          warn$1(
            'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn$1(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook(vm, 'beforeMount');

    var updateComponent;
    /* istanbul ignore if */
    if ( config.performance && mark) {
      updateComponent = function () {
        var name = vm._name;
        var id = vm._uid;
        var startTag = "vue-perf-start:" + id;
        var endTag = "vue-perf-end:" + id;

        mark(startTag);
        var vnode = vm._render();
        mark(endTag);
        measure(("vue " + name + " render"), startTag, endTag);

        mark(startTag);
        vm._update(vnode, hydrating);
        mark(endTag);
        measure(("vue " + name + " patch"), startTag, endTag);
      };
    } else {
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    // we set this to vm._watcher inside the watcher's constructor
    // since the watcher's initial patch may call $forceUpdate (e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher(vm, updateComponent, noop$1, {
      before: function before () {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate');
        }
      }
    }, true /* isRenderWatcher */);
    hydrating = false;

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm
  }

  function updateChildComponent (
    vm,
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    {
      isUpdatingChildComponent = true;
    }

    // determine whether component has slot children
    // we need to do this before overwriting $options._renderChildren.

    // check if there are dynamic scopedSlots (hand-written or compiled but with
    // dynamic slot names). Static scoped slots compiled from template has the
    // "$stable" marker.
    var newScopedSlots = parentVnode.data.scopedSlots;
    var oldScopedSlots = vm.$scopedSlots;
    var hasDynamicScopedSlot = !!(
      (newScopedSlots && !newScopedSlots.$stable) ||
      (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
      (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
      (!newScopedSlots && vm.$scopedSlots.$key)
    );

    // Any static slot children from the parent may have changed during parent's
    // update. Dynamic scoped slots may also have changed. In such cases, a forced
    // update is necessary to ensure correctness.
    var needsForceUpdate = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      hasDynamicScopedSlot
    );

    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render

    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;

    // update $attrs and $listeners hash
    // these are also reactive so they may trigger child update if the child
    // used them during render
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    // update props
    if (propsData && vm.$options.props) {
      toggleObserving(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props; // wtf flow?
        props[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      // keep a copy of raw propsData
      vm.$options.propsData = propsData;
    }

    // update listeners
    listeners = listeners || emptyObject;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    // resolve slots + force update if has children
    if (needsForceUpdate) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }

    {
      isUpdatingChildComponent = false;
    }
  }

  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) { return true }
    }
    return false
  }

  function activateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        activateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'activated');
    }
  }

  function deactivateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) {
        return
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'deactivated');
    }
  }

  function callHook (vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget();
    var handlers = vm.$options[hook];
    var info = hook + " hook";
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling(handlers[i], vm, null, vm, info);
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }

  /*  */

  var MAX_UPDATE_COUNT = 100;

  var queue = [];
  var activatedChildren = [];
  var has = {};
  var circular = {};
  var waiting = false;
  var flushing = false;
  var index = 0;

  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState () {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    {
      circular = {};
    }
    waiting = flushing = false;
  }

  // Async edge case #6566 requires saving the timestamp when event listeners are
  // attached. However, calling performance.now() has a perf overhead especially
  // if the page has thousands of event listeners. Instead, we take a timestamp
  // every time the scheduler flushes and use that for all event listeners
  // attached during that flush.
  var currentFlushTimestamp = 0;

  // Async edge case fix requires storing an event listener's attach timestamp.
  var getNow = Date.now;

  // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.
  // All IE versions use low-res event timestamps, and have problematic clock
  // implementations (#9632)
  if (inBrowser$1 && !isIE) {
    var performance = window.performance;
    if (
      performance &&
      typeof performance.now === 'function' &&
      getNow() > document.createEvent('Event').timeStamp
    ) {
      // if the event timestamp, although evaluated AFTER the Date.now(), is
      // smaller than it, it means the event is using a hi-res timestamp,
      // and we need to use the hi-res version for event listener timestamps as
      // well.
      getNow = function () { return performance.now(); };
    }
  }

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue () {
    currentFlushTimestamp = getNow();
    flushing = true;
    var watcher, id;

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child)
    // 2. A component's user watchers are run before its render watcher (because
    //    user watchers are created before the render watcher)
    // 3. If a component is destroyed during a parent component's watcher run,
    //    its watchers can be skipped.
    queue.sort(function (a, b) { return a.id - b.id; });

    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      if (watcher.before) {
        watcher.before();
      }
      id = watcher.id;
      has[id] = null;
      watcher.run();
      // in dev build, check and stop circular updates.
      if ( has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn$1(
            'You may have an infinite update loop ' + (
              watcher.user
                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                : "in a component render function."
            ),
            watcher.vm
          );
          break
        }
      }
    }

    // keep copies of post queues before resetting state
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice();

    resetSchedulerState();

    // call component updated and activated hooks
    callActivatedHooks(activatedQueue);
    callUpdatedHooks(updatedQueue);

    // devtool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
  }

  function callUpdatedHooks (queue) {
    var i = queue.length;
    while (i--) {
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'updated');
      }
    }
  }

  /**
   * Queue a kept-alive component that was activated during patch.
   * The queue will be processed after the entire tree has been patched.
   */
  function queueActivatedComponent (vm) {
    // setting _inactive to false here so that a render function can
    // rely on checking whether it's in an inactive tree (e.g. router-view)
    vm._inactive = false;
    activatedChildren.push(vm);
  }

  function callActivatedHooks (queue) {
    for (var i = 0; i < queue.length; i++) {
      queue[i]._inactive = true;
      activateChildComponent(queue[i], true /* true */);
    }
  }

  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher (watcher) {
    var id = watcher.id;
    if (has[id] == null) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        var i = queue.length - 1;
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }
      // queue the flush
      if (!waiting) {
        waiting = true;

        if ( !config.async) {
          flushSchedulerQueue();
          return
        }
        nextTick(flushSchedulerQueue);
      }
    }
  }

  /*  */



  var uid$2 = 0;

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */
  var Watcher = function Watcher (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$2; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression =  expOrFn.toString()
      ;
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath$1(expOrFn);
      if (!this.getter) {
        this.getter = noop$1;
         warn$1(
          "Failed watching path: \"" + expOrFn + "\" " +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get();
  };

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  Watcher.prototype.get = function get () {
    pushTarget(this);
    var value;
    var vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value
  };

  /**
   * Add a dependency to this directive.
   */
  Watcher.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * Clean up for dependency collection.
   */
  Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var i = this.deps.length;
    while (i--) {
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  Watcher.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  };

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  Watcher.prototype.run = function run () {
    if (this.active) {
      var value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          var info = "callback for watcher \"" + (this.expression) + "\"";
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  Watcher.prototype.evaluate = function evaluate () {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * Depend on all deps collected by this watcher.
   */
  Watcher.prototype.depend = function depend () {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  };

  /**
   * Remove self from all dependencies' subscriber list.
   */
  Watcher.prototype.teardown = function teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  };

  /*  */

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop$1,
    set: noop$1
  };

  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }

  function initProps (vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // root instance props should be converted
    if (!isRoot) {
      toggleObserving(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp(key, propsOptions, propsData, vm);
      /* istanbul ignore else */
      {
        var hyphenatedKey = hyphenate(key);
        if (isReservedAttribute(hyphenatedKey) ||
            config.isReservedAttr(hyphenatedKey)) {
          warn$1(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive$$1(props, key, value, function () {
          if (!isRoot && !isUpdatingChildComponent) {
            warn$1(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      if (!(key in vm)) {
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key );
    toggleObserving(true);
  }

  function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
       warn$1(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          warn$1(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) {
         warn$1(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) {
        proxy(vm, "_data", key);
      }
    }
    // observe data
    observe(data, true /* asRootData */);
  }

  function getData (data, vm) {
    // #7573 disable dep collection when invoking data getters
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
  }

  var computedWatcherOptions = { lazy: true };

  function initComputed (vm, computed) {
    // $flow-disable-line
    var watchers = vm._computedWatchers = Object.create(null);
    // computed properties are just getters during SSR
    var isSSR = isServerRendering();

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      if ( getter == null) {
        warn$1(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      if (!isSSR) {
        // create internal watcher for the computed property.
        watchers[key] = new Watcher(
          vm,
          getter || noop$1,
          noop$1,
          computedWatcherOptions
        );
      }

      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      if (!(key in vm)) {
        defineComputed(vm, key, userDef);
      } else {
        if (key in vm.$data) {
          warn$1(("The computed property \"" + key + "\" is already defined in data."), vm);
        } else if (vm.$options.props && key in vm.$options.props) {
          warn$1(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        } else if (vm.$options.methods && key in vm.$options.methods) {
          warn$1(("The computed property \"" + key + "\" is already defined as a method."), vm);
        }
      }
    }
  }

  function defineComputed (
    target,
    key,
    userDef
  ) {
    var shouldCache = !isServerRendering();
    if (typeof userDef === 'function') {
      sharedPropertyDefinition.get = shouldCache
        ? createComputedGetter(key)
        : createGetterInvoker(userDef);
      sharedPropertyDefinition.set = noop$1;
    } else {
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          : createGetterInvoker(userDef.get)
        : noop$1;
      sharedPropertyDefinition.set = userDef.set || noop$1;
    }
    if (
        sharedPropertyDefinition.set === noop$1) {
      sharedPropertyDefinition.set = function () {
        warn$1(
          ("Computed property \"" + key + "\" was assigned to but it has no setter."),
          this
        );
      };
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function createComputedGetter (key) {
    return function computedGetter () {
      var watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value
      }
    }
  }

  function createGetterInvoker(fn) {
    return function computedGetter () {
      return fn.call(this, this)
    }
  }

  function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      {
        if (typeof methods[key] !== 'function') {
          warn$1(
            "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn(props, key)) {
          warn$1(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved(key)) {
          warn$1(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop$1 : bind(methods[key], vm);
    }
  }

  function initWatch (vm, watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher (
    vm,
    expOrFn,
    handler,
    options
  ) {
    if (isPlainObject(handler)) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options)
  }

  function stateMixin (Vue) {
    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props };
    {
      dataDef.set = function () {
        warn$1(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        );
      };
      propsDef.set = function () {
        warn$1("$props is readonly.", this);
      };
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);

    Vue.prototype.$set = set;
    Vue.prototype.$delete = del;

    Vue.prototype.$watch = function (
      expOrFn,
      cb,
      options
    ) {
      var vm = this;
      if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
      }
      options = options || {};
      options.user = true;
      var watcher = new Watcher(vm, expOrFn, cb, options);
      if (options.immediate) {
        var info = "callback for immediate watcher \"" + (watcher.expression) + "\"";
        pushTarget();
        invokeWithErrorHandling(cb, vm, [watcher.value], vm, info);
        popTarget();
      }
      return function unwatchFn () {
        watcher.teardown();
      }
    };
  }

  /*  */

  var uid$3 = 0;

  function initMixin (Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3++;

      var startTag, endTag;
      /* istanbul ignore if */
      if ( config.performance && mark) {
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark(startTag);
      }

      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        );
      }
      /* istanbul ignore else */
      {
        initProxy(vm);
      }
      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook(vm, 'beforeCreate');
      initInjections(vm); // resolve injections before data/props
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook(vm, 'created');

      /* istanbul ignore if */
      if ( config.performance && mark) {
        vm._name = formatComponentName(vm, false);
        mark(endTag);
        measure(("vue " + (vm._name) + " init"), startTag, endTag);
      }

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
  }

  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions(Ctor.super);
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // super option changed,
        // need to resolve new options.
        Ctor.superOptions = superOptions;
        // check if there are any late-modified/attached options (#4976)
        var modifiedOptions = resolveModifiedOptions(Ctor);
        // update base extend options
        if (modifiedOptions) {
          extend$1(Ctor.extendOptions, modifiedOptions);
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options
  }

  function resolveModifiedOptions (Ctor) {
    var modified;
    var latest = Ctor.options;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = latest[key];
      }
    }
    return modified
  }

  function Vue (options) {
    if (
      !(this instanceof Vue)
    ) {
      warn$1('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
  }

  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  /*  */

  function initUse (Vue) {
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      if (installedPlugins.indexOf(plugin) > -1) {
        return this
      }

      // additional parameters
      var args = toArray(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin);
      return this
    };
  }

  /*  */

  function initMixin$1 (Vue) {
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this
    };
  }

  /*  */

  function initExtend (Vue) {
    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     */
    Vue.cid = 0;
    var cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var SuperId = Super.cid;
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
      }

      var name = extendOptions.name || Super.options.name;
      if ( name) {
        validateComponentName(name);
      }

      var Sub = function VueComponent (options) {
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(
        Super.options,
        extendOptions
      );
      Sub['super'] = Super;

      // For props and computed properties, we define the proxy getters on
      // the Vue instances at extension time, on the extended prototype. This
      // avoids Object.defineProperty calls for each instance created.
      if (Sub.options.props) {
        initProps$1(Sub);
      }
      if (Sub.options.computed) {
        initComputed$1(Sub);
      }

      // allow further extension/mixin/plugin usage
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      // create asset registers, so extended classes
      // can have their private assets too.
      ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type];
      });
      // enable recursive self-lookup
      if (name) {
        Sub.options.components[name] = Sub;
      }

      // keep a reference to the super options at extension time.
      // later at instantiation we can check if Super's options have
      // been updated.
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend$1({}, Sub.options);

      // cache constructor
      cachedCtors[SuperId] = Sub;
      return Sub
    };
  }

  function initProps$1 (Comp) {
    var props = Comp.options.props;
    for (var key in props) {
      proxy(Comp.prototype, "_props", key);
    }
  }

  function initComputed$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed(Comp.prototype, key, computed[key]);
    }
  }

  /*  */

  function initAssetRegisters (Vue) {
    /**
     * Create asset registration methods.
     */
    ASSET_TYPES.forEach(function (type) {
      Vue[type] = function (
        id,
        definition
      ) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          /* istanbul ignore if */
          if ( type === 'component') {
            validateComponentName(id);
          }
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition };
          }
          this.options[type + 's'][id] = definition;
          return definition
        }
      };
    });
  }

  /*  */





  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
  }

  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var entry = cache[key];
      if (entry) {
        var name = entry.name;
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
  }

  function pruneCacheEntry (
    cache,
    key,
    keys,
    current
  ) {
    var entry = cache[key];
    if (entry && (!current || entry.tag !== current.tag)) {
      entry.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }

  var patternTypes = [String, RegExp, Array];

  var KeepAlive = {
    name: 'keep-alive',
    abstract: true,

    props: {
      include: patternTypes,
      exclude: patternTypes,
      max: [String, Number]
    },

    methods: {
      cacheVNode: function cacheVNode() {
        var ref = this;
        var cache = ref.cache;
        var keys = ref.keys;
        var vnodeToCache = ref.vnodeToCache;
        var keyToCache = ref.keyToCache;
        if (vnodeToCache) {
          var tag = vnodeToCache.tag;
          var componentInstance = vnodeToCache.componentInstance;
          var componentOptions = vnodeToCache.componentOptions;
          cache[keyToCache] = {
            name: getComponentName(componentOptions),
            tag: tag,
            componentInstance: componentInstance,
          };
          keys.push(keyToCache);
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
          this.vnodeToCache = null;
        }
      }
    },

    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    destroyed: function destroyed () {
      for (var key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },

    mounted: function mounted () {
      var this$1 = this;

      this.cacheVNode();
      this.$watch('include', function (val) {
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      this.$watch('exclude', function (val) {
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    updated: function updated () {
      this.cacheVNode();
    },

    render: function render () {
      var slot = this.$slots.default;
      var vnode = getFirstComponentChild(slot);
      var componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        // check pattern
        var name = getComponentName(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches(include, name))) ||
          // excluded
          (exclude && name && matches(exclude, name))
        ) {
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = vnode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) {
          vnode.componentInstance = cache[key].componentInstance;
          // make current key freshest
          remove(keys, key);
          keys.push(key);
        } else {
          // delay setting the cache until update
          this.vnodeToCache = vnode;
          this.keyToCache = key;
        }

        vnode.data.keepAlive = true;
      }
      return vnode || (slot && slot[0])
    }
  };

  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  /*  */

  function initGlobalAPI (Vue) {
    // config
    var configDef = {};
    configDef.get = function () { return config; };
    {
      configDef.set = function () {
        warn$1(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    Object.defineProperty(Vue, 'config', configDef);

    // exposed util methods.
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
      warn: warn$1,
      extend: extend$1,
      mergeOptions: mergeOptions,
      defineReactive: defineReactive$$1
    };

    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;

    // 2.6 explicit observable API
    Vue.observable = function (obj) {
      observe(obj);
      return obj
    };

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    Vue.options._base = Vue;

    extend$1(Vue.options.components, builtInComponents);

    initUse(Vue);
    initMixin$1(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);
  }

  initGlobalAPI(Vue);

  Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', {
    get: function get () {
      /* istanbul ignore next */
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  // expose FunctionalRenderContext for ssr runtime helper installation
  Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
  });

  Vue.version = '2.6.14';

  /*  */

  // these are reserved for web because they are directly compiled away
  // during template compilation
  var isReservedAttr = makeMap('style,class');

  // attributes that should be using props for binding
  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

  var convertEnumeratedValue = function (key, value) {
    return isFalsyAttrValue(value) || value === 'false'
      ? 'false'
      // allow arbitrary string value for contenteditable
      : key === 'contenteditable' && isValidContentEditableValue(value)
        ? value
        : 'true'
  };

  var isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,' +
    'truespeed,typemustmatch,visible'
  );

  var xlinkNS = 'http://www.w3.org/1999/xlink';

  var isXlink = function (name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  var getXlinkProp = function (name) {
    return isXlink(name) ? name.slice(6, name.length) : ''
  };

  var isFalsyAttrValue = function (val) {
    return val == null || val === false
  };

  /*  */

  function genClassForVnode (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    while (isDef(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data);
      }
    }
    return renderClass(data.staticClass, data.class)
  }

  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class)
        ? [child.class, parent.class]
        : parent.class
    }
  }

  function renderClass (
    staticClass,
    dynamicClass
  ) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass))
    }
    /* istanbul ignore next */
    return ''
  }

  function concat (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass (value) {
    if (Array.isArray(value)) {
      return stringifyArray(value)
    }
    if (isObject(value)) {
      return stringifyObject(value)
    }
    if (typeof value === 'string') {
      return value
    }
    /* istanbul ignore next */
    return ''
  }

  function stringifyArray (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  /*  */

  var namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );

  var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
  };

  function getTagNamespace (tag) {
    if (isSVG(tag)) {
      return 'svg'
    }
    // basic support for MathML
    // note it doesn't support other MathML elements being component roots
    if (tag === 'math') {
      return 'math'
    }
  }

  var unknownElementCache = Object.create(null);
  function isUnknownElement (tag) {
    /* istanbul ignore if */
    if (!inBrowser$1) {
      return true
    }
    if (isReservedTag(tag)) {
      return false
    }
    tag = tag.toLowerCase();
    /* istanbul ignore if */
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType = makeMap('text,number,password,search,email,tel,url');

  /*  */

  /**
   * Query an element selector if it's not an element already.
   */
  function query (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);
      if (!selected) {
         warn$1(
          'Cannot find element: ' + el
        );
        return document.createElement('div')
      }
      return selected
    } else {
      return el
    }
  }

  /*  */

  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') {
      return elm
    }
    // false or null will remove the attribute but undefined will not
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
  }

  function createTextNode (text) {
    return document.createTextNode(text)
  }

  function createComment (text) {
    return document.createComment(text)
  }

  function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild (node, child) {
    node.removeChild(child);
  }

  function appendChild (node, child) {
    node.appendChild(child);
  }

  function parentNode (node) {
    return node.parentNode
  }

  function nextSibling (node) {
    return node.nextSibling
  }

  function tagName (node) {
    return node.tagName
  }

  function setTextContent (node, text) {
    node.textContent = text;
  }

  function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
  }

  var nodeOps = /*#__PURE__*/Object.freeze({
    createElement: createElement$1,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
  });

  /*  */

  var ref = {
    create: function create (_, vnode) {
      registerRef(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef(vnode, true);
    }
  };

  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!isDef(key)) { return }

    var vm = vnode.context;
    var ref = vnode.componentInstance || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (!Array.isArray(refs[key])) {
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) {
          // $flow-disable-line
          refs[key].push(ref);
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  /**
   * Virtual DOM patching algorithm based on Snabbdom by
   * Simon Friis Vindum (@paldepind)
   * Licensed under the MIT License
   * https://github.com/paldepind/snabbdom/blob/master/LICENSE
   *
   * modified by Evan You (@yyx990803)
   *
   * Not type-checking this because this file is perf-critical and the cost
   * of making flow understand it is not worth it.
   */

  var emptyNode = new VNode('', {}, []);

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

  function sameVnode (a, b) {
    return (
      a.key === b.key &&
      a.asyncFactory === b.asyncFactory && (
        (
          a.tag === b.tag &&
          a.isComment === b.isComment &&
          isDef(a.data) === isDef(b.data) &&
          sameInputType(a, b)
        ) || (
          isTrue(a.isAsyncPlaceholder) &&
          isUndef(b.asyncFactory.error)
        )
      )
    )
  }

  function sameInputType (a, b) {
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }

  function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
  }

  function createPatchFunction (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }
    }

    function emptyNodeAt (elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function createRmCb (childElm, listeners) {
      function remove$$1 () {
        if (--remove$$1.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove$$1.listeners = listeners;
      return remove$$1
    }

    function removeNode (el) {
      var parent = nodeOps.parentNode(el);
      // element may have already been removed due to v-html / v-text
      if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }

    function isUnknownElement$$1 (vnode, inVPre) {
      return (
        !inVPre &&
        !vnode.ns &&
        !(
          config.ignoredElements.length &&
          config.ignoredElements.some(function (ignore) {
            return isRegExp(ignore)
              ? ignore.test(vnode.tag)
              : ignore === vnode.tag
          })
        ) &&
        config.isUnknownElement(vnode.tag)
      )
    }

    var creatingElmInVPre = 0;

    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm,
      nested,
      ownerArray,
      index
    ) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // This vnode was used in a previous render!
        // now it's used as a new node, overwriting its elm would cause
        // potential patch errors down the road when it's used as an insertion
        // reference node. Instead, we clone the node on-demand before creating
        // associated DOM element for it.
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      vnode.isRootInsert = !nested; // for transition enter check
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
      }

      var data = vnode.data;
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef(tag)) {
        {
          if (data && data.pre) {
            creatingElmInVPre++;
          }
          if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
            warn$1(
              'Unknown custom element: <' + tag + '> - did you ' +
              'register the component correctly? For recursive components, ' +
              'make sure to provide the "name" option.',
              vnode.context
            );
          }
        }

        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode);

        /* istanbul ignore if */
        {
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }

        if ( data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }

    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data;
      if (isDef(i)) {
        var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
        if (isDef(i = i.hook) && isDef(i = i.init)) {
          i(vnode, false /* hydrating */);
        }
        // after calling the init hook, if the vnode is a child component
        // it should've created a child instance and mounted it. the child
        // component also has set the placeholder vnode's elm.
        // in that case we can just return the element and be done.
        if (isDef(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          insert(parentElm, vnode.elm, refElm);
          if (isTrue(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true
        }
      }
    }

    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        // empty component root.
        // skip all element-related modules except for ref (#3455)
        registerRef(vnode);
        // make sure to invoke the insert hook
        insertedVnodeQueue.push(vnode);
      }
    }

    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // hack for #4339: a reactivated component with inner transition
      // does not trigger because the inner node's created hooks are not called
      // again. It's not ideal to involve module-specific logic in here but
      // there doesn't seem to be a better way to do it.
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      // unlike a newly created component,
      // a reactivated keep-alive component doesn't insert itself
      insert(parentElm, vnode.elm, refElm);
    }

    function insert (parent, elm, ref$$1) {
      if (isDef(parent)) {
        if (isDef(ref$$1)) {
          if (nodeOps.parentNode(ref$$1) === parent) {
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else {
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        {
          checkDuplicateKeys(children);
        }
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    function isPatchable (vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag)
    }

    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (isDef(i.create)) { i.create(emptyNode, vnode); }
        if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
      }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // for slot content they should also get the scopeId from the host instance.
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
        for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
      }
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes (vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { // Text node
            removeNode(ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }

    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0;
      var newStartIdx = 0;
      var oldEndIdx = oldCh.length - 1;
      var oldStartVnode = oldCh[0];
      var oldEndVnode = oldCh[oldEndIdx];
      var newEndIdx = newCh.length - 1;
      var newStartVnode = newCh[0];
      var newEndVnode = newCh[newEndIdx];
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly is a special flag used only by <transition-group>
      // to ensure removed elements stay in correct relative positions
      // during leaving transitions
      var canMove = !removeOnly;

      {
        checkDuplicateKeys(newCh);
      }

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // same key but different element. treat as new element
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function checkDuplicateKeys (children) {
      var seenKeys = {};
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i];
        var key = vnode.key;
        if (isDef(key)) {
          if (seenKeys[key]) {
            warn$1(
              ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
              vnode.context
            );
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }

    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
      }
    }

    function patchVnode (
      oldVnode,
      vnode,
      insertedVnodeQueue,
      ownerArray,
      index,
      removeOnly
    ) {
      if (oldVnode === vnode) {
        return
      }

      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // clone reused vnode
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      var elm = vnode.elm = oldVnode.elm;

      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      // reuse element for static trees.
      // note we only do this if the vnode is cloned -
      // if the new node is not cloned it means the render functions have been
      // reset by the hot-reload-api and we need to do a proper re-render.
      if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode);
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef(data) && isPatchable(vnode)) {
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
        } else if (isDef(ch)) {
          {
            checkDuplicateKeys(ch);
          }
          if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
      }
    }

    function invokeInsertHook (vnode, queue, initial) {
      // delay insert hooks for component root nodes, invoke them after the
      // element is really inserted
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false;
    // list of modules that can skip create hook during hydration because they
    // are already rendered on the client or has no need for initialization
    // Note: style is excluded because it relies on initial clone for future
    // deep updates (#7063).
    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    // Note: this is a browser-only function so we can assume elms are DOM nodes.
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      // assert node match
      {
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false
        }
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef(i = vnode.componentInstance)) {
          // child component. it should have hydrated its own tree.
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                /* istanbul ignore if */
                if (
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                /* istanbul ignore if */
                if (
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deep class bindings for future updates
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef(vnode.tag)) {
        return vnode.tag.indexOf('vue-component') === 0 || (
          !isUnknownElement$$1(vnode, inVPre) &&
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
        )
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    return function patch (oldVnode, vnode, hydrating, removeOnly) {
      if (isUndef(vnode)) {
        if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
        return
      }

      var isInitialPatch = false;
      var insertedVnodeQueue = [];

      if (isUndef(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue);
      } else {
        var isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          // patch existing root node
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        } else {
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else {
                warn$1(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                );
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            oldVnode = emptyNodeAt(oldVnode);
          }

          // replacing existing element
          var oldElm = oldVnode.elm;
          var parentElm = nodeOps.parentNode(oldElm);

          // create new node
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm,
            nodeOps.nextSibling(oldElm)
          );

          // update parent placeholder node element, recursively
          if (isDef(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, ancestor);
                }
                // #6513
                // invoke insert hooks that may have been merged by create hooks.
                // e.g. for directives that uses the "inserted" hook.
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  // start at index 1 to avoid re-invoking component mounted hook
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // destroy old node
          if (isDef(parentElm)) {
            removeVnodes([oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm
    }
  }

  /*  */

  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives (vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };

  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }

  function _update (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode;
    var isDestroy = vnode === emptyNode;
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = [];
    var dirsWithPostpatch = [];

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // new directive, bind
        callHook$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        // existing directive, update
        dir.oldValue = oldDir.value;
        dir.oldArg = oldDir.arg;
        callHook$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else {
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // no longer present, unbind
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers = Object.create(null);

  function normalizeDirectives$1 (
    dirs,
    vm
  ) {
    var res = Object.create(null);
    if (!dirs) {
      // $flow-disable-line
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        // $flow-disable-line
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
    }
    // $flow-disable-line
    return res
  }

  function getRawDirName (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules = [
    ref,
    directives
  ];

  /*  */

  function updateAttrs (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
      return
    }
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return
    }
    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend$1({}, attrs);
    }

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur, vnode.data.pre);
      }
    }
    // #4391: in IE9, setting type can reset value for input[type=radio]
    // #6666: IE/Edge forces progress value down to 1 before setting a max
    /* istanbul ignore if */
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
      setAttr(elm, 'value', attrs.value);
    }
    for (key in oldAttrs) {
      if (isUndef(attrs[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr (el, key, value, isInPre) {
    if (isInPre || el.tagName.indexOf('-') > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      // set attribute for blank value
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        // technically allowfullscreen is a boolean attribute for <iframe>,
        // but Flash expects a value of "true" when used on <embed> tag
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, convertEnumeratedValue(key, value));
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }

  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // #7138: IE10 & 11 fires input event when setting placeholder on
      // <textarea>... block the first input event and remove the blocker
      // immediately.
      /* istanbul ignore if */
      if (
        isIE && !isIE9 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && value !== '' && !el.__ieph
      ) {
        var blocker = function (e) {
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        // $flow-disable-line
        el.__ieph = true; /* IE placeholder patched */
      }
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  /*  */

  function updateClass (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (
      isUndef(data.staticClass) &&
      isUndef(data.class) && (
        isUndef(oldData) || (
          isUndef(oldData.staticClass) &&
          isUndef(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode(vnode);

    // handle transition classes
    var transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    // set the class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  /*  */

  /*  */

  /*  */

  /*  */

  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';

  /*  */

  // normalize v-model event tokens that can only be determined at runtime.
  // it's important to place the event as the first in the array because
  // the whole point is ensuring the v-model callback gets called before
  // user-attached handlers.
  function normalizeEvents (on) {
    /* istanbul ignore if */
    if (isDef(on[RANGE_TOKEN])) {
      // IE input[type=range] only supports `change` event
      var event = isIE ? 'change' : 'input';
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    // This was originally intended to fix #4521 but no longer necessary
    // after 2.5. Keeping it for backwards compat with generated code from < 2.4
    /* istanbul ignore if */
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }

  var target$1;

  function createOnceHandler$1 (event, handler, capture) {
    var _target = target$1; // save current target element in closure
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  // #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
  // implementation and does not fire microtasks in between event propagation, so
  // safe to exclude.
  var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

  function add$1 (
    name,
    handler,
    capture,
    passive
  ) {
    // async edge case #6566: inner click event triggers patch, event handler
    // attached to outer element during patch, and triggered again. This
    // happens because browsers fire microtask ticks between event propagation.
    // the solution is simple: we save the timestamp when a handler is attached,
    // and the handler would only fire if the event passed to it was fired
    // AFTER it was attached.
    if (useMicrotaskFix) {
      var attachedTimestamp = currentFlushTimestamp;
      var original = handler;
      handler = original._wrapper = function (e) {
        if (
          // no bubbling, should always fire.
          // this is just a safety net in case event.timeStamp is unreliable in
          // certain weird environments...
          e.target === e.currentTarget ||
          // event is fired after handler attachment
          e.timeStamp >= attachedTimestamp ||
          // bail for environments that have buggy event.timeStamp implementations
          // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
          // #9681 QtWebEngine event.timeStamp is negative value
          e.timeStamp <= 0 ||
          // #9448 bail if event is fired in another document in a multi-page
          // electron/nw.js app, since event.timeStamp will be using a different
          // starting reference
          e.target.ownerDocument !== document
        ) {
          return original.apply(this, arguments)
        }
      };
    }
    target$1.addEventListener(
      name,
      handler,
      supportsPassive
        ? { capture: capture, passive: passive }
        : capture
    );
  }

  function remove$2 (
    name,
    handler,
    capture,
    _target
  ) {
    (_target || target$1).removeEventListener(
      name,
      handler._wrapper || handler,
      capture
    );
  }

  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
      return
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    target$1 = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
    target$1 = undefined;
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };

  /*  */

  var svgContainer;

  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
      return
    }
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend$1({}, props);
    }

    for (key in oldProps) {
      if (!(key in props)) {
        elm[key] = '';
      }
    }

    for (key in props) {
      cur = props[key];
      // ignore children if the node has textContent or innerHTML,
      // as these will throw away existing DOM nodes and cause removal errors
      // on subsequent patches (#3360)
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        // #6601 work around Chrome version <= 55 bug where single textNode
        // replaced by innerHTML/textContent retains its parentNode property
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value' && elm.tagName !== 'PROGRESS') {
        // store value as _value as well since
        // non-string values will be stringified
        elm._value = cur;
        // avoid resetting cursor position when value is the same
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
        // IE doesn't support innerHTML for SVG elements
        svgContainer = svgContainer || document.createElement('div');
        svgContainer.innerHTML = "<svg>" + cur + "</svg>";
        var svg = svgContainer.firstChild;
        while (elm.firstChild) {
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) {
          elm.appendChild(svg.firstChild);
        }
      } else if (
        // skip the update if old and new VDOM state is the same.
        // `value` is handled separately because the DOM value may be temporarily
        // out of sync with VDOM state due to focus, composition and modifiers.
        // This  #4521 by skipping the unnecessary `checked` update.
        cur !== oldProps[key]
      ) {
        // some property updates can throw
        // e.g. `value` on <progress> w/ non-finite value
        try {
          elm[key] = cur;
        } catch (e) {}
      }
    }
  }

  // check platforms/web/util/attrs.js acceptValue


  function shouldUpdateValue (elm, checkVal) {
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal)
    ))
  }

  function isNotInFocusAndDirty (elm, checkVal) {
    // return true when textbox (.number and .trim) loses focus and its value is
    // not equal to the updated value
    var notInFocus = true;
    // #6157
    // work around IE bug when accessing document.activeElement in an iframe
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers; // injected by v-model runtime
    if (isDef(modifiers)) {
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal)
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };

  /*  */

  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  // merge static and dynamic style data on the same vnode
  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style);
    // static style is pre-processed into an object during compilation
    // and is always a fresh object, so it's safe to merge into it
    return data.staticStyle
      ? extend$1(data.staticStyle, style)
      : style
  }

  // normalize possible array / string values into Object
  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * parent component style should be after child's
   * so that parent component's style could override it
   */
  function getStyle (vnode, checkChild) {
    var res = {};
    var styleData;

    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data))
        ) {
          extend$1(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) {
      extend$1(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
        extend$1(res, styleData);
      }
    }
    return res
  }

  /*  */

  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
    /* istanbul ignore if */
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
    } else {
      var normalizedName = normalize(name);
      if (Array.isArray(val)) {
        // Support values array created by autoprefixer, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // Set them one by one, and the browser will only set those it can recognize
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle;
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    prop = camelize(prop);
    if (prop !== 'filter' && (prop in emptyStyle)) {
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < vendorNames.length; i++) {
      var name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name
      }
    }
  });

  function updateStyle (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;

    if (isUndef(data.staticStyle) && isUndef(data.style) &&
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    // if static style exists, stylebinding already merged into it when doing normalizeStyleData
    var oldStyle = oldStaticStyle || oldStyleBinding;

    var style = normalizeStyleBinding(vnode.data.style) || {};

    // store normalized style under a different key for next diff
    // make sure to clone it if it's reactive, since the user likely wants
    // to mutate it.
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend$1({}, style)
      : style;

    var newStyle = getStyle(vnode, true);

    for (name in oldStyle) {
      if (isUndef(newStyle[name])) {
        setProp(el, name, '');
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        // ie9 setting to null has no effect, must use empty string
        setProp(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  /*  */

  var whitespaceRE = /\s+/;

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  /*  */

  function resolveTransition (def$$1) {
    if (!def$$1) {
      return
    }
    /* istanbul ignore else */
    if (typeof def$$1 === 'object') {
      var res = {};
      if (def$$1.css !== false) {
        extend$1(res, autoCssTransition(def$$1.name || 'v'));
      }
      extend$1(res, def$$1);
      return res
    } else if (typeof def$$1 === 'string') {
      return autoCssTransition(def$$1)
    }
  }

  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition = inBrowser$1 && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  // Transition property/event sniffing
  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  // binding to window is necessary to make hot reload work in IE in strict mode
  var raf = inBrowser$1
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout
    : /* istanbul ignore next */ function (fn) { return fn(); };

  function nextFrame (fn) {
    raf(function () {
      raf(fn);
    });
  }

  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }

  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) {
      remove(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }

  function whenTransitionEnds (
    el,
    expectedType,
    cb
  ) {
    var ref = getTransitionInfo(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  var transformRE = /\b(transform|all)(,|$)/;

  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el);
    // JSDOM may return undefined for transition properties
    var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
    var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
    var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);

    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null;
      propCount = type
        ? type === TRANSITION
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    var hasTransform =
      type === TRANSITION &&
      transformRE.test(styles[transitionProp + 'Property']);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  function getTimeout (delays, durations) {
    /* istanbul ignore next */
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }))
  }

  // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
  // in a locale-dependent way, using a comma instead of a dot.
  // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
  // as a floor function) causing unexpected behaviors
  function toMs (s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  /*  */

  function enter (vnode, toggleDisplay) {
    var el = vnode.elm;

    // call leave callback now
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data)) {
      return
    }

    /* istanbul ignore if */
    if (isDef(el._enterCb) || el.nodeType !== 1) {
      return
    }

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;

    // activeInstance will always be the <transition> component managing this
    // transition. One edge case to check is when the <transition> is placed
    // as the root node of a child component. In that case we need to check
    // <transition>'s parent for appear check.
    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert;

    if (isAppear && !appear && appear !== '') {
      return
    }

    var startClass = isAppear && appearClass
      ? appearClass
      : enterClass;
    var activeClass = isAppear && appearActiveClass
      ? appearActiveClass
      : enterActiveClass;
    var toClass = isAppear && appearToClass
      ? appearToClass
      : enterToClass;

    var beforeEnterHook = isAppear
      ? (beforeAppear || beforeEnter)
      : beforeEnter;
    var enterHook = isAppear
      ? (typeof appear === 'function' ? appear : enter)
      : enter;
    var afterEnterHook = isAppear
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook = isAppear
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    var explicitEnterDuration = toNumber(
      isObject(duration)
        ? duration.enter
        : duration
    );

    if ( explicitEnterDuration != null) {
      checkDuration(explicitEnterDuration, 'enter', vnode);
    }

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(enterHook);

    var cb = el._enterCb = once$1(function () {
      if (expectsCSS) {
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      // remove pending leave element on enter by injecting an insert hook
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // start enter transition
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave (vnode, rm) {
    var el = vnode.elm;

    // call enter callback now
    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      return rm()
    }

    /* istanbul ignore if */
    if (isDef(el._leaveCb)) {
      return
    }

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave;
    var leave = data.leave;
    var afterLeave = data.afterLeave;
    var leaveCancelled = data.leaveCancelled;
    var delayLeave = data.delayLeave;
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(leave);

    var explicitLeaveDuration = toNumber(
      isObject(duration)
        ? duration.leave
        : duration
    );

    if ( isDef(explicitLeaveDuration)) {
      checkDuration(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once$1(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () {
      // the delayed leave may have already been cancelled
      if (cb.cancelled) {
        return
      }
      // record leaving element
      if (!vnode.data.show && el.parentNode) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  // only used in dev mode
  function checkDuration (val, name, vnode) {
    if (typeof val !== 'number') {
      warn$1(
        "<transition> explicit " + name + " duration is not a valid number - " +
        "got " + (JSON.stringify(val)) + ".",
        vnode.context
      );
    } else if (isNaN(val)) {
      warn$1(
        "<transition> explicit " + name + " duration is NaN - " +
        'the duration expression might be incorrect.',
        vnode.context
      );
    }
  }

  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  /**
   * Normalize a transition hook's argument length. The hook may be:
   * - a merged hook (invoker) with the original in .fns
   * - a wrapped component method (check ._length)
   * - a plain function (.length)
   */
  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) {
      return false
    }
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      // invoker
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      return (fn._length || fn.length) > 1
    }
  }

  function _enter (_, vnode) {
    if (vnode.data.show !== true) {
      enter(vnode);
    }
  }

  var transition = inBrowser$1 ? {
    create: _enter,
    activate: _enter,
    remove: function remove$$1 (vnode, rm) {
      /* istanbul ignore else */
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules = [
    attrs,
    klass,
    events,
    domProps,
    style,
    transition
  ];

  /*  */

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules = platformModules.concat(baseModules);

  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

  /**
   * Not type checking this file because flow doesn't like attaching
   * properties to Elements.
   */

  /* istanbul ignore if */
  if (isIE9) {
    // http://www.matts411.com/post/internet-explorer-9-oninput/
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) {
        trigger(el, 'input');
      }
    });
  }

  var directive = {
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        // #6903
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, 'postpatch', function () {
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue);
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
          // Safari < 10.2 & UIWebView doesn't fire compositionend when
          // switching focus before confirming composition choice
          // this also fixes the issue where some browsers e.g. iOS Chrome
          // fires "change" instead of "input" on autocomplete.
          el.addEventListener('change', onCompositionEnd);
          /* istanbul ignore if */
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },

    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected(el, binding, vnode.context);
        // in case the options rendered by v-for have changed,
        // it's possible that the value is out-of-sync with the rendered options.
        // detect such cases and filter out values that no longer has a matching
        // option in the DOM.
        var prevOptions = el._vOptions;
        var curOptions = el._vOptions = [].map.call(el.options, getValue);
        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          // trigger change event if
          // no matching option found for at least one value
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, 'change');
          }
        }
      }
    }
  };

  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    /* istanbul ignore if */
    if (isIE || isEdge) {
      setTimeout(function () {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }

  function actuallySetSelected (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
       warn$1(
        "<select multiple v-model=\"" + (binding.expression) + "\"> " +
        "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
        vm
      );
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf(value, getValue(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        if (looseEqual(getValue(option), value)) {
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }

  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { return !looseEqual(o, value); })
  }

  function getValue (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  function onCompositionStart (e) {
    e.target.composing = true;
  }

  function onCompositionEnd (e) {
    // prevent triggering an input event for no reason
    if (!e.target.composing) { return }
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger (el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  /*  */

  // recursively search for possible transition defined inside the component root
  function locateNode (vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode(vnode.componentInstance._vnode)
      : vnode
  }

  var show = {
    bind: function bind (el, ref, vnode) {
      var value = ref.value;

      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) {
        vnode.data.show = true;
        enter(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      /* istanbul ignore if */
      if (!value === !oldValue) { return }
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        vnode.data.show = true;
        if (value) {
          enter(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  var platformDirectives = {
    model: directive,
    show: show
  };

  /*  */

  var transitionProps = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };

  // in case the child is also an abstract component, e.g. <keep-alive>
  // we want to recursively retrieve the real component to be rendered
  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children))
    } else {
      return vnode
    }
  }

  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options;
    // props
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    // events.
    // extract listeners and pass them directly to the transition methods
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  function placeholder (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) {
        return true
      }
    }
  }

  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

  var isVShowDirective = function (d) { return d.name === 'show'; };

  var Transition = {
    name: 'transition',
    props: transitionProps,
    abstract: true,

    render: function render (h) {
      var this$1 = this;

      var children = this.$slots.default;
      if (!children) {
        return
      }

      // filter out text nodes (possible whitespaces)
      children = children.filter(isNotTextNode);
      /* istanbul ignore if */
      if (!children.length) {
        return
      }

      // warn multiple elements
      if ( children.length > 1) {
        warn$1(
          '<transition> can only be used on a single element. Use ' +
          '<transition-group> for lists.',
          this.$parent
        );
      }

      var mode = this.mode;

      // warn invalid mode
      if (
        mode && mode !== 'in-out' && mode !== 'out-in'
      ) {
        warn$1(
          'invalid <transition> mode: ' + mode,
          this.$parent
        );
      }

      var rawChild = children[0];

      // if this is a component root node and the component's
      // parent container node also has transition, skip.
      if (hasParentTransition(this.$vnode)) {
        return rawChild
      }

      // apply transition data to child
      // use getRealChild() to ignore abstract components e.g. keep-alive
      var child = getRealChild(rawChild);
      /* istanbul ignore if */
      if (!child) {
        return rawChild
      }

      if (this._leaving) {
        return placeholder(h, rawChild)
      }

      // ensure a key that is unique to the vnode type and to this transition
      // component instance. This key will be used to remove pending leaving nodes
      // during entering.
      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      // mark v-show
      // so that the transition module can hand over the control to the directive
      if (child.data.directives && child.data.directives.some(isVShowDirective)) {
        child.data.show = true;
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) &&
        !isAsyncPlaceholder(oldChild) &&
        // #6687 component root is a comment node
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {
        // replace old child transition data with fresh one
        // important for dynamic transitions!
        var oldData = oldChild.data.transition = extend$1({}, data);
        // handle transition mode
        if (mode === 'out-in') {
          // return placeholder node and queue update when leave finishes
          this._leaving = true;
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') {
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }

      return rawChild
    }
  };

  /*  */

  var props = extend$1({
    tag: String,
    moveClass: String
  }, transitionProps);

  delete props.mode;

  var TransitionGroup = {
    props: props,

    beforeMount: function beforeMount () {
      var this$1 = this;

      var update = this._update;
      this._update = function (vnode, hydrating) {
        var restoreActiveInstance = setActiveInstance(this$1);
        // force removing pass
        this$1.__patch__(
          this$1._vnode,
          this$1.kept,
          false, // hydrating
          true // removeOnly (!important, avoids unnecessary moves)
        );
        this$1._vnode = this$1.kept;
        restoreActiveInstance();
        update.call(this$1, vnode, hydrating);
      };
    },

    render: function render (h) {
      var tag = this.tag || this.$vnode.data.tag || 'span';
      var map = Object.create(null);
      var prevChildren = this.prevChildren = this.children;
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      var transitionData = extractTransitionData(this);

      for (var i = 0; i < rawChildren.length; i++) {
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c);
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          } else {
            var opts = c.componentOptions;
            var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
            warn$1(("<transition-group> children must be keyed: <" + name + ">"));
          }
        }
      }

      if (prevChildren) {
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          c$1.data.transition = transitionData;
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        this.kept = h(tag, null, kept);
        this.removed = removed;
      }

      return h(tag, null, children)
    },

    updated: function updated () {
      var children = this.prevChildren;
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      // we divide the work into three loops to avoid mixing DOM reads and writes
      // in each iteration - which helps prevent layout thrashing.
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);

      // force reflow to put everything in position
      // assign to this to avoid being removed in tree-shaking
      // $flow-disable-line
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
            if (e && e.target !== el) {
              return
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass);
            }
          });
        }
      });
    },

    methods: {
      hasMove: function hasMove (el, moveClass) {
        /* istanbul ignore if */
        if (!hasTransition) {
          return false
        }
        /* istanbul ignore if */
        if (this._hasMove) {
          return this._hasMove
        }
        // Detect whether an element with the move class applied has
        // CSS transitions. Since the element may be inside an entering
        // transition at this very moment, we make a clone of it and remove
        // all other transition classes applied to ensure only the move class
        // is applied.
        var clone = el.cloneNode();
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
        }
        addClass(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        var info = getTransitionInfo(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  function callPendingCbs (c) {
    /* istanbul ignore if */
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    /* istanbul ignore if */
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }

  function recordPosition (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  function applyTranslation (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  var platformComponents = {
    Transition: Transition,
    TransitionGroup: TransitionGroup
  };

  /*  */

  // install platform specific utils
  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;

  // install platform runtime directives & components
  extend$1(Vue.options.directives, platformDirectives);
  extend$1(Vue.options.components, platformComponents);

  // install platform patch function
  Vue.prototype.__patch__ = inBrowser$1 ? patch : noop$1;

  // public mount method
  Vue.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && inBrowser$1 ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
  };

  // devtools global hook
  /* istanbul ignore next */
  if (inBrowser$1) {
    setTimeout(function () {
      if (config.devtools) {
        if (devtools) {
          devtools.emit('init', Vue);
        } else {
          console[console.info ? 'info' : 'log'](
            'Download the Vue Devtools extension for a better development experience:\n' +
            'https://github.com/vuejs/vue-devtools'
          );
        }
      }
      if (
        config.productionTip !== false &&
        typeof console !== 'undefined'
      ) {
        console[console.info ? 'info' : 'log'](
          "You are running Vue in development mode.\n" +
          "Make sure to turn on production mode when deploying for production.\n" +
          "See more tips at https://vuejs.org/guide/deployment.html"
        );
      }
    }, 0);
  }

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  var classKey = Class.key;
  var key$1 = Symbol('private');
  var mixins = [{
      render(){
          return this.render.apply(this, Array.prototype.slice.call(arguments));
      },
      created(){
          this.onInitialized();
      },
      beforeMount(){
          if( this.hasEventListener(ComponentEvent.BEFORE_MOUNT) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.BEFORE_MOUNT ) );
          }
          this.onBeforeMount();
      },
      mounted(){
          if( this.hasEventListener(ComponentEvent.MOUNTED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.MOUNTED ) );
          }
          this.onMounted();
      },
      beforeUpdate(){
          if( this.hasEventListener(ComponentEvent.BEFORE_UPDATE) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.BEFORE_UPDATE ) );
          }
          this.onBeforeUpdate();
      },
      updated(){
          if( this.hasEventListener(ComponentEvent.UPDATED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.UPDATED ) );
          }
          this.onUpdated();
      },
      beforeDestroy(){
          if( this.hasEventListener(ComponentEvent.BEFORE_DESTROY) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.BEFORE_DESTROY ) );
          }
          this.onBeforeUnmount();
      },
      destroyed(){
          if( this.hasEventListener(ComponentEvent.DESTROYED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.DESTROYED ) );
          }
          this.onUnmounted();
      },
      errorCaptured(){
          if( this.hasEventListener(ComponentEvent.ERROR_CAPTURED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.ERROR_CAPTURED ) );
          }
          this.onErrorCaptured();
      },
      activated(){
          if( this.hasEventListener(ComponentEvent.ACTIVATED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.ACTIVATED ) );
          }
          this.onActivated();
      },
      deactivated(){
          if( this.hasEventListener(ComponentEvent.DEACTIVATED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.DEACTIVATED ) );
          }
          this.onDeactivated();
      }
  }];

  function Component(options){
      Component.options = Vue.options;
      Vue.call(this,options);
  }

  Component.prototype = Object.create(Vue.prototype);
  Component.prototype.constructor = Component;
  Component.options = Vue.options;
  var proto = Component.prototype;

  Object.defineProperty( proto, '_init', {value:function _init(options){
      var context = options && options._parentVnode && options._parentVnode.componentOptions && options._parentVnode || {};
      var componentOptions = context.componentOptions || {};
      this[key$1] = Object.create(null);
      this[key$1].event=new EventDispatcher();
      this[key$1].initialized=false;
      this[key$1].options = componentOptions;
      this[key$1].config = context.data || {};
      this[key$1].states = {};
      var classModule = this.constructor;
      var description = classModule[classKey];
      var props = {};
      if( description ){
          var members = description.members || {};
          var data = context.data || {};
          for(var name in members ){
              var member = members[name];
              if( Class.CONSTANT.PROPERTY_ACCESSOR === member.d ){
                  if( data.props && Object.hasOwnProperty.call(data.props,name) ){
                      props[ name ] = data.props[ name ];
                  }else if( data.attrs && Object.hasOwnProperty.call(data.attrs,name) ){
                      props[ name ] = data.attrs[ name ];
                  }
              }
          }
      }

      var propsData = this.onReceiveProps( props );
      if( propsData ){
          for(var name in propsData ){
              if( Object.hasOwnProperty.call(this, name) ){
                  this[name] = propsData[name];
              }
          }
      }
      
      Vue.prototype._init.call(this,options);
      this[key$1].initialized=true;
  }});

  Object.defineProperty( proto, 'render', {value: function render(){return null}});

  Object.defineProperty( proto, 'getConfig', {value:function getConfig(){
      return this[key$1].config;
  }});

  Object.defineProperty( proto, 'isWebComponent', {value:true});

  Object.defineProperty( proto, 'onReceiveProps', {value: function onReceiveProps(props){
      return props;
  }});

  Object.defineProperty( proto, 'onInitialized', {value:function onInitialized(){}});

  Object.defineProperty( proto, 'onBeforeMount', {value:function onBeforeMount(){}});

  Object.defineProperty( proto, 'onMounted', {value:function onMounted(){}});

  Object.defineProperty( proto, 'onShouldUpdate', {value: function onShouldUpdate(newValue,oldValue){
      return newValue !== oldValue;
  }});

  Object.defineProperty( proto, 'onBeforeUpdate', {value:function onBeforeUpdate(){}});

  Object.defineProperty( proto, 'onUpdated', {value:function onUpdated(){}});

  Object.defineProperty( proto, 'onBeforeUnmount', {value:function onBeforeUnmount(){}});

  Object.defineProperty( proto, 'onUnmounted', {value:function onUnmounted(){}});

  Object.defineProperty( proto, 'onErrorCaptured', {value:function onErrorCaptured(e){}});

  Object.defineProperty( proto, 'onActivated', {value:function onActivated(){}});

  Object.defineProperty( proto, 'onDeactivated', {value:function onDeactivated(){}});

  Object.defineProperty( proto, 'reactive', {value:function reactive(name, value){
      var states = this[key$1].states;
      if( value === void 0 ){
          return Object.hasOwnProperty.call(states, name) ? states[name] : void 0;
      }else {
          var old = states[name];
          if( this[key$1].initialized ){
              if( this.onShouldUpdate(old,value) ){
                  states[name] = value;
                  this.$forceUpdate();
              }
          }else {
              states[name] = value;
          }
          return value;
      }
  }});

  Object.defineProperty( proto, 'forceUpdate', {value:function forceUpdate(){
      this.$forceUpdate();
  }});

  Object.defineProperty( proto, 'mount', {value:function mount(element){
      return this.$mount( element );
  }});

  Object.defineProperty( proto, 'slot', {value:function slot(name,scoped,called,args){
      name = name || 'default';
      if( scoped ){
          var value = this.$scopedSlots[name];
          if( called ){
              return value && typeof value === "function" ? value(args) : null;
          }
          return value;
      }
      return this.$slots[name];
  }});

  Object.defineProperty( proto, 'parent', {get:function parent(){
      return this.$parent;
  }});

  Object.defineProperty( proto, 'children', {get:function parent(){
      return this.$children;
  }});

  Object.defineProperty( proto, 'createElement', {value:function createElement(name,config,children){
      return this.$createElement(name, config, children);
  }});

  Object.defineProperty( proto, 'getElementByRefName', {value:function getElementByRefName(name){
      return this.$refs[name];
  }});

  Object.defineProperty( proto, 'addEventListener', {value:function addEventListener(type, listener,useCapture,priority,reference){
      return this[key$1].event.addEventListener(type,listener,useCapture,priority,reference);
  }});

  Object.defineProperty( proto, 'dispatchEvent', {value:function dispatchEvent(event){
      return this[key$1].event.dispatchEvent(event);
  }});

  Object.defineProperty( proto, 'removeEventListener', {value:function removeEventListener(type, listener){
      return this[key$1].event.removeEventListener(type, listener);
  }});

  Object.defineProperty( proto, 'hasEventListener', {value:function hasEventListener(type, listener){
      return this[key$1].event.hasEventListener(type, listener);
  }});

  Object.defineProperty( proto, 'on', {value:function on(type, listener){
      return this.$on(type,listener);
  }});

  Object.defineProperty( proto, 'off', {value:function off(type, listener){
      return this.$off( type, listener);
  }});

  Object.defineProperty( proto, 'emit', {value:function emit(type, args){
      return this.$emit(type, args);
  }});

  Object.defineProperty( proto, 'watch', {value:function watch(name, callback){
      return this.$watch(name, callback);
  }});

  Object.defineProperty( proto, 'nextTick', {value:function nextTick(callback){
      return this.$nextTick(callback);
  }});

  Object.defineProperty( proto, 'destroy', {value:function destroy(){
      return this.$destroy();
  }});

  Object.defineProperty( Component, 'createComponent', {value:function createComponent(options){
      options = options || {};
      options.mixins = mixins;
      var subClass = Vue.extend( options );
      return subClass;
  }});
  Class.creator(8,Component,{
  	'id':1,
  	'global':true,
  	'dynamic':false,
  	'name':'Component'
  }, false);

  var _private$1=Symbol("private");
  var members = {};
  members.enter={m:3,d:3,value:function enter(to,from){

  }};
  members.leave={m:3,d:3,value:function leave(){

  }};
  members.skin={m:3,d:4,enumerable:true,get:function skin(){
  	return new this.skinClass(this);
  }};
  members._skinClass={m:1,d:1,writable:true,value:null};
  members.skinClass={m:3,d:4,enumerable:true,get:function skinClass(){
  	return this[_private$1]._skinClass;
  },set:function skinClass(value){
  	this[_private$1]._skinClass=value;
  }};
  members.render={m:3,d:3,value:function render(){
  	return this.skin.render();
  }};
  members._init={value:function _init(options){
  (function (options){
  	Object.defineProperty(this,_private$1,{value:{'_skinClass':null}});
  Component.prototype._init.call(this,options);
  }).call(this,options);
  }};
  var View$1 = Component.createComponent({
  	name:'es-View'
  });
  Class.creator(9,View$1,{
  	'id':1,
  	'ns':'web',
  	'name':'View',
  	'private':_private$1,
  	'inherit':Component,
  	'members':members
  }, false);

  var members$1 = {};
  members$1.test={m:3,d:3,value:function test(){
  	var b = this.skin.hostComponent;
  }};
  members$1.name={m:3,d:4,enumerable:true,get:function name(){
  	return '=========MyView of MySkin=============';
  }};
  members$1.nameMyView={m:3,d:4,enumerable:true,get:function nameMyView(){
  	return 'name';
  }};
  var MyView = Component.createComponent({
  	name:'es-MyView',
  	extends:View$1
  });
  Class.creator(1,MyView,{
  	'id':1,
  	'ns':'',
  	'name':'MyView',
  	'inherit':View$1,
  	'members':members$1
  }, false);

  /*!
   * Vue.js v2.6.14
   * (c) 2014-2021 Evan You
   * Released under the MIT License.
   */
  /*  */

  var emptyObject$1 = Object.freeze({});

  // These helpers produce better VM code in JS engines due to their
  // explicitness and function inlining.
  function isUndef$1 (v) {
    return v === undefined || v === null
  }

  function isDef$1 (v) {
    return v !== undefined && v !== null
  }

  function isTrue$1 (v) {
    return v === true
  }

  function isFalse$1 (v) {
    return v === false
  }

  /**
   * Check if value is primitive.
   */
  function isPrimitive$1 (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      // $flow-disable-line
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject$1 (obj) {
    return obj !== null && typeof obj === 'object'
  }

  /**
   * Get the raw type string of a value, e.g., [object Object].
   */
  var _toString$1 = Object.prototype.toString;

  function toRawType$1 (value) {
    return _toString$1.call(value).slice(8, -1)
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject$1 (obj) {
    return _toString$1.call(obj) === '[object Object]'
  }

  function isRegExp$1 (v) {
    return _toString$1.call(v) === '[object RegExp]'
  }

  /**
   * Check if val is a valid array index.
   */
  function isValidArrayIndex$1 (val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }

  function isPromise$1 (val) {
    return (
      isDef$1(val) &&
      typeof val.then === 'function' &&
      typeof val.catch === 'function'
    )
  }

  /**
   * Convert a value to a string that is actually rendered.
   */
  function toString$1 (val) {
    return val == null
      ? ''
      : Array.isArray(val) || (isPlainObject$1(val) && val.toString === _toString$1)
        ? JSON.stringify(val, null, 2)
        : String(val)
  }

  /**
   * Convert an input value to a number for persistence.
   * If the conversion fails, return original string.
   */
  function toNumber$1 (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap$1 (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
  }

  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag$1 = makeMap$1('slot,component', true);

  /**
   * Check if an attribute is a reserved attribute.
   */
  var isReservedAttribute$1 = makeMap$1('key,ref,slot,slot-scope,is');

  /**
   * Remove an item from an array.
   */
  function remove$3 (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  /**
   * Check whether an object has the property.
   */
  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  function hasOwn$1 (obj, key) {
    return hasOwnProperty$1.call(obj, key)
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached$1 (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * Camelize a hyphen-delimited string.
   */
  var camelizeRE$1 = /-(\w)/g;
  var camelize$1 = cached$1(function (str) {
    return str.replace(camelizeRE$1, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  /**
   * Capitalize a string.
   */
  var capitalize$1 = cached$1(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE$1 = /\B([A-Z])/g;
  var hyphenate$1 = cached$1(function (str) {
    return str.replace(hyphenateRE$1, '-$1').toLowerCase()
  });

  /**
   * Simple bind polyfill for environments that do not support it,
   * e.g., PhantomJS 1.x. Technically, we don't need this anymore
   * since native bind is now performant enough in most browsers.
   * But removing it would mean breaking code that was able to run in
   * PhantomJS 1.x, so this must be kept for backward compatibility.
   */

  /* istanbul ignore next */
  function polyfillBind$1 (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
  }

  function nativeBind$1 (fn, ctx) {
    return fn.bind(ctx)
  }

  var bind$1 = Function.prototype.bind
    ? nativeBind$1
    : polyfillBind$1;

  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray$1 (list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  /**
   * Mix properties into target object.
   */
  function extend$2 (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject$1 (arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend$2(res, arr[i]);
      }
    }
    return res
  }

  /* eslint-disable no-unused-vars */

  /**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
   */
  function noop$2 (a, b, c) {}

  /**
   * Always return false.
   */
  var no$1 = function (a, b, c) { return false; };

  /* eslint-enable no-unused-vars */

  /**
   * Return the same value.
   */
  var identity$1 = function (_) { return _; };

  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   */
  function looseEqual$1 (a, b) {
    if (a === b) { return true }
    var isObjectA = isObject$1(a);
    var isObjectB = isObject$1(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual$1(e, b[i])
          })
        } else if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime()
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual$1(a[key], b[key])
          })
        } else {
          /* istanbul ignore next */
          return false
        }
      } catch (e) {
        /* istanbul ignore next */
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }

  /**
   * Return the first index at which a loosely equal value can be
   * found in the array (if value is a plain object, the array must
   * contain an object of the same shape), or -1 if it is not present.
   */
  function looseIndexOf$1 (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual$1(arr[i], val)) { return i }
    }
    return -1
  }

  /**
   * Ensure a function is called only once.
   */
  function once$2 (fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    }
  }

  var SSR_ATTR$1 = 'data-server-rendered';

  var ASSET_TYPES$1 = [
    'component',
    'directive',
    'filter'
  ];

  var LIFECYCLE_HOOKS$1 = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured',
    'serverPrefetch'
  ];

  /*  */



  var config$1 = ({
    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Show production mode tip message on boot?
     */
    productionTip: "development" !== 'production',

    /**
     * Whether to enable devtools
     */
    devtools: "development" !== 'production',

    /**
     * Whether to record perf
     */
    performance: false,

    /**
     * Error handler for watcher errors
     */
    errorHandler: null,

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,

    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: Object.create(null),

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no$1,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no$1,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no$1,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop$2,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity$1,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no$1,

    /**
     * Perform updates asynchronously. Intended to be used by Vue Test Utils
     * This will significantly reduce performance if set to false.
     */
    async: true,

    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS$1
  });

  /*  */

  /**
   * unicode letters used for parsing html tags, component names and property paths.
   * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
   * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
   */
  var unicodeRegExp$1 = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

  /**
   * Check if a string starts with $ or _
   */
  function isReserved$1 (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  /**
   * Define a property.
   */
  function def$1 (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Parse simple path.
   */
  var bailRE$1 = new RegExp(("[^" + (unicodeRegExp$1.source) + ".$_\\d]"));
  function parsePath$2 (path) {
    if (bailRE$1.test(path)) {
      return
    }
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }

  /*  */

  // can we use __proto__?
  var hasProto$1 = '__proto__' in {};

  // Browser environment sniffing
  var inBrowser$2 = typeof window !== 'undefined';
  var inWeex$1 = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform$1 = inWeex$1 && WXEnvironment.platform.toLowerCase();
  var UA$1 = inBrowser$2 && window.navigator.userAgent.toLowerCase();
  var isIE$1 = UA$1 && /msie|trident/.test(UA$1);
  var isIE9$1 = UA$1 && UA$1.indexOf('msie 9.0') > 0;
  var isEdge$1 = UA$1 && UA$1.indexOf('edge/') > 0;
  var isAndroid$1 = (UA$1 && UA$1.indexOf('android') > 0) || (weexPlatform$1 === 'android');
  var isIOS$1 = (UA$1 && /iphone|ipad|ipod|ios/.test(UA$1)) || (weexPlatform$1 === 'ios');
  var isChrome$1 = UA$1 && /chrome\/\d+/.test(UA$1) && !isEdge$1;
  var isPhantomJS$1 = UA$1 && /phantomjs/.test(UA$1);
  var isFF$1 = UA$1 && UA$1.match(/firefox\/(\d+)/);

  // Firefox has a "watch" function on Object.prototype...
  var nativeWatch$1 = ({}).watch;

  var supportsPassive$1 = false;
  if (inBrowser$2) {
    try {
      var opts$1 = {};
      Object.defineProperty(opts$1, 'passive', ({
        get: function get () {
          /* istanbul ignore next */
          supportsPassive$1 = true;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts$1);
    } catch (e) {}
  }

  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer$1;
  var isServerRendering$1 = function () {
    if (_isServer$1 === undefined) {
      /* istanbul ignore if */
      if (!inBrowser$2 && !inWeex$1 && typeof global !== 'undefined') {
        // detect presence of vue-server-renderer and avoid
        // Webpack shimming the process
        _isServer$1 = global['process'] && global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer$1 = false;
      }
    }
    return _isServer$1
  };

  // detect devtools
  var devtools$1 = inBrowser$2 && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  /* istanbul ignore next */
  function isNative$1 (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol$2 =
    typeof Symbol !== 'undefined' && isNative$1(Symbol) &&
    typeof Reflect !== 'undefined' && isNative$1(Reflect.ownKeys);

  var _Set$1;
  /* istanbul ignore if */ // $flow-disable-line
  if (typeof Set !== 'undefined' && isNative$1(Set)) {
    // use native Set when available.
    _Set$1 = Set;
  } else {
    // a non-standard Set polyfill that only works with primitive keys.
    _Set$1 = /*@__PURE__*/(function () {
      function Set () {
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) {
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) {
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () {
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  /*  */

  var warn$2 = noop$2;
  var tip$1 = noop$2;
  var generateComponentTrace$1 = (noop$2); // work around flow check
  var formatComponentName$1 = (noop$2);

  {
    var hasConsole$1 = typeof console !== 'undefined';
    var classifyRE$1 = /(?:^|[-_])(\w)/g;
    var classify$1 = function (str) { return str
      .replace(classifyRE$1, function (c) { return c.toUpperCase(); })
      .replace(/[-_]/g, ''); };

    warn$2 = function (msg, vm) {
      var trace = vm ? generateComponentTrace$1(vm) : '';

      if (config$1.warnHandler) {
        config$1.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole$1 && (!config$1.silent)) {
        console.error(("[Vue warn]: " + msg + trace));
      }
    };

    tip$1 = function (msg, vm) {
      if (hasConsole$1 && (!config$1.silent)) {
        console.warn("[Vue tip]: " + msg + (
          vm ? generateComponentTrace$1(vm) : ''
        ));
      }
    };

    formatComponentName$1 = function (vm, includeFile) {
      if (vm.$root === vm) {
        return '<Root>'
      }
      var options = typeof vm === 'function' && vm.cid != null
        ? vm.options
        : vm._isVue
          ? vm.$options || vm.constructor.options
          : vm;
      var name = options.name || options._componentTag;
      var file = options.__file;
      if (!name && file) {
        var match = file.match(/([^/\\]+)\.vue$/);
        name = match && match[1];
      }

      return (
        (name ? ("<" + (classify$1(name)) + ">") : "<Anonymous>") +
        (file && includeFile !== false ? (" at " + file) : '')
      )
    };

    var repeat$1 = function (str, n) {
      var res = '';
      while (n) {
        if (n % 2 === 1) { res += str; }
        if (n > 1) { str += str; }
        n >>= 1;
      }
      return res
    };

    generateComponentTrace$1 = function (vm) {
      if (vm._isVue && vm.$parent) {
        var tree = [];
        var currentRecursiveSequence = 0;
        while (vm) {
          if (tree.length > 0) {
            var last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) {
              currentRecursiveSequence++;
              vm = vm.$parent;
              continue
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence];
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return '\n\nfound in\n\n' + tree
          .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat$1(' ', 5 + i * 2)) + (Array.isArray(vm)
              ? ((formatComponentName$1(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
              : formatComponentName$1(vm))); })
          .join('\n')
      } else {
        return ("\n\n(found in " + (formatComponentName$1(vm)) + ")")
      }
    };
  }

  /*  */

  var uid$1 = 0;

  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   */
  var Dep$1 = function Dep () {
    this.id = uid$1++;
    this.subs = [];
  };

  Dep$1.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
  };

  Dep$1.prototype.removeSub = function removeSub (sub) {
    remove$3(this.subs, sub);
  };

  Dep$1.prototype.depend = function depend () {
    if (Dep$1.target) {
      Dep$1.target.addDep(this);
    }
  };

  Dep$1.prototype.notify = function notify () {
    // stabilize the subscriber list first
    var subs = this.subs.slice();
    if ( !config$1.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort(function (a, b) { return a.id - b.id; });
    }
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  // The current target watcher being evaluated.
  // This is globally unique because only one watcher
  // can be evaluated at a time.
  Dep$1.target = null;
  var targetStack$1 = [];

  function pushTarget$1 (target) {
    targetStack$1.push(target);
    Dep$1.target = target;
  }

  function popTarget$1 () {
    targetStack$1.pop();
    Dep$1.target = targetStack$1[targetStack$1.length - 1];
  }

  /*  */

  var VNode$1 = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  var prototypeAccessors$2 = { child: { configurable: true } };

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  prototypeAccessors$2.child.get = function () {
    return this.componentInstance
  };

  Object.defineProperties( VNode$1.prototype, prototypeAccessors$2 );

  var createEmptyVNode$1 = function (text) {
    if ( text === void 0 ) text = '';

    var node = new VNode$1();
    node.text = text;
    node.isComment = true;
    return node
  };

  function createTextVNode$1 (val) {
    return new VNode$1(undefined, undefined, undefined, String(val))
  }

  // optimized shallow clone
  // used for static nodes and slot nodes because they may be reused across
  // multiple renders, cloning them avoids errors when DOM manipulations rely
  // on their elm reference.
  function cloneVNode$1 (vnode) {
    var cloned = new VNode$1(
      vnode.tag,
      vnode.data,
      // #7975
      // clone children array to avoid mutating original in case of cloning
      // a child.
      vnode.children && vnode.children.slice(),
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned
  }

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */

  var arrayProto$1 = Array.prototype;
  var arrayMethods$1 = Object.create(arrayProto$1);

  var methodsToPatch$1 = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch$1.forEach(function (method) {
    // cache original method
    var original = arrayProto$1[method];
    def$1(arrayMethods$1, method, function mutator () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); }
      // notify change
      ob.dep.notify();
      return result
    });
  });

  /*  */

  var arrayKeys$1 = Object.getOwnPropertyNames(arrayMethods$1);

  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve$1 = true;

  function toggleObserving$1 (value) {
    shouldObserve$1 = value;
  }

  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  var Observer$1 = function Observer (value) {
    this.value = value;
    this.dep = new Dep$1();
    this.vmCount = 0;
    def$1(value, '__ob__', this);
    if (Array.isArray(value)) {
      if (hasProto$1) {
        protoAugment$1(value, arrayMethods$1);
      } else {
        copyAugment$1(value, arrayMethods$1, arrayKeys$1);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  };

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  Observer$1.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive$$1$1(obj, keys[i]);
    }
  };

  /**
   * Observe a list of Array items.
   */
  Observer$1.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe$1(items[i]);
    }
  };

  // helpers

  /**
   * Augment a target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment$1 (target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment a target Object or Array by defining
   * hidden properties.
   */
  /* istanbul ignore next */
  function copyAugment$1 (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def$1(target, key, src[key]);
    }
  }

  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe$1 (value, asRootData) {
    if (!isObject$1(value) || value instanceof VNode$1) {
      return
    }
    var ob;
    if (hasOwn$1(value, '__ob__') && value.__ob__ instanceof Observer$1) {
      ob = value.__ob__;
    } else if (
      shouldObserve$1 &&
      !isServerRendering$1() &&
      (Array.isArray(value) || isPlainObject$1(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer$1(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
  }

  /**
   * Define a reactive property on an Object.
   */
  function defineReactive$$1$1 (
    obj,
    key,
    val,
    customSetter,
    shallow
  ) {
    var dep = new Dep$1();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    var setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key];
    }

    var childOb = !shallow && observe$1(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        if (Dep$1.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray$1(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        var value = getter ? getter.call(obj) : val;
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        /* eslint-enable no-self-compare */
        if ( customSetter) {
          customSetter();
        }
        // #7981: for accessor properties without setter
        if (getter && !setter) { return }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = !shallow && observe$1(newVal);
        dep.notify();
      }
    });
  }

  /**
   * Set a property on an object. Adds the new property and
   * triggers change notification if the property doesn't
   * already exist.
   */
  function set$1 (target, key, val) {
    if (
      (isUndef$1(target) || isPrimitive$1(target))
    ) {
      warn$2(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex$1(key)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val
    }
    if (key in target && !(key in Object.prototype)) {
      target[key] = val;
      return val
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
       warn$2(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      );
      return val
    }
    if (!ob) {
      target[key] = val;
      return val
    }
    defineReactive$$1$1(ob.value, key, val);
    ob.dep.notify();
    return val
  }

  /**
   * Delete a property and trigger change if necessary.
   */
  function del$1 (target, key) {
    if (
      (isUndef$1(target) || isPrimitive$1(target))
    ) {
      warn$2(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex$1(key)) {
      target.splice(key, 1);
      return
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
       warn$2(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      );
      return
    }
    if (!hasOwn$1(target, key)) {
      return
    }
    delete target[key];
    if (!ob) {
      return
    }
    ob.dep.notify();
  }

  /**
   * Collect dependencies on array elements when the array is touched, since
   * we cannot intercept array element access like property getters.
   */
  function dependArray$1 (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        dependArray$1(e);
      }
    }
  }

  /*  */

  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats$1 = config$1.optionMergeStrategies;

  /**
   * Options with restrictions
   */
  {
    strats$1.el = strats$1.propsData = function (parent, child, vm, key) {
      if (!vm) {
        warn$2(
          "option \"" + key + "\" can only be used during instance " +
          'creation with the `new` keyword.'
        );
      }
      return defaultStrat$1(parent, child)
    };
  }

  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData$1 (to, from) {
    if (!from) { return to }
    var key, toVal, fromVal;

    var keys = hasSymbol$2
      ? Reflect.ownKeys(from)
      : Object.keys(from);

    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      // in case the object is already observed...
      if (key === '__ob__') { continue }
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn$1(to, key)) {
        set$1(to, key, fromVal);
      } else if (
        toVal !== fromVal &&
        isPlainObject$1(toVal) &&
        isPlainObject$1(fromVal)
      ) {
        mergeData$1(toVal, fromVal);
      }
    }
    return to
  }

  /**
   * Data
   */
  function mergeDataOrFn$1 (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      // in a Vue.extend merge, both should be functions
      if (!childVal) {
        return parentVal
      }
      if (!parentVal) {
        return childVal
      }
      // when parentVal & childVal are both present,
      // we need to return a function that returns the
      // merged result of both functions... no need to
      // check if parentVal is a function here because
      // it has to be a function to pass previous merges.
      return function mergedDataFn () {
        return mergeData$1(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else {
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData$1(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }

  strats$1.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {
         warn$2(
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        );

        return parentVal
      }
      return mergeDataOrFn$1(parentVal, childVal)
    }

    return mergeDataOrFn$1(parentVal, childVal, vm)
  };

  /**
   * Hooks and props are merged as arrays.
   */
  function mergeHook$2 (
    parentVal,
    childVal
  ) {
    var res = childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal
          : [childVal]
      : parentVal;
    return res
      ? dedupeHooks$1(res)
      : res
  }

  function dedupeHooks$1 (hooks) {
    var res = [];
    for (var i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }

  LIFECYCLE_HOOKS$1.forEach(function (hook) {
    strats$1[hook] = mergeHook$2;
  });

  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets$1 (
    parentVal,
    childVal,
    vm,
    key
  ) {
    var res = Object.create(parentVal || null);
    if (childVal) {
       assertObjectType$1(key, childVal, vm);
      return extend$2(res, childVal)
    } else {
      return res
    }
  }

  ASSET_TYPES$1.forEach(function (type) {
    strats$1[type + 's'] = mergeAssets$1;
  });

  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats$1.watch = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    // work around Firefox's Object.prototype.watch...
    if (parentVal === nativeWatch$1) { parentVal = undefined; }
    if (childVal === nativeWatch$1) { childVal = undefined; }
    /* istanbul ignore if */
    if (!childVal) { return Object.create(parentVal || null) }
    {
      assertObjectType$1(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = {};
    extend$2(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * Other object hashes.
   */
  strats$1.props =
  strats$1.methods =
  strats$1.inject =
  strats$1.computed = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    if (childVal && "development" !== 'production') {
      assertObjectType$1(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend$2(ret, parentVal);
    if (childVal) { extend$2(ret, childVal); }
    return ret
  };
  strats$1.provide = mergeDataOrFn$1;

  /**
   * Default strategy.
   */
  var defaultStrat$1 = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  /**
   * Validate component names
   */
  function checkComponents$1 (options) {
    for (var key in options.components) {
      validateComponentName$1(key);
    }
  }

  function validateComponentName$1 (name) {
    if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp$1.source) + "]*$")).test(name)) {
      warn$2(
        'Invalid component name: "' + name + '". Component names ' +
        'should conform to valid custom element name in html5 specification.'
      );
    }
    if (isBuiltInTag$1(name) || config$1.isReservedTag(name)) {
      warn$2(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + name
      );
    }
  }

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps$1 (options, vm) {
    var props = options.props;
    if (!props) { return }
    var res = {};
    var i, val, name;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize$1(val);
          res[name] = { type: null };
        } else {
          warn$2('props must be strings when using array syntax.');
        }
      }
    } else if (isPlainObject$1(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize$1(key);
        res[name] = isPlainObject$1(val)
          ? val
          : { type: val };
      }
    } else {
      warn$2(
        "Invalid value for option \"props\": expected an Array or an Object, " +
        "but got " + (toRawType$1(props)) + ".",
        vm
      );
    }
    options.props = res;
  }

  /**
   * Normalize all injections into Object-based format
   */
  function normalizeInject$1 (options, vm) {
    var inject = options.inject;
    if (!inject) { return }
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject$1(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject$1(val)
          ? extend$2({ from: key }, val)
          : { from: val };
      }
    } else {
      warn$2(
        "Invalid value for option \"inject\": expected an Array or an Object, " +
        "but got " + (toRawType$1(inject)) + ".",
        vm
      );
    }
  }

  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives$2 (options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def$$1 = dirs[key];
        if (typeof def$$1 === 'function') {
          dirs[key] = { bind: def$$1, update: def$$1 };
        }
      }
    }
  }

  function assertObjectType$1 (name, value, vm) {
    if (!isPlainObject$1(value)) {
      warn$2(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType$1(value)) + ".",
        vm
      );
    }
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions$1 (
    parent,
    child,
    vm
  ) {
    {
      checkComponents$1(child);
    }

    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps$1(child, vm);
    normalizeInject$1(child, vm);
    normalizeDirectives$2(child);

    // Apply extends and mixins on the child options,
    // but only if it is a raw options object that isn't
    // the result of another mergeOptions call.
    // Only merged options has the _base property.
    if (!child._base) {
      if (child.extends) {
        parent = mergeOptions$1(parent, child.extends, vm);
      }
      if (child.mixins) {
        for (var i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions$1(parent, child.mixins[i], vm);
        }
      }
    }

    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn$1(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      var strat = strats$1[key] || defaultStrat$1;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset$1 (
    options,
    type,
    id,
    warnMissing
  ) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return
    }
    var assets = options[type];
    // check local registration variations first
    if (hasOwn$1(assets, id)) { return assets[id] }
    var camelizedId = camelize$1(id);
    if (hasOwn$1(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize$1(camelizedId);
    if (hasOwn$1(assets, PascalCaseId)) { return assets[PascalCaseId] }
    // fallback to prototype chain
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if ( warnMissing && !res) {
      warn$2(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      );
    }
    return res
  }

  /*  */



  function validateProp$1 (
    key,
    propOptions,
    propsData,
    vm
  ) {
    var prop = propOptions[key];
    var absent = !hasOwn$1(propsData, key);
    var value = propsData[key];
    // boolean casting
    var booleanIndex = getTypeIndex$1(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn$1(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate$1(key)) {
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex$1(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue$1(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      var prevShouldObserve = shouldObserve$1;
      toggleObserving$1(true);
      observe$1(value);
      toggleObserving$1(prevShouldObserve);
    }
    {
      assertProp$1(prop, key, value, vm, absent);
    }
    return value
  }

  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue$1 (vm, prop, key) {
    // no default, return undefined
    if (!hasOwn$1(prop, 'default')) {
      return undefined
    }
    var def = prop.default;
    // warn against non-factory defaults for Object & Array
    if ( isObject$1(def)) {
      warn$2(
        'Invalid default value for prop "' + key + '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
        vm
      );
    }
    // the raw prop value was also undefined from previous render,
    // return previous default value to avoid unnecessary watcher trigger
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // call factory function for non-Function types
    // a value is Function if its prototype is function even across different execution context
    return typeof def === 'function' && getType$1(prop.type) !== 'Function'
      ? def.call(vm)
      : def
  }

  /**
   * Assert whether a prop is valid.
   */
  function assertProp$1 (
    prop,
    name,
    value,
    vm,
    absent
  ) {
    if (prop.required && absent) {
      warn$2(
        'Missing required prop: "' + name + '"',
        vm
      );
      return
    }
    if (value == null && !prop.required) {
      return
    }
    var type = prop.type;
    var valid = !type || type === true;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType$1(value, type[i], vm);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
      }
    }

    var haveExpectedTypes = expectedTypes.some(function (t) { return t; });
    if (!valid && haveExpectedTypes) {
      warn$2(
        getInvalidTypeMessage$1(name, value, expectedTypes),
        vm
      );
      return
    }
    var validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn$2(
          'Invalid prop: custom validator check failed for prop "' + name + '".',
          vm
        );
      }
    }
  }

  var simpleCheckRE$1 = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;

  function assertType$1 (value, type, vm) {
    var valid;
    var expectedType = getType$1(type);
    if (simpleCheckRE$1.test(expectedType)) {
      var t = typeof value;
      valid = t === expectedType.toLowerCase();
      // for primitive wrapper objects
      if (!valid && t === 'object') {
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') {
      valid = isPlainObject$1(value);
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      try {
        valid = value instanceof type;
      } catch (e) {
        warn$2('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
        valid = false;
      }
    }
    return {
      valid: valid,
      expectedType: expectedType
    }
  }

  var functionTypeCheckRE$1 = /^\s*function (\w+)/;

  /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType$1 (fn) {
    var match = fn && fn.toString().match(functionTypeCheckRE$1);
    return match ? match[1] : ''
  }

  function isSameType$1 (a, b) {
    return getType$1(a) === getType$1(b)
  }

  function getTypeIndex$1 (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      return isSameType$1(expectedTypes, type) ? 0 : -1
    }
    for (var i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType$1(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  function getInvalidTypeMessage$1 (name, value, expectedTypes) {
    var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
      " Expected " + (expectedTypes.map(capitalize$1).join(', '));
    var expectedType = expectedTypes[0];
    var receivedType = toRawType$1(value);
    // check if we need to specify expected value
    if (
      expectedTypes.length === 1 &&
      isExplicable$1(expectedType) &&
      isExplicable$1(typeof value) &&
      !isBoolean$1(expectedType, receivedType)
    ) {
      message += " with value " + (styleValue$1(value, expectedType));
    }
    message += ", got " + receivedType + " ";
    // check if we need to specify received value
    if (isExplicable$1(receivedType)) {
      message += "with value " + (styleValue$1(value, receivedType)) + ".";
    }
    return message
  }

  function styleValue$1 (value, type) {
    if (type === 'String') {
      return ("\"" + value + "\"")
    } else if (type === 'Number') {
      return ("" + (Number(value)))
    } else {
      return ("" + value)
    }
  }

  var EXPLICABLE_TYPES$1 = ['string', 'number', 'boolean'];
  function isExplicable$1 (value) {
    return EXPLICABLE_TYPES$1.some(function (elem) { return value.toLowerCase() === elem; })
  }

  function isBoolean$1 () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
  }

  /*  */

  function handleError$1 (err, vm, info) {
    // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
    // See: https://github.com/vuejs/vuex/issues/1505
    pushTarget$1();
    try {
      if (vm) {
        var cur = vm;
        while ((cur = cur.$parent)) {
          var hooks = cur.$options.errorCaptured;
          if (hooks) {
            for (var i = 0; i < hooks.length; i++) {
              try {
                var capture = hooks[i].call(cur, err, vm, info) === false;
                if (capture) { return }
              } catch (e) {
                globalHandleError$1(e, cur, 'errorCaptured hook');
              }
            }
          }
        }
      }
      globalHandleError$1(err, vm, info);
    } finally {
      popTarget$1();
    }
  }

  function invokeWithErrorHandling$1 (
    handler,
    context,
    args,
    vm,
    info
  ) {
    var res;
    try {
      res = args ? handler.apply(context, args) : handler.call(context);
      if (res && !res._isVue && isPromise$1(res) && !res._handled) {
        res.catch(function (e) { return handleError$1(e, vm, info + " (Promise/async)"); });
        // issue #9511
        // avoid catch triggering multiple times when nested calls
        res._handled = true;
      }
    } catch (e) {
      handleError$1(e, vm, info);
    }
    return res
  }

  function globalHandleError$1 (err, vm, info) {
    if (config$1.errorHandler) {
      try {
        return config$1.errorHandler.call(null, err, vm, info)
      } catch (e) {
        // if the user intentionally throws the original error in the handler,
        // do not log it twice
        if (e !== err) {
          logError$1(e, null, 'config.errorHandler');
        }
      }
    }
    logError$1(err, vm, info);
  }

  function logError$1 (err, vm, info) {
    {
      warn$2(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    /* istanbul ignore else */
    if ((inBrowser$2 || inWeex$1) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }

  /*  */

  var isUsingMicroTask$1 = false;

  var callbacks$1 = [];
  var pending$1 = false;

  function flushCallbacks$1 () {
    pending$1 = false;
    var copies = callbacks$1.slice(0);
    callbacks$1.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // Here we have async deferring wrappers using microtasks.
  // In 2.5 we used (macro) tasks (in combination with microtasks).
  // However, it has subtle problems when state is changed right before repaint
  // (e.g. #6813, out-in transitions).
  // Also, using (macro) tasks in event handler would cause some weird behaviors
  // that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
  // So we now use microtasks everywhere, again.
  // A major drawback of this tradeoff is that there are some scenarios
  // where microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690, which have workarounds)
  // or even between bubbling of the same event (#6566).
  var timerFunc$1;

  // The nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative$1(Promise)) {
    var p$1 = Promise.resolve();
    timerFunc$1 = function () {
      p$1.then(flushCallbacks$1);
      // In problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS$1) { setTimeout(noop$2); }
    };
    isUsingMicroTask$1 = true;
  } else if (!isIE$1 && typeof MutationObserver !== 'undefined' && (
    isNative$1(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // Use MutationObserver where native Promise is not available,
    // e.g. PhantomJS, iOS7, Android 4.4
    // (#6466 MutationObserver is unreliable in IE11)
    var counter$1 = 1;
    var observer$1 = new MutationObserver(flushCallbacks$1);
    var textNode$1 = document.createTextNode(String(counter$1));
    observer$1.observe(textNode$1, {
      characterData: true
    });
    timerFunc$1 = function () {
      counter$1 = (counter$1 + 1) % 2;
      textNode$1.data = String(counter$1);
    };
    isUsingMicroTask$1 = true;
  } else if (typeof setImmediate !== 'undefined' && isNative$1(setImmediate)) {
    // Fallback to setImmediate.
    // Technically it leverages the (macro) task queue,
    // but it is still a better choice than setTimeout.
    timerFunc$1 = function () {
      setImmediate(flushCallbacks$1);
    };
  } else {
    // Fallback to setTimeout.
    timerFunc$1 = function () {
      setTimeout(flushCallbacks$1, 0);
    };
  }

  function nextTick$1 (cb, ctx) {
    var _resolve;
    callbacks$1.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError$1(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending$1) {
      pending$1 = true;
      timerFunc$1();
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }

  /*  */

  /* not type checking this file because flow doesn't play well with Proxy */

  var initProxy$1;

  {
    var allowedGlobals$1 = makeMap$1(
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
      'require' // for Webpack/Browserify
    );

    var warnNonPresent$1 = function (target, key) {
      warn$2(
        "Property or method \"" + key + "\" is not defined on the instance but " +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        target
      );
    };

    var warnReservedPrefix$1 = function (target, key) {
      warn$2(
        "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
        'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
        'prevent conflicts with Vue internals. ' +
        'See: https://vuejs.org/v2/api/#data',
        target
      );
    };

    var hasProxy$1 =
      typeof Proxy !== 'undefined' && isNative$1(Proxy);

    if (hasProxy$1) {
      var isBuiltInModifier$1 = makeMap$1('stop,prevent,self,ctrl,shift,alt,meta,exact');
      config$1.keyCodes = new Proxy(config$1.keyCodes, {
        set: function set (target, key, value) {
          if (isBuiltInModifier$1(key)) {
            warn$2(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
            return false
          } else {
            target[key] = value;
            return true
          }
        }
      });
    }

    var hasHandler$1 = {
      has: function has (target, key) {
        var has = key in target;
        var isAllowed = allowedGlobals$1(key) ||
          (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
        if (!has && !isAllowed) {
          if (key in target.$data) { warnReservedPrefix$1(target, key); }
          else { warnNonPresent$1(target, key); }
        }
        return has || !isAllowed
      }
    };

    var getHandler$1 = {
      get: function get (target, key) {
        if (typeof key === 'string' && !(key in target)) {
          if (key in target.$data) { warnReservedPrefix$1(target, key); }
          else { warnNonPresent$1(target, key); }
        }
        return target[key]
      }
    };

    initProxy$1 = function initProxy (vm) {
      if (hasProxy$1) {
        // determine which proxy handler to use
        var options = vm.$options;
        var handlers = options.render && options.render._withStripped
          ? getHandler$1
          : hasHandler$1;
        vm._renderProxy = new Proxy(vm, handlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  }

  /*  */

  var seenObjects$1 = new _Set$1();

  /**
   * Recursively traverse an object to evoke all converted
   * getters, so that every nested property inside the object
   * is collected as a "deep" dependency.
   */
  function traverse$1 (val) {
    _traverse$1(val, seenObjects$1);
    seenObjects$1.clear();
  }

  function _traverse$1 (val, seen) {
    var i, keys;
    var isA = Array.isArray(val);
    if ((!isA && !isObject$1(val)) || Object.isFrozen(val) || val instanceof VNode$1) {
      return
    }
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--) { _traverse$1(val[i], seen); }
    } else {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) { _traverse$1(val[keys[i]], seen); }
    }
  }

  var mark$1;
  var measure$1;

  {
    var perf$1 = inBrowser$2 && window.performance;
    /* istanbul ignore if */
    if (
      perf$1 &&
      perf$1.mark &&
      perf$1.measure &&
      perf$1.clearMarks &&
      perf$1.clearMeasures
    ) {
      mark$1 = function (tag) { return perf$1.mark(tag); };
      measure$1 = function (name, startTag, endTag) {
        perf$1.measure(name, startTag, endTag);
        perf$1.clearMarks(startTag);
        perf$1.clearMarks(endTag);
        // perf.clearMeasures(name)
      };
    }
  }

  /*  */

  var normalizeEvent$1 = cached$1(function (name) {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
    name = once$$1 ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
      name: name,
      once: once$$1,
      capture: capture,
      passive: passive
    }
  });

  function createFnInvoker$1 (fns, vm) {
    function invoker () {
      var arguments$1 = arguments;

      var fns = invoker.fns;
      if (Array.isArray(fns)) {
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          invokeWithErrorHandling$1(cloned[i], null, arguments$1, vm, "v-on handler");
        }
      } else {
        // return handler return value for single handlers
        return invokeWithErrorHandling$1(fns, null, arguments, vm, "v-on handler")
      }
    }
    invoker.fns = fns;
    return invoker
  }

  function updateListeners$1 (
    on,
    oldOn,
    add,
    remove$$1,
    createOnceHandler,
    vm
  ) {
    var name, def$$1, cur, old, event;
    for (name in on) {
      def$$1 = cur = on[name];
      old = oldOn[name];
      event = normalizeEvent$1(name);
      if (isUndef$1(cur)) {
         warn$2(
          "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
          vm
        );
      } else if (isUndef$1(old)) {
        if (isUndef$1(cur.fns)) {
          cur = on[name] = createFnInvoker$1(cur, vm);
        }
        if (isTrue$1(event.once)) {
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef$1(on[name])) {
        event = normalizeEvent$1(name);
        remove$$1(event.name, oldOn[name], event.capture);
      }
    }
  }

  /*  */

  function mergeVNodeHook$1 (def, hookKey, hook) {
    if (def instanceof VNode$1) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];

    function wrappedHook () {
      hook.apply(this, arguments);
      // important: remove merged hook to ensure it's called only once
      // and prevent memory leak
      remove$3(invoker.fns, wrappedHook);
    }

    if (isUndef$1(oldHook)) {
      // no existing hook
      invoker = createFnInvoker$1([wrappedHook]);
    } else {
      /* istanbul ignore if */
      if (isDef$1(oldHook.fns) && isTrue$1(oldHook.merged)) {
        // already a merged invoker
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        // existing plain hook
        invoker = createFnInvoker$1([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true;
    def[hookKey] = invoker;
  }

  /*  */

  function extractPropsFromVNodeData$1 (
    data,
    Ctor,
    tag
  ) {
    // we are only extracting raw values here.
    // validation and default values are handled in the child
    // component itself.
    var propOptions = Ctor.options.props;
    if (isUndef$1(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    if (isDef$1(attrs) || isDef$1(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate$1(key);
        {
          var keyInLowerCase = key.toLowerCase();
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn$1(attrs, keyInLowerCase)
          ) {
            tip$1(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName$1(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        checkProp$1(res, props, key, altKey, true) ||
        checkProp$1(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp$1 (
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef$1(hash)) {
      if (hasOwn$1(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn$1(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /*  */

  // The template compiler attempts to minimize the need for normalization by
  // statically analyzing the template at compile time.
  //
  // For plain HTML markup, normalization can be completely skipped because the
  // generated render function is guaranteed to return Array<VNode>. There are
  // two cases where extra normalization is needed:

  // 1. When the children contains components - because a functional component
  // may return an Array instead of a single root. In this case, just a simple
  // normalization is needed - if any child is an Array, we flatten the whole
  // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
  // because functional components already normalize their own children.
  function simpleNormalizeChildren$1 (children) {
    for (var i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }

  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren$1 (children) {
    return isPrimitive$1(children)
      ? [createTextVNode$1(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren$1(children)
        : undefined
  }

  function isTextNode$1 (node) {
    return isDef$1(node) && isDef$1(node.text) && isFalse$1(node.isComment)
  }

  function normalizeArrayChildren$1 (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef$1(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      //  nested
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren$1(c, ((nestedIndex || '') + "_" + i));
          // merge adjacent text nodes
          if (isTextNode$1(c[0]) && isTextNode$1(last)) {
            res[lastIndex] = createTextVNode$1(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive$1(c)) {
        if (isTextNode$1(last)) {
          // merge adjacent text nodes
          // this is necessary for SSR hydration because text nodes are
          // essentially merged when rendered to HTML strings
          res[lastIndex] = createTextVNode$1(last.text + c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode$1(c));
        }
      } else {
        if (isTextNode$1(c) && isTextNode$1(last)) {
          // merge adjacent text nodes
          res[lastIndex] = createTextVNode$1(last.text + c.text);
        } else {
          // default key for nested array children (likely generated by v-for)
          if (isTrue$1(children._isVList) &&
            isDef$1(c.tag) &&
            isUndef$1(c.key) &&
            isDef$1(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  /*  */

  function initProvide$1 (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
    }
  }

  function initInjections$1 (vm) {
    var result = resolveInject$1(vm.$options.inject, vm);
    if (result) {
      toggleObserving$1(false);
      Object.keys(result).forEach(function (key) {
        /* istanbul ignore else */
        {
          defineReactive$$1$1(vm, key, result[key], function () {
            warn$2(
              "Avoid mutating an injected value directly since the changes will be " +
              "overwritten whenever the provided component re-renders. " +
              "injection being mutated: \"" + key + "\"",
              vm
            );
          });
        }
      });
      toggleObserving$1(true);
    }
  }

  function resolveInject$1 (inject, vm) {
    if (inject) {
      // inject is :any because flow is not smart enough to figure out cached
      var result = Object.create(null);
      var keys = hasSymbol$2
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        // #6574 in case the inject object is observed...
        if (key === '__ob__') { continue }
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn$1(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          } else {
            warn$2(("Injection \"" + key + "\" not found"), vm);
          }
        }
      }
      return result
    }
  }

  /*  */



  /**
   * Runtime helper for resolving raw children VNodes into a slot object.
   */
  function resolveSlots$1 (
    children,
    context
  ) {
    if (!children || !children.length) {
      return {}
    }
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // remove slot attribute if the node is resolved as a Vue slot node
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // ignore slots that contains only whitespace
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace$1)) {
        delete slots[name$1];
      }
    }
    return slots
  }

  function isWhitespace$1 (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  /*  */

  function isAsyncPlaceholder$1 (node) {
    return node.isComment && node.asyncFactory
  }

  /*  */

  function normalizeScopedSlots$1 (
    slots,
    normalSlots,
    prevSlots
  ) {
    var res;
    var hasNormalSlots = Object.keys(normalSlots).length > 0;
    var isStable = slots ? !!slots.$stable : !hasNormalSlots;
    var key = slots && slots.$key;
    if (!slots) {
      res = {};
    } else if (slots._normalized) {
      // fast path 1: child component re-render only, parent did not change
      return slots._normalized
    } else if (
      isStable &&
      prevSlots &&
      prevSlots !== emptyObject$1 &&
      key === prevSlots.$key &&
      !hasNormalSlots &&
      !prevSlots.$hasNormal
    ) {
      // fast path 2: stable scoped slots w/ no normal slots to proxy,
      // only need to normalize once
      return prevSlots
    } else {
      res = {};
      for (var key$1 in slots) {
        if (slots[key$1] && key$1[0] !== '$') {
          res[key$1] = normalizeScopedSlot$1(normalSlots, key$1, slots[key$1]);
        }
      }
    }
    // expose normal slots on scopedSlots
    for (var key$2 in normalSlots) {
      if (!(key$2 in res)) {
        res[key$2] = proxyNormalSlot$1(normalSlots, key$2);
      }
    }
    // avoriaz seems to mock a non-extensible $scopedSlots object
    // and when that is passed down this would cause an error
    if (slots && Object.isExtensible(slots)) {
      (slots)._normalized = res;
    }
    def$1(res, '$stable', isStable);
    def$1(res, '$key', key);
    def$1(res, '$hasNormal', hasNormalSlots);
    return res
  }

  function normalizeScopedSlot$1(normalSlots, key, fn) {
    var normalized = function () {
      var res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === 'object' && !Array.isArray(res)
        ? [res] // single vnode
        : normalizeChildren$1(res);
      var vnode = res && res[0];
      return res && (
        !vnode ||
        (res.length === 1 && vnode.isComment && !isAsyncPlaceholder$1(vnode)) // #9658, #10391
      ) ? undefined
        : res
    };
    // this is a slot using the new v-slot syntax without scope. although it is
    // compiled as a scoped slot, render fn users would expect it to be present
    // on this.$slots because the usage is semantically a normal slot.
    if (fn.proxy) {
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized
  }

  function proxyNormalSlot$1(slots, key) {
    return function () { return slots[key]; }
  }

  /*  */

  /**
   * Runtime helper for rendering v-for lists.
   */
  function renderList$1 (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject$1(val)) {
      if (hasSymbol$2 && val[Symbol.iterator]) {
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    if (!isDef$1(ret)) {
      ret = [];
    }
    (ret)._isVList = true;
    return ret
  }

  /*  */

  /**
   * Runtime helper for rendering <slot>
   */
  function renderSlot$1 (
    name,
    fallbackRender,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) {
      // scoped slot
      props = props || {};
      if (bindObject) {
        if ( !isObject$1(bindObject)) {
          warn$2('slot v-bind without argument expects an Object', this);
        }
        props = extend$2(extend$2({}, bindObject), props);
      }
      nodes =
        scopedSlotFn(props) ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    } else {
      nodes =
        this.$slots[name] ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    }

    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /*  */

  /**
   * Runtime helper for resolving filters
   */
  function resolveFilter$1 (id) {
    return resolveAsset$1(this.$options, 'filters', id, true) || identity$1
  }

  /*  */

  function isKeyNotMatch$1 (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  /**
   * Runtime helper for checking keyCodes from config.
   * exposed as Vue.prototype._k
   * passing in eventKeyName as last argument separately for backwards compat
   */
  function checkKeyCodes$1 (
    eventKeyCode,
    key,
    builtInKeyCode,
    eventKeyName,
    builtInKeyName
  ) {
    var mappedKeyCode = config$1.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config$1.keyCodes[key]) {
      return isKeyNotMatch$1(builtInKeyName, eventKeyName)
    } else if (mappedKeyCode) {
      return isKeyNotMatch$1(mappedKeyCode, eventKeyCode)
    } else if (eventKeyName) {
      return hyphenate$1(eventKeyName) !== key
    }
    return eventKeyCode === undefined
  }

  /*  */

  /**
   * Runtime helper for merging v-bind="object" into a VNode's data.
   */
  function bindObjectProps$1 (
    data,
    tag,
    value,
    asProp,
    isSync
  ) {
    if (value) {
      if (!isObject$1(value)) {
         warn$2(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject$1(value);
        }
        var hash;
        var loop = function ( key ) {
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute$1(key)
          ) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config$1.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          var camelizedKey = camelize$1(key);
          var hyphenatedKey = hyphenate$1(key);
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
            hash[key] = value[key];

            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) loop( key );
      }
    }
    return data
  }

  /*  */

  /**
   * Runtime helper for rendering static trees.
   */
  function renderStatic$1 (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    if (tree && !isInFor) {
      return tree
    }
    // otherwise, render a fresh tree.
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic$1(tree, ("__static__" + index), false);
    return tree
  }

  /**
   * Runtime helper for v-once.
   * Effectively it means marking the node as static with a unique key.
   */
  function markOnce$1 (
    tree,
    index,
    key
  ) {
    markStatic$1(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  }

  function markStatic$1 (
    tree,
    key,
    isOnce
  ) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode$1(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode$1(tree, key, isOnce);
    }
  }

  function markStaticNode$1 (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  /*  */

  function bindObjectListeners$1 (data, value) {
    if (value) {
      if (!isPlainObject$1(value)) {
         warn$2(
          'v-on without argument expects an Object value',
          this
        );
      } else {
        var on = data.on = data.on ? extend$2({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  /*  */

  function resolveScopedSlots$1 (
    fns, // see flow/vnode
    res,
    // the following are added in 2.6
    hasDynamicKeys,
    contentHashKey
  ) {
    res = res || { $stable: !hasDynamicKeys };
    for (var i = 0; i < fns.length; i++) {
      var slot = fns[i];
      if (Array.isArray(slot)) {
        resolveScopedSlots$1(slot, res, hasDynamicKeys);
      } else if (slot) {
        // marker for reverse proxying v-slot without scope on this.$slots
        if (slot.proxy) {
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn;
      }
    }
    if (contentHashKey) {
      (res).$key = contentHashKey;
    }
    return res
  }

  /*  */

  function bindDynamicKeys$1 (baseObj, values) {
    for (var i = 0; i < values.length; i += 2) {
      var key = values[i];
      if (typeof key === 'string' && key) {
        baseObj[values[i]] = values[i + 1];
      } else if ( key !== '' && key !== null) {
        // null is a special value for explicitly removing a binding
        warn$2(
          ("Invalid value for dynamic directive argument (expected string or null): " + key),
          this
        );
      }
    }
    return baseObj
  }

  // helper to dynamically append modifier runtime markers to event names.
  // ensure only append when value is already string, otherwise it will be cast
  // to string and cause the type check to miss.
  function prependModifier$1 (value, symbol) {
    return typeof value === 'string' ? symbol + value : value
  }

  /*  */

  function installRenderHelpers$1 (target) {
    target._o = markOnce$1;
    target._n = toNumber$1;
    target._s = toString$1;
    target._l = renderList$1;
    target._t = renderSlot$1;
    target._q = looseEqual$1;
    target._i = looseIndexOf$1;
    target._m = renderStatic$1;
    target._f = resolveFilter$1;
    target._k = checkKeyCodes$1;
    target._b = bindObjectProps$1;
    target._v = createTextVNode$1;
    target._e = createEmptyVNode$1;
    target._u = resolveScopedSlots$1;
    target._g = bindObjectListeners$1;
    target._d = bindDynamicKeys$1;
    target._p = prependModifier$1;
  }

  /*  */

  function FunctionalRenderContext$1 (
    data,
    props,
    children,
    parent,
    Ctor
  ) {
    var this$1 = this;

    var options = Ctor.options;
    // ensure the createElement function in functional components
    // gets a unique context - this is necessary for correct named slot check
    var contextVm;
    if (hasOwn$1(parent, '_uid')) {
      contextVm = Object.create(parent);
      // $flow-disable-line
      contextVm._original = parent;
    } else {
      // the context vm passed in is a functional context as well.
      // in this case we want to make sure we are able to get a hold to the
      // real context instance.
      contextVm = parent;
      // $flow-disable-line
      parent = parent._original;
    }
    var isCompiled = isTrue$1(options._compiled);
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject$1;
    this.injections = resolveInject$1(options.inject, parent);
    this.slots = function () {
      if (!this$1.$slots) {
        normalizeScopedSlots$1(
          data.scopedSlots,
          this$1.$slots = resolveSlots$1(children, parent)
        );
      }
      return this$1.$slots
    };

    Object.defineProperty(this, 'scopedSlots', ({
      enumerable: true,
      get: function get () {
        return normalizeScopedSlots$1(data.scopedSlots, this.slots())
      }
    }));

    // support for compiled functional template
    if (isCompiled) {
      // exposing $options for renderStatic()
      this.$options = options;
      // pre-resolve slots for renderSlot()
      this.$slots = this.slots();
      this.$scopedSlots = normalizeScopedSlots$1(data.scopedSlots, this.$slots);
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement$2(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      this._c = function (a, b, c, d) { return createElement$2(contextVm, a, b, c, d, needNormalization); };
    }
  }

  installRenderHelpers$1(FunctionalRenderContext$1.prototype);

  function createFunctionalComponent$1 (
    Ctor,
    propsData,
    data,
    contextVm,
    children
  ) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef$1(propOptions)) {
      for (var key in propOptions) {
        props[key] = validateProp$1(key, propOptions, propsData || emptyObject$1);
      }
    } else {
      if (isDef$1(data.attrs)) { mergeProps$1(props, data.attrs); }
      if (isDef$1(data.props)) { mergeProps$1(props, data.props); }
    }

    var renderContext = new FunctionalRenderContext$1(
      data,
      props,
      children,
      contextVm,
      Ctor
    );

    var vnode = options.render.call(null, renderContext._c, renderContext);

    if (vnode instanceof VNode$1) {
      return cloneAndMarkFunctionalResult$1(vnode, data, renderContext.parent, options, renderContext)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren$1(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult$1(vnodes[i], data, renderContext.parent, options, renderContext);
      }
      return res
    }
  }

  function cloneAndMarkFunctionalResult$1 (vnode, data, contextVm, options, renderContext) {
    // #7817 clone node before setting fnContext, otherwise if the node is reused
    // (e.g. it was from a cached normal slot) the fnContext causes named slots
    // that should not be matched to match.
    var clone = cloneVNode$1(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    {
      (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
    }
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  function mergeProps$1 (to, from) {
    for (var key in from) {
      to[camelize$1(key)] = from[key];
    }
  }

  /*  */

  /*  */

  /*  */

  /*  */

  // inline hooks to be invoked on component VNodes during patch
  var componentVNodeHooks$1 = {
    init: function init (vnode, hydrating) {
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        // kept-alive components, treat as a patch
        var mountedNode = vnode; // work around flow
        componentVNodeHooks$1.prepatch(mountedNode, mountedNode);
      } else {
        var child = vnode.componentInstance = createComponentInstanceForVnode$1(
          vnode,
          activeInstance$1
        );
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      }
    },

    prepatch: function prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions;
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent$1(
        child,
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },

    insert: function insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook$2(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          // vue-router#1212
          // During updates, a kept-alive component's child components may
          // change, so directly walking the tree here may call activated hooks
          // on incorrect children. Instead we push them into a queue which will
          // be processed after the whole patch process ended.
          queueActivatedComponent$1(componentInstance);
        } else {
          activateChildComponent$1(componentInstance, true /* direct */);
        }
      }
    },

    destroy: function destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent$1(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge$1 = Object.keys(componentVNodeHooks$1);

  function createComponent$1 (
    Ctor,
    data,
    context,
    children,
    tag
  ) {
    if (isUndef$1(Ctor)) {
      return
    }

    var baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    if (isObject$1(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
    if (typeof Ctor !== 'function') {
      {
        warn$2(("Invalid Component definition: " + (String(Ctor))), context);
      }
      return
    }

    // async component
    var asyncFactory;
    if (isUndef$1(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent$1(asyncFactory, baseCtor);
      if (Ctor === undefined) {
        // return a placeholder node for async component, which is rendered
        // as a comment node but preserves all the raw information for the node.
        // the information will be used for async server-rendering and hydration.
        return createAsyncPlaceholder$1(
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {};

    // resolve constructor options in case global mixins are applied after
    // component constructor creation
    resolveConstructorOptions$1(Ctor);

    // transform component v-model data into props & events
    if (isDef$1(data.model)) {
      transformModel$1(Ctor.options, data);
    }

    // extract props
    var propsData = extractPropsFromVNodeData$1(data, Ctor, tag);

    // functional component
    if (isTrue$1(Ctor.options.functional)) {
      return createFunctionalComponent$1(Ctor, propsData, data, context, children)
    }

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    var listeners = data.on;
    // replace with listeners with .native modifier
    // so it gets processed during parent component patch.
    data.on = data.nativeOn;

    if (isTrue$1(Ctor.options.abstract)) {
      // abstract components do not keep anything
      // other than props & listeners & slot

      // work around flow
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    // install component management hooks onto the placeholder node
    installComponentHooks$1(data);

    // return a placeholder vnode
    var name = Ctor.options.name || tag;
    var vnode = new VNode$1(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    return vnode
  }

  function createComponentInstanceForVnode$1 (
    // we know it's MountedComponentVNode but flow doesn't
    vnode,
    // activeInstance in lifecycle state
    parent
  ) {
    var options = {
      _isComponent: true,
      _parentVnode: vnode,
      parent: parent
    };
    // check inline-template render functions
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef$1(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)
  }

  function installComponentHooks$1 (data) {
    var hooks = data.hook || (data.hook = {});
    for (var i = 0; i < hooksToMerge$1.length; i++) {
      var key = hooksToMerge$1[i];
      var existing = hooks[key];
      var toMerge = componentVNodeHooks$1[key];
      if (existing !== toMerge && !(existing && existing._merged)) {
        hooks[key] = existing ? mergeHook$1$1(toMerge, existing) : toMerge;
      }
    }
  }

  function mergeHook$1$1 (f1, f2) {
    var merged = function (a, b) {
      // flow complains about extra args which is why we use any
      f1(a, b);
      f2(a, b);
    };
    merged._merged = true;
    return merged
  }

  // transform component v-model info (value and callback) into
  // prop and event handler respectively.
  function transformModel$1 (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input'
    ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    var existing = on[event];
    var callback = data.model.callback;
    if (isDef$1(existing)) {
      if (
        Array.isArray(existing)
          ? existing.indexOf(callback) === -1
          : existing !== callback
      ) {
        on[event] = [callback].concat(existing);
      }
    } else {
      on[event] = callback;
    }
  }

  /*  */

  var SIMPLE_NORMALIZE$1 = 1;
  var ALWAYS_NORMALIZE$1 = 2;

  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement$2 (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive$1(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue$1(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE$1;
    }
    return _createElement$1(context, tag, data, children, normalizationType)
  }

  function _createElement$1 (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef$1(data) && isDef$1((data).__ob__)) {
       warn$2(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode$1()
    }
    // object syntax in v-bind
    if (isDef$1(data) && isDef$1(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyVNode$1()
    }
    // warn against non-primitive key
    if (
      isDef$1(data) && isDef$1(data.key) && !isPrimitive$1(data.key)
    ) {
      {
        warn$2(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE$1) {
      children = normalizeChildren$1(children);
    } else if (normalizationType === SIMPLE_NORMALIZE$1) {
      children = simpleNormalizeChildren$1(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config$1.getTagNamespace(tag);
      if (config$1.isReservedTag(tag)) {
        // platform built-in elements
        if ( isDef$1(data) && isDef$1(data.nativeOn) && data.tag !== 'component') {
          warn$2(
            ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
            context
          );
        }
        vnode = new VNode$1(
          config$1.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef$1(Ctor = resolveAsset$1(context.$options, 'components', tag))) {
        // component
        vnode = createComponent$1(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode$1(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      // direct component options / constructor
      vnode = createComponent$1(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef$1(vnode)) {
      if (isDef$1(ns)) { applyNS$1(vnode, ns); }
      if (isDef$1(data)) { registerDeepBindings$1(data); }
      return vnode
    } else {
      return createEmptyVNode$1()
    }
  }

  function applyNS$1 (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      // use default namespace inside foreignObject
      ns = undefined;
      force = true;
    }
    if (isDef$1(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef$1(child.tag) && (
          isUndef$1(child.ns) || (isTrue$1(force) && child.tag !== 'svg'))) {
          applyNS$1(child, ns, force);
        }
      }
    }
  }

  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings$1 (data) {
    if (isObject$1(data.style)) {
      traverse$1(data.style);
    }
    if (isObject$1(data.class)) {
      traverse$1(data.class);
    }
  }

  /*  */

  function initRender$1 (vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTrees = null; // v-once cached trees
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots$1(options._renderChildren, renderContext);
    vm.$scopedSlots = emptyObject$1;
    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = function (a, b, c, d) { return createElement$2(vm, a, b, c, d, false); };
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = function (a, b, c, d) { return createElement$2(vm, a, b, c, d, true); };

    // $attrs & $listeners are exposed for easier HOC creation.
    // they need to be reactive so that HOCs using them are always updated
    var parentData = parentVnode && parentVnode.data;

    /* istanbul ignore else */
    {
      defineReactive$$1$1(vm, '$attrs', parentData && parentData.attrs || emptyObject$1, function () {
        !isUpdatingChildComponent$1 && warn$2("$attrs is readonly.", vm);
      }, true);
      defineReactive$$1$1(vm, '$listeners', options._parentListeners || emptyObject$1, function () {
        !isUpdatingChildComponent$1 && warn$2("$listeners is readonly.", vm);
      }, true);
    }
  }

  var currentRenderingInstance$1 = null;

  function renderMixin$1 (Vue) {
    // install runtime convenience helpers
    installRenderHelpers$1(Vue.prototype);

    Vue.prototype.$nextTick = function (fn) {
      return nextTick$1(fn, this)
    };

    Vue.prototype._render = function () {
      var vm = this;
      var ref = vm.$options;
      var render = ref.render;
      var _parentVnode = ref._parentVnode;

      if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots$1(
          _parentVnode.data.scopedSlots,
          vm.$slots,
          vm.$scopedSlots
        );
      }

      // set parent vnode. this allows render functions to have access
      // to the data on the placeholder node.
      vm.$vnode = _parentVnode;
      // render self
      var vnode;
      try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance$1 = vm;
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError$1(e, vm, "render");
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if ( vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError$1(e, vm, "renderError");
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance$1 = null;
      }
      // if the returned array contains only a single node, allow it
      if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
      }
      // return empty vnode in case the render function errored out
      if (!(vnode instanceof VNode$1)) {
        if ( Array.isArray(vnode)) {
          warn$2(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
          );
        }
        vnode = createEmptyVNode$1();
      }
      // set parent
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  /*  */

  function ensureCtor$1 (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol$2 && comp[Symbol.toStringTag] === 'Module')
    ) {
      comp = comp.default;
    }
    return isObject$1(comp)
      ? base.extend(comp)
      : comp
  }

  function createAsyncPlaceholder$1 (
    factory,
    data,
    context,
    children,
    tag
  ) {
    var node = createEmptyVNode$1();
    node.asyncFactory = factory;
    node.asyncMeta = { data: data, context: context, children: children, tag: tag };
    return node
  }

  function resolveAsyncComponent$1 (
    factory,
    baseCtor
  ) {
    if (isTrue$1(factory.error) && isDef$1(factory.errorComp)) {
      return factory.errorComp
    }

    if (isDef$1(factory.resolved)) {
      return factory.resolved
    }

    var owner = currentRenderingInstance$1;
    if (owner && isDef$1(factory.owners) && factory.owners.indexOf(owner) === -1) {
      // already pending
      factory.owners.push(owner);
    }

    if (isTrue$1(factory.loading) && isDef$1(factory.loadingComp)) {
      return factory.loadingComp
    }

    if (owner && !isDef$1(factory.owners)) {
      var owners = factory.owners = [owner];
      var sync = true;
      var timerLoading = null;
      var timerTimeout = null

      ;(owner).$on('hook:destroyed', function () { return remove$3(owners, owner); });

      var forceRender = function (renderCompleted) {
        for (var i = 0, l = owners.length; i < l; i++) {
          (owners[i]).$forceUpdate();
        }

        if (renderCompleted) {
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };

      var resolve = once$2(function (res) {
        // cache resolved
        factory.resolved = ensureCtor$1(res, baseCtor);
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });

      var reject = once$2(function (reason) {
         warn$2(
          "Failed to resolve async component: " + (String(factory)) +
          (reason ? ("\nReason: " + reason) : '')
        );
        if (isDef$1(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });

      var res = factory(resolve, reject);

      if (isObject$1(res)) {
        if (isPromise$1(res)) {
          // () => Promise
          if (isUndef$1(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isPromise$1(res.component)) {
          res.component.then(resolve, reject);

          if (isDef$1(res.error)) {
            factory.errorComp = ensureCtor$1(res.error, baseCtor);
          }

          if (isDef$1(res.loading)) {
            factory.loadingComp = ensureCtor$1(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              timerLoading = setTimeout(function () {
                timerLoading = null;
                if (isUndef$1(factory.resolved) && isUndef$1(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }

          if (isDef$1(res.timeout)) {
            timerTimeout = setTimeout(function () {
              timerTimeout = null;
              if (isUndef$1(factory.resolved)) {
                reject(
                   ("timeout (" + (res.timeout) + "ms)")
                    
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false;
      // return in case resolved synchronously
      return factory.loading
        ? factory.loadingComp
        : factory.resolved
    }
  }

  /*  */

  function getFirstComponentChild$1 (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef$1(c) && (isDef$1(c.componentOptions) || isAsyncPlaceholder$1(c))) {
          return c
        }
      }
    }
  }

  /*  */

  /*  */

  function initEvents$1 (vm) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;
    // init parent attached events
    var listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners$1(vm, listeners);
    }
  }

  var target$2;

  function add$2 (event, fn) {
    target$2.$on(event, fn);
  }

  function remove$1$1 (event, fn) {
    target$2.$off(event, fn);
  }

  function createOnceHandler$2 (event, fn) {
    var _target = target$2;
    return function onceHandler () {
      var res = fn.apply(null, arguments);
      if (res !== null) {
        _target.$off(event, onceHandler);
      }
    }
  }

  function updateComponentListeners$1 (
    vm,
    listeners,
    oldListeners
  ) {
    target$2 = vm;
    updateListeners$1(listeners, oldListeners || {}, add$2, remove$1$1, createOnceHandler$2, vm);
    target$2 = undefined;
  }

  function eventsMixin$1 (Vue) {
    var hookRE = /^hook:/;
    Vue.prototype.$on = function (event, fn) {
      var vm = this;
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          vm.$on(event[i], fn);
        }
      } else {
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        // optimize hook:event cost by using a boolean flag marked at registration
        // instead of a hash lookup
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm
    };

    Vue.prototype.$off = function (event, fn) {
      var vm = this;
      // all
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm
      }
      // array of events
      if (Array.isArray(event)) {
        for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
          vm.$off(event[i$1], fn);
        }
        return vm
      }
      // specific event
      var cbs = vm._events[event];
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      // specific handler
      var cb;
      var i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break
        }
      }
      return vm
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      {
        var lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
          tip$1(
            "Event \"" + lowerCaseEvent + "\" is emitted in component " +
            (formatComponentName$1(vm)) + " but the handler is registered for \"" + event + "\". " +
            "Note that HTML attributes are case-insensitive and you cannot use " +
            "v-on to listen to camelCase events when using in-DOM templates. " +
            "You should probably use \"" + (hyphenate$1(event)) + "\" instead of \"" + event + "\"."
          );
        }
      }
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray$1(cbs) : cbs;
        var args = toArray$1(arguments, 1);
        var info = "event handler for \"" + event + "\"";
        for (var i = 0, l = cbs.length; i < l; i++) {
          invokeWithErrorHandling$1(cbs[i], vm, args, vm, info);
        }
      }
      return vm
    };
  }

  /*  */

  var activeInstance$1 = null;
  var isUpdatingChildComponent$1 = false;

  function setActiveInstance$1(vm) {
    var prevActiveInstance = activeInstance$1;
    activeInstance$1 = vm;
    return function () {
      activeInstance$1 = prevActiveInstance;
    }
  }

  function initLifecycle$1 (vm) {
    var options = vm.$options;

    // locate first non-abstract parent
    var parent = options.parent;
    if (parent && !options.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }

    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  function lifecycleMixin$1 (Vue) {
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      var prevEl = vm.$el;
      var prevVnode = vm._vnode;
      var restoreActiveInstance = setActiveInstance$1(vm);
      vm._vnode = vnode;
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
      } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      restoreActiveInstance();
      // update __vue__ reference
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      // if parent is an HOC, update its $el as well
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el;
      }
      // updated hook is called by the scheduler to ensure that children are
      // updated in a parent's updated hook.
    };

    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };

    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return
      }
      callHook$2(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // remove self from parent
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove$3(parent.$children, vm);
      }
      // teardown watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      // call the last hook...
      vm._isDestroyed = true;
      // invoke destroy hooks on current rendered tree
      vm.__patch__(vm._vnode, null);
      // fire destroyed hook
      callHook$2(vm, 'destroyed');
      // turn off all instance listeners.
      vm.$off();
      // remove __vue__ reference
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      // release circular reference (#6759)
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }

  function mountComponent$1 (
    vm,
    el,
    hydrating
  ) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode$1;
      {
        /* istanbul ignore if */
        if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
          vm.$options.el || el) {
          warn$2(
            'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn$2(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook$2(vm, 'beforeMount');

    var updateComponent;
    /* istanbul ignore if */
    if ( config$1.performance && mark$1) {
      updateComponent = function () {
        var name = vm._name;
        var id = vm._uid;
        var startTag = "vue-perf-start:" + id;
        var endTag = "vue-perf-end:" + id;

        mark$1(startTag);
        var vnode = vm._render();
        mark$1(endTag);
        measure$1(("vue " + name + " render"), startTag, endTag);

        mark$1(startTag);
        vm._update(vnode, hydrating);
        mark$1(endTag);
        measure$1(("vue " + name + " patch"), startTag, endTag);
      };
    } else {
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    // we set this to vm._watcher inside the watcher's constructor
    // since the watcher's initial patch may call $forceUpdate (e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher$1(vm, updateComponent, noop$2, {
      before: function before () {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook$2(vm, 'beforeUpdate');
        }
      }
    }, true /* isRenderWatcher */);
    hydrating = false;

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook$2(vm, 'mounted');
    }
    return vm
  }

  function updateChildComponent$1 (
    vm,
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    {
      isUpdatingChildComponent$1 = true;
    }

    // determine whether component has slot children
    // we need to do this before overwriting $options._renderChildren.

    // check if there are dynamic scopedSlots (hand-written or compiled but with
    // dynamic slot names). Static scoped slots compiled from template has the
    // "$stable" marker.
    var newScopedSlots = parentVnode.data.scopedSlots;
    var oldScopedSlots = vm.$scopedSlots;
    var hasDynamicScopedSlot = !!(
      (newScopedSlots && !newScopedSlots.$stable) ||
      (oldScopedSlots !== emptyObject$1 && !oldScopedSlots.$stable) ||
      (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
      (!newScopedSlots && vm.$scopedSlots.$key)
    );

    // Any static slot children from the parent may have changed during parent's
    // update. Dynamic scoped slots may also have changed. In such cases, a forced
    // update is necessary to ensure correctness.
    var needsForceUpdate = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      hasDynamicScopedSlot
    );

    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render

    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;

    // update $attrs and $listeners hash
    // these are also reactive so they may trigger child update if the child
    // used them during render
    vm.$attrs = parentVnode.data.attrs || emptyObject$1;
    vm.$listeners = listeners || emptyObject$1;

    // update props
    if (propsData && vm.$options.props) {
      toggleObserving$1(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props; // wtf flow?
        props[key] = validateProp$1(key, propOptions, propsData, vm);
      }
      toggleObserving$1(true);
      // keep a copy of raw propsData
      vm.$options.propsData = propsData;
    }

    // update listeners
    listeners = listeners || emptyObject$1;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners$1(vm, listeners, oldListeners);

    // resolve slots + force update if has children
    if (needsForceUpdate) {
      vm.$slots = resolveSlots$1(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }

    {
      isUpdatingChildComponent$1 = false;
    }
  }

  function isInInactiveTree$1 (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) { return true }
    }
    return false
  }

  function activateChildComponent$1 (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree$1(vm)) {
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        activateChildComponent$1(vm.$children[i]);
      }
      callHook$2(vm, 'activated');
    }
  }

  function deactivateChildComponent$1 (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree$1(vm)) {
        return
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent$1(vm.$children[i]);
      }
      callHook$2(vm, 'deactivated');
    }
  }

  function callHook$2 (vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget$1();
    var handlers = vm.$options[hook];
    var info = hook + " hook";
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling$1(handlers[i], vm, null, vm, info);
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget$1();
  }

  /*  */

  var MAX_UPDATE_COUNT$1 = 100;

  var queue$1 = [];
  var activatedChildren$1 = [];
  var has$1 = {};
  var circular$1 = {};
  var waiting$1 = false;
  var flushing$1 = false;
  var index$1 = 0;

  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState$1 () {
    index$1 = queue$1.length = activatedChildren$1.length = 0;
    has$1 = {};
    {
      circular$1 = {};
    }
    waiting$1 = flushing$1 = false;
  }

  // Async edge case #6566 requires saving the timestamp when event listeners are
  // attached. However, calling performance.now() has a perf overhead especially
  // if the page has thousands of event listeners. Instead, we take a timestamp
  // every time the scheduler flushes and use that for all event listeners
  // attached during that flush.
  var currentFlushTimestamp$1 = 0;

  // Async edge case fix requires storing an event listener's attach timestamp.
  var getNow$1 = Date.now;

  // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.
  // All IE versions use low-res event timestamps, and have problematic clock
  // implementations (#9632)
  if (inBrowser$2 && !isIE$1) {
    var performance$1 = window.performance;
    if (
      performance$1 &&
      typeof performance$1.now === 'function' &&
      getNow$1() > document.createEvent('Event').timeStamp
    ) {
      // if the event timestamp, although evaluated AFTER the Date.now(), is
      // smaller than it, it means the event is using a hi-res timestamp,
      // and we need to use the hi-res version for event listener timestamps as
      // well.
      getNow$1 = function () { return performance$1.now(); };
    }
  }

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue$1 () {
    currentFlushTimestamp$1 = getNow$1();
    flushing$1 = true;
    var watcher, id;

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child)
    // 2. A component's user watchers are run before its render watcher (because
    //    user watchers are created before the render watcher)
    // 3. If a component is destroyed during a parent component's watcher run,
    //    its watchers can be skipped.
    queue$1.sort(function (a, b) { return a.id - b.id; });

    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index$1 = 0; index$1 < queue$1.length; index$1++) {
      watcher = queue$1[index$1];
      if (watcher.before) {
        watcher.before();
      }
      id = watcher.id;
      has$1[id] = null;
      watcher.run();
      // in dev build, check and stop circular updates.
      if ( has$1[id] != null) {
        circular$1[id] = (circular$1[id] || 0) + 1;
        if (circular$1[id] > MAX_UPDATE_COUNT$1) {
          warn$2(
            'You may have an infinite update loop ' + (
              watcher.user
                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                : "in a component render function."
            ),
            watcher.vm
          );
          break
        }
      }
    }

    // keep copies of post queues before resetting state
    var activatedQueue = activatedChildren$1.slice();
    var updatedQueue = queue$1.slice();

    resetSchedulerState$1();

    // call component updated and activated hooks
    callActivatedHooks$1(activatedQueue);
    callUpdatedHooks$1(updatedQueue);

    // devtool hook
    /* istanbul ignore if */
    if (devtools$1 && config$1.devtools) {
      devtools$1.emit('flush');
    }
  }

  function callUpdatedHooks$1 (queue) {
    var i = queue.length;
    while (i--) {
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
        callHook$2(vm, 'updated');
      }
    }
  }

  /**
   * Queue a kept-alive component that was activated during patch.
   * The queue will be processed after the entire tree has been patched.
   */
  function queueActivatedComponent$1 (vm) {
    // setting _inactive to false here so that a render function can
    // rely on checking whether it's in an inactive tree (e.g. router-view)
    vm._inactive = false;
    activatedChildren$1.push(vm);
  }

  function callActivatedHooks$1 (queue) {
    for (var i = 0; i < queue.length; i++) {
      queue[i]._inactive = true;
      activateChildComponent$1(queue[i], true /* true */);
    }
  }

  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher$1 (watcher) {
    var id = watcher.id;
    if (has$1[id] == null) {
      has$1[id] = true;
      if (!flushing$1) {
        queue$1.push(watcher);
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        var i = queue$1.length - 1;
        while (i > index$1 && queue$1[i].id > watcher.id) {
          i--;
        }
        queue$1.splice(i + 1, 0, watcher);
      }
      // queue the flush
      if (!waiting$1) {
        waiting$1 = true;

        if ( !config$1.async) {
          flushSchedulerQueue$1();
          return
        }
        nextTick$1(flushSchedulerQueue$1);
      }
    }
  }

  /*  */



  var uid$2$1 = 0;

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */
  var Watcher$1 = function Watcher (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$2$1; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set$1();
    this.newDepIds = new _Set$1();
    this.expression =  expOrFn.toString()
      ;
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath$2(expOrFn);
      if (!this.getter) {
        this.getter = noop$2;
         warn$2(
          "Failed watching path: \"" + expOrFn + "\" " +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get();
  };

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  Watcher$1.prototype.get = function get () {
    pushTarget$1(this);
    var value;
    var vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError$1(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse$1(value);
      }
      popTarget$1();
      this.cleanupDeps();
    }
    return value
  };

  /**
   * Add a dependency to this directive.
   */
  Watcher$1.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * Clean up for dependency collection.
   */
  Watcher$1.prototype.cleanupDeps = function cleanupDeps () {
    var i = this.deps.length;
    while (i--) {
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  Watcher$1.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher$1(this);
    }
  };

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  Watcher$1.prototype.run = function run () {
    if (this.active) {
      var value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject$1(value) ||
        this.deep
      ) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          var info = "callback for watcher \"" + (this.expression) + "\"";
          invokeWithErrorHandling$1(this.cb, this.vm, [value, oldValue], this.vm, info);
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  Watcher$1.prototype.evaluate = function evaluate () {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * Depend on all deps collected by this watcher.
   */
  Watcher$1.prototype.depend = function depend () {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  };

  /**
   * Remove self from all dependencies' subscriber list.
   */
  Watcher$1.prototype.teardown = function teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove$3(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  };

  /*  */

  var sharedPropertyDefinition$1 = {
    enumerable: true,
    configurable: true,
    get: noop$2,
    set: noop$2
  };

  function proxy$1 (target, sourceKey, key) {
    sharedPropertyDefinition$1.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition$1.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition$1);
  }

  function initState$1 (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps$2(vm, opts.props); }
    if (opts.methods) { initMethods$1(vm, opts.methods); }
    if (opts.data) {
      initData$1(vm);
    } else {
      observe$1(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed$2(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch$1) {
      initWatch$1(vm, opts.watch);
    }
  }

  function initProps$2 (vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // root instance props should be converted
    if (!isRoot) {
      toggleObserving$1(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp$1(key, propsOptions, propsData, vm);
      /* istanbul ignore else */
      {
        var hyphenatedKey = hyphenate$1(key);
        if (isReservedAttribute$1(hyphenatedKey) ||
            config$1.isReservedAttr(hyphenatedKey)) {
          warn$2(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive$$1$1(props, key, value, function () {
          if (!isRoot && !isUpdatingChildComponent$1) {
            warn$2(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      if (!(key in vm)) {
        proxy$1(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key );
    toggleObserving$1(true);
  }

  function initData$1 (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData$1(data, vm)
      : data || {};
    if (!isPlainObject$1(data)) {
      data = {};
       warn$2(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn$1(methods, key)) {
          warn$2(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn$1(props, key)) {
         warn$2(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved$1(key)) {
        proxy$1(vm, "_data", key);
      }
    }
    // observe data
    observe$1(data, true /* asRootData */);
  }

  function getData$1 (data, vm) {
    // #7573 disable dep collection when invoking data getters
    pushTarget$1();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError$1(e, vm, "data()");
      return {}
    } finally {
      popTarget$1();
    }
  }

  var computedWatcherOptions$1 = { lazy: true };

  function initComputed$2 (vm, computed) {
    // $flow-disable-line
    var watchers = vm._computedWatchers = Object.create(null);
    // computed properties are just getters during SSR
    var isSSR = isServerRendering$1();

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      if ( getter == null) {
        warn$2(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      if (!isSSR) {
        // create internal watcher for the computed property.
        watchers[key] = new Watcher$1(
          vm,
          getter || noop$2,
          noop$2,
          computedWatcherOptions$1
        );
      }

      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      if (!(key in vm)) {
        defineComputed$1(vm, key, userDef);
      } else {
        if (key in vm.$data) {
          warn$2(("The computed property \"" + key + "\" is already defined in data."), vm);
        } else if (vm.$options.props && key in vm.$options.props) {
          warn$2(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        } else if (vm.$options.methods && key in vm.$options.methods) {
          warn$2(("The computed property \"" + key + "\" is already defined as a method."), vm);
        }
      }
    }
  }

  function defineComputed$1 (
    target,
    key,
    userDef
  ) {
    var shouldCache = !isServerRendering$1();
    if (typeof userDef === 'function') {
      sharedPropertyDefinition$1.get = shouldCache
        ? createComputedGetter$1(key)
        : createGetterInvoker$1(userDef);
      sharedPropertyDefinition$1.set = noop$2;
    } else {
      sharedPropertyDefinition$1.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter$1(key)
          : createGetterInvoker$1(userDef.get)
        : noop$2;
      sharedPropertyDefinition$1.set = userDef.set || noop$2;
    }
    if (
        sharedPropertyDefinition$1.set === noop$2) {
      sharedPropertyDefinition$1.set = function () {
        warn$2(
          ("Computed property \"" + key + "\" was assigned to but it has no setter."),
          this
        );
      };
    }
    Object.defineProperty(target, key, sharedPropertyDefinition$1);
  }

  function createComputedGetter$1 (key) {
    return function computedGetter () {
      var watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep$1.target) {
          watcher.depend();
        }
        return watcher.value
      }
    }
  }

  function createGetterInvoker$1(fn) {
    return function computedGetter () {
      return fn.call(this, this)
    }
  }

  function initMethods$1 (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      {
        if (typeof methods[key] !== 'function') {
          warn$2(
            "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn$1(props, key)) {
          warn$2(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved$1(key)) {
          warn$2(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop$2 : bind$1(methods[key], vm);
    }
  }

  function initWatch$1 (vm, watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher$1(vm, key, handler[i]);
        }
      } else {
        createWatcher$1(vm, key, handler);
      }
    }
  }

  function createWatcher$1 (
    vm,
    expOrFn,
    handler,
    options
  ) {
    if (isPlainObject$1(handler)) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options)
  }

  function stateMixin$1 (Vue) {
    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props };
    {
      dataDef.set = function () {
        warn$2(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        );
      };
      propsDef.set = function () {
        warn$2("$props is readonly.", this);
      };
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);

    Vue.prototype.$set = set$1;
    Vue.prototype.$delete = del$1;

    Vue.prototype.$watch = function (
      expOrFn,
      cb,
      options
    ) {
      var vm = this;
      if (isPlainObject$1(cb)) {
        return createWatcher$1(vm, expOrFn, cb, options)
      }
      options = options || {};
      options.user = true;
      var watcher = new Watcher$1(vm, expOrFn, cb, options);
      if (options.immediate) {
        var info = "callback for immediate watcher \"" + (watcher.expression) + "\"";
        pushTarget$1();
        invokeWithErrorHandling$1(cb, vm, [watcher.value], vm, info);
        popTarget$1();
      }
      return function unwatchFn () {
        watcher.teardown();
      }
    };
  }

  /*  */

  var uid$3$1 = 0;

  function initMixin$2 (Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3$1++;

      var startTag, endTag;
      /* istanbul ignore if */
      if ( config$1.performance && mark$1) {
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark$1(startTag);
      }

      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent$1(vm, options);
      } else {
        vm.$options = mergeOptions$1(
          resolveConstructorOptions$1(vm.constructor),
          options || {},
          vm
        );
      }
      /* istanbul ignore else */
      {
        initProxy$1(vm);
      }
      // expose real self
      vm._self = vm;
      initLifecycle$1(vm);
      initEvents$1(vm);
      initRender$1(vm);
      callHook$2(vm, 'beforeCreate');
      initInjections$1(vm); // resolve injections before data/props
      initState$1(vm);
      initProvide$1(vm); // resolve provide after data/props
      callHook$2(vm, 'created');

      /* istanbul ignore if */
      if ( config$1.performance && mark$1) {
        vm._name = formatComponentName$1(vm, false);
        mark$1(endTag);
        measure$1(("vue " + (vm._name) + " init"), startTag, endTag);
      }

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
  }

  function initInternalComponent$1 (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  function resolveConstructorOptions$1 (Ctor) {
    var options = Ctor.options;
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions$1(Ctor.super);
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // super option changed,
        // need to resolve new options.
        Ctor.superOptions = superOptions;
        // check if there are any late-modified/attached options (#4976)
        var modifiedOptions = resolveModifiedOptions$1(Ctor);
        // update base extend options
        if (modifiedOptions) {
          extend$2(Ctor.extendOptions, modifiedOptions);
        }
        options = Ctor.options = mergeOptions$1(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options
  }

  function resolveModifiedOptions$1 (Ctor) {
    var modified;
    var latest = Ctor.options;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = latest[key];
      }
    }
    return modified
  }

  function Vue$1 (options) {
    if (
      !(this instanceof Vue$1)
    ) {
      warn$2('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
  }

  initMixin$2(Vue$1);
  stateMixin$1(Vue$1);
  eventsMixin$1(Vue$1);
  lifecycleMixin$1(Vue$1);
  renderMixin$1(Vue$1);

  /*  */

  function initUse$1 (Vue) {
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      if (installedPlugins.indexOf(plugin) > -1) {
        return this
      }

      // additional parameters
      var args = toArray$1(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin);
      return this
    };
  }

  /*  */

  function initMixin$1$1 (Vue) {
    Vue.mixin = function (mixin) {
      this.options = mergeOptions$1(this.options, mixin);
      return this
    };
  }

  /*  */

  function initExtend$1 (Vue) {
    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     */
    Vue.cid = 0;
    var cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var SuperId = Super.cid;
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
      }

      var name = extendOptions.name || Super.options.name;
      if ( name) {
        validateComponentName$1(name);
      }

      var Sub = function VueComponent (options) {
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions$1(
        Super.options,
        extendOptions
      );
      Sub['super'] = Super;

      // For props and computed properties, we define the proxy getters on
      // the Vue instances at extension time, on the extended prototype. This
      // avoids Object.defineProperty calls for each instance created.
      if (Sub.options.props) {
        initProps$1$1(Sub);
      }
      if (Sub.options.computed) {
        initComputed$1$1(Sub);
      }

      // allow further extension/mixin/plugin usage
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      // create asset registers, so extended classes
      // can have their private assets too.
      ASSET_TYPES$1.forEach(function (type) {
        Sub[type] = Super[type];
      });
      // enable recursive self-lookup
      if (name) {
        Sub.options.components[name] = Sub;
      }

      // keep a reference to the super options at extension time.
      // later at instantiation we can check if Super's options have
      // been updated.
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend$2({}, Sub.options);

      // cache constructor
      cachedCtors[SuperId] = Sub;
      return Sub
    };
  }

  function initProps$1$1 (Comp) {
    var props = Comp.options.props;
    for (var key in props) {
      proxy$1(Comp.prototype, "_props", key);
    }
  }

  function initComputed$1$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed$1(Comp.prototype, key, computed[key]);
    }
  }

  /*  */

  function initAssetRegisters$1 (Vue) {
    /**
     * Create asset registration methods.
     */
    ASSET_TYPES$1.forEach(function (type) {
      Vue[type] = function (
        id,
        definition
      ) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          /* istanbul ignore if */
          if ( type === 'component') {
            validateComponentName$1(id);
          }
          if (type === 'component' && isPlainObject$1(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition };
          }
          this.options[type + 's'][id] = definition;
          return definition
        }
      };
    });
  }

  /*  */





  function getComponentName$1 (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches$1 (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp$1(pattern)) {
      return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
  }

  function pruneCache$1 (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var entry = cache[key];
      if (entry) {
        var name = entry.name;
        if (name && !filter(name)) {
          pruneCacheEntry$1(cache, key, keys, _vnode);
        }
      }
    }
  }

  function pruneCacheEntry$1 (
    cache,
    key,
    keys,
    current
  ) {
    var entry = cache[key];
    if (entry && (!current || entry.tag !== current.tag)) {
      entry.componentInstance.$destroy();
    }
    cache[key] = null;
    remove$3(keys, key);
  }

  var patternTypes$1 = [String, RegExp, Array];

  var KeepAlive$1 = {
    name: 'keep-alive',
    abstract: true,

    props: {
      include: patternTypes$1,
      exclude: patternTypes$1,
      max: [String, Number]
    },

    methods: {
      cacheVNode: function cacheVNode() {
        var ref = this;
        var cache = ref.cache;
        var keys = ref.keys;
        var vnodeToCache = ref.vnodeToCache;
        var keyToCache = ref.keyToCache;
        if (vnodeToCache) {
          var tag = vnodeToCache.tag;
          var componentInstance = vnodeToCache.componentInstance;
          var componentOptions = vnodeToCache.componentOptions;
          cache[keyToCache] = {
            name: getComponentName$1(componentOptions),
            tag: tag,
            componentInstance: componentInstance,
          };
          keys.push(keyToCache);
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry$1(cache, keys[0], keys, this._vnode);
          }
          this.vnodeToCache = null;
        }
      }
    },

    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    destroyed: function destroyed () {
      for (var key in this.cache) {
        pruneCacheEntry$1(this.cache, key, this.keys);
      }
    },

    mounted: function mounted () {
      var this$1 = this;

      this.cacheVNode();
      this.$watch('include', function (val) {
        pruneCache$1(this$1, function (name) { return matches$1(val, name); });
      });
      this.$watch('exclude', function (val) {
        pruneCache$1(this$1, function (name) { return !matches$1(val, name); });
      });
    },

    updated: function updated () {
      this.cacheVNode();
    },

    render: function render () {
      var slot = this.$slots.default;
      var vnode = getFirstComponentChild$1(slot);
      var componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        // check pattern
        var name = getComponentName$1(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches$1(include, name))) ||
          // excluded
          (exclude && name && matches$1(exclude, name))
        ) {
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = vnode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) {
          vnode.componentInstance = cache[key].componentInstance;
          // make current key freshest
          remove$3(keys, key);
          keys.push(key);
        } else {
          // delay setting the cache until update
          this.vnodeToCache = vnode;
          this.keyToCache = key;
        }

        vnode.data.keepAlive = true;
      }
      return vnode || (slot && slot[0])
    }
  };

  var builtInComponents$1 = {
    KeepAlive: KeepAlive$1
  };

  /*  */

  function initGlobalAPI$1 (Vue) {
    // config
    var configDef = {};
    configDef.get = function () { return config$1; };
    {
      configDef.set = function () {
        warn$2(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    Object.defineProperty(Vue, 'config', configDef);

    // exposed util methods.
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
      warn: warn$2,
      extend: extend$2,
      mergeOptions: mergeOptions$1,
      defineReactive: defineReactive$$1$1
    };

    Vue.set = set$1;
    Vue.delete = del$1;
    Vue.nextTick = nextTick$1;

    // 2.6 explicit observable API
    Vue.observable = function (obj) {
      observe$1(obj);
      return obj
    };

    Vue.options = Object.create(null);
    ASSET_TYPES$1.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    Vue.options._base = Vue;

    extend$2(Vue.options.components, builtInComponents$1);

    initUse$1(Vue);
    initMixin$1$1(Vue);
    initExtend$1(Vue);
    initAssetRegisters$1(Vue);
  }

  initGlobalAPI$1(Vue$1);

  Object.defineProperty(Vue$1.prototype, '$isServer', {
    get: isServerRendering$1
  });

  Object.defineProperty(Vue$1.prototype, '$ssrContext', {
    get: function get () {
      /* istanbul ignore next */
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  // expose FunctionalRenderContext for ssr runtime helper installation
  Object.defineProperty(Vue$1, 'FunctionalRenderContext', {
    value: FunctionalRenderContext$1
  });

  Vue$1.version = '2.6.14';

  /*  */

  // these are reserved for web because they are directly compiled away
  // during template compilation
  var isReservedAttr$1 = makeMap$1('style,class');

  // attributes that should be using props for binding
  var acceptValue$1 = makeMap$1('input,textarea,option,select,progress');
  var mustUseProp$1 = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue$1(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  var isEnumeratedAttr$1 = makeMap$1('contenteditable,draggable,spellcheck');

  var isValidContentEditableValue$1 = makeMap$1('events,caret,typing,plaintext-only');

  var convertEnumeratedValue$1 = function (key, value) {
    return isFalsyAttrValue$1(value) || value === 'false'
      ? 'false'
      // allow arbitrary string value for contenteditable
      : key === 'contenteditable' && isValidContentEditableValue$1(value)
        ? value
        : 'true'
  };

  var isBooleanAttr$1 = makeMap$1(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,' +
    'truespeed,typemustmatch,visible'
  );

  var xlinkNS$1 = 'http://www.w3.org/1999/xlink';

  var isXlink$1 = function (name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  var getXlinkProp$1 = function (name) {
    return isXlink$1(name) ? name.slice(6, name.length) : ''
  };

  var isFalsyAttrValue$1 = function (val) {
    return val == null || val === false
  };

  /*  */

  function genClassForVnode$1 (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef$1(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData$1(childNode.data, data);
      }
    }
    while (isDef$1(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData$1(data, parentNode.data);
      }
    }
    return renderClass$1(data.staticClass, data.class)
  }

  function mergeClassData$1 (child, parent) {
    return {
      staticClass: concat$1(child.staticClass, parent.staticClass),
      class: isDef$1(child.class)
        ? [child.class, parent.class]
        : parent.class
    }
  }

  function renderClass$1 (
    staticClass,
    dynamicClass
  ) {
    if (isDef$1(staticClass) || isDef$1(dynamicClass)) {
      return concat$1(staticClass, stringifyClass$1(dynamicClass))
    }
    /* istanbul ignore next */
    return ''
  }

  function concat$1 (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass$1 (value) {
    if (Array.isArray(value)) {
      return stringifyArray$1(value)
    }
    if (isObject$1(value)) {
      return stringifyObject$1(value)
    }
    if (typeof value === 'string') {
      return value
    }
    /* istanbul ignore next */
    return ''
  }

  function stringifyArray$1 (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef$1(stringified = stringifyClass$1(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject$1 (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  /*  */

  var namespaceMap$1 = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isHTMLTag$1 = makeMap$1(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG$1 = makeMap$1(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );

  var isReservedTag$1 = function (tag) {
    return isHTMLTag$1(tag) || isSVG$1(tag)
  };

  function getTagNamespace$1 (tag) {
    if (isSVG$1(tag)) {
      return 'svg'
    }
    // basic support for MathML
    // note it doesn't support other MathML elements being component roots
    if (tag === 'math') {
      return 'math'
    }
  }

  var unknownElementCache$1 = Object.create(null);
  function isUnknownElement$1 (tag) {
    /* istanbul ignore if */
    if (!inBrowser$2) {
      return true
    }
    if (isReservedTag$1(tag)) {
      return false
    }
    tag = tag.toLowerCase();
    /* istanbul ignore if */
    if (unknownElementCache$1[tag] != null) {
      return unknownElementCache$1[tag]
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (unknownElementCache$1[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      return (unknownElementCache$1[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType$1 = makeMap$1('text,number,password,search,email,tel,url');

  /*  */

  /**
   * Query an element selector if it's not an element already.
   */
  function query$1 (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);
      if (!selected) {
         warn$2(
          'Cannot find element: ' + el
        );
        return document.createElement('div')
      }
      return selected
    } else {
      return el
    }
  }

  /*  */

  function createElement$1$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') {
      return elm
    }
    // false or null will remove the attribute but undefined will not
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  function createElementNS$1 (namespace, tagName) {
    return document.createElementNS(namespaceMap$1[namespace], tagName)
  }

  function createTextNode$1 (text) {
    return document.createTextNode(text)
  }

  function createComment$1 (text) {
    return document.createComment(text)
  }

  function insertBefore$1 (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild$1 (node, child) {
    node.removeChild(child);
  }

  function appendChild$1 (node, child) {
    node.appendChild(child);
  }

  function parentNode$1 (node) {
    return node.parentNode
  }

  function nextSibling$1 (node) {
    return node.nextSibling
  }

  function tagName$1 (node) {
    return node.tagName
  }

  function setTextContent$1 (node, text) {
    node.textContent = text;
  }

  function setStyleScope$1 (node, scopeId) {
    node.setAttribute(scopeId, '');
  }

  var nodeOps$1 = /*#__PURE__*/Object.freeze({
    createElement: createElement$1$1,
    createElementNS: createElementNS$1,
    createTextNode: createTextNode$1,
    createComment: createComment$1,
    insertBefore: insertBefore$1,
    removeChild: removeChild$1,
    appendChild: appendChild$1,
    parentNode: parentNode$1,
    nextSibling: nextSibling$1,
    tagName: tagName$1,
    setTextContent: setTextContent$1,
    setStyleScope: setStyleScope$1
  });

  /*  */

  var ref$1 = {
    create: function create (_, vnode) {
      registerRef$1(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef$1(oldVnode, true);
        registerRef$1(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef$1(vnode, true);
    }
  };

  function registerRef$1 (vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!isDef$1(key)) { return }

    var vm = vnode.context;
    var ref = vnode.componentInstance || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove$3(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (!Array.isArray(refs[key])) {
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) {
          // $flow-disable-line
          refs[key].push(ref);
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  /**
   * Virtual DOM patching algorithm based on Snabbdom by
   * Simon Friis Vindum (@paldepind)
   * Licensed under the MIT License
   * https://github.com/paldepind/snabbdom/blob/master/LICENSE
   *
   * modified by Evan You (@yyx990803)
   *
   * Not type-checking this because this file is perf-critical and the cost
   * of making flow understand it is not worth it.
   */

  var emptyNode$1 = new VNode$1('', {}, []);

  var hooks$1 = ['create', 'activate', 'update', 'remove', 'destroy'];

  function sameVnode$1 (a, b) {
    return (
      a.key === b.key &&
      a.asyncFactory === b.asyncFactory && (
        (
          a.tag === b.tag &&
          a.isComment === b.isComment &&
          isDef$1(a.data) === isDef$1(b.data) &&
          sameInputType$1(a, b)
        ) || (
          isTrue$1(a.isAsyncPlaceholder) &&
          isUndef$1(b.asyncFactory.error)
        )
      )
    )
  }

  function sameInputType$1 (a, b) {
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef$1(i = a.data) && isDef$1(i = i.attrs) && i.type;
    var typeB = isDef$1(i = b.data) && isDef$1(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType$1(typeA) && isTextInputType$1(typeB)
  }

  function createKeyToOldIdx$1 (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef$1(key)) { map[key] = i; }
    }
    return map
  }

  function createPatchFunction$1 (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    for (i = 0; i < hooks$1.length; ++i) {
      cbs[hooks$1[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (isDef$1(modules[j][hooks$1[i]])) {
          cbs[hooks$1[i]].push(modules[j][hooks$1[i]]);
        }
      }
    }

    function emptyNodeAt (elm) {
      return new VNode$1(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function createRmCb (childElm, listeners) {
      function remove$$1 () {
        if (--remove$$1.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove$$1.listeners = listeners;
      return remove$$1
    }

    function removeNode (el) {
      var parent = nodeOps.parentNode(el);
      // element may have already been removed due to v-html / v-text
      if (isDef$1(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }

    function isUnknownElement$$1 (vnode, inVPre) {
      return (
        !inVPre &&
        !vnode.ns &&
        !(
          config$1.ignoredElements.length &&
          config$1.ignoredElements.some(function (ignore) {
            return isRegExp$1(ignore)
              ? ignore.test(vnode.tag)
              : ignore === vnode.tag
          })
        ) &&
        config$1.isUnknownElement(vnode.tag)
      )
    }

    var creatingElmInVPre = 0;

    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm,
      nested,
      ownerArray,
      index
    ) {
      if (isDef$1(vnode.elm) && isDef$1(ownerArray)) {
        // This vnode was used in a previous render!
        // now it's used as a new node, overwriting its elm would cause
        // potential patch errors down the road when it's used as an insertion
        // reference node. Instead, we clone the node on-demand before creating
        // associated DOM element for it.
        vnode = ownerArray[index] = cloneVNode$1(vnode);
      }

      vnode.isRootInsert = !nested; // for transition enter check
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
      }

      var data = vnode.data;
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef$1(tag)) {
        {
          if (data && data.pre) {
            creatingElmInVPre++;
          }
          if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
            warn$2(
              'Unknown custom element: <' + tag + '> - did you ' +
              'register the component correctly? For recursive components, ' +
              'make sure to provide the "name" option.',
              vnode.context
            );
          }
        }

        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode);

        /* istanbul ignore if */
        {
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef$1(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }

        if ( data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue$1(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }

    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data;
      if (isDef$1(i)) {
        var isReactivated = isDef$1(vnode.componentInstance) && i.keepAlive;
        if (isDef$1(i = i.hook) && isDef$1(i = i.init)) {
          i(vnode, false /* hydrating */);
        }
        // after calling the init hook, if the vnode is a child component
        // it should've created a child instance and mounted it. the child
        // component also has set the placeholder vnode's elm.
        // in that case we can just return the element and be done.
        if (isDef$1(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          insert(parentElm, vnode.elm, refElm);
          if (isTrue$1(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true
        }
      }
    }

    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef$1(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        // empty component root.
        // skip all element-related modules except for ref (#3455)
        registerRef$1(vnode);
        // make sure to invoke the insert hook
        insertedVnodeQueue.push(vnode);
      }
    }

    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // hack for #4339: a reactivated component with inner transition
      // does not trigger because the inner node's created hooks are not called
      // again. It's not ideal to involve module-specific logic in here but
      // there doesn't seem to be a better way to do it.
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef$1(i = innerNode.data) && isDef$1(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode$1, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      // unlike a newly created component,
      // a reactivated keep-alive component doesn't insert itself
      insert(parentElm, vnode.elm, refElm);
    }

    function insert (parent, elm, ref$$1) {
      if (isDef$1(parent)) {
        if (isDef$1(ref$$1)) {
          if (nodeOps.parentNode(ref$$1) === parent) {
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else {
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        {
          checkDuplicateKeys(children);
        }
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive$1(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    function isPatchable (vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef$1(vnode.tag)
    }

    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode$1, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef$1(i)) {
        if (isDef$1(i.create)) { i.create(emptyNode$1, vnode); }
        if (isDef$1(i.insert)) { insertedVnodeQueue.push(vnode); }
      }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope (vnode) {
      var i;
      if (isDef$1(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef$1(i = ancestor.context) && isDef$1(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // for slot content they should also get the scopeId from the host instance.
      if (isDef$1(i = activeInstance$1) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef$1(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef$1(data)) {
        if (isDef$1(i = data.hook) && isDef$1(i = i.destroy)) { i(vnode); }
        for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
      }
      if (isDef$1(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes (vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef$1(ch)) {
          if (isDef$1(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { // Text node
            removeNode(ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef$1(rm) || isDef$1(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef$1(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef$1(i = vnode.componentInstance) && isDef$1(i = i._vnode) && isDef$1(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef$1(i = vnode.data.hook) && isDef$1(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }

    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0;
      var newStartIdx = 0;
      var oldEndIdx = oldCh.length - 1;
      var oldStartVnode = oldCh[0];
      var oldEndVnode = oldCh[oldEndIdx];
      var newEndIdx = newCh.length - 1;
      var newStartVnode = newCh[0];
      var newEndVnode = newCh[newEndIdx];
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly is a special flag used only by <transition-group>
      // to ensure removed elements stay in correct relative positions
      // during leaving transitions
      var canMove = !removeOnly;

      {
        checkDuplicateKeys(newCh);
      }

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef$1(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef$1(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode$1(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode$1(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode$1(oldStartVnode, newEndVnode)) { // Vnode moved right
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode$1(oldEndVnode, newStartVnode)) { // Vnode moved left
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef$1(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx$1(oldCh, oldStartIdx, oldEndIdx); }
          idxInOld = isDef$1(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef$1(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode$1(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // same key but different element. treat as new element
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef$1(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function checkDuplicateKeys (children) {
      var seenKeys = {};
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i];
        var key = vnode.key;
        if (isDef$1(key)) {
          if (seenKeys[key]) {
            warn$2(
              ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
              vnode.context
            );
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }

    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef$1(c) && sameVnode$1(node, c)) { return i }
      }
    }

    function patchVnode (
      oldVnode,
      vnode,
      insertedVnodeQueue,
      ownerArray,
      index,
      removeOnly
    ) {
      if (oldVnode === vnode) {
        return
      }

      if (isDef$1(vnode.elm) && isDef$1(ownerArray)) {
        // clone reused vnode
        vnode = ownerArray[index] = cloneVNode$1(vnode);
      }

      var elm = vnode.elm = oldVnode.elm;

      if (isTrue$1(oldVnode.isAsyncPlaceholder)) {
        if (isDef$1(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      // reuse element for static trees.
      // note we only do this if the vnode is cloned -
      // if the new node is not cloned it means the render functions have been
      // reset by the hot-reload-api and we need to do a proper re-render.
      if (isTrue$1(vnode.isStatic) &&
        isTrue$1(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue$1(vnode.isCloned) || isTrue$1(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef$1(data) && isDef$1(i = data.hook) && isDef$1(i = i.prepatch)) {
        i(oldVnode, vnode);
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef$1(data) && isPatchable(vnode)) {
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef$1(i = data.hook) && isDef$1(i = i.update)) { i(oldVnode, vnode); }
      }
      if (isUndef$1(vnode.text)) {
        if (isDef$1(oldCh) && isDef$1(ch)) {
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
        } else if (isDef$1(ch)) {
          {
            checkDuplicateKeys(ch);
          }
          if (isDef$1(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef$1(oldCh)) {
          removeVnodes(oldCh, 0, oldCh.length - 1);
        } else if (isDef$1(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef$1(data)) {
        if (isDef$1(i = data.hook) && isDef$1(i = i.postpatch)) { i(oldVnode, vnode); }
      }
    }

    function invokeInsertHook (vnode, queue, initial) {
      // delay insert hooks for component root nodes, invoke them after the
      // element is really inserted
      if (isTrue$1(initial) && isDef$1(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false;
    // list of modules that can skip create hook during hydration because they
    // are already rendered on the client or has no need for initialization
    // Note: style is excluded because it relies on initial clone for future
    // deep updates (#7063).
    var isRenderedModule = makeMap$1('attrs,class,staticClass,staticStyle,key');

    // Note: this is a browser-only function so we can assume elms are DOM nodes.
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue$1(vnode.isComment) && isDef$1(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      // assert node match
      {
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false
        }
      }
      if (isDef$1(data)) {
        if (isDef$1(i = data.hook) && isDef$1(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef$1(i = vnode.componentInstance)) {
          // child component. it should have hydrated its own tree.
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef$1(tag)) {
        if (isDef$1(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef$1(i = data) && isDef$1(i = i.domProps) && isDef$1(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                /* istanbul ignore if */
                if (
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                /* istanbul ignore if */
                if (
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef$1(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deep class bindings for future updates
            traverse$1(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef$1(vnode.tag)) {
        return vnode.tag.indexOf('vue-component') === 0 || (
          !isUnknownElement$$1(vnode, inVPre) &&
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
        )
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    return function patch (oldVnode, vnode, hydrating, removeOnly) {
      if (isUndef$1(vnode)) {
        if (isDef$1(oldVnode)) { invokeDestroyHook(oldVnode); }
        return
      }

      var isInitialPatch = false;
      var insertedVnodeQueue = [];

      if (isUndef$1(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue);
      } else {
        var isRealElement = isDef$1(oldVnode.nodeType);
        if (!isRealElement && sameVnode$1(oldVnode, vnode)) {
          // patch existing root node
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        } else {
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR$1)) {
              oldVnode.removeAttribute(SSR_ATTR$1);
              hydrating = true;
            }
            if (isTrue$1(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else {
                warn$2(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                );
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            oldVnode = emptyNodeAt(oldVnode);
          }

          // replacing existing element
          var oldElm = oldVnode.elm;
          var parentElm = nodeOps.parentNode(oldElm);

          // create new node
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm,
            nodeOps.nextSibling(oldElm)
          );

          // update parent placeholder node element, recursively
          if (isDef$1(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode$1, ancestor);
                }
                // #6513
                // invoke insert hooks that may have been merged by create hooks.
                // e.g. for directives that uses the "inserted" hook.
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  // start at index 1 to avoid re-invoking component mounted hook
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef$1(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // destroy old node
          if (isDef$1(parentElm)) {
            removeVnodes([oldVnode], 0, 0);
          } else if (isDef$1(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm
    }
  }

  /*  */

  var directives$1 = {
    create: updateDirectives$1,
    update: updateDirectives$1,
    destroy: function unbindDirectives (vnode) {
      updateDirectives$1(vnode, emptyNode$1);
    }
  };

  function updateDirectives$1 (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update$1(oldVnode, vnode);
    }
  }

  function _update$1 (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode$1;
    var isDestroy = vnode === emptyNode$1;
    var oldDirs = normalizeDirectives$1$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = [];
    var dirsWithPostpatch = [];

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // new directive, bind
        callHook$1$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        // existing directive, update
        dir.oldValue = oldDir.value;
        dir.oldArg = oldDir.arg;
        callHook$1$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook$1(vnode, 'insert', callInsert);
      } else {
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      mergeVNodeHook$1(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // no longer present, unbind
          callHook$1$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers$1 = Object.create(null);

  function normalizeDirectives$1$1 (
    dirs,
    vm
  ) {
    var res = Object.create(null);
    if (!dirs) {
      // $flow-disable-line
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        // $flow-disable-line
        dir.modifiers = emptyModifiers$1;
      }
      res[getRawDirName$1(dir)] = dir;
      dir.def = resolveAsset$1(vm.$options, 'directives', dir.name, true);
    }
    // $flow-disable-line
    return res
  }

  function getRawDirName$1 (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  function callHook$1$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError$1(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules$1 = [
    ref$1,
    directives$1
  ];

  /*  */

  function updateAttrs$1 (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef$1(opts) && opts.Ctor.options.inheritAttrs === false) {
      return
    }
    if (isUndef$1(oldVnode.data.attrs) && isUndef$1(vnode.data.attrs)) {
      return
    }
    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef$1(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend$2({}, attrs);
    }

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr$1(elm, key, cur, vnode.data.pre);
      }
    }
    // #4391: in IE9, setting type can reset value for input[type=radio]
    // #6666: IE/Edge forces progress value down to 1 before setting a max
    /* istanbul ignore if */
    if ((isIE$1 || isEdge$1) && attrs.value !== oldAttrs.value) {
      setAttr$1(elm, 'value', attrs.value);
    }
    for (key in oldAttrs) {
      if (isUndef$1(attrs[key])) {
        if (isXlink$1(key)) {
          elm.removeAttributeNS(xlinkNS$1, getXlinkProp$1(key));
        } else if (!isEnumeratedAttr$1(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr$1 (el, key, value, isInPre) {
    if (isInPre || el.tagName.indexOf('-') > -1) {
      baseSetAttr$1(el, key, value);
    } else if (isBooleanAttr$1(key)) {
      // set attribute for blank value
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue$1(value)) {
        el.removeAttribute(key);
      } else {
        // technically allowfullscreen is a boolean attribute for <iframe>,
        // but Flash expects a value of "true" when used on <embed> tag
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr$1(key)) {
      el.setAttribute(key, convertEnumeratedValue$1(key, value));
    } else if (isXlink$1(key)) {
      if (isFalsyAttrValue$1(value)) {
        el.removeAttributeNS(xlinkNS$1, getXlinkProp$1(key));
      } else {
        el.setAttributeNS(xlinkNS$1, key, value);
      }
    } else {
      baseSetAttr$1(el, key, value);
    }
  }

  function baseSetAttr$1 (el, key, value) {
    if (isFalsyAttrValue$1(value)) {
      el.removeAttribute(key);
    } else {
      // #7138: IE10 & 11 fires input event when setting placeholder on
      // <textarea>... block the first input event and remove the blocker
      // immediately.
      /* istanbul ignore if */
      if (
        isIE$1 && !isIE9$1 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && value !== '' && !el.__ieph
      ) {
        var blocker = function (e) {
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        // $flow-disable-line
        el.__ieph = true; /* IE placeholder patched */
      }
      el.setAttribute(key, value);
    }
  }

  var attrs$1 = {
    create: updateAttrs$1,
    update: updateAttrs$1
  };

  /*  */

  function updateClass$1 (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (
      isUndef$1(data.staticClass) &&
      isUndef$1(data.class) && (
        isUndef$1(oldData) || (
          isUndef$1(oldData.staticClass) &&
          isUndef$1(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode$1(vnode);

    // handle transition classes
    var transitionClass = el._transitionClasses;
    if (isDef$1(transitionClass)) {
      cls = concat$1(cls, stringifyClass$1(transitionClass));
    }

    // set the class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass$1 = {
    create: updateClass$1,
    update: updateClass$1
  };

  /*  */

  /*  */

  /*  */

  /*  */

  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
  var RANGE_TOKEN$1 = '__r';
  var CHECKBOX_RADIO_TOKEN$1 = '__c';

  /*  */

  // normalize v-model event tokens that can only be determined at runtime.
  // it's important to place the event as the first in the array because
  // the whole point is ensuring the v-model callback gets called before
  // user-attached handlers.
  function normalizeEvents$1 (on) {
    /* istanbul ignore if */
    if (isDef$1(on[RANGE_TOKEN$1])) {
      // IE input[type=range] only supports `change` event
      var event = isIE$1 ? 'change' : 'input';
      on[event] = [].concat(on[RANGE_TOKEN$1], on[event] || []);
      delete on[RANGE_TOKEN$1];
    }
    // This was originally intended to fix #4521 but no longer necessary
    // after 2.5. Keeping it for backwards compat with generated code from < 2.4
    /* istanbul ignore if */
    if (isDef$1(on[CHECKBOX_RADIO_TOKEN$1])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN$1], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN$1];
    }
  }

  var target$1$1;

  function createOnceHandler$1$1 (event, handler, capture) {
    var _target = target$1$1; // save current target element in closure
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2$1(event, onceHandler, capture, _target);
      }
    }
  }

  // #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
  // implementation and does not fire microtasks in between event propagation, so
  // safe to exclude.
  var useMicrotaskFix$1 = isUsingMicroTask$1 && !(isFF$1 && Number(isFF$1[1]) <= 53);

  function add$1$1 (
    name,
    handler,
    capture,
    passive
  ) {
    // async edge case #6566: inner click event triggers patch, event handler
    // attached to outer element during patch, and triggered again. This
    // happens because browsers fire microtask ticks between event propagation.
    // the solution is simple: we save the timestamp when a handler is attached,
    // and the handler would only fire if the event passed to it was fired
    // AFTER it was attached.
    if (useMicrotaskFix$1) {
      var attachedTimestamp = currentFlushTimestamp$1;
      var original = handler;
      handler = original._wrapper = function (e) {
        if (
          // no bubbling, should always fire.
          // this is just a safety net in case event.timeStamp is unreliable in
          // certain weird environments...
          e.target === e.currentTarget ||
          // event is fired after handler attachment
          e.timeStamp >= attachedTimestamp ||
          // bail for environments that have buggy event.timeStamp implementations
          // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
          // #9681 QtWebEngine event.timeStamp is negative value
          e.timeStamp <= 0 ||
          // #9448 bail if event is fired in another document in a multi-page
          // electron/nw.js app, since event.timeStamp will be using a different
          // starting reference
          e.target.ownerDocument !== document
        ) {
          return original.apply(this, arguments)
        }
      };
    }
    target$1$1.addEventListener(
      name,
      handler,
      supportsPassive$1
        ? { capture: capture, passive: passive }
        : capture
    );
  }

  function remove$2$1 (
    name,
    handler,
    capture,
    _target
  ) {
    (_target || target$1$1).removeEventListener(
      name,
      handler._wrapper || handler,
      capture
    );
  }

  function updateDOMListeners$1 (oldVnode, vnode) {
    if (isUndef$1(oldVnode.data.on) && isUndef$1(vnode.data.on)) {
      return
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    target$1$1 = vnode.elm;
    normalizeEvents$1(on);
    updateListeners$1(on, oldOn, add$1$1, remove$2$1, createOnceHandler$1$1, vnode.context);
    target$1$1 = undefined;
  }

  var events$1 = {
    create: updateDOMListeners$1,
    update: updateDOMListeners$1
  };

  /*  */

  var svgContainer$1;

  function updateDOMProps$1 (oldVnode, vnode) {
    if (isUndef$1(oldVnode.data.domProps) && isUndef$1(vnode.data.domProps)) {
      return
    }
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef$1(props.__ob__)) {
      props = vnode.data.domProps = extend$2({}, props);
    }

    for (key in oldProps) {
      if (!(key in props)) {
        elm[key] = '';
      }
    }

    for (key in props) {
      cur = props[key];
      // ignore children if the node has textContent or innerHTML,
      // as these will throw away existing DOM nodes and cause removal errors
      // on subsequent patches (#3360)
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        // #6601 work around Chrome version <= 55 bug where single textNode
        // replaced by innerHTML/textContent retains its parentNode property
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value' && elm.tagName !== 'PROGRESS') {
        // store value as _value as well since
        // non-string values will be stringified
        elm._value = cur;
        // avoid resetting cursor position when value is the same
        var strCur = isUndef$1(cur) ? '' : String(cur);
        if (shouldUpdateValue$1(elm, strCur)) {
          elm.value = strCur;
        }
      } else if (key === 'innerHTML' && isSVG$1(elm.tagName) && isUndef$1(elm.innerHTML)) {
        // IE doesn't support innerHTML for SVG elements
        svgContainer$1 = svgContainer$1 || document.createElement('div');
        svgContainer$1.innerHTML = "<svg>" + cur + "</svg>";
        var svg = svgContainer$1.firstChild;
        while (elm.firstChild) {
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) {
          elm.appendChild(svg.firstChild);
        }
      } else if (
        // skip the update if old and new VDOM state is the same.
        // `value` is handled separately because the DOM value may be temporarily
        // out of sync with VDOM state due to focus, composition and modifiers.
        // This  #4521 by skipping the unnecessary `checked` update.
        cur !== oldProps[key]
      ) {
        // some property updates can throw
        // e.g. `value` on <progress> w/ non-finite value
        try {
          elm[key] = cur;
        } catch (e) {}
      }
    }
  }

  // check platforms/web/util/attrs.js acceptValue


  function shouldUpdateValue$1 (elm, checkVal) {
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty$1(elm, checkVal) ||
      isDirtyWithModifiers$1(elm, checkVal)
    ))
  }

  function isNotInFocusAndDirty$1 (elm, checkVal) {
    // return true when textbox (.number and .trim) loses focus and its value is
    // not equal to the updated value
    var notInFocus = true;
    // #6157
    // work around IE bug when accessing document.activeElement in an iframe
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isDirtyWithModifiers$1 (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers; // injected by v-model runtime
    if (isDef$1(modifiers)) {
      if (modifiers.number) {
        return toNumber$1(value) !== toNumber$1(newVal)
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps$1 = {
    create: updateDOMProps$1,
    update: updateDOMProps$1
  };

  /*  */

  var parseStyleText$1 = cached$1(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  // merge static and dynamic style data on the same vnode
  function normalizeStyleData$1 (data) {
    var style = normalizeStyleBinding$1(data.style);
    // static style is pre-processed into an object during compilation
    // and is always a fresh object, so it's safe to merge into it
    return data.staticStyle
      ? extend$2(data.staticStyle, style)
      : style
  }

  // normalize possible array / string values into Object
  function normalizeStyleBinding$1 (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject$1(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText$1(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * parent component style should be after child's
   * so that parent component's style could override it
   */
  function getStyle$1 (vnode, checkChild) {
    var res = {};
    var styleData;

    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData$1(childNode.data))
        ) {
          extend$2(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData$1(vnode.data))) {
      extend$2(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData$1(parentNode.data))) {
        extend$2(res, styleData);
      }
    }
    return res
  }

  /*  */

  var cssVarRE$1 = /^--/;
  var importantRE$1 = /\s*!important$/;
  var setProp$1 = function (el, name, val) {
    /* istanbul ignore if */
    if (cssVarRE$1.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE$1.test(val)) {
      el.style.setProperty(hyphenate$1(name), val.replace(importantRE$1, ''), 'important');
    } else {
      var normalizedName = normalize$1(name);
      if (Array.isArray(val)) {
        // Support values array created by autoprefixer, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // Set them one by one, and the browser will only set those it can recognize
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames$1 = ['Webkit', 'Moz', 'ms'];

  var emptyStyle$1;
  var normalize$1 = cached$1(function (prop) {
    emptyStyle$1 = emptyStyle$1 || document.createElement('div').style;
    prop = camelize$1(prop);
    if (prop !== 'filter' && (prop in emptyStyle$1)) {
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < vendorNames$1.length; i++) {
      var name = vendorNames$1[i] + capName;
      if (name in emptyStyle$1) {
        return name
      }
    }
  });

  function updateStyle$1 (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;

    if (isUndef$1(data.staticStyle) && isUndef$1(data.style) &&
      isUndef$1(oldData.staticStyle) && isUndef$1(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    // if static style exists, stylebinding already merged into it when doing normalizeStyleData
    var oldStyle = oldStaticStyle || oldStyleBinding;

    var style = normalizeStyleBinding$1(vnode.data.style) || {};

    // store normalized style under a different key for next diff
    // make sure to clone it if it's reactive, since the user likely wants
    // to mutate it.
    vnode.data.normalizedStyle = isDef$1(style.__ob__)
      ? extend$2({}, style)
      : style;

    var newStyle = getStyle$1(vnode, true);

    for (name in oldStyle) {
      if (isUndef$1(newStyle[name])) {
        setProp$1(el, name, '');
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        // ie9 setting to null has no effect, must use empty string
        setProp$1(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style$1 = {
    create: updateStyle$1,
    update: updateStyle$1
  };

  /*  */

  var whitespaceRE$1 = /\s+/;

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass$1 (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE$1).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass$1 (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE$1).forEach(function (c) { return el.classList.remove(c); });
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  /*  */

  function resolveTransition$1 (def$$1) {
    if (!def$$1) {
      return
    }
    /* istanbul ignore else */
    if (typeof def$$1 === 'object') {
      var res = {};
      if (def$$1.css !== false) {
        extend$2(res, autoCssTransition$1(def$$1.name || 'v'));
      }
      extend$2(res, def$$1);
      return res
    } else if (typeof def$$1 === 'string') {
      return autoCssTransition$1(def$$1)
    }
  }

  var autoCssTransition$1 = cached$1(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition$1 = inBrowser$2 && !isIE9$1;
  var TRANSITION$1 = 'transition';
  var ANIMATION$1 = 'animation';

  // Transition property/event sniffing
  var transitionProp$1 = 'transition';
  var transitionEndEvent$1 = 'transitionend';
  var animationProp$1 = 'animation';
  var animationEndEvent$1 = 'animationend';
  if (hasTransition$1) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp$1 = 'WebkitTransition';
      transitionEndEvent$1 = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp$1 = 'WebkitAnimation';
      animationEndEvent$1 = 'webkitAnimationEnd';
    }
  }

  // binding to window is necessary to make hot reload work in IE in strict mode
  var raf$1 = inBrowser$2
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout
    : /* istanbul ignore next */ function (fn) { return fn(); };

  function nextFrame$1 (fn) {
    raf$1(function () {
      raf$1(fn);
    });
  }

  function addTransitionClass$1 (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass$1(el, cls);
    }
  }

  function removeTransitionClass$1 (el, cls) {
    if (el._transitionClasses) {
      remove$3(el._transitionClasses, cls);
    }
    removeClass$1(el, cls);
  }

  function whenTransitionEnds$1 (
    el,
    expectedType,
    cb
  ) {
    var ref = getTransitionInfo$1(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION$1 ? transitionEndEvent$1 : animationEndEvent$1;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  var transformRE$1 = /\b(transform|all)(,|$)/;

  function getTransitionInfo$1 (el, expectedType) {
    var styles = window.getComputedStyle(el);
    // JSDOM may return undefined for transition properties
    var transitionDelays = (styles[transitionProp$1 + 'Delay'] || '').split(', ');
    var transitionDurations = (styles[transitionProp$1 + 'Duration'] || '').split(', ');
    var transitionTimeout = getTimeout$1(transitionDelays, transitionDurations);
    var animationDelays = (styles[animationProp$1 + 'Delay'] || '').split(', ');
    var animationDurations = (styles[animationProp$1 + 'Duration'] || '').split(', ');
    var animationTimeout = getTimeout$1(animationDelays, animationDurations);

    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION$1) {
      if (transitionTimeout > 0) {
        type = TRANSITION$1;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION$1) {
      if (animationTimeout > 0) {
        type = ANIMATION$1;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION$1
          : ANIMATION$1
        : null;
      propCount = type
        ? type === TRANSITION$1
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    var hasTransform =
      type === TRANSITION$1 &&
      transformRE$1.test(styles[transitionProp$1 + 'Property']);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  function getTimeout$1 (delays, durations) {
    /* istanbul ignore next */
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs$1(d) + toMs$1(delays[i])
    }))
  }

  // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
  // in a locale-dependent way, using a comma instead of a dot.
  // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
  // as a floor function) causing unexpected behaviors
  function toMs$1 (s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  /*  */

  function enter$1 (vnode, toggleDisplay) {
    var el = vnode.elm;

    // call leave callback now
    if (isDef$1(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }

    var data = resolveTransition$1(vnode.data.transition);
    if (isUndef$1(data)) {
      return
    }

    /* istanbul ignore if */
    if (isDef$1(el._enterCb) || el.nodeType !== 1) {
      return
    }

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;

    // activeInstance will always be the <transition> component managing this
    // transition. One edge case to check is when the <transition> is placed
    // as the root node of a child component. In that case we need to check
    // <transition>'s parent for appear check.
    var context = activeInstance$1;
    var transitionNode = activeInstance$1.$vnode;
    while (transitionNode && transitionNode.parent) {
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert;

    if (isAppear && !appear && appear !== '') {
      return
    }

    var startClass = isAppear && appearClass
      ? appearClass
      : enterClass;
    var activeClass = isAppear && appearActiveClass
      ? appearActiveClass
      : enterActiveClass;
    var toClass = isAppear && appearToClass
      ? appearToClass
      : enterToClass;

    var beforeEnterHook = isAppear
      ? (beforeAppear || beforeEnter)
      : beforeEnter;
    var enterHook = isAppear
      ? (typeof appear === 'function' ? appear : enter)
      : enter;
    var afterEnterHook = isAppear
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook = isAppear
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    var explicitEnterDuration = toNumber$1(
      isObject$1(duration)
        ? duration.enter
        : duration
    );

    if ( explicitEnterDuration != null) {
      checkDuration$1(explicitEnterDuration, 'enter', vnode);
    }

    var expectsCSS = css !== false && !isIE9$1;
    var userWantsControl = getHookArgumentsLength$1(enterHook);

    var cb = el._enterCb = once$2(function () {
      if (expectsCSS) {
        removeTransitionClass$1(el, toClass);
        removeTransitionClass$1(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass$1(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      // remove pending leave element on enter by injecting an insert hook
      mergeVNodeHook$1(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // start enter transition
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass$1(el, startClass);
      addTransitionClass$1(el, activeClass);
      nextFrame$1(function () {
        removeTransitionClass$1(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass$1(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration$1(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds$1(el, type, cb);
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave$1 (vnode, rm) {
    var el = vnode.elm;

    // call enter callback now
    if (isDef$1(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition$1(vnode.data.transition);
    if (isUndef$1(data) || el.nodeType !== 1) {
      return rm()
    }

    /* istanbul ignore if */
    if (isDef$1(el._leaveCb)) {
      return
    }

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave;
    var leave = data.leave;
    var afterLeave = data.afterLeave;
    var leaveCancelled = data.leaveCancelled;
    var delayLeave = data.delayLeave;
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9$1;
    var userWantsControl = getHookArgumentsLength$1(leave);

    var explicitLeaveDuration = toNumber$1(
      isObject$1(duration)
        ? duration.leave
        : duration
    );

    if ( isDef$1(explicitLeaveDuration)) {
      checkDuration$1(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once$2(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass$1(el, leaveToClass);
        removeTransitionClass$1(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass$1(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () {
      // the delayed leave may have already been cancelled
      if (cb.cancelled) {
        return
      }
      // record leaving element
      if (!vnode.data.show && el.parentNode) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass$1(el, leaveClass);
        addTransitionClass$1(el, leaveActiveClass);
        nextFrame$1(function () {
          removeTransitionClass$1(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass$1(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration$1(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds$1(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  // only used in dev mode
  function checkDuration$1 (val, name, vnode) {
    if (typeof val !== 'number') {
      warn$2(
        "<transition> explicit " + name + " duration is not a valid number - " +
        "got " + (JSON.stringify(val)) + ".",
        vnode.context
      );
    } else if (isNaN(val)) {
      warn$2(
        "<transition> explicit " + name + " duration is NaN - " +
        'the duration expression might be incorrect.',
        vnode.context
      );
    }
  }

  function isValidDuration$1 (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  /**
   * Normalize a transition hook's argument length. The hook may be:
   * - a merged hook (invoker) with the original in .fns
   * - a wrapped component method (check ._length)
   * - a plain function (.length)
   */
  function getHookArgumentsLength$1 (fn) {
    if (isUndef$1(fn)) {
      return false
    }
    var invokerFns = fn.fns;
    if (isDef$1(invokerFns)) {
      // invoker
      return getHookArgumentsLength$1(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      return (fn._length || fn.length) > 1
    }
  }

  function _enter$1 (_, vnode) {
    if (vnode.data.show !== true) {
      enter$1(vnode);
    }
  }

  var transition$1 = inBrowser$2 ? {
    create: _enter$1,
    activate: _enter$1,
    remove: function remove$$1 (vnode, rm) {
      /* istanbul ignore else */
      if (vnode.data.show !== true) {
        leave$1(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules$1 = [
    attrs$1,
    klass$1,
    events$1,
    domProps$1,
    style$1,
    transition$1
  ];

  /*  */

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules$1 = platformModules$1.concat(baseModules$1);

  var patch$1 = createPatchFunction$1({ nodeOps: nodeOps$1, modules: modules$1 });

  /**
   * Not type checking this file because flow doesn't like attaching
   * properties to Elements.
   */

  /* istanbul ignore if */
  if (isIE9$1) {
    // http://www.matts411.com/post/internet-explorer-9-oninput/
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) {
        trigger$1(el, 'input');
      }
    });
  }

  var directive$1 = {
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        // #6903
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook$1(vnode, 'postpatch', function () {
            directive$1.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected$1(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue$1);
      } else if (vnode.tag === 'textarea' || isTextInputType$1(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener('compositionstart', onCompositionStart$1);
          el.addEventListener('compositionend', onCompositionEnd$1);
          // Safari < 10.2 & UIWebView doesn't fire compositionend when
          // switching focus before confirming composition choice
          // this also fixes the issue where some browsers e.g. iOS Chrome
          // fires "change" instead of "input" on autocomplete.
          el.addEventListener('change', onCompositionEnd$1);
          /* istanbul ignore if */
          if (isIE9$1) {
            el.vmodel = true;
          }
        }
      }
    },

    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected$1(el, binding, vnode.context);
        // in case the options rendered by v-for have changed,
        // it's possible that the value is out-of-sync with the rendered options.
        // detect such cases and filter out values that no longer has a matching
        // option in the DOM.
        var prevOptions = el._vOptions;
        var curOptions = el._vOptions = [].map.call(el.options, getValue$1);
        if (curOptions.some(function (o, i) { return !looseEqual$1(o, prevOptions[i]); })) {
          // trigger change event if
          // no matching option found for at least one value
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption$1(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption$1(binding.value, curOptions);
          if (needReset) {
            trigger$1(el, 'change');
          }
        }
      }
    }
  };

  function setSelected$1 (el, binding, vm) {
    actuallySetSelected$1(el, binding, vm);
    /* istanbul ignore if */
    if (isIE$1 || isEdge$1) {
      setTimeout(function () {
        actuallySetSelected$1(el, binding, vm);
      }, 0);
    }
  }

  function actuallySetSelected$1 (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
       warn$2(
        "<select multiple v-model=\"" + (binding.expression) + "\"> " +
        "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
        vm
      );
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf$1(value, getValue$1(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        if (looseEqual$1(getValue$1(option), value)) {
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }

  function hasNoMatchingOption$1 (value, options) {
    return options.every(function (o) { return !looseEqual$1(o, value); })
  }

  function getValue$1 (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  function onCompositionStart$1 (e) {
    e.target.composing = true;
  }

  function onCompositionEnd$1 (e) {
    // prevent triggering an input event for no reason
    if (!e.target.composing) { return }
    e.target.composing = false;
    trigger$1(e.target, 'input');
  }

  function trigger$1 (el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  /*  */

  // recursively search for possible transition defined inside the component root
  function locateNode$1 (vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode$1(vnode.componentInstance._vnode)
      : vnode
  }

  var show$1 = {
    bind: function bind (el, ref, vnode) {
      var value = ref.value;

      vnode = locateNode$1(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) {
        vnode.data.show = true;
        enter$1(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      /* istanbul ignore if */
      if (!value === !oldValue) { return }
      vnode = locateNode$1(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        vnode.data.show = true;
        if (value) {
          enter$1(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave$1(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  var platformDirectives$1 = {
    model: directive$1,
    show: show$1
  };

  /*  */

  var transitionProps$1 = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };

  // in case the child is also an abstract component, e.g. <keep-alive>
  // we want to recursively retrieve the real component to be rendered
  function getRealChild$1 (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild$1(getFirstComponentChild$1(compOptions.children))
    } else {
      return vnode
    }
  }

  function extractTransitionData$1 (comp) {
    var data = {};
    var options = comp.$options;
    // props
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    // events.
    // extract listeners and pass them directly to the transition methods
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize$1(key$1)] = listeners[key$1];
    }
    return data
  }

  function placeholder$1 (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  function hasParentTransition$1 (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) {
        return true
      }
    }
  }

  function isSameChild$1 (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  var isNotTextNode$1 = function (c) { return c.tag || isAsyncPlaceholder$1(c); };

  var isVShowDirective$1 = function (d) { return d.name === 'show'; };

  var Transition$1 = {
    name: 'transition',
    props: transitionProps$1,
    abstract: true,

    render: function render (h) {
      var this$1 = this;

      var children = this.$slots.default;
      if (!children) {
        return
      }

      // filter out text nodes (possible whitespaces)
      children = children.filter(isNotTextNode$1);
      /* istanbul ignore if */
      if (!children.length) {
        return
      }

      // warn multiple elements
      if ( children.length > 1) {
        warn$2(
          '<transition> can only be used on a single element. Use ' +
          '<transition-group> for lists.',
          this.$parent
        );
      }

      var mode = this.mode;

      // warn invalid mode
      if (
        mode && mode !== 'in-out' && mode !== 'out-in'
      ) {
        warn$2(
          'invalid <transition> mode: ' + mode,
          this.$parent
        );
      }

      var rawChild = children[0];

      // if this is a component root node and the component's
      // parent container node also has transition, skip.
      if (hasParentTransition$1(this.$vnode)) {
        return rawChild
      }

      // apply transition data to child
      // use getRealChild() to ignore abstract components e.g. keep-alive
      var child = getRealChild$1(rawChild);
      /* istanbul ignore if */
      if (!child) {
        return rawChild
      }

      if (this._leaving) {
        return placeholder$1(h, rawChild)
      }

      // ensure a key that is unique to the vnode type and to this transition
      // component instance. This key will be used to remove pending leaving nodes
      // during entering.
      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive$1(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData$1(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild$1(oldRawChild);

      // mark v-show
      // so that the transition module can hand over the control to the directive
      if (child.data.directives && child.data.directives.some(isVShowDirective$1)) {
        child.data.show = true;
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild$1(child, oldChild) &&
        !isAsyncPlaceholder$1(oldChild) &&
        // #6687 component root is a comment node
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {
        // replace old child transition data with fresh one
        // important for dynamic transitions!
        var oldData = oldChild.data.transition = extend$2({}, data);
        // handle transition mode
        if (mode === 'out-in') {
          // return placeholder node and queue update when leave finishes
          this._leaving = true;
          mergeVNodeHook$1(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder$1(h, rawChild)
        } else if (mode === 'in-out') {
          if (isAsyncPlaceholder$1(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook$1(data, 'afterEnter', performLeave);
          mergeVNodeHook$1(data, 'enterCancelled', performLeave);
          mergeVNodeHook$1(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }

      return rawChild
    }
  };

  /*  */

  var props$1 = extend$2({
    tag: String,
    moveClass: String
  }, transitionProps$1);

  delete props$1.mode;

  var TransitionGroup$1 = {
    props: props$1,

    beforeMount: function beforeMount () {
      var this$1 = this;

      var update = this._update;
      this._update = function (vnode, hydrating) {
        var restoreActiveInstance = setActiveInstance$1(this$1);
        // force removing pass
        this$1.__patch__(
          this$1._vnode,
          this$1.kept,
          false, // hydrating
          true // removeOnly (!important, avoids unnecessary moves)
        );
        this$1._vnode = this$1.kept;
        restoreActiveInstance();
        update.call(this$1, vnode, hydrating);
      };
    },

    render: function render (h) {
      var tag = this.tag || this.$vnode.data.tag || 'span';
      var map = Object.create(null);
      var prevChildren = this.prevChildren = this.children;
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      var transitionData = extractTransitionData$1(this);

      for (var i = 0; i < rawChildren.length; i++) {
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c);
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          } else {
            var opts = c.componentOptions;
            var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
            warn$2(("<transition-group> children must be keyed: <" + name + ">"));
          }
        }
      }

      if (prevChildren) {
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          c$1.data.transition = transitionData;
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        this.kept = h(tag, null, kept);
        this.removed = removed;
      }

      return h(tag, null, children)
    },

    updated: function updated () {
      var children = this.prevChildren;
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      // we divide the work into three loops to avoid mixing DOM reads and writes
      // in each iteration - which helps prevent layout thrashing.
      children.forEach(callPendingCbs$1);
      children.forEach(recordPosition$1);
      children.forEach(applyTranslation$1);

      // force reflow to put everything in position
      // assign to this to avoid being removed in tree-shaking
      // $flow-disable-line
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          addTransitionClass$1(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent$1, el._moveCb = function cb (e) {
            if (e && e.target !== el) {
              return
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent$1, cb);
              el._moveCb = null;
              removeTransitionClass$1(el, moveClass);
            }
          });
        }
      });
    },

    methods: {
      hasMove: function hasMove (el, moveClass) {
        /* istanbul ignore if */
        if (!hasTransition$1) {
          return false
        }
        /* istanbul ignore if */
        if (this._hasMove) {
          return this._hasMove
        }
        // Detect whether an element with the move class applied has
        // CSS transitions. Since the element may be inside an entering
        // transition at this very moment, we make a clone of it and remove
        // all other transition classes applied to ensure only the move class
        // is applied.
        var clone = el.cloneNode();
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass$1(clone, cls); });
        }
        addClass$1(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        var info = getTransitionInfo$1(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  function callPendingCbs$1 (c) {
    /* istanbul ignore if */
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    /* istanbul ignore if */
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }

  function recordPosition$1 (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  function applyTranslation$1 (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  var platformComponents$1 = {
    Transition: Transition$1,
    TransitionGroup: TransitionGroup$1
  };

  /*  */

  // install platform specific utils
  Vue$1.config.mustUseProp = mustUseProp$1;
  Vue$1.config.isReservedTag = isReservedTag$1;
  Vue$1.config.isReservedAttr = isReservedAttr$1;
  Vue$1.config.getTagNamespace = getTagNamespace$1;
  Vue$1.config.isUnknownElement = isUnknownElement$1;

  // install platform runtime directives & components
  extend$2(Vue$1.options.directives, platformDirectives$1);
  extend$2(Vue$1.options.components, platformComponents$1);

  // install platform patch function
  Vue$1.prototype.__patch__ = inBrowser$2 ? patch$1 : noop$2;

  // public mount method
  Vue$1.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && inBrowser$2 ? query$1(el) : undefined;
    return mountComponent$1(this, el, hydrating)
  };

  // devtools global hook
  /* istanbul ignore next */
  if (inBrowser$2) {
    setTimeout(function () {
      if (config$1.devtools) {
        if (devtools$1) {
          devtools$1.emit('init', Vue$1);
        } else {
          console[console.info ? 'info' : 'log'](
            'Download the Vue Devtools extension for a better development experience:\n' +
            'https://github.com/vuejs/vue-devtools'
          );
        }
      }
      if (
        config$1.productionTip !== false &&
        typeof console !== 'undefined'
      ) {
        console[console.info ? 'info' : 'log'](
          "You are running Vue in development mode.\n" +
          "Make sure to turn on production mode when deploying for production.\n" +
          "See more tips at https://vuejs.org/guide/deployment.html"
        );
      }
    }, 0);
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  var typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error'
  };
  var script = {
    data: function data() {
      return {
        visible: false,
        title: '',
        message: '',
        duration: 4500,
        type: '',
        showClose: true,
        customClass: '',
        iconClass: '',
        onClose: null,
        onClick: null,
        closed: false,
        verticalOffset: 0,
        timer: null,
        dangerouslyUseHTMLString: false,
        position: 'top-right'
      };
    },
    computed: {
      typeClass: function typeClass() {
        return this.type && typeMap[this.type] ? "el-icon-".concat(typeMap[this.type]) : '';
      },
      horizontalClass: function horizontalClass() {
        return this.position.indexOf('right') > -1 ? 'right' : 'left';
      },
      verticalProperty: function verticalProperty() {
        return /^top-/.test(this.position) ? 'top' : 'bottom';
      },
      positionStyle: function positionStyle() {
        return _defineProperty({}, this.verticalProperty, "".concat(this.verticalOffset, "px"));
      }
    },
    watch: {
      closed: function closed(newVal) {
        if (newVal) {
          this.visible = false;
          this.$el.addEventListener('transitionend', this.destroyElement);
        }
      }
    },
    methods: {
      destroyElement: function destroyElement() {
        this.$el.removeEventListener('transitionend', this.destroyElement);
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },
      click: function click() {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      },
      close: function close() {
        this.closed = true;

        if (typeof this.onClose === 'function') {
          this.onClose();
        }
      },
      clearTimer: function clearTimer() {
        clearTimeout(this.timer);
      },
      startTimer: function startTimer() {
        var _this = this;

        if (this.duration > 0) {
          this.timer = setTimeout(function () {
            if (!_this.closed) {
              _this.close();
            }
          }, this.duration);
        }
      },
      keydown: function keydown(e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          this.clearTimer(); // detele 取消倒计时
        } else if (e.keyCode === 27) {
          // esc关闭消息
          if (!this.closed) {
            this.close();
          }
        } else {
          this.startTimer(); // 恢复倒计时
        }
      }
    },
    mounted: function mounted() {
      var _this2 = this;

      if (this.duration > 0) {
        this.timer = setTimeout(function () {
          if (!_this2.closed) {
            _this2.close();
          }
        }, this.duration);
      }

      document.addEventListener('keydown', this.keydown);
    },
    beforeDestroy: function beforeDestroy() {
      document.removeEventListener('keydown', this.keydown);
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  /* script */
  var __vue_script__ = script;
  /* template */

  var __vue_render__ = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("transition", {
      attrs: {
        name: "el-notification-fade"
      }
    }, [_c("div", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.visible,
        expression: "visible"
      }],
      "class": ["el-notification", _vm.customClass, _vm.horizontalClass],
      style: _vm.positionStyle,
      attrs: {
        role: "alert"
      },
      on: {
        mouseenter: function mouseenter($event) {
          return _vm.clearTimer();
        },
        mouseleave: function mouseleave($event) {
          return _vm.startTimer();
        },
        click: _vm.click
      }
    }, [_vm.type || _vm.iconClass ? _c("i", {
      staticClass: "el-notification__icon",
      "class": [_vm.typeClass, _vm.iconClass]
    }) : _vm._e(), _vm._v(" "), _c("div", {
      staticClass: "el-notification__group",
      "class": {
        "is-with-icon": _vm.typeClass || _vm.iconClass
      }
    }, [_c("h2", {
      staticClass: "el-notification__title",
      domProps: {
        textContent: _vm._s(_vm.title)
      }
    }), _vm._v(" "), _c("div", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.message,
        expression: "message"
      }],
      staticClass: "el-notification__content"
    }, [_vm._t("default", function () {
      return [!_vm.dangerouslyUseHTMLString ? _c("p", [_vm._v(_vm._s(_vm.message))]) : _c("p", {
        domProps: {
          innerHTML: _vm._s(_vm.message)
        }
      })];
    })], 2), _vm._v(" "), _vm.showClose ? _c("div", {
      staticClass: "el-notification__closeBtn el-icon-close",
      on: {
        click: function click($event) {
          $event.stopPropagation();
          return _vm.close.apply(null, arguments);
        }
      }
    }) : _vm._e()])])]);
  };

  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;
  /* style */

  var __vue_inject_styles__ = undefined;
  /* scoped */

  var __vue_scope_id__ = undefined;
  /* module identifier */

  var __vue_module_identifier__ = undefined;
  /* functional template */

  var __vue_is_functional_template__ = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__ = /*#__PURE__*/normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
  }, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

  function merge(target) {
    for (let i = 1, j = arguments.length; i < j; i++) {
      let source = arguments[i] || {};
      for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
          let value = source[prop];
          if (value !== undefined) {
            target[prop] = value;
          }
        }
      }
    }

    return target;
  }

  /* istanbul ignore next */

  const isServer = Vue$1.prototype.$isServer;

  /* istanbul ignore next */
  const trim = function(string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
  };

  /* istanbul ignore next */
  function hasClass(el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
  }
  /* istanbul ignore next */
  function addClass$2(el, cls) {
    if (!el) return;
    var curClass = el.className;
    var classes = (cls || '').split(' ');

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.add(clsName);
      } else if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
    if (!el.classList) {
      el.setAttribute('class', curClass);
    }
  }
  /* istanbul ignore next */
  function removeClass$2(el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' ');
    var curClass = ' ' + el.className + ' ';

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.remove(clsName);
      } else if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
    if (!el.classList) {
      el.setAttribute('class', trim(curClass));
    }
  }

  let hasModal = false;
  let hasInitZIndex = false;
  let zIndex;

  const getModal = function() {
    if (Vue$1.prototype.$isServer) return;
    let modalDom = PopupManager.modalDom;
    if (modalDom) {
      hasModal = true;
    } else {
      hasModal = false;
      modalDom = document.createElement('div');
      PopupManager.modalDom = modalDom;

      modalDom.addEventListener('touchmove', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });

      modalDom.addEventListener('click', function() {
        PopupManager.doOnModalClick && PopupManager.doOnModalClick();
      });
    }

    return modalDom;
  };

  const instances = {};

  const PopupManager = {
    modalFade: true,

    getInstance: function(id) {
      return instances[id];
    },

    register: function(id, instance) {
      if (id && instance) {
        instances[id] = instance;
      }
    },

    deregister: function(id) {
      if (id) {
        instances[id] = null;
        delete instances[id];
      }
    },

    nextZIndex: function() {
      return PopupManager.zIndex++;
    },

    modalStack: [],

    doOnModalClick: function() {
      const topItem = PopupManager.modalStack[PopupManager.modalStack.length - 1];
      if (!topItem) return;

      const instance = PopupManager.getInstance(topItem.id);
      if (instance && instance.closeOnClickModal) {
        instance.close();
      }
    },

    openModal: function(id, zIndex, dom, modalClass, modalFade) {
      if (Vue$1.prototype.$isServer) return;
      if (!id || zIndex === undefined) return;
      this.modalFade = modalFade;

      const modalStack = this.modalStack;

      for (let i = 0, j = modalStack.length; i < j; i++) {
        const item = modalStack[i];
        if (item.id === id) {
          return;
        }
      }

      const modalDom = getModal();

      addClass$2(modalDom, 'v-modal');
      if (this.modalFade && !hasModal) {
        addClass$2(modalDom, 'v-modal-enter');
      }
      if (modalClass) {
        let classArr = modalClass.trim().split(/\s+/);
        classArr.forEach(item => addClass$2(modalDom, item));
      }
      setTimeout(() => {
        removeClass$2(modalDom, 'v-modal-enter');
      }, 200);

      if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
        dom.parentNode.appendChild(modalDom);
      } else {
        document.body.appendChild(modalDom);
      }

      if (zIndex) {
        modalDom.style.zIndex = zIndex;
      }
      modalDom.tabIndex = 0;
      modalDom.style.display = '';

      this.modalStack.push({ id: id, zIndex: zIndex, modalClass: modalClass });
    },

    closeModal: function(id) {
      const modalStack = this.modalStack;
      const modalDom = getModal();

      if (modalStack.length > 0) {
        const topItem = modalStack[modalStack.length - 1];
        if (topItem.id === id) {
          if (topItem.modalClass) {
            let classArr = topItem.modalClass.trim().split(/\s+/);
            classArr.forEach(item => removeClass$2(modalDom, item));
          }

          modalStack.pop();
          if (modalStack.length > 0) {
            modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex;
          }
        } else {
          for (let i = modalStack.length - 1; i >= 0; i--) {
            if (modalStack[i].id === id) {
              modalStack.splice(i, 1);
              break;
            }
          }
        }
      }

      if (modalStack.length === 0) {
        if (this.modalFade) {
          addClass$2(modalDom, 'v-modal-leave');
        }
        setTimeout(() => {
          if (modalStack.length === 0) {
            if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom);
            modalDom.style.display = 'none';
            PopupManager.modalDom = undefined;
          }
          removeClass$2(modalDom, 'v-modal-leave');
        }, 200);
      }
    }
  };

  Object.defineProperty(PopupManager, 'zIndex', {
    configurable: true,
    get() {
      if (!hasInitZIndex) {
        zIndex = zIndex || (Vue$1.prototype.$ELEMENT || {}).zIndex || 2000;
        hasInitZIndex = true;
      }
      return zIndex;
    },
    set(value) {
      zIndex = value;
    }
  });

  const getTopPopup = function() {
    if (Vue$1.prototype.$isServer) return;
    if (PopupManager.modalStack.length > 0) {
      const topPopup = PopupManager.modalStack[PopupManager.modalStack.length - 1];
      if (!topPopup) return;
      const instance = PopupManager.getInstance(topPopup.id);

      return instance;
    }
  };

  if (!Vue$1.prototype.$isServer) {
    // handle `esc` key when the popup is shown
    window.addEventListener('keydown', function(event) {
      if (event.keyCode === 27) {
        const topPopup = getTopPopup();

        if (topPopup && topPopup.closeOnPressEscape) {
          topPopup.handleClose
            ? topPopup.handleClose()
            : (topPopup.handleAction ? topPopup.handleAction('cancel') : topPopup.close());
        }
      }
    });
  }

  if (typeof /./ !== 'function' && typeof Int8Array !== 'object' && (Vue$1.prototype.$isServer || typeof document.childNodes !== 'function')) ;

  const hasOwnProperty$2 = Object.prototype.hasOwnProperty;

  function hasOwn$2(obj, key) {
    return hasOwnProperty$2.call(obj, key);
  }

  function isVNode(node) {
    return node !== null && typeof node === 'object' && hasOwn$2(node, 'componentOptions');
  }

  var NotificationConstructor = Vue$1.extend(__vue_component__);
  var instance;
  var instances$1 = [];
  var seed = 1;

  var Notification = function Notification(options) {
    if (Vue$1.prototype.$isServer) return;
    options = merge({}, options);
    var userOnClose = options.onClose;
    var id = 'notification_' + seed++;
    var position = options.position || 'top-right';

    options.onClose = function () {
      Notification.close(id, userOnClose);
    };

    instance = new NotificationConstructor({
      data: options
    });

    if (isVNode(options.message)) {
      instance.$slots["default"] = [options.message];
      options.message = 'REPLACED_BY_VNODE';
    }

    instance.id = id;
    instance.$mount();
    document.body.appendChild(instance.$el);
    instance.visible = true;
    instance.dom = instance.$el;
    instance.dom.style.zIndex = PopupManager.nextZIndex();
    var verticalOffset = options.offset || 0;
    instances$1.filter(function (item) {
      return item.position === position;
    }).forEach(function (item) {
      verticalOffset += item.$el.offsetHeight + 16;
    });
    verticalOffset += 16;
    instance.verticalOffset = verticalOffset;
    instances$1.push(instance);
    return instance;
  };

  ['success', 'warning', 'info', 'error'].forEach(function (type) {
    Notification[type] = function (options) {
      if (typeof options === 'string' || isVNode(options)) {
        options = {
          message: options
        };
      }

      options.type = type;
      return Notification(options);
    };
  });

  Notification.close = function (id, userOnClose) {
    var index = -1;
    var len = instances$1.length;
    var instance = instances$1.filter(function (instance, i) {
      if (instance.id === id) {
        index = i;
        return true;
      }

      return false;
    })[0];
    if (!instance) return;

    if (typeof userOnClose === 'function') {
      userOnClose(instance);
    }

    instances$1.splice(index, 1);
    if (len <= 1) return;
    var position = instance.position;
    var removedHeight = instance.dom.offsetHeight;

    for (var i = index; i < len - 1; i++) {
      if (instances$1[i].position === position) {
        instances$1[i].dom.style[instance.verticalProperty] = parseInt(instances$1[i].dom.style[instance.verticalProperty], 10) - removedHeight - 16 + 'px';
      }
    }
  };

  Notification.closeAll = function () {
    for (var i = instances$1.length - 1; i >= 0; i--) {
      instances$1[i].close();
    }
  };

  function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
      var name = child.$options.componentName;

      if (name === componentName) {
        child.$emit.apply(child, [eventName].concat(params));
      } else {
        broadcast.apply(child, [componentName, eventName].concat([params]));
      }
    });
  }
  var Emitter = {
    methods: {
      dispatch(componentName, eventName, params) {
        var parent = this.$parent || this.$root;
        var name = parent.$options.componentName;

        while (parent && (!name || name !== componentName)) {
          parent = parent.$parent;

          if (parent) {
            name = parent.$options.componentName;
          }
        }
        if (parent) {
          parent.$emit.apply(parent, [eventName].concat(params));
        }
      },
      broadcast(componentName, eventName, params) {
        broadcast.call(this, componentName, eventName, params);
      }
    }
  };

  function Focus(ref) {
    return {
      methods: {
        focus() {
          this.$refs[ref].focus();
        }
      }
    };
  }

  var defaultLang = {
    el: {
      colorpicker: {
        confirm: '确定',
        clear: '清空'
      },
      datepicker: {
        now: '此刻',
        today: '今天',
        cancel: '取消',
        clear: '清空',
        confirm: '确定',
        selectDate: '选择日期',
        selectTime: '选择时间',
        startDate: '开始日期',
        startTime: '开始时间',
        endDate: '结束日期',
        endTime: '结束时间',
        prevYear: '前一年',
        nextYear: '后一年',
        prevMonth: '上个月',
        nextMonth: '下个月',
        year: '年',
        month1: '1 月',
        month2: '2 月',
        month3: '3 月',
        month4: '4 月',
        month5: '5 月',
        month6: '6 月',
        month7: '7 月',
        month8: '8 月',
        month9: '9 月',
        month10: '10 月',
        month11: '11 月',
        month12: '12 月',
        // week: '周次',
        weeks: {
          sun: '日',
          mon: '一',
          tue: '二',
          wed: '三',
          thu: '四',
          fri: '五',
          sat: '六'
        },
        months: {
          jan: '一月',
          feb: '二月',
          mar: '三月',
          apr: '四月',
          may: '五月',
          jun: '六月',
          jul: '七月',
          aug: '八月',
          sep: '九月',
          oct: '十月',
          nov: '十一月',
          dec: '十二月'
        }
      },
      select: {
        loading: '加载中',
        noMatch: '无匹配数据',
        noData: '无数据',
        placeholder: '请选择'
      },
      cascader: {
        noMatch: '无匹配数据',
        loading: '加载中',
        placeholder: '请选择',
        noData: '暂无数据'
      },
      pagination: {
        goto: '前往',
        pagesize: '条/页',
        total: '共 {total} 条',
        pageClassifier: '页'
      },
      messagebox: {
        title: '提示',
        confirm: '确定',
        cancel: '取消',
        error: '输入的数据不合法!'
      },
      upload: {
        deleteTip: '按 delete 键可删除',
        delete: '删除',
        preview: '查看图片',
        continue: '继续上传'
      },
      table: {
        emptyText: '暂无数据',
        confirmFilter: '筛选',
        resetFilter: '重置',
        clearFilter: '全部',
        sumText: '合计'
      },
      tree: {
        emptyText: '暂无数据'
      },
      transfer: {
        noMatch: '无匹配数据',
        noData: '无数据',
        titles: ['列表 1', '列表 2'],
        filterPlaceholder: '请输入搜索内容',
        noCheckedFormat: '共 {total} 项',
        hasCheckedFormat: '已选 {checked}/{total} 项'
      },
      image: {
        error: '加载失败'
      },
      pageHeader: {
        title: '返回'
      },
      popconfirm: {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      },
      empty: {
        description: '暂无数据'
      }
    }
  };

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
      return Array.isArray(val) ? [] : {}
  }

  function cloneIfNecessary(value, optionsArgument) {
      var clone = optionsArgument && optionsArgument.clone === true;
      return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
  }

  function defaultArrayMerge(target, source, optionsArgument) {
      var destination = target.slice();
      source.forEach(function(e, i) {
          if (typeof destination[i] === 'undefined') {
              destination[i] = cloneIfNecessary(e, optionsArgument);
          } else if (isMergeableObject(e)) {
              destination[i] = deepmerge(target[i], e, optionsArgument);
          } else if (target.indexOf(e) === -1) {
              destination.push(cloneIfNecessary(e, optionsArgument));
          }
      });
      return destination
  }

  function mergeObject(target, source, optionsArgument) {
      var destination = {};
      if (isMergeableObject(target)) {
          Object.keys(target).forEach(function(key) {
              destination[key] = cloneIfNecessary(target[key], optionsArgument);
          });
      }
      Object.keys(source).forEach(function(key) {
          if (!isMergeableObject(source[key]) || !target[key]) {
              destination[key] = cloneIfNecessary(source[key], optionsArgument);
          } else {
              destination[key] = deepmerge(target[key], source[key], optionsArgument);
          }
      });
      return destination
  }

  function deepmerge(target, source, optionsArgument) {
      var sourceIsArray = Array.isArray(source);
      var targetIsArray = Array.isArray(target);
      var options = optionsArgument || { arrayMerge: defaultArrayMerge };
      var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

      if (!sourceAndTargetTypesMatch) {
          return cloneIfNecessary(source, optionsArgument)
      } else if (sourceIsArray) {
          var arrayMerge = options.arrayMerge || defaultArrayMerge;
          return arrayMerge(target, source, optionsArgument)
      } else {
          return mergeObject(target, source, optionsArgument)
      }
  }

  deepmerge.all = function deepmergeAll(array, optionsArgument) {
      if (!Array.isArray(array) || array.length < 2) {
          throw new Error('first argument should be an array with at least two elements')
      }

      // we are sure there are at least 2 values, so it is safe to have no initial value
      return array.reduce(function(prev, next) {
          return deepmerge(prev, next, optionsArgument)
      })
  };

  var deepmerge_1 = deepmerge;

  if (typeof /./ !== 'function' && typeof Int8Array !== 'object' && (Vue.prototype.$isServer || typeof document.childNodes !== 'function')) ;

  const hasOwnProperty$3 = Object.prototype.hasOwnProperty;

  function hasOwn$3(obj, key) {
    return hasOwnProperty$3.call(obj, key);
  }
  function extend$3(to, _from) {
    for (let key in _from) {
      to[key] = _from[key];
    }
    return to;
  }
  function toObject$2(arr) {
    var res = {};
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend$3(res, arr[i]);
      }
    }
    return res;
  }
  const getValueByPath = function(object, prop) {
    prop = prop || '';
    const paths = prop.split('.');
    let current = object;
    let result = null;
    for (let i = 0, j = paths.length; i < j; i++) {
      const path = paths[i];
      if (!current) break;

      if (i === j - 1) {
        result = current[path];
        break;
      }
      current = current[path];
    }
    return result;
  };

  const valueEquals = (a, b) => {
    // see: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
    if (a === b) return true;
    if (!(a instanceof Array)) return false;
    if (!(b instanceof Array)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i !== a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const escapeRegexpString = (value = '') => String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

  const isIE$2 = function() {
    return !Vue.prototype.$isServer && !isNaN(Number(document.documentMode));
  };

  const isEdge$2 = function() {
    return !Vue.prototype.$isServer && navigator.userAgent.indexOf('Edge') > -1;
  };

  const kebabCase = function(str) {
    const hyphenateRE = /([^-])([A-Z])/g;
    return str
      .replace(hyphenateRE, '$1-$2')
      .replace(hyphenateRE, '$1-$2')
      .toLowerCase();
  };

  const RE_NARGS = /(%|)\{([0-9a-zA-Z_]+)\}/g;
  /**
   *  String format template
   *  - Inspired:
   *    https://github.com/Matt-Esch/string-template/index.js
   */
  function Format(Vue) {

    /**
     * template
     *
     * @param {String} string
     * @param {Array} ...args
     * @return {String}
     */

    function template(string, ...args) {
      if (args.length === 1 && typeof args[0] === 'object') {
        args = args[0];
      }

      if (!args || !args.hasOwnProperty) {
        args = {};
      }

      return string.replace(RE_NARGS, (match, prefix, i, index) => {
        let result;

        if (string[index - 1] === '{' &&
          string[index + match.length] === '}') {
          return i;
        } else {
          result = hasOwn$3(args, i) ? args[i] : null;
          if (result === null || result === undefined) {
            return '';
          }

          return result;
        }
      });
    }

    return template;
  }

  const format = Format();
  let lang = defaultLang;
  let merged = false;
  let i18nHandler = function() {
    const vuei18n = Object.getPrototypeOf(this || Vue).$t;
    if (typeof vuei18n === 'function' && !!Vue.locale) {
      if (!merged) {
        merged = true;
        Vue.locale(
          Vue.config.lang,
          deepmerge_1(lang, Vue.locale(Vue.config.lang) || {}, { clone: true })
        );
      }
      return vuei18n.apply(this, arguments);
    }
  };

  const t = function(path, options) {
    let value = i18nHandler.apply(this, arguments);
    if (value !== null && value !== undefined) return value;

    const array = path.split('.');
    let current = lang;

    for (let i = 0, j = array.length; i < j; i++) {
      const property = array[i];
      value = current[property];
      if (i === j - 1) return format(value, options);
      if (!value) return '';
      current = value;
    }
    return '';
  };

  var Locale = {
    methods: {
      t(...args) {
        return t.apply(this, args);
      }
    }
  };

  /**
   * Show migrating guide in browser console.
   *
   * Usage:
   * import Migrating from 'element-ui/src/mixins/migrating';
   *
   * mixins: [Migrating]
   *
   * add getMigratingConfig method for your component.
   *  getMigratingConfig() {
   *    return {
   *      props: {
   *        'allow-no-selection': 'allow-no-selection is removed.',
   *        'selection-mode': 'selection-mode is removed.'
   *      },
   *      events: {
   *        selectionchange: 'selectionchange is renamed to selection-change.'
   *      }
   *    };
   *  },
   */
  var Migrating = {
    mounted() {
      if (!this.$vnode) return;
      const { props = {}, events = {} } = this.getMigratingConfig();
      const { data, componentOptions } = this.$vnode;
      const definedProps = data.attrs || {};
      const definedEvents = componentOptions.listeners || {};

      for (let propName in definedProps) {
        propName = kebabCase(propName); // compatible with camel case
        if (props[propName]) {
          console.warn(`[Element Migrating][${this.$options.name}][Attribute]: ${props[propName]}`);
        }
      }

      for (let eventName in definedEvents) {
        eventName = kebabCase(eventName); // compatible with camel case
        if (events[eventName]) {
          console.warn(`[Element Migrating][${this.$options.name}][Event]: ${events[eventName]}`);
        }
      }
    },
    methods: {
      getMigratingConfig() {
        return {
          props: {},
          events: {}
        };
      }
    }
  };

  var hiddenTextarea;
  var HIDDEN_STYLE = "\n  height:0 !important;\n  visibility:hidden !important;\n  overflow:hidden !important;\n  position:absolute !important;\n  z-index:-1000 !important;\n  top:0 !important;\n  right:0 !important\n";
  var CONTEXT_STYLE = ['letter-spacing', 'line-height', 'padding-top', 'padding-bottom', 'font-family', 'font-weight', 'font-size', 'text-rendering', 'text-transform', 'width', 'text-indent', 'padding-left', 'padding-right', 'border-width', 'box-sizing'];

  function calculateNodeStyling(targetElement) {
    var style = window.getComputedStyle(targetElement);
    var boxSizing = style.getPropertyValue('box-sizing');
    var paddingSize = parseFloat(style.getPropertyValue('padding-bottom')) + parseFloat(style.getPropertyValue('padding-top'));
    var borderSize = parseFloat(style.getPropertyValue('border-bottom-width')) + parseFloat(style.getPropertyValue('border-top-width'));
    var contextStyle = CONTEXT_STYLE.map(function (name) {
      return "".concat(name, ":").concat(style.getPropertyValue(name));
    }).join(';');
    return {
      contextStyle: contextStyle,
      paddingSize: paddingSize,
      borderSize: borderSize,
      boxSizing: boxSizing
    };
  }

  function calcTextareaHeight(targetElement) {
    var minRows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var maxRows = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (!hiddenTextarea) {
      hiddenTextarea = document.createElement('textarea');
      document.body.appendChild(hiddenTextarea);
    }

    var _calculateNodeStyling = calculateNodeStyling(targetElement),
        paddingSize = _calculateNodeStyling.paddingSize,
        borderSize = _calculateNodeStyling.borderSize,
        boxSizing = _calculateNodeStyling.boxSizing,
        contextStyle = _calculateNodeStyling.contextStyle;

    hiddenTextarea.setAttribute('style', "".concat(contextStyle, ";").concat(HIDDEN_STYLE));
    hiddenTextarea.value = targetElement.value || targetElement.placeholder || '';
    var height = hiddenTextarea.scrollHeight;
    var result = {};

    if (boxSizing === 'border-box') {
      height = height + borderSize;
    } else if (boxSizing === 'content-box') {
      height = height - paddingSize;
    }

    hiddenTextarea.value = '';
    var singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;

    if (minRows !== null) {
      var minHeight = singleRowHeight * minRows;

      if (boxSizing === 'border-box') {
        minHeight = minHeight + paddingSize + borderSize;
      }

      height = Math.max(minHeight, height);
      result.minHeight = "".concat(minHeight, "px");
    }

    if (maxRows !== null) {
      var maxHeight = singleRowHeight * maxRows;

      if (boxSizing === 'border-box') {
        maxHeight = maxHeight + paddingSize + borderSize;
      }

      height = Math.min(maxHeight, height);
    }

    result.height = "".concat(height, "px");
    hiddenTextarea.parentNode && hiddenTextarea.parentNode.removeChild(hiddenTextarea);
    hiddenTextarea = null;
    return result;
  }

  function merge$1(target) {
    for (let i = 1, j = arguments.length; i < j; i++) {
      let source = arguments[i] || {};
      for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
          let value = source[prop];
          if (value !== undefined) {
            target[prop] = value;
          }
        }
      }
    }

    return target;
  }

  function isKorean(text) {
    const reg = /([(\uAC00-\uD7AF)|(\u3130-\u318F)])+/gi;
    return reg.test(text);
  }

  //
  var script$1 = {
    name: 'ElInput',
    componentName: 'ElInput',
    mixins: [Emitter, Migrating],
    inheritAttrs: false,
    inject: {
      elForm: {
        "default": ''
      },
      elFormItem: {
        "default": ''
      }
    },
    data: function data() {
      return {
        textareaCalcStyle: {},
        hovering: false,
        focused: false,
        isComposing: false,
        passwordVisible: false
      };
    },
    props: {
      value: [String, Number],
      size: String,
      resize: String,
      form: String,
      disabled: Boolean,
      readonly: Boolean,
      type: {
        type: String,
        "default": 'text'
      },
      autosize: {
        type: [Boolean, Object],
        "default": false
      },
      autocomplete: {
        type: String,
        "default": 'off'
      },

      /** @Deprecated in next major version */
      autoComplete: {
        type: String,
        validator: function validator(val) {
           console.warn('[Element Warn][Input]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
          return true;
        }
      },
      validateEvent: {
        type: Boolean,
        "default": true
      },
      suffixIcon: String,
      prefixIcon: String,
      label: String,
      clearable: {
        type: Boolean,
        "default": false
      },
      showPassword: {
        type: Boolean,
        "default": false
      },
      showWordLimit: {
        type: Boolean,
        "default": false
      },
      tabindex: String
    },
    computed: {
      _elFormItemSize: function _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      validateState: function validateState() {
        return this.elFormItem ? this.elFormItem.validateState : '';
      },
      needStatusIcon: function needStatusIcon() {
        return this.elForm ? this.elForm.statusIcon : false;
      },
      validateIcon: function validateIcon() {
        return {
          validating: 'el-icon-loading',
          success: 'el-icon-circle-check',
          error: 'el-icon-circle-close'
        }[this.validateState];
      },
      textareaStyle: function textareaStyle() {
        return merge$1({}, this.textareaCalcStyle, {
          resize: this.resize
        });
      },
      inputSize: function inputSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      inputDisabled: function inputDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      nativeInputValue: function nativeInputValue() {
        return this.value === null || this.value === undefined ? '' : String(this.value);
      },
      showClear: function showClear() {
        return this.clearable && !this.inputDisabled && !this.readonly && this.nativeInputValue && (this.focused || this.hovering);
      },
      showPwdVisible: function showPwdVisible() {
        return this.showPassword && !this.inputDisabled && !this.readonly && (!!this.nativeInputValue || this.focused);
      },
      isWordLimitVisible: function isWordLimitVisible() {
        return this.showWordLimit && this.$attrs.maxlength && (this.type === 'text' || this.type === 'textarea') && !this.inputDisabled && !this.readonly && !this.showPassword;
      },
      upperLimit: function upperLimit() {
        return this.$attrs.maxlength;
      },
      textLength: function textLength() {
        if (typeof this.value === 'number') {
          return String(this.value).length;
        }

        return (this.value || '').length;
      },
      inputExceed: function inputExceed() {
        // show exceed style if length of initial value greater then maxlength
        return this.isWordLimitVisible && this.textLength > this.upperLimit;
      }
    },
    watch: {
      value: function value(val) {
        this.$nextTick(this.resizeTextarea);

        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.change', [val]);
        }
      },
      // native input value is set explicitly
      // do not use v-model / :value in template
      // see: https://github.com/ElemeFE/element/issues/14521
      nativeInputValue: function nativeInputValue() {
        this.setNativeInputValue();
      },
      // when change between <input> and <textarea>,
      // update DOM dependent value and styles
      // https://github.com/ElemeFE/element/issues/14857
      type: function type() {
        var _this = this;

        this.$nextTick(function () {
          _this.setNativeInputValue();

          _this.resizeTextarea();

          _this.updateIconOffset();
        });
      }
    },
    methods: {
      focus: function focus() {
        this.getInput().focus();
      },
      blur: function blur() {
        this.getInput().blur();
      },
      getMigratingConfig: function getMigratingConfig() {
        return {
          props: {
            'icon': 'icon is removed, use suffix-icon / prefix-icon instead.',
            'on-icon-click': 'on-icon-click is removed.'
          },
          events: {
            'click': 'click is removed.'
          }
        };
      },
      handleBlur: function handleBlur(event) {
        this.focused = false;
        this.$emit('blur', event);

        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.blur', [this.value]);
        }
      },
      select: function select() {
        this.getInput().select();
      },
      resizeTextarea: function resizeTextarea() {
        if (this.$isServer) return;
        var autosize = this.autosize,
            type = this.type;
        if (type !== 'textarea') return;

        if (!autosize) {
          this.textareaCalcStyle = {
            minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
          };
          return;
        }

        var minRows = autosize.minRows;
        var maxRows = autosize.maxRows;
        this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
      },
      setNativeInputValue: function setNativeInputValue() {
        var input = this.getInput();
        if (!input) return;
        if (input.value === this.nativeInputValue) return;
        input.value = this.nativeInputValue;
      },
      handleFocus: function handleFocus(event) {
        this.focused = true;
        this.$emit('focus', event);
      },
      handleCompositionStart: function handleCompositionStart(event) {
        this.$emit('compositionstart', event);
        this.isComposing = true;
      },
      handleCompositionUpdate: function handleCompositionUpdate(event) {
        this.$emit('compositionupdate', event);
        var text = event.target.value;
        var lastCharacter = text[text.length - 1] || '';
        this.isComposing = !isKorean(lastCharacter);
      },
      handleCompositionEnd: function handleCompositionEnd(event) {
        this.$emit('compositionend', event);

        if (this.isComposing) {
          this.isComposing = false;
          this.handleInput(event);
        }
      },
      handleInput: function handleInput(event) {
        // should not emit input during composition
        // see: https://github.com/ElemeFE/element/issues/10516
        if (this.isComposing) return; // hack for https://github.com/ElemeFE/element/issues/8548
        // should remove the following line when we don't support IE

        if (event.target.value === this.nativeInputValue) return;
        this.$emit('input', event.target.value); // ensure native input value is controlled
        // see: https://github.com/ElemeFE/element/issues/12850

        this.$nextTick(this.setNativeInputValue);
      },
      handleChange: function handleChange(event) {
        this.$emit('change', event.target.value);
      },
      calcIconOffset: function calcIconOffset(place) {
        var elList = [].slice.call(this.$el.querySelectorAll(".el-input__".concat(place)) || []);
        if (!elList.length) return;
        var el = null;

        for (var i = 0; i < elList.length; i++) {
          if (elList[i].parentNode === this.$el) {
            el = elList[i];
            break;
          }
        }

        if (!el) return;
        var pendantMap = {
          suffix: 'append',
          prefix: 'prepend'
        };
        var pendant = pendantMap[place];

        if (this.$slots[pendant]) {
          el.style.transform = "translateX(".concat(place === 'suffix' ? '-' : '').concat(this.$el.querySelector(".el-input-group__".concat(pendant)).offsetWidth, "px)");
        } else {
          el.removeAttribute('style');
        }
      },
      updateIconOffset: function updateIconOffset() {
        this.calcIconOffset('prefix');
        this.calcIconOffset('suffix');
      },
      clear: function clear() {
        this.$emit('input', '');
        this.$emit('change', '');
        this.$emit('clear');
      },
      handlePasswordVisible: function handlePasswordVisible() {
        var _this2 = this;

        this.passwordVisible = !this.passwordVisible;
        this.$nextTick(function () {
          _this2.focus();
        });
      },
      getInput: function getInput() {
        return this.$refs.input || this.$refs.textarea;
      },
      getSuffixVisible: function getSuffixVisible() {
        return this.$slots.suffix || this.suffixIcon || this.showClear || this.showPassword || this.isWordLimitVisible || this.validateState && this.needStatusIcon;
      }
    },
    created: function created() {
      this.$on('inputSelect', this.select);
    },
    mounted: function mounted() {
      this.setNativeInputValue();
      this.resizeTextarea();
      this.updateIconOffset();
    },
    updated: function updated() {
      this.$nextTick(this.updateIconOffset);
    }
  };

  /* script */
  var __vue_script__$1 = script$1;
  /* template */

  var __vue_render__$1 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("div", {
      "class": [_vm.type === "textarea" ? "el-textarea" : "el-input", _vm.inputSize ? "el-input--" + _vm.inputSize : "", {
        "is-disabled": _vm.inputDisabled,
        "is-exceed": _vm.inputExceed,
        "el-input-group": _vm.$slots.prepend || _vm.$slots.append,
        "el-input-group--append": _vm.$slots.append,
        "el-input-group--prepend": _vm.$slots.prepend,
        "el-input--prefix": _vm.$slots.prefix || _vm.prefixIcon,
        "el-input--suffix": _vm.$slots.suffix || _vm.suffixIcon || _vm.clearable || _vm.showPassword
      }],
      on: {
        mouseenter: function mouseenter($event) {
          _vm.hovering = true;
        },
        mouseleave: function mouseleave($event) {
          _vm.hovering = false;
        }
      }
    }, [_vm.type !== "textarea" ? [_vm.$slots.prepend ? _c("div", {
      staticClass: "el-input-group__prepend"
    }, [_vm._t("prepend")], 2) : _vm._e(), _vm._v(" "), _vm.type !== "textarea" ? _c("input", _vm._b({
      ref: "input",
      staticClass: "el-input__inner",
      attrs: {
        tabindex: _vm.tabindex,
        type: _vm.showPassword ? _vm.passwordVisible ? "text" : "password" : _vm.type,
        disabled: _vm.inputDisabled,
        readonly: _vm.readonly,
        autocomplete: _vm.autoComplete || _vm.autocomplete,
        "aria-label": _vm.label
      },
      on: {
        compositionstart: _vm.handleCompositionStart,
        compositionupdate: _vm.handleCompositionUpdate,
        compositionend: _vm.handleCompositionEnd,
        input: _vm.handleInput,
        focus: _vm.handleFocus,
        blur: _vm.handleBlur,
        change: _vm.handleChange
      }
    }, "input", _vm.$attrs, false)) : _vm._e(), _vm._v(" "), _vm.$slots.prefix || _vm.prefixIcon ? _c("span", {
      staticClass: "el-input__prefix"
    }, [_vm._t("prefix"), _vm._v(" "), _vm.prefixIcon ? _c("i", {
      staticClass: "el-input__icon",
      "class": _vm.prefixIcon
    }) : _vm._e()], 2) : _vm._e(), _vm._v(" "), _vm.getSuffixVisible() ? _c("span", {
      staticClass: "el-input__suffix"
    }, [_c("span", {
      staticClass: "el-input__suffix-inner"
    }, [!_vm.showClear || !_vm.showPwdVisible || !_vm.isWordLimitVisible ? [_vm._t("suffix"), _vm._v(" "), _vm.suffixIcon ? _c("i", {
      staticClass: "el-input__icon",
      "class": _vm.suffixIcon
    }) : _vm._e()] : _vm._e(), _vm._v(" "), _vm.showClear ? _c("i", {
      staticClass: "el-input__icon el-icon-circle-close el-input__clear",
      on: {
        mousedown: function mousedown($event) {
          $event.preventDefault();
        },
        click: _vm.clear
      }
    }) : _vm._e(), _vm._v(" "), _vm.showPwdVisible ? _c("i", {
      staticClass: "el-input__icon el-icon-view el-input__clear",
      on: {
        click: _vm.handlePasswordVisible
      }
    }) : _vm._e(), _vm._v(" "), _vm.isWordLimitVisible ? _c("span", {
      staticClass: "el-input__count"
    }, [_c("span", {
      staticClass: "el-input__count-inner"
    }, [_vm._v("\n            " + _vm._s(_vm.textLength) + "/" + _vm._s(_vm.upperLimit) + "\n          ")])]) : _vm._e()], 2), _vm._v(" "), _vm.validateState ? _c("i", {
      staticClass: "el-input__icon",
      "class": ["el-input__validateIcon", _vm.validateIcon]
    }) : _vm._e()]) : _vm._e(), _vm._v(" "), _vm.$slots.append ? _c("div", {
      staticClass: "el-input-group__append"
    }, [_vm._t("append")], 2) : _vm._e()] : _c("textarea", _vm._b({
      ref: "textarea",
      staticClass: "el-textarea__inner",
      style: _vm.textareaStyle,
      attrs: {
        tabindex: _vm.tabindex,
        disabled: _vm.inputDisabled,
        readonly: _vm.readonly,
        autocomplete: _vm.autoComplete || _vm.autocomplete,
        "aria-label": _vm.label
      },
      on: {
        compositionstart: _vm.handleCompositionStart,
        compositionupdate: _vm.handleCompositionUpdate,
        compositionend: _vm.handleCompositionEnd,
        input: _vm.handleInput,
        focus: _vm.handleFocus,
        blur: _vm.handleBlur,
        change: _vm.handleChange
      }
    }, "textarea", _vm.$attrs, false)), _vm._v(" "), _vm.isWordLimitVisible && _vm.type === "textarea" ? _c("span", {
      staticClass: "el-input__count"
    }, [_vm._v(_vm._s(_vm.textLength) + "/" + _vm._s(_vm.upperLimit))]) : _vm._e()], 2);
  };

  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;
  /* style */

  var __vue_inject_styles__$1 = undefined;
  /* scoped */

  var __vue_scope_id__$1 = undefined;
  /* module identifier */

  var __vue_module_identifier__$1 = undefined;
  /* functional template */

  var __vue_is_functional_template__$1 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$1 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$1,
    staticRenderFns: __vue_staticRenderFns__$1
  }, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);

  /* istanbul ignore next */

  __vue_component__$1.install = function (Vue) {
    Vue.component(__vue_component__$1.name, __vue_component__$1);
  };

  /* istanbul ignore next */

  const isServer$1 = Vue.prototype.$isServer;

  /* istanbul ignore next */
  const trim$1 = function(string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
  };

  /* istanbul ignore next */
  const on = (function() {
    if (!isServer$1 && document.addEventListener) {
      return function(element, event, handler) {
        if (element && event && handler) {
          element.addEventListener(event, handler, false);
        }
      };
    } else {
      return function(element, event, handler) {
        if (element && event && handler) {
          element.attachEvent('on' + event, handler);
        }
      };
    }
  })();

  /* istanbul ignore next */
  const off = (function() {
    if (!isServer$1 && document.removeEventListener) {
      return function(element, event, handler) {
        if (element && event) {
          element.removeEventListener(event, handler, false);
        }
      };
    } else {
      return function(element, event, handler) {
        if (element && event) {
          element.detachEvent('on' + event, handler);
        }
      };
    }
  })();

  /* istanbul ignore next */
  function hasClass$1(el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
  }
  /* istanbul ignore next */
  function addClass$3(el, cls) {
    if (!el) return;
    var curClass = el.className;
    var classes = (cls || '').split(' ');

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.add(clsName);
      } else if (!hasClass$1(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
    if (!el.classList) {
      el.setAttribute('class', curClass);
    }
  }
  /* istanbul ignore next */
  function removeClass$3(el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' ');
    var curClass = ' ' + el.className + ' ';

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.remove(clsName);
      } else if (hasClass$1(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
    if (!el.classList) {
      el.setAttribute('class', trim$1(curClass));
    }
  }

  let hasModal$1 = false;
  let hasInitZIndex$1 = false;
  let zIndex$1;

  const getModal$1 = function() {
    if (Vue.prototype.$isServer) return;
    let modalDom = PopupManager$1.modalDom;
    if (modalDom) {
      hasModal$1 = true;
    } else {
      hasModal$1 = false;
      modalDom = document.createElement('div');
      PopupManager$1.modalDom = modalDom;

      modalDom.addEventListener('touchmove', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });

      modalDom.addEventListener('click', function() {
        PopupManager$1.doOnModalClick && PopupManager$1.doOnModalClick();
      });
    }

    return modalDom;
  };

  const instances$2 = {};

  const PopupManager$1 = {
    modalFade: true,

    getInstance: function(id) {
      return instances$2[id];
    },

    register: function(id, instance) {
      if (id && instance) {
        instances$2[id] = instance;
      }
    },

    deregister: function(id) {
      if (id) {
        instances$2[id] = null;
        delete instances$2[id];
      }
    },

    nextZIndex: function() {
      return PopupManager$1.zIndex++;
    },

    modalStack: [],

    doOnModalClick: function() {
      const topItem = PopupManager$1.modalStack[PopupManager$1.modalStack.length - 1];
      if (!topItem) return;

      const instance = PopupManager$1.getInstance(topItem.id);
      if (instance && instance.closeOnClickModal) {
        instance.close();
      }
    },

    openModal: function(id, zIndex, dom, modalClass, modalFade) {
      if (Vue.prototype.$isServer) return;
      if (!id || zIndex === undefined) return;
      this.modalFade = modalFade;

      const modalStack = this.modalStack;

      for (let i = 0, j = modalStack.length; i < j; i++) {
        const item = modalStack[i];
        if (item.id === id) {
          return;
        }
      }

      const modalDom = getModal$1();

      addClass$3(modalDom, 'v-modal');
      if (this.modalFade && !hasModal$1) {
        addClass$3(modalDom, 'v-modal-enter');
      }
      if (modalClass) {
        let classArr = modalClass.trim().split(/\s+/);
        classArr.forEach(item => addClass$3(modalDom, item));
      }
      setTimeout(() => {
        removeClass$3(modalDom, 'v-modal-enter');
      }, 200);

      if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
        dom.parentNode.appendChild(modalDom);
      } else {
        document.body.appendChild(modalDom);
      }

      if (zIndex) {
        modalDom.style.zIndex = zIndex;
      }
      modalDom.tabIndex = 0;
      modalDom.style.display = '';

      this.modalStack.push({ id: id, zIndex: zIndex, modalClass: modalClass });
    },

    closeModal: function(id) {
      const modalStack = this.modalStack;
      const modalDom = getModal$1();

      if (modalStack.length > 0) {
        const topItem = modalStack[modalStack.length - 1];
        if (topItem.id === id) {
          if (topItem.modalClass) {
            let classArr = topItem.modalClass.trim().split(/\s+/);
            classArr.forEach(item => removeClass$3(modalDom, item));
          }

          modalStack.pop();
          if (modalStack.length > 0) {
            modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex;
          }
        } else {
          for (let i = modalStack.length - 1; i >= 0; i--) {
            if (modalStack[i].id === id) {
              modalStack.splice(i, 1);
              break;
            }
          }
        }
      }

      if (modalStack.length === 0) {
        if (this.modalFade) {
          addClass$3(modalDom, 'v-modal-leave');
        }
        setTimeout(() => {
          if (modalStack.length === 0) {
            if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom);
            modalDom.style.display = 'none';
            PopupManager$1.modalDom = undefined;
          }
          removeClass$3(modalDom, 'v-modal-leave');
        }, 200);
      }
    }
  };

  Object.defineProperty(PopupManager$1, 'zIndex', {
    configurable: true,
    get() {
      if (!hasInitZIndex$1) {
        zIndex$1 = zIndex$1 || (Vue.prototype.$ELEMENT || {}).zIndex || 2000;
        hasInitZIndex$1 = true;
      }
      return zIndex$1;
    },
    set(value) {
      zIndex$1 = value;
    }
  });

  const getTopPopup$1 = function() {
    if (Vue.prototype.$isServer) return;
    if (PopupManager$1.modalStack.length > 0) {
      const topPopup = PopupManager$1.modalStack[PopupManager$1.modalStack.length - 1];
      if (!topPopup) return;
      const instance = PopupManager$1.getInstance(topPopup.id);

      return instance;
    }
  };

  if (!Vue.prototype.$isServer) {
    // handle `esc` key when the popup is shown
    window.addEventListener('keydown', function(event) {
      if (event.keyCode === 27) {
        const topPopup = getTopPopup$1();

        if (topPopup && topPopup.closeOnPressEscape) {
          topPopup.handleClose
            ? topPopup.handleClose()
            : (topPopup.handleAction ? topPopup.handleAction('cancel') : topPopup.close());
        }
      }
    });
  }

  let scrollBarWidth;

  function scrollbarWidth() {
    if (Vue.prototype.$isServer) return 0;
    if (scrollBarWidth !== undefined) return scrollBarWidth;

    const outer = document.createElement('div');
    outer.className = 'el-scrollbar__wrap';
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    document.body.appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    const inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    scrollBarWidth = widthNoScroll - widthWithScroll;

    return scrollBarWidth;
  }

  const PopperJS = Vue.prototype.$isServer ? function() {} : require('./popper');
  const stop = e => e.stopPropagation();

  /**
   * @param {HTMLElement} [reference=$refs.reference] - The reference element used to position the popper.
   * @param {HTMLElement} [popper=$refs.popper] - The HTML element used as popper, or a configuration used to generate the popper.
   * @param {String} [placement=button] - Placement of the popper accepted values: top(-start, -end), right(-start, -end), bottom(-start, -end), left(-start, -end)
   * @param {Number} [offset=0] - Amount of pixels the popper will be shifted (can be negative).
   * @param {Boolean} [visible=false] Visibility of the popup element.
   * @param {Boolean} [visible-arrow=false] Visibility of the arrow, no style.
   */
  var Popper = {
    props: {
      transformOrigin: {
        type: [Boolean, String],
        default: true
      },
      placement: {
        type: String,
        default: 'bottom'
      },
      boundariesPadding: {
        type: Number,
        default: 5
      },
      reference: {},
      popper: {},
      offset: {
        default: 0
      },
      value: Boolean,
      visibleArrow: Boolean,
      arrowOffset: {
        type: Number,
        default: 35
      },
      appendToBody: {
        type: Boolean,
        default: true
      },
      popperOptions: {
        type: Object,
        default() {
          return {
            gpuAcceleration: false
          };
        }
      }
    },

    data() {
      return {
        showPopper: false,
        currentPlacement: ''
      };
    },

    watch: {
      value: {
        immediate: true,
        handler(val) {
          this.showPopper = val;
          this.$emit('input', val);
        }
      },

      showPopper(val) {
        if (this.disabled) return;
        val ? this.updatePopper() : this.destroyPopper();
        this.$emit('input', val);
      }
    },

    methods: {
      createPopper() {
        if (this.$isServer) return;
        this.currentPlacement = this.currentPlacement || this.placement;
        if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)) {
          return;
        }

        const options = this.popperOptions;
        const popper = this.popperElm = this.popperElm || this.popper || this.$refs.popper;
        let reference = this.referenceElm = this.referenceElm || this.reference || this.$refs.reference;

        if (!reference &&
          this.$slots.reference &&
          this.$slots.reference[0]) {
          reference = this.referenceElm = this.$slots.reference[0].elm;
        }

        if (!popper || !reference) return;
        if (this.visibleArrow) this.appendArrow(popper);
        if (this.appendToBody) document.body.appendChild(this.popperElm);
        if (this.popperJS && this.popperJS.destroy) {
          this.popperJS.destroy();
        }

        options.placement = this.currentPlacement;
        options.offset = this.offset;
        options.arrowOffset = this.arrowOffset;
        this.popperJS = new PopperJS(reference, popper, options);
        this.popperJS.onCreate(_ => {
          this.$emit('created', this);
          this.resetTransformOrigin();
          this.$nextTick(this.updatePopper);
        });
        if (typeof options.onUpdate === 'function') {
          this.popperJS.onUpdate(options.onUpdate);
        }
        this.popperJS._popper.style.zIndex = PopupManager$1.nextZIndex();
        this.popperElm.addEventListener('click', stop);
      },

      updatePopper() {
        const popperJS = this.popperJS;
        if (popperJS) {
          popperJS.update();
          if (popperJS._popper) {
            popperJS._popper.style.zIndex = PopupManager$1.nextZIndex();
          }
        } else {
          this.createPopper();
        }
      },

      doDestroy(forceDestroy) {
        /* istanbul ignore if */
        if (!this.popperJS || (this.showPopper && !forceDestroy)) return;
        this.popperJS.destroy();
        this.popperJS = null;
      },

      destroyPopper() {
        if (this.popperJS) {
          this.resetTransformOrigin();
        }
      },

      resetTransformOrigin() {
        if (!this.transformOrigin) return;
        let placementMap = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left'
        };
        let placement = this.popperJS._popper.getAttribute('x-placement').split('-')[0];
        let origin = placementMap[placement];
        this.popperJS._popper.style.transformOrigin = typeof this.transformOrigin === 'string'
          ? this.transformOrigin
          : ['top', 'bottom'].indexOf(placement) > -1 ? `center ${ origin }` : `${ origin } center`;
      },

      appendArrow(element) {
        let hash;
        if (this.appended) {
          return;
        }

        this.appended = true;

        for (let item in element.attributes) {
          if (/^_v-/.test(element.attributes[item].name)) {
            hash = element.attributes[item].name;
            break;
          }
        }

        const arrow = document.createElement('div');

        if (hash) {
          arrow.setAttribute(hash, '');
        }
        arrow.setAttribute('x-arrow', '');
        arrow.className = 'popper__arrow';
        element.appendChild(arrow);
      }
    },

    beforeDestroy() {
      this.doDestroy(true);
      if (this.popperElm && this.popperElm.parentNode === document.body) {
        this.popperElm.removeEventListener('click', stop);
        document.body.removeChild(this.popperElm);
      }
    },

    // call destroy in keep-alive mode
    deactivated() {
      this.$options.beforeDestroy[0].call(this);
    }
  };

  //
  var script$2 = {
    name: 'ElSelectDropdown',
    componentName: 'ElSelectDropdown',
    mixins: [Popper],
    props: {
      placement: {
        "default": 'bottom-start'
      },
      boundariesPadding: {
        "default": 0
      },
      popperOptions: {
        "default": function _default() {
          return {
            gpuAcceleration: false
          };
        }
      },
      visibleArrow: {
        "default": true
      },
      appendToBody: {
        type: Boolean,
        "default": true
      }
    },
    data: function data() {
      return {
        minWidth: ''
      };
    },
    computed: {
      popperClass: function popperClass() {
        return this.$parent.popperClass;
      }
    },
    watch: {
      '$parent.inputWidth': function $parentInputWidth() {
        this.minWidth = this.$parent.$el.getBoundingClientRect().width + 'px';
      }
    },
    mounted: function mounted() {
      var _this = this;

      this.referenceElm = this.$parent.$refs.reference.$el;
      this.$parent.popperElm = this.popperElm = this.$el;
      this.$on('updatePopper', function () {
        if (_this.$parent.visible) _this.updatePopper();
      });
      this.$on('destroyPopper', this.destroyPopper);
    }
  };

  /* script */
  var __vue_script__$2 = script$2;
  /* template */

  var __vue_render__$2 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("div", {
      staticClass: "el-select-dropdown el-popper",
      "class": [{
        "is-multiple": _vm.$parent.multiple
      }, _vm.popperClass],
      style: {
        minWidth: _vm.minWidth
      }
    }, [_vm._t("default")], 2);
  };

  var __vue_staticRenderFns__$2 = [];
  __vue_render__$2._withStripped = true;
  /* style */

  var __vue_inject_styles__$2 = undefined;
  /* scoped */

  var __vue_scope_id__$2 = undefined;
  /* module identifier */

  var __vue_module_identifier__$2 = undefined;
  /* functional template */

  var __vue_is_functional_template__$2 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$2 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$2,
    staticRenderFns: __vue_staticRenderFns__$2
  }, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);

  var script$3 = {
    mixins: [Emitter],
    name: 'ElOption',
    componentName: 'ElOption',
    inject: ['select'],
    props: {
      value: {
        required: true
      },
      label: [String, Number],
      created: Boolean,
      disabled: {
        type: Boolean,
        "default": false
      }
    },
    data: function data() {
      return {
        index: -1,
        groupDisabled: false,
        visible: true,
        hitState: false,
        hover: false
      };
    },
    computed: {
      isObject: function isObject() {
        return Object.prototype.toString.call(this.value).toLowerCase() === '[object object]';
      },
      currentLabel: function currentLabel() {
        return this.label || (this.isObject ? '' : this.value);
      },
      currentValue: function currentValue() {
        return this.value || this.label || '';
      },
      itemSelected: function itemSelected() {
        if (!this.select.multiple) {
          return this.isEqual(this.value, this.select.value);
        } else {
          return this.contains(this.select.value, this.value);
        }
      },
      limitReached: function limitReached() {
        if (this.select.multiple) {
          return !this.itemSelected && (this.select.value || []).length >= this.select.multipleLimit && this.select.multipleLimit > 0;
        } else {
          return false;
        }
      }
    },
    watch: {
      currentLabel: function currentLabel() {
        if (!this.created && !this.select.remote) this.dispatch('ElSelect', 'setSelected');
      },
      value: function value(val, oldVal) {
        var _this$select = this.select,
            remote = _this$select.remote,
            valueKey = _this$select.valueKey;

        if (!this.created && !remote) {
          if (valueKey && _typeof(val) === 'object' && _typeof(oldVal) === 'object' && val[valueKey] === oldVal[valueKey]) {
            return;
          }

          this.dispatch('ElSelect', 'setSelected');
        }
      }
    },
    methods: {
      isEqual: function isEqual(a, b) {
        if (!this.isObject) {
          return a === b;
        } else {
          var valueKey = this.select.valueKey;
          return getValueByPath(a, valueKey) === getValueByPath(b, valueKey);
        }
      },
      contains: function contains() {
        var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var target = arguments.length > 1 ? arguments[1] : undefined;

        if (!this.isObject) {
          return arr && arr.indexOf(target) > -1;
        } else {
          var valueKey = this.select.valueKey;
          return arr && arr.some(function (item) {
            return getValueByPath(item, valueKey) === getValueByPath(target, valueKey);
          });
        }
      },
      handleGroupDisabled: function handleGroupDisabled(val) {
        this.groupDisabled = val;
      },
      hoverItem: function hoverItem() {
        if (!this.disabled && !this.groupDisabled) {
          this.select.hoverIndex = this.select.options.indexOf(this);
        }
      },
      selectOptionClick: function selectOptionClick() {
        if (this.disabled !== true && this.groupDisabled !== true) {
          this.dispatch('ElSelect', 'handleOptionClick', [this, true]);
        }
      },
      queryChange: function queryChange(query) {
        this.visible = new RegExp(escapeRegexpString(query), 'i').test(this.currentLabel) || this.created;

        if (!this.visible) {
          this.select.filteredOptionsCount--;
        }
      }
    },
    created: function created() {
      this.select.options.push(this);
      this.select.cachedOptions.push(this);
      this.select.optionsCount++;
      this.select.filteredOptionsCount++;
      this.$on('queryChange', this.queryChange);
      this.$on('handleGroupDisabled', this.handleGroupDisabled);
    },
    beforeDestroy: function beforeDestroy() {
      var _this$select2 = this.select,
          selected = _this$select2.selected,
          multiple = _this$select2.multiple;
      var selectedOptions = multiple ? selected : [selected];
      var index = this.select.cachedOptions.indexOf(this);
      var selectedIndex = selectedOptions.indexOf(this); // if option is not selected, remove it from cache

      if (index > -1 && selectedIndex < 0) {
        this.select.cachedOptions.splice(index, 1);
      }

      this.select.onOptionDestroy(this.select.options.indexOf(this));
    }
  };

  /* script */
  var __vue_script__$3 = script$3;
  /* template */

  var __vue_render__$3 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("li", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.visible,
        expression: "visible"
      }],
      staticClass: "el-select-dropdown__item",
      "class": {
        selected: _vm.itemSelected,
        "is-disabled": _vm.disabled || _vm.groupDisabled || _vm.limitReached,
        hover: _vm.hover
      },
      on: {
        mouseenter: _vm.hoverItem,
        click: function click($event) {
          $event.stopPropagation();
          return _vm.selectOptionClick.apply(null, arguments);
        }
      }
    }, [_vm._t("default", function () {
      return [_c("span", [_vm._v(_vm._s(_vm.currentLabel))])];
    })], 2);
  };

  var __vue_staticRenderFns__$3 = [];
  __vue_render__$3._withStripped = true;
  /* style */

  var __vue_inject_styles__$3 = undefined;
  /* scoped */

  var __vue_scope_id__$3 = undefined;
  /* module identifier */

  var __vue_module_identifier__$3 = undefined;
  /* functional template */

  var __vue_is_functional_template__$3 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$3 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$3,
    staticRenderFns: __vue_staticRenderFns__$3
  }, __vue_inject_styles__$3, __vue_script__$3, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);

  var script$4 = {
    name: 'ElTag',
    props: {
      text: String,
      closable: Boolean,
      type: String,
      hit: Boolean,
      disableTransitions: Boolean,
      color: String,
      size: String,
      effect: {
        type: String,
        "default": 'light',
        validator: function validator(val) {
          return ['dark', 'light', 'plain'].indexOf(val) !== -1;
        }
      }
    },
    methods: {
      handleClose: function handleClose(event) {
        event.stopPropagation();
        this.$emit('close', event);
      },
      handleClick: function handleClick(event) {
        this.$emit('click', event);
      }
    },
    computed: {
      tagSize: function tagSize() {
        return this.size || (this.$ELEMENT || {}).size;
      }
    },
    render: function render(h) {
      var type = this.type,
          tagSize = this.tagSize,
          hit = this.hit,
          effect = this.effect;
      var classes = ['el-tag', type ? "el-tag--".concat(type) : '', tagSize ? "el-tag--".concat(tagSize) : '', effect ? "el-tag--".concat(effect) : '', hit && 'is-hit'];
      var tagEl = h("span", {
        "class": classes,
        "style": {
          backgroundColor: this.color
        },
        "on": {
          "click": this.handleClick
        }
      }, [this.$slots["default"], this.closable && h("i", {
        "class": "el-tag__close el-icon-close",
        "on": {
          "click": this.handleClose
        }
      })]);
      return this.disableTransitions ? tagEl : h("transition", {
        "attrs": {
          "name": "el-zoom-in-center"
        }
      }, [tagEl]);
    }
  };

  /* script */
  var __vue_script__$4 = script$4;
  /* template */

  /* style */

  var __vue_inject_styles__$4 = undefined;
  /* scoped */

  var __vue_scope_id__$4 = undefined;
  /* module identifier */

  var __vue_module_identifier__$4 = undefined;
  /* functional template */

  var __vue_is_functional_template__$4 = undefined;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$4 = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__$4, __vue_script__$4, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, false, undefined, undefined, undefined);

  /* istanbul ignore next */

  __vue_component__$4.install = function (Vue) {
    Vue.component(__vue_component__$4.name, __vue_component__$4);
  };

  /**
   * A collection of shims that provide minimal functionality of the ES6 collections.
   *
   * These implementations are not meant to be used outside of the ResizeObserver
   * modules as they cover only a limited range of use cases.
   */
  /* eslint-disable require-jsdoc, valid-jsdoc */
  var MapShim = (function () {
      if (typeof Map !== 'undefined') {
          return Map;
      }
      /**
       * Returns index in provided array that matches the specified key.
       *
       * @param {Array<Array>} arr
       * @param {*} key
       * @returns {number}
       */
      function getIndex(arr, key) {
          var result = -1;
          arr.some(function (entry, index) {
              if (entry[0] === key) {
                  result = index;
                  return true;
              }
              return false;
          });
          return result;
      }
      return /** @class */ (function () {
          function class_1() {
              this.__entries__ = [];
          }
          Object.defineProperty(class_1.prototype, "size", {
              /**
               * @returns {boolean}
               */
              get: function () {
                  return this.__entries__.length;
              },
              enumerable: true,
              configurable: true
          });
          /**
           * @param {*} key
           * @returns {*}
           */
          class_1.prototype.get = function (key) {
              var index = getIndex(this.__entries__, key);
              var entry = this.__entries__[index];
              return entry && entry[1];
          };
          /**
           * @param {*} key
           * @param {*} value
           * @returns {void}
           */
          class_1.prototype.set = function (key, value) {
              var index = getIndex(this.__entries__, key);
              if (~index) {
                  this.__entries__[index][1] = value;
              }
              else {
                  this.__entries__.push([key, value]);
              }
          };
          /**
           * @param {*} key
           * @returns {void}
           */
          class_1.prototype.delete = function (key) {
              var entries = this.__entries__;
              var index = getIndex(entries, key);
              if (~index) {
                  entries.splice(index, 1);
              }
          };
          /**
           * @param {*} key
           * @returns {void}
           */
          class_1.prototype.has = function (key) {
              return !!~getIndex(this.__entries__, key);
          };
          /**
           * @returns {void}
           */
          class_1.prototype.clear = function () {
              this.__entries__.splice(0);
          };
          /**
           * @param {Function} callback
           * @param {*} [ctx=null]
           * @returns {void}
           */
          class_1.prototype.forEach = function (callback, ctx) {
              if (ctx === void 0) { ctx = null; }
              for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
                  var entry = _a[_i];
                  callback.call(ctx, entry[1], entry[0]);
              }
          };
          return class_1;
      }());
  })();

  /**
   * Detects whether window and document objects are available in current environment.
   */
  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

  // Returns global object of a current environment.
  var global$1 = (function () {
      if (typeof global !== 'undefined' && global.Math === Math) {
          return global;
      }
      if (typeof self !== 'undefined' && self.Math === Math) {
          return self;
      }
      if (typeof window !== 'undefined' && window.Math === Math) {
          return window;
      }
      // eslint-disable-next-line no-new-func
      return Function('return this')();
  })();

  /**
   * A shim for the requestAnimationFrame which falls back to the setTimeout if
   * first one is not supported.
   *
   * @returns {number} Requests' identifier.
   */
  var requestAnimationFrame$1 = (function () {
      if (typeof requestAnimationFrame === 'function') {
          // It's required to use a bounded function because IE sometimes throws
          // an "Invalid calling object" error if rAF is invoked without the global
          // object on the left hand side.
          return requestAnimationFrame.bind(global$1);
      }
      return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
  })();

  // Defines minimum timeout before adding a trailing call.
  var trailingTimeout = 2;
  /**
   * Creates a wrapper function which ensures that provided callback will be
   * invoked only once during the specified delay period.
   *
   * @param {Function} callback - Function to be invoked after the delay period.
   * @param {number} delay - Delay after which to invoke callback.
   * @returns {Function}
   */
  function throttle (callback, delay) {
      var leadingCall = false, trailingCall = false, lastCallTime = 0;
      /**
       * Invokes the original callback function and schedules new invocation if
       * the "proxy" was called during current request.
       *
       * @returns {void}
       */
      function resolvePending() {
          if (leadingCall) {
              leadingCall = false;
              callback();
          }
          if (trailingCall) {
              proxy();
          }
      }
      /**
       * Callback invoked after the specified delay. It will further postpone
       * invocation of the original function delegating it to the
       * requestAnimationFrame.
       *
       * @returns {void}
       */
      function timeoutCallback() {
          requestAnimationFrame$1(resolvePending);
      }
      /**
       * Schedules invocation of the original function.
       *
       * @returns {void}
       */
      function proxy() {
          var timeStamp = Date.now();
          if (leadingCall) {
              // Reject immediately following calls.
              if (timeStamp - lastCallTime < trailingTimeout) {
                  return;
              }
              // Schedule new call to be in invoked when the pending one is resolved.
              // This is important for "transitions" which never actually start
              // immediately so there is a chance that we might miss one if change
              // happens amids the pending invocation.
              trailingCall = true;
          }
          else {
              leadingCall = true;
              trailingCall = false;
              setTimeout(timeoutCallback, delay);
          }
          lastCallTime = timeStamp;
      }
      return proxy;
  }

  // Minimum delay before invoking the update of observers.
  var REFRESH_DELAY = 20;
  // A list of substrings of CSS properties used to find transition events that
  // might affect dimensions of observed elements.
  var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
  // Check if MutationObserver is available.
  var mutationObserverSupported = typeof MutationObserver !== 'undefined';
  /**
   * Singleton controller class which handles updates of ResizeObserver instances.
   */
  var ResizeObserverController = /** @class */ (function () {
      /**
       * Creates a new instance of ResizeObserverController.
       *
       * @private
       */
      function ResizeObserverController() {
          /**
           * Indicates whether DOM listeners have been added.
           *
           * @private {boolean}
           */
          this.connected_ = false;
          /**
           * Tells that controller has subscribed for Mutation Events.
           *
           * @private {boolean}
           */
          this.mutationEventsAdded_ = false;
          /**
           * Keeps reference to the instance of MutationObserver.
           *
           * @private {MutationObserver}
           */
          this.mutationsObserver_ = null;
          /**
           * A list of connected observers.
           *
           * @private {Array<ResizeObserverSPI>}
           */
          this.observers_ = [];
          this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
          this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
      }
      /**
       * Adds observer to observers list.
       *
       * @param {ResizeObserverSPI} observer - Observer to be added.
       * @returns {void}
       */
      ResizeObserverController.prototype.addObserver = function (observer) {
          if (!~this.observers_.indexOf(observer)) {
              this.observers_.push(observer);
          }
          // Add listeners if they haven't been added yet.
          if (!this.connected_) {
              this.connect_();
          }
      };
      /**
       * Removes observer from observers list.
       *
       * @param {ResizeObserverSPI} observer - Observer to be removed.
       * @returns {void}
       */
      ResizeObserverController.prototype.removeObserver = function (observer) {
          var observers = this.observers_;
          var index = observers.indexOf(observer);
          // Remove observer if it's present in registry.
          if (~index) {
              observers.splice(index, 1);
          }
          // Remove listeners if controller has no connected observers.
          if (!observers.length && this.connected_) {
              this.disconnect_();
          }
      };
      /**
       * Invokes the update of observers. It will continue running updates insofar
       * it detects changes.
       *
       * @returns {void}
       */
      ResizeObserverController.prototype.refresh = function () {
          var changesDetected = this.updateObservers_();
          // Continue running updates if changes have been detected as there might
          // be future ones caused by CSS transitions.
          if (changesDetected) {
              this.refresh();
          }
      };
      /**
       * Updates every observer from observers list and notifies them of queued
       * entries.
       *
       * @private
       * @returns {boolean} Returns "true" if any observer has detected changes in
       *      dimensions of it's elements.
       */
      ResizeObserverController.prototype.updateObservers_ = function () {
          // Collect observers that have active observations.
          var activeObservers = this.observers_.filter(function (observer) {
              return observer.gatherActive(), observer.hasActive();
          });
          // Deliver notifications in a separate cycle in order to avoid any
          // collisions between observers, e.g. when multiple instances of
          // ResizeObserver are tracking the same element and the callback of one
          // of them changes content dimensions of the observed target. Sometimes
          // this may result in notifications being blocked for the rest of observers.
          activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
          return activeObservers.length > 0;
      };
      /**
       * Initializes DOM listeners.
       *
       * @private
       * @returns {void}
       */
      ResizeObserverController.prototype.connect_ = function () {
          // Do nothing if running in a non-browser environment or if listeners
          // have been already added.
          if (!isBrowser || this.connected_) {
              return;
          }
          // Subscription to the "Transitionend" event is used as a workaround for
          // delayed transitions. This way it's possible to capture at least the
          // final state of an element.
          document.addEventListener('transitionend', this.onTransitionEnd_);
          window.addEventListener('resize', this.refresh);
          if (mutationObserverSupported) {
              this.mutationsObserver_ = new MutationObserver(this.refresh);
              this.mutationsObserver_.observe(document, {
                  attributes: true,
                  childList: true,
                  characterData: true,
                  subtree: true
              });
          }
          else {
              document.addEventListener('DOMSubtreeModified', this.refresh);
              this.mutationEventsAdded_ = true;
          }
          this.connected_ = true;
      };
      /**
       * Removes DOM listeners.
       *
       * @private
       * @returns {void}
       */
      ResizeObserverController.prototype.disconnect_ = function () {
          // Do nothing if running in a non-browser environment or if listeners
          // have been already removed.
          if (!isBrowser || !this.connected_) {
              return;
          }
          document.removeEventListener('transitionend', this.onTransitionEnd_);
          window.removeEventListener('resize', this.refresh);
          if (this.mutationsObserver_) {
              this.mutationsObserver_.disconnect();
          }
          if (this.mutationEventsAdded_) {
              document.removeEventListener('DOMSubtreeModified', this.refresh);
          }
          this.mutationsObserver_ = null;
          this.mutationEventsAdded_ = false;
          this.connected_ = false;
      };
      /**
       * "Transitionend" event handler.
       *
       * @private
       * @param {TransitionEvent} event
       * @returns {void}
       */
      ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
          var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
          // Detect whether transition may affect dimensions of an element.
          var isReflowProperty = transitionKeys.some(function (key) {
              return !!~propertyName.indexOf(key);
          });
          if (isReflowProperty) {
              this.refresh();
          }
      };
      /**
       * Returns instance of the ResizeObserverController.
       *
       * @returns {ResizeObserverController}
       */
      ResizeObserverController.getInstance = function () {
          if (!this.instance_) {
              this.instance_ = new ResizeObserverController();
          }
          return this.instance_;
      };
      /**
       * Holds reference to the controller's instance.
       *
       * @private {ResizeObserverController}
       */
      ResizeObserverController.instance_ = null;
      return ResizeObserverController;
  }());

  /**
   * Defines non-writable/enumerable properties of the provided target object.
   *
   * @param {Object} target - Object for which to define properties.
   * @param {Object} props - Properties to be defined.
   * @returns {Object} Target object.
   */
  var defineConfigurable = (function (target, props) {
      for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
          var key = _a[_i];
          Object.defineProperty(target, key, {
              value: props[key],
              enumerable: false,
              writable: false,
              configurable: true
          });
      }
      return target;
  });

  /**
   * Returns the global object associated with provided element.
   *
   * @param {Object} target
   * @returns {Object}
   */
  var getWindowOf = (function (target) {
      // Assume that the element is an instance of Node, which means that it
      // has the "ownerDocument" property from which we can retrieve a
      // corresponding global object.
      var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
      // Return the local global object if it's not possible extract one from
      // provided element.
      return ownerGlobal || global$1;
  });

  // Placeholder of an empty content rectangle.
  var emptyRect = createRectInit(0, 0, 0, 0);
  /**
   * Converts provided string to a number.
   *
   * @param {number|string} value
   * @returns {number}
   */
  function toFloat(value) {
      return parseFloat(value) || 0;
  }
  /**
   * Extracts borders size from provided styles.
   *
   * @param {CSSStyleDeclaration} styles
   * @param {...string} positions - Borders positions (top, right, ...)
   * @returns {number}
   */
  function getBordersSize(styles) {
      var positions = [];
      for (var _i = 1; _i < arguments.length; _i++) {
          positions[_i - 1] = arguments[_i];
      }
      return positions.reduce(function (size, position) {
          var value = styles['border-' + position + '-width'];
          return size + toFloat(value);
      }, 0);
  }
  /**
   * Extracts paddings sizes from provided styles.
   *
   * @param {CSSStyleDeclaration} styles
   * @returns {Object} Paddings box.
   */
  function getPaddings(styles) {
      var positions = ['top', 'right', 'bottom', 'left'];
      var paddings = {};
      for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
          var position = positions_1[_i];
          var value = styles['padding-' + position];
          paddings[position] = toFloat(value);
      }
      return paddings;
  }
  /**
   * Calculates content rectangle of provided SVG element.
   *
   * @param {SVGGraphicsElement} target - Element content rectangle of which needs
   *      to be calculated.
   * @returns {DOMRectInit}
   */
  function getSVGContentRect(target) {
      var bbox = target.getBBox();
      return createRectInit(0, 0, bbox.width, bbox.height);
  }
  /**
   * Calculates content rectangle of provided HTMLElement.
   *
   * @param {HTMLElement} target - Element for which to calculate the content rectangle.
   * @returns {DOMRectInit}
   */
  function getHTMLElementContentRect(target) {
      // Client width & height properties can't be
      // used exclusively as they provide rounded values.
      var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
      // By this condition we can catch all non-replaced inline, hidden and
      // detached elements. Though elements with width & height properties less
      // than 0.5 will be discarded as well.
      //
      // Without it we would need to implement separate methods for each of
      // those cases and it's not possible to perform a precise and performance
      // effective test for hidden elements. E.g. even jQuery's ':visible' filter
      // gives wrong results for elements with width & height less than 0.5.
      if (!clientWidth && !clientHeight) {
          return emptyRect;
      }
      var styles = getWindowOf(target).getComputedStyle(target);
      var paddings = getPaddings(styles);
      var horizPad = paddings.left + paddings.right;
      var vertPad = paddings.top + paddings.bottom;
      // Computed styles of width & height are being used because they are the
      // only dimensions available to JS that contain non-rounded values. It could
      // be possible to utilize the getBoundingClientRect if only it's data wasn't
      // affected by CSS transformations let alone paddings, borders and scroll bars.
      var width = toFloat(styles.width), height = toFloat(styles.height);
      // Width & height include paddings and borders when the 'border-box' box
      // model is applied (except for IE).
      if (styles.boxSizing === 'border-box') {
          // Following conditions are required to handle Internet Explorer which
          // doesn't include paddings and borders to computed CSS dimensions.
          //
          // We can say that if CSS dimensions + paddings are equal to the "client"
          // properties then it's either IE, and thus we don't need to subtract
          // anything, or an element merely doesn't have paddings/borders styles.
          if (Math.round(width + horizPad) !== clientWidth) {
              width -= getBordersSize(styles, 'left', 'right') + horizPad;
          }
          if (Math.round(height + vertPad) !== clientHeight) {
              height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
          }
      }
      // Following steps can't be applied to the document's root element as its
      // client[Width/Height] properties represent viewport area of the window.
      // Besides, it's as well not necessary as the <html> itself neither has
      // rendered scroll bars nor it can be clipped.
      if (!isDocumentElement(target)) {
          // In some browsers (only in Firefox, actually) CSS width & height
          // include scroll bars size which can be removed at this step as scroll
          // bars are the only difference between rounded dimensions + paddings
          // and "client" properties, though that is not always true in Chrome.
          var vertScrollbar = Math.round(width + horizPad) - clientWidth;
          var horizScrollbar = Math.round(height + vertPad) - clientHeight;
          // Chrome has a rather weird rounding of "client" properties.
          // E.g. for an element with content width of 314.2px it sometimes gives
          // the client width of 315px and for the width of 314.7px it may give
          // 314px. And it doesn't happen all the time. So just ignore this delta
          // as a non-relevant.
          if (Math.abs(vertScrollbar) !== 1) {
              width -= vertScrollbar;
          }
          if (Math.abs(horizScrollbar) !== 1) {
              height -= horizScrollbar;
          }
      }
      return createRectInit(paddings.left, paddings.top, width, height);
  }
  /**
   * Checks whether provided element is an instance of the SVGGraphicsElement.
   *
   * @param {Element} target - Element to be checked.
   * @returns {boolean}
   */
  var isSVGGraphicsElement = (function () {
      // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
      // interface.
      if (typeof SVGGraphicsElement !== 'undefined') {
          return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
      }
      // If it's so, then check that element is at least an instance of the
      // SVGElement and that it has the "getBBox" method.
      // eslint-disable-next-line no-extra-parens
      return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
          typeof target.getBBox === 'function'); };
  })();
  /**
   * Checks whether provided element is a document element (<html>).
   *
   * @param {Element} target - Element to be checked.
   * @returns {boolean}
   */
  function isDocumentElement(target) {
      return target === getWindowOf(target).document.documentElement;
  }
  /**
   * Calculates an appropriate content rectangle for provided html or svg element.
   *
   * @param {Element} target - Element content rectangle of which needs to be calculated.
   * @returns {DOMRectInit}
   */
  function getContentRect(target) {
      if (!isBrowser) {
          return emptyRect;
      }
      if (isSVGGraphicsElement(target)) {
          return getSVGContentRect(target);
      }
      return getHTMLElementContentRect(target);
  }
  /**
   * Creates rectangle with an interface of the DOMRectReadOnly.
   * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
   *
   * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
   * @returns {DOMRectReadOnly}
   */
  function createReadOnlyRect(_a) {
      var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
      // If DOMRectReadOnly is available use it as a prototype for the rectangle.
      var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
      var rect = Object.create(Constr.prototype);
      // Rectangle's properties are not writable and non-enumerable.
      defineConfigurable(rect, {
          x: x, y: y, width: width, height: height,
          top: y,
          right: x + width,
          bottom: height + y,
          left: x
      });
      return rect;
  }
  /**
   * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
   * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
   *
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {number} width - Rectangle's width.
   * @param {number} height - Rectangle's height.
   * @returns {DOMRectInit}
   */
  function createRectInit(x, y, width, height) {
      return { x: x, y: y, width: width, height: height };
  }

  /**
   * Class that is responsible for computations of the content rectangle of
   * provided DOM element and for keeping track of it's changes.
   */
  var ResizeObservation = /** @class */ (function () {
      /**
       * Creates an instance of ResizeObservation.
       *
       * @param {Element} target - Element to be observed.
       */
      function ResizeObservation(target) {
          /**
           * Broadcasted width of content rectangle.
           *
           * @type {number}
           */
          this.broadcastWidth = 0;
          /**
           * Broadcasted height of content rectangle.
           *
           * @type {number}
           */
          this.broadcastHeight = 0;
          /**
           * Reference to the last observed content rectangle.
           *
           * @private {DOMRectInit}
           */
          this.contentRect_ = createRectInit(0, 0, 0, 0);
          this.target = target;
      }
      /**
       * Updates content rectangle and tells whether it's width or height properties
       * have changed since the last broadcast.
       *
       * @returns {boolean}
       */
      ResizeObservation.prototype.isActive = function () {
          var rect = getContentRect(this.target);
          this.contentRect_ = rect;
          return (rect.width !== this.broadcastWidth ||
              rect.height !== this.broadcastHeight);
      };
      /**
       * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
       * from the corresponding properties of the last observed content rectangle.
       *
       * @returns {DOMRectInit} Last observed content rectangle.
       */
      ResizeObservation.prototype.broadcastRect = function () {
          var rect = this.contentRect_;
          this.broadcastWidth = rect.width;
          this.broadcastHeight = rect.height;
          return rect;
      };
      return ResizeObservation;
  }());

  var ResizeObserverEntry = /** @class */ (function () {
      /**
       * Creates an instance of ResizeObserverEntry.
       *
       * @param {Element} target - Element that is being observed.
       * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
       */
      function ResizeObserverEntry(target, rectInit) {
          var contentRect = createReadOnlyRect(rectInit);
          // According to the specification following properties are not writable
          // and are also not enumerable in the native implementation.
          //
          // Property accessors are not being used as they'd require to define a
          // private WeakMap storage which may cause memory leaks in browsers that
          // don't support this type of collections.
          defineConfigurable(this, { target: target, contentRect: contentRect });
      }
      return ResizeObserverEntry;
  }());

  var ResizeObserverSPI = /** @class */ (function () {
      /**
       * Creates a new instance of ResizeObserver.
       *
       * @param {ResizeObserverCallback} callback - Callback function that is invoked
       *      when one of the observed elements changes it's content dimensions.
       * @param {ResizeObserverController} controller - Controller instance which
       *      is responsible for the updates of observer.
       * @param {ResizeObserver} callbackCtx - Reference to the public
       *      ResizeObserver instance which will be passed to callback function.
       */
      function ResizeObserverSPI(callback, controller, callbackCtx) {
          /**
           * Collection of resize observations that have detected changes in dimensions
           * of elements.
           *
           * @private {Array<ResizeObservation>}
           */
          this.activeObservations_ = [];
          /**
           * Registry of the ResizeObservation instances.
           *
           * @private {Map<Element, ResizeObservation>}
           */
          this.observations_ = new MapShim();
          if (typeof callback !== 'function') {
              throw new TypeError('The callback provided as parameter 1 is not a function.');
          }
          this.callback_ = callback;
          this.controller_ = controller;
          this.callbackCtx_ = callbackCtx;
      }
      /**
       * Starts observing provided element.
       *
       * @param {Element} target - Element to be observed.
       * @returns {void}
       */
      ResizeObserverSPI.prototype.observe = function (target) {
          if (!arguments.length) {
              throw new TypeError('1 argument required, but only 0 present.');
          }
          // Do nothing if current environment doesn't have the Element interface.
          if (typeof Element === 'undefined' || !(Element instanceof Object)) {
              return;
          }
          if (!(target instanceof getWindowOf(target).Element)) {
              throw new TypeError('parameter 1 is not of type "Element".');
          }
          var observations = this.observations_;
          // Do nothing if element is already being observed.
          if (observations.has(target)) {
              return;
          }
          observations.set(target, new ResizeObservation(target));
          this.controller_.addObserver(this);
          // Force the update of observations.
          this.controller_.refresh();
      };
      /**
       * Stops observing provided element.
       *
       * @param {Element} target - Element to stop observing.
       * @returns {void}
       */
      ResizeObserverSPI.prototype.unobserve = function (target) {
          if (!arguments.length) {
              throw new TypeError('1 argument required, but only 0 present.');
          }
          // Do nothing if current environment doesn't have the Element interface.
          if (typeof Element === 'undefined' || !(Element instanceof Object)) {
              return;
          }
          if (!(target instanceof getWindowOf(target).Element)) {
              throw new TypeError('parameter 1 is not of type "Element".');
          }
          var observations = this.observations_;
          // Do nothing if element is not being observed.
          if (!observations.has(target)) {
              return;
          }
          observations.delete(target);
          if (!observations.size) {
              this.controller_.removeObserver(this);
          }
      };
      /**
       * Stops observing all elements.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.disconnect = function () {
          this.clearActive();
          this.observations_.clear();
          this.controller_.removeObserver(this);
      };
      /**
       * Collects observation instances the associated element of which has changed
       * it's content rectangle.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.gatherActive = function () {
          var _this = this;
          this.clearActive();
          this.observations_.forEach(function (observation) {
              if (observation.isActive()) {
                  _this.activeObservations_.push(observation);
              }
          });
      };
      /**
       * Invokes initial callback function with a list of ResizeObserverEntry
       * instances collected from active resize observations.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.broadcastActive = function () {
          // Do nothing if observer doesn't have active observations.
          if (!this.hasActive()) {
              return;
          }
          var ctx = this.callbackCtx_;
          // Create ResizeObserverEntry instance for every active observation.
          var entries = this.activeObservations_.map(function (observation) {
              return new ResizeObserverEntry(observation.target, observation.broadcastRect());
          });
          this.callback_.call(ctx, entries, ctx);
          this.clearActive();
      };
      /**
       * Clears the collection of active observations.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.clearActive = function () {
          this.activeObservations_.splice(0);
      };
      /**
       * Tells whether observer has active observations.
       *
       * @returns {boolean}
       */
      ResizeObserverSPI.prototype.hasActive = function () {
          return this.activeObservations_.length > 0;
      };
      return ResizeObserverSPI;
  }());

  // Registry of internal observers. If WeakMap is not available use current shim
  // for the Map collection as it has all required methods and because WeakMap
  // can't be fully polyfilled anyway.
  var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
  /**
   * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
   * exposing only those methods and properties that are defined in the spec.
   */
  var ResizeObserver = /** @class */ (function () {
      /**
       * Creates a new instance of ResizeObserver.
       *
       * @param {ResizeObserverCallback} callback - Callback that is invoked when
       *      dimensions of the observed elements change.
       */
      function ResizeObserver(callback) {
          if (!(this instanceof ResizeObserver)) {
              throw new TypeError('Cannot call a class as a function.');
          }
          if (!arguments.length) {
              throw new TypeError('1 argument required, but only 0 present.');
          }
          var controller = ResizeObserverController.getInstance();
          var observer = new ResizeObserverSPI(callback, controller, this);
          observers.set(this, observer);
      }
      return ResizeObserver;
  }());
  // Expose public methods of ResizeObserver.
  [
      'observe',
      'unobserve',
      'disconnect'
  ].forEach(function (method) {
      ResizeObserver.prototype[method] = function () {
          var _a;
          return (_a = observers.get(this))[method].apply(_a, arguments);
      };
  });

  var index$2 = (function () {
      // Export existing implementation if available.
      if (typeof global$1.ResizeObserver !== 'undefined') {
          return global$1.ResizeObserver;
      }
      return ResizeObserver;
  })();

  /* eslint-disable no-undefined,no-param-reassign,no-shadow */

  /**
   * Throttle execution of a function. Especially useful for rate limiting
   * execution of handlers on events like resize and scroll.
   *
   * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}   [noTrailing]   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
   *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
   *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
   *                                    the internal counter is reset)
   * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                    to `callback` when the throttled-function is executed.
   * @param  {Boolean}   [debounceMode] If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
   *                                    schedule `callback` to execute after `delay` ms.
   *
   * @return {Function}  A new, throttled, function.
   */
  var throttle$1 = function ( delay, noTrailing, callback, debounceMode ) {

  	// After wrapper has stopped being called, this timeout ensures that
  	// `callback` is executed at the proper times in `throttle` and `end`
  	// debounce modes.
  	var timeoutID;

  	// Keep track of the last time `callback` was executed.
  	var lastExec = 0;

  	// `noTrailing` defaults to falsy.
  	if ( typeof noTrailing !== 'boolean' ) {
  		debounceMode = callback;
  		callback = noTrailing;
  		noTrailing = undefined;
  	}

  	// The `wrapper` function encapsulates all of the throttling / debouncing
  	// functionality and when executed will limit the rate at which `callback`
  	// is executed.
  	function wrapper () {

  		var self = this;
  		var elapsed = Number(new Date()) - lastExec;
  		var args = arguments;

  		// Execute `callback` and update the `lastExec` timestamp.
  		function exec () {
  			lastExec = Number(new Date());
  			callback.apply(self, args);
  		}

  		// If `debounceMode` is true (at begin) this is used to clear the flag
  		// to allow future `callback` executions.
  		function clear () {
  			timeoutID = undefined;
  		}

  		if ( debounceMode && !timeoutID ) {
  			// Since `wrapper` is being called for the first time and
  			// `debounceMode` is true (at begin), execute `callback`.
  			exec();
  		}

  		// Clear any existing timeout.
  		if ( timeoutID ) {
  			clearTimeout(timeoutID);
  		}

  		if ( debounceMode === undefined && elapsed > delay ) {
  			// In throttle mode, if `delay` time has been exceeded, execute
  			// `callback`.
  			exec();

  		} else if ( noTrailing !== true ) {
  			// In trailing throttle mode, since `delay` time has not been
  			// exceeded, schedule `callback` to execute `delay` ms after most
  			// recent execution.
  			//
  			// If `debounceMode` is true (at begin), schedule `clear` to execute
  			// after `delay` ms.
  			//
  			// If `debounceMode` is false (at end), schedule `callback` to
  			// execute after `delay` ms.
  			timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
  		}

  	}

  	// Return the wrapper function.
  	return wrapper;

  };

  /* eslint-disable no-undefined */



  /**
   * Debounce execution of a function. Debouncing, unlike throttling,
   * guarantees that a function is only executed a single time, either at the
   * very beginning of a series of calls, or at the very end.
   *
   * @param  {Number}   delay         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}  [atBegin]     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
   *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
   *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
   * @param  {Function} callback      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                  to `callback` when the debounced-function is executed.
   *
   * @return {Function} A new, debounced function.
   */
  var debounce = function ( delay, atBegin, callback ) {
  	return callback === undefined ? throttle$1(delay, atBegin, false) : throttle$1(delay, callback, atBegin !== false);
  };

  var throttleDebounce = {
  	throttle: throttle$1,
  	debounce: debounce
  };
  var throttleDebounce_2 = throttleDebounce.debounce;

  const isServer$2 = typeof window === 'undefined';

  /* istanbul ignore next */
  const resizeHandler = function(entries) {
    for (let entry of entries) {
      const listeners = entry.target.__resizeListeners__ || [];
      if (listeners.length) {
        listeners.forEach(fn => {
          fn();
        });
      }
    }
  };

  /* istanbul ignore next */
  const addResizeListener = function(element, fn) {
    if (isServer$2) return;
    if (!element.__resizeListeners__) {
      element.__resizeListeners__ = [];
      element.__ro__ = new index$2(throttleDebounce_2(16, resizeHandler));
      element.__ro__.observe(element);
    }
    element.__resizeListeners__.push(fn);
  };

  /* istanbul ignore next */
  const removeResizeListener = function(element, fn) {
    if (!element || !element.__resizeListeners__) return;
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
      element.__ro__.disconnect();
    }
  };

  var BAR_MAP = {
    vertical: {
      offset: 'offsetHeight',
      scroll: 'scrollTop',
      scrollSize: 'scrollHeight',
      size: 'height',
      key: 'vertical',
      axis: 'Y',
      client: 'clientY',
      direction: 'top'
    },
    horizontal: {
      offset: 'offsetWidth',
      scroll: 'scrollLeft',
      scrollSize: 'scrollWidth',
      size: 'width',
      key: 'horizontal',
      axis: 'X',
      client: 'clientX',
      direction: 'left'
    }
  };
  function renderThumbStyle(_ref) {
    var move = _ref.move,
        size = _ref.size,
        bar = _ref.bar;
    var style = {};
    var translate = "translate".concat(bar.axis, "(").concat(move, "%)");
    style[bar.size] = size;
    style.transform = translate;
    style.msTransform = translate;
    style.webkitTransform = translate;
    return style;
  }

  /* istanbul ignore next */

  var Bar = {
    name: 'Bar',
    props: {
      vertical: Boolean,
      size: String,
      move: Number
    },
    computed: {
      bar: function bar() {
        return BAR_MAP[this.vertical ? 'vertical' : 'horizontal'];
      },
      wrap: function wrap() {
        return this.$parent.wrap;
      }
    },
    render: function render(h) {
      var size = this.size,
          move = this.move,
          bar = this.bar;
      return h("div", {
        "class": ['el-scrollbar__bar', 'is-' + bar.key],
        "on": {
          "mousedown": this.clickTrackHandler
        }
      }, [h("div", {
        "ref": "thumb",
        "class": "el-scrollbar__thumb",
        "on": {
          "mousedown": this.clickThumbHandler
        },
        "style": renderThumbStyle({
          size: size,
          move: move,
          bar: bar
        })
      })]);
    },
    methods: {
      clickThumbHandler: function clickThumbHandler(e) {
        // prevent click event of right button
        if (e.ctrlKey || e.button === 2) {
          return;
        }

        this.startDrag(e);
        this[this.bar.axis] = e.currentTarget[this.bar.offset] - (e[this.bar.client] - e.currentTarget.getBoundingClientRect()[this.bar.direction]);
      },
      clickTrackHandler: function clickTrackHandler(e) {
        var offset = Math.abs(e.target.getBoundingClientRect()[this.bar.direction] - e[this.bar.client]);
        var thumbHalf = this.$refs.thumb[this.bar.offset] / 2;
        var thumbPositionPercentage = (offset - thumbHalf) * 100 / this.$el[this.bar.offset];
        this.wrap[this.bar.scroll] = thumbPositionPercentage * this.wrap[this.bar.scrollSize] / 100;
      },
      startDrag: function startDrag(e) {
        e.stopImmediatePropagation();
        this.cursorDown = true;
        on(document, 'mousemove', this.mouseMoveDocumentHandler);
        on(document, 'mouseup', this.mouseUpDocumentHandler);

        document.onselectstart = function () {
          return false;
        };
      },
      mouseMoveDocumentHandler: function mouseMoveDocumentHandler(e) {
        if (this.cursorDown === false) return;
        var prevPage = this[this.bar.axis];
        if (!prevPage) return;
        var offset = (this.$el.getBoundingClientRect()[this.bar.direction] - e[this.bar.client]) * -1;
        var thumbClickPosition = this.$refs.thumb[this.bar.offset] - prevPage;
        var thumbPositionPercentage = (offset - thumbClickPosition) * 100 / this.$el[this.bar.offset];
        this.wrap[this.bar.scroll] = thumbPositionPercentage * this.wrap[this.bar.scrollSize] / 100;
      },
      mouseUpDocumentHandler: function mouseUpDocumentHandler(e) {
        this.cursorDown = false;
        this[this.bar.axis] = 0;
        off(document, 'mousemove', this.mouseMoveDocumentHandler);
        document.onselectstart = null;
      }
    },
    destroyed: function destroyed() {
      off(document, 'mouseup', this.mouseUpDocumentHandler);
    }
  };

  // reference https://github.com/noeldelgado/gemini-scrollbar/blob/master/index.js
  /* istanbul ignore next */

  var Scrollbar = {
    name: 'ElScrollbar',
    components: {
      Bar: Bar
    },
    props: {
      "native": Boolean,
      wrapStyle: {},
      wrapClass: {},
      viewClass: {},
      viewStyle: {},
      noresize: Boolean,
      // 如果 container 尺寸不会发生变化，最好设置它可以优化性能
      tag: {
        type: String,
        "default": 'div'
      }
    },
    data: function data() {
      return {
        sizeWidth: '0',
        sizeHeight: '0',
        moveX: 0,
        moveY: 0
      };
    },
    computed: {
      wrap: function wrap() {
        return this.$refs.wrap;
      }
    },
    render: function render(h) {
      var gutter = scrollbarWidth();
      var style = this.wrapStyle;

      if (gutter) {
        var gutterWith = "-".concat(gutter, "px");
        var gutterStyle = "margin-bottom: ".concat(gutterWith, "; margin-right: ").concat(gutterWith, ";");

        if (Array.isArray(this.wrapStyle)) {
          style = toObject$2(this.wrapStyle);
          style.marginRight = style.marginBottom = gutterWith;
        } else if (typeof this.wrapStyle === 'string') {
          style += gutterStyle;
        } else {
          style = gutterStyle;
        }
      }

      var view = h(this.tag, {
        "class": ['el-scrollbar__view', this.viewClass],
        style: this.viewStyle,
        ref: 'resize'
      }, this.$slots["default"]);
      var wrap = h("div", {
        "ref": "wrap",
        "style": style,
        "on": {
          "scroll": this.handleScroll
        },
        "class": [this.wrapClass, 'el-scrollbar__wrap', gutter ? '' : 'el-scrollbar__wrap--hidden-default']
      }, [[view]]);
      var nodes;

      if (!this["native"]) {
        nodes = [wrap, h(Bar, {
          "attrs": {
            "move": this.moveX,
            "size": this.sizeWidth
          }
        }), h(Bar, {
          "attrs": {
            "vertical": true,
            "move": this.moveY,
            "size": this.sizeHeight
          }
        })];
      } else {
        nodes = [h("div", {
          "ref": "wrap",
          "class": [this.wrapClass, 'el-scrollbar__wrap'],
          "style": style
        }, [[view]])];
      }

      return h('div', {
        "class": 'el-scrollbar'
      }, nodes);
    },
    methods: {
      handleScroll: function handleScroll() {
        var wrap = this.wrap;
        this.moveY = wrap.scrollTop * 100 / wrap.clientHeight;
        this.moveX = wrap.scrollLeft * 100 / wrap.clientWidth;
      },
      update: function update() {
        var heightPercentage, widthPercentage;
        var wrap = this.wrap;
        if (!wrap) return;
        heightPercentage = wrap.clientHeight * 100 / wrap.scrollHeight;
        widthPercentage = wrap.clientWidth * 100 / wrap.scrollWidth;
        this.sizeHeight = heightPercentage < 100 ? heightPercentage + '%' : '';
        this.sizeWidth = widthPercentage < 100 ? widthPercentage + '%' : '';
      }
    },
    mounted: function mounted() {
      if (this["native"]) return;
      this.$nextTick(this.update);
      !this.noresize && addResizeListener(this.$refs.resize, this.update);
    },
    beforeDestroy: function beforeDestroy() {
      if (this["native"]) return;
      !this.noresize && removeResizeListener(this.$refs.resize, this.update);
    }
  };

  /* istanbul ignore next */

  Scrollbar.install = function (Vue) {
    Vue.component(Scrollbar.name, Scrollbar);
  };

  const nodeList = [];
  const ctx = '@@clickoutsideContext';

  let startClick;
  let seed$1 = 0;

  !Vue.prototype.$isServer && on(document, 'mousedown', e => (startClick = e));

  !Vue.prototype.$isServer && on(document, 'mouseup', e => {
    nodeList.forEach(node => node[ctx].documentHandler(e, startClick));
  });

  function createDocumentHandler(el, binding, vnode) {
    return function(mouseup = {}, mousedown = {}) {
      if (!vnode ||
        !vnode.context ||
        !mouseup.target ||
        !mousedown.target ||
        el.contains(mouseup.target) ||
        el.contains(mousedown.target) ||
        el === mouseup.target ||
        (vnode.context.popperElm &&
        (vnode.context.popperElm.contains(mouseup.target) ||
        vnode.context.popperElm.contains(mousedown.target)))) return;

      if (binding.expression &&
        el[ctx].methodName &&
        vnode.context[el[ctx].methodName]) {
        vnode.context[el[ctx].methodName]();
      } else {
        el[ctx].bindingFn && el[ctx].bindingFn();
      }
    };
  }

  /**
   * v-clickoutside
   * @desc 点击元素外面才会触发的事件
   * @example
   * ```vue
   * <div v-element-clickoutside="handleClose">
   * ```
   */
  var Clickoutside = {
    bind(el, binding, vnode) {
      nodeList.push(el);
      const id = seed$1++;
      el[ctx] = {
        id,
        documentHandler: createDocumentHandler(el, binding, vnode),
        methodName: binding.expression,
        bindingFn: binding.value
      };
    },

    update(el, binding, vnode) {
      el[ctx].documentHandler = createDocumentHandler(el, binding, vnode);
      el[ctx].methodName = binding.expression;
      el[ctx].bindingFn = binding.value;
    },

    unbind(el) {
      let len = nodeList.length;

      for (let i = 0; i < len; i++) {
        if (nodeList[i][ctx].id === el[ctx].id) {
          nodeList.splice(i, 1);
          break;
        }
      }
      delete el[ctx];
    }
  };

  function scrollIntoView(container, selected) {
    if (Vue.prototype.$isServer) return;

    if (!selected) {
      container.scrollTop = 0;
      return;
    }

    const offsetParents = [];
    let pointer = selected.offsetParent;
    while (pointer && container !== pointer && container.contains(pointer)) {
      offsetParents.push(pointer);
      pointer = pointer.offsetParent;
    }
    const top = selected.offsetTop + offsetParents.reduce((prev, curr) => (prev + curr.offsetTop), 0);
    const bottom = top + selected.offsetHeight;
    const viewRectTop = container.scrollTop;
    const viewRectBottom = viewRectTop + container.clientHeight;

    if (top < viewRectTop) {
      container.scrollTop = top;
    } else if (bottom > viewRectBottom) {
      container.scrollTop = bottom - container.clientHeight;
    }
  }

  var NavigationMixin = {
    data: function data() {
      return {
        hoverOption: -1
      };
    },
    computed: {
      optionsAllDisabled: function optionsAllDisabled() {
        return this.options.filter(function (option) {
          return option.visible;
        }).every(function (option) {
          return option.disabled;
        });
      }
    },
    watch: {
      hoverIndex: function hoverIndex(val) {
        var _this = this;

        if (typeof val === 'number' && val > -1) {
          this.hoverOption = this.options[val] || {};
        }

        this.options.forEach(function (option) {
          option.hover = _this.hoverOption === option;
        });
      }
    },
    methods: {
      navigateOptions: function navigateOptions(direction) {
        var _this2 = this;

        if (!this.visible) {
          this.visible = true;
          return;
        }

        if (this.options.length === 0 || this.filteredOptionsCount === 0) return;

        if (!this.optionsAllDisabled) {
          if (direction === 'next') {
            this.hoverIndex++;

            if (this.hoverIndex === this.options.length) {
              this.hoverIndex = 0;
            }
          } else if (direction === 'prev') {
            this.hoverIndex--;

            if (this.hoverIndex < 0) {
              this.hoverIndex = this.options.length - 1;
            }
          }

          var option = this.options[this.hoverIndex];

          if (option.disabled === true || option.groupDisabled === true || !option.visible) {
            this.navigateOptions(direction);
          }

          this.$nextTick(function () {
            return _this2.scrollToOption(_this2.hoverOption);
          });
        }
      }
    }
  };

  //
  var script$5 = {
    mixins: [Emitter, Locale, Focus('reference'), NavigationMixin],
    name: 'ElSelect',
    componentName: 'ElSelect',
    inject: {
      elForm: {
        "default": ''
      },
      elFormItem: {
        "default": ''
      }
    },
    provide: function provide() {
      return {
        'select': this
      };
    },
    computed: {
      _elFormItemSize: function _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      readonly: function readonly() {
        return !this.filterable || this.multiple || !isIE$2() && !isEdge$2() && !this.visible;
      },
      showClose: function showClose() {
        var hasValue = this.multiple ? Array.isArray(this.value) && this.value.length > 0 : this.value !== undefined && this.value !== null && this.value !== '';
        var criteria = this.clearable && !this.selectDisabled && this.inputHovering && hasValue;
        return criteria;
      },
      iconClass: function iconClass() {
        return this.remote && this.filterable ? '' : this.visible ? 'arrow-up is-reverse' : 'arrow-up';
      },
      debounce: function debounce() {
        return this.remote ? 300 : 0;
      },
      emptyText: function emptyText() {
        if (this.loading) {
          return this.loadingText || this.t('el.select.loading');
        } else {
          if (this.remote && this.query === '' && this.options.length === 0) return false;

          if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
            return this.noMatchText || this.t('el.select.noMatch');
          }

          if (this.options.length === 0) {
            return this.noDataText || this.t('el.select.noData');
          }
        }

        return null;
      },
      showNewOption: function showNewOption() {
        var _this = this;

        var hasExistingOption = this.options.filter(function (option) {
          return !option.created;
        }).some(function (option) {
          return option.currentLabel === _this.query;
        });
        return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption;
      },
      selectSize: function selectSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      selectDisabled: function selectDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      collapseTagSize: function collapseTagSize() {
        return ['small', 'mini'].indexOf(this.selectSize) > -1 ? 'mini' : 'small';
      },
      propPlaceholder: function propPlaceholder() {
        return typeof this.placeholder !== 'undefined' ? this.placeholder : this.t('el.select.placeholder');
      }
    },
    components: {
      ElInput: __vue_component__$1,
      ElSelectMenu: __vue_component__$2,
      ElOption: __vue_component__$3,
      ElTag: __vue_component__$4,
      ElScrollbar: Scrollbar
    },
    directives: {
      Clickoutside: Clickoutside
    },
    props: {
      name: String,
      id: String,
      value: {
        required: true
      },
      autocomplete: {
        type: String,
        "default": 'off'
      },

      /** @Deprecated in next major version */
      autoComplete: {
        type: String,
        validator: function validator(val) {
           console.warn('[Element Warn][Select]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
          return true;
        }
      },
      automaticDropdown: Boolean,
      size: String,
      disabled: Boolean,
      clearable: Boolean,
      filterable: Boolean,
      allowCreate: Boolean,
      loading: Boolean,
      popperClass: String,
      remote: Boolean,
      loadingText: String,
      noMatchText: String,
      noDataText: String,
      remoteMethod: Function,
      filterMethod: Function,
      multiple: Boolean,
      multipleLimit: {
        type: Number,
        "default": 0
      },
      placeholder: {
        type: String,
        required: false
      },
      defaultFirstOption: Boolean,
      reserveKeyword: Boolean,
      valueKey: {
        type: String,
        "default": 'value'
      },
      collapseTags: Boolean,
      popperAppendToBody: {
        type: Boolean,
        "default": true
      }
    },
    data: function data() {
      return {
        options: [],
        cachedOptions: [],
        createdLabel: null,
        createdSelected: false,
        selected: this.multiple ? [] : {},
        inputLength: 20,
        inputWidth: 0,
        initialInputHeight: 0,
        cachedPlaceHolder: '',
        optionsCount: 0,
        filteredOptionsCount: 0,
        visible: false,
        softFocus: false,
        selectedLabel: '',
        hoverIndex: -1,
        query: '',
        previousQuery: null,
        inputHovering: false,
        currentPlaceholder: '',
        menuVisibleOnFocus: false,
        isOnComposition: false,
        isSilentBlur: false
      };
    },
    watch: {
      selectDisabled: function selectDisabled() {
        var _this2 = this;

        this.$nextTick(function () {
          _this2.resetInputHeight();
        });
      },
      propPlaceholder: function propPlaceholder(val) {
        this.cachedPlaceHolder = this.currentPlaceholder = val;
      },
      value: function value(val, oldVal) {
        if (this.multiple) {
          this.resetInputHeight();

          if (val && val.length > 0 || this.$refs.input && this.query !== '') {
            this.currentPlaceholder = '';
          } else {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }

          if (this.filterable && !this.reserveKeyword) {
            this.query = '';
            this.handleQueryChange(this.query);
          }
        }

        this.setSelected();

        if (this.filterable && !this.multiple) {
          this.inputLength = 20;
        }

        if (!valueEquals(val, oldVal)) {
          this.dispatch('ElFormItem', 'el.form.change', val);
        }
      },
      visible: function visible(val) {
        var _this3 = this;

        if (!val) {
          this.broadcast('ElSelectDropdown', 'destroyPopper');

          if (this.$refs.input) {
            this.$refs.input.blur();
          }

          this.query = '';
          this.previousQuery = null;
          this.selectedLabel = '';
          this.inputLength = 20;
          this.menuVisibleOnFocus = false;
          this.resetHoverIndex();
          this.$nextTick(function () {
            if (_this3.$refs.input && _this3.$refs.input.value === '' && _this3.selected.length === 0) {
              _this3.currentPlaceholder = _this3.cachedPlaceHolder;
            }
          });

          if (!this.multiple) {
            if (this.selected) {
              if (this.filterable && this.allowCreate && this.createdSelected && this.createdLabel) {
                this.selectedLabel = this.createdLabel;
              } else {
                this.selectedLabel = this.selected.currentLabel;
              }

              if (this.filterable) this.query = this.selectedLabel;
            }

            if (this.filterable) {
              this.currentPlaceholder = this.cachedPlaceHolder;
            }
          }
        } else {
          this.broadcast('ElSelectDropdown', 'updatePopper');

          if (this.filterable) {
            this.query = this.remote ? '' : this.selectedLabel;
            this.handleQueryChange(this.query);

            if (this.multiple) {
              this.$refs.input.focus();
            } else {
              if (!this.remote) {
                this.broadcast('ElOption', 'queryChange', '');
                this.broadcast('ElOptionGroup', 'queryChange');
              }

              if (this.selectedLabel) {
                this.currentPlaceholder = this.selectedLabel;
                this.selectedLabel = '';
              }
            }
          }
        }

        this.$emit('visible-change', val);
      },
      options: function options() {
        var _this4 = this;

        if (this.$isServer) return;
        this.$nextTick(function () {
          _this4.broadcast('ElSelectDropdown', 'updatePopper');
        });

        if (this.multiple) {
          this.resetInputHeight();
        }

        var inputs = this.$el.querySelectorAll('input');

        if ([].indexOf.call(inputs, document.activeElement) === -1) {
          this.setSelected();
        }

        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      }
    },
    methods: {
      handleNavigate: function handleNavigate(direction) {
        if (this.isOnComposition) return;
        this.navigateOptions(direction);
      },
      handleComposition: function handleComposition(event) {
        var _this5 = this;

        var text = event.target.value;

        if (event.type === 'compositionend') {
          this.isOnComposition = false;
          this.$nextTick(function (_) {
            return _this5.handleQueryChange(text);
          });
        } else {
          var lastCharacter = text[text.length - 1] || '';
          this.isOnComposition = !isKorean(lastCharacter);
        }
      },
      handleQueryChange: function handleQueryChange(val) {
        var _this6 = this;

        if (this.previousQuery === val || this.isOnComposition) return;

        if (this.previousQuery === null && (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')) {
          this.previousQuery = val;
          return;
        }

        this.previousQuery = val;
        this.$nextTick(function () {
          if (_this6.visible) _this6.broadcast('ElSelectDropdown', 'updatePopper');
        });
        this.hoverIndex = -1;

        if (this.multiple && this.filterable) {
          this.$nextTick(function () {
            var length = _this6.$refs.input.value.length * 15 + 20;
            _this6.inputLength = _this6.collapseTags ? Math.min(50, length) : length;

            _this6.managePlaceholder();

            _this6.resetInputHeight();
          });
        }

        if (this.remote && typeof this.remoteMethod === 'function') {
          this.hoverIndex = -1;
          this.remoteMethod(val);
        } else if (typeof this.filterMethod === 'function') {
          this.filterMethod(val);
          this.broadcast('ElOptionGroup', 'queryChange');
        } else {
          this.filteredOptionsCount = this.optionsCount;
          this.broadcast('ElOption', 'queryChange', val);
          this.broadcast('ElOptionGroup', 'queryChange');
        }

        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      },
      scrollToOption: function scrollToOption(option) {
        var target = Array.isArray(option) && option[0] ? option[0].$el : option.$el;

        if (this.$refs.popper && target) {
          var menu = this.$refs.popper.$el.querySelector('.el-select-dropdown__wrap');
          scrollIntoView(menu, target);
        }

        this.$refs.scrollbar && this.$refs.scrollbar.handleScroll();
      },
      handleMenuEnter: function handleMenuEnter() {
        var _this7 = this;

        this.$nextTick(function () {
          return _this7.scrollToOption(_this7.selected);
        });
      },
      emitChange: function emitChange(val) {
        if (!valueEquals(this.value, val)) {
          this.$emit('change', val);
        }
      },
      getOption: function getOption(value) {
        var option;
        var isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
        var isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]';
        var isUndefined = Object.prototype.toString.call(value).toLowerCase() === '[object undefined]';

        for (var i = this.cachedOptions.length - 1; i >= 0; i--) {
          var cachedOption = this.cachedOptions[i];
          var isEqual = isObject ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey) : cachedOption.value === value;

          if (isEqual) {
            option = cachedOption;
            break;
          }
        }

        if (option) return option;
        var label = !isObject && !isNull && !isUndefined ? String(value) : '';
        var newOption = {
          value: value,
          currentLabel: label
        };

        if (this.multiple) {
          newOption.hitState = false;
        }

        return newOption;
      },
      setSelected: function setSelected() {
        var _this8 = this;

        if (!this.multiple) {
          var option = this.getOption(this.value);

          if (option.created) {
            this.createdLabel = option.currentLabel;
            this.createdSelected = true;
          } else {
            this.createdSelected = false;
          }

          this.selectedLabel = option.currentLabel;
          this.selected = option;
          if (this.filterable) this.query = this.selectedLabel;
          return;
        }

        var result = [];

        if (Array.isArray(this.value)) {
          this.value.forEach(function (value) {
            result.push(_this8.getOption(value));
          });
        }

        this.selected = result;
        this.$nextTick(function () {
          _this8.resetInputHeight();
        });
      },
      handleFocus: function handleFocus(event) {
        if (!this.softFocus) {
          if (this.automaticDropdown || this.filterable) {
            if (this.filterable && !this.visible) {
              this.menuVisibleOnFocus = true;
            }

            this.visible = true;
          }

          this.$emit('focus', event);
        } else {
          this.softFocus = false;
        }
      },
      blur: function blur() {
        this.visible = false;
        this.$refs.reference.blur();
      },
      handleBlur: function handleBlur(event) {
        var _this9 = this;

        setTimeout(function () {
          if (_this9.isSilentBlur) {
            _this9.isSilentBlur = false;
          } else {
            _this9.$emit('blur', event);
          }
        }, 50);
        this.softFocus = false;
      },
      handleClearClick: function handleClearClick(event) {
        this.deleteSelected(event);
      },
      doDestroy: function doDestroy() {
        this.$refs.popper && this.$refs.popper.doDestroy();
      },
      handleClose: function handleClose() {
        this.visible = false;
      },
      toggleLastOptionHitState: function toggleLastOptionHitState(hit) {
        if (!Array.isArray(this.selected)) return;
        var option = this.selected[this.selected.length - 1];
        if (!option) return;

        if (hit === true || hit === false) {
          option.hitState = hit;
          return hit;
        }

        option.hitState = !option.hitState;
        return option.hitState;
      },
      deletePrevTag: function deletePrevTag(e) {
        if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
          var value = this.value.slice();
          value.pop();
          this.$emit('input', value);
          this.emitChange(value);
        }
      },
      managePlaceholder: function managePlaceholder() {
        if (this.currentPlaceholder !== '') {
          this.currentPlaceholder = this.$refs.input.value ? '' : this.cachedPlaceHolder;
        }
      },
      resetInputState: function resetInputState(e) {
        if (e.keyCode !== 8) this.toggleLastOptionHitState(false);
        this.inputLength = this.$refs.input.value.length * 15 + 20;
        this.resetInputHeight();
      },
      resetInputHeight: function resetInputHeight() {
        var _this10 = this;

        if (this.collapseTags && !this.filterable) return;
        this.$nextTick(function () {
          if (!_this10.$refs.reference) return;
          var inputChildNodes = _this10.$refs.reference.$el.childNodes;
          var input = [].filter.call(inputChildNodes, function (item) {
            return item.tagName === 'INPUT';
          })[0];
          var tags = _this10.$refs.tags;
          var tagsHeight = tags ? Math.round(tags.getBoundingClientRect().height) : 0;
          var sizeInMap = _this10.initialInputHeight || 40;
          input.style.height = _this10.selected.length === 0 ? sizeInMap + 'px' : Math.max(tags ? tagsHeight + (tagsHeight > sizeInMap ? 6 : 0) : 0, sizeInMap) + 'px';

          if (_this10.visible && _this10.emptyText !== false) {
            _this10.broadcast('ElSelectDropdown', 'updatePopper');
          }
        });
      },
      resetHoverIndex: function resetHoverIndex() {
        var _this11 = this;

        setTimeout(function () {
          if (!_this11.multiple) {
            _this11.hoverIndex = _this11.options.indexOf(_this11.selected);
          } else {
            if (_this11.selected.length > 0) {
              _this11.hoverIndex = Math.min.apply(null, _this11.selected.map(function (item) {
                return _this11.options.indexOf(item);
              }));
            } else {
              _this11.hoverIndex = -1;
            }
          }
        }, 300);
      },
      handleOptionSelect: function handleOptionSelect(option, byClick) {
        var _this12 = this;

        if (this.multiple) {
          var value = (this.value || []).slice();
          var optionIndex = this.getValueIndex(value, option.value);

          if (optionIndex > -1) {
            value.splice(optionIndex, 1);
          } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
            value.push(option.value);
          }

          this.$emit('input', value);
          this.emitChange(value);

          if (option.created) {
            this.query = '';
            this.handleQueryChange('');
            this.inputLength = 20;
          }

          if (this.filterable) this.$refs.input.focus();
        } else {
          this.$emit('input', option.value);
          this.emitChange(option.value);
          this.visible = false;
        }

        this.isSilentBlur = byClick;
        this.setSoftFocus();
        if (this.visible) return;
        this.$nextTick(function () {
          _this12.scrollToOption(option);
        });
      },
      setSoftFocus: function setSoftFocus() {
        this.softFocus = true;
        var input = this.$refs.input || this.$refs.reference;

        if (input) {
          input.focus();
        }
      },
      getValueIndex: function getValueIndex() {
        var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var value = arguments.length > 1 ? arguments[1] : undefined;
        var isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';

        if (!isObject) {
          return arr.indexOf(value);
        } else {
          var valueKey = this.valueKey;
          var index = -1;
          arr.some(function (item, i) {
            if (getValueByPath(item, valueKey) === getValueByPath(value, valueKey)) {
              index = i;
              return true;
            }

            return false;
          });
          return index;
        }
      },
      toggleMenu: function toggleMenu() {
        if (!this.selectDisabled) {
          if (this.menuVisibleOnFocus) {
            this.menuVisibleOnFocus = false;
          } else {
            this.visible = !this.visible;
          }

          if (this.visible) {
            (this.$refs.input || this.$refs.reference).focus();
          }
        }
      },
      selectOption: function selectOption() {
        if (!this.visible) {
          this.toggleMenu();
        } else {
          if (this.options[this.hoverIndex]) {
            this.handleOptionSelect(this.options[this.hoverIndex]);
          }
        }
      },
      deleteSelected: function deleteSelected(event) {
        event.stopPropagation();
        var value = this.multiple ? [] : '';
        this.$emit('input', value);
        this.emitChange(value);
        this.visible = false;
        this.$emit('clear');
      },
      deleteTag: function deleteTag(event, tag) {
        var index = this.selected.indexOf(tag);

        if (index > -1 && !this.selectDisabled) {
          var value = this.value.slice();
          value.splice(index, 1);
          this.$emit('input', value);
          this.emitChange(value);
          this.$emit('remove-tag', tag.value);
        }

        event.stopPropagation();
      },
      onInputChange: function onInputChange() {
        if (this.filterable && this.query !== this.selectedLabel) {
          this.query = this.selectedLabel;
          this.handleQueryChange(this.query);
        }
      },
      onOptionDestroy: function onOptionDestroy(index) {
        if (index > -1) {
          this.optionsCount--;
          this.filteredOptionsCount--;
          this.options.splice(index, 1);
        }
      },
      resetInputWidth: function resetInputWidth() {
        this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
      },
      handleResize: function handleResize() {
        this.resetInputWidth();
        if (this.multiple) this.resetInputHeight();
      },
      checkDefaultFirstOption: function checkDefaultFirstOption() {
        this.hoverIndex = -1; // highlight the created option

        var hasCreated = false;

        for (var i = this.options.length - 1; i >= 0; i--) {
          if (this.options[i].created) {
            hasCreated = true;
            this.hoverIndex = i;
            break;
          }
        }

        if (hasCreated) return;

        for (var _i = 0; _i !== this.options.length; ++_i) {
          var option = this.options[_i];

          if (this.query) {
            // highlight first options that passes the filter
            if (!option.disabled && !option.groupDisabled && option.visible) {
              this.hoverIndex = _i;
              break;
            }
          } else {
            // highlight currently selected option
            if (option.itemSelected) {
              this.hoverIndex = _i;
              break;
            }
          }
        }
      },
      getValueKey: function getValueKey(item) {
        if (Object.prototype.toString.call(item.value).toLowerCase() !== '[object object]') {
          return item.value;
        } else {
          return getValueByPath(item.value, this.valueKey);
        }
      }
    },
    created: function created() {
      var _this13 = this;

      this.cachedPlaceHolder = this.currentPlaceholder = this.propPlaceholder;

      if (this.multiple && !Array.isArray(this.value)) {
        this.$emit('input', []);
      }

      if (!this.multiple && Array.isArray(this.value)) {
        this.$emit('input', '');
      }

      this.debouncedOnInputChange = debounce(this.debounce, function () {
        _this13.onInputChange();
      });
      this.debouncedQueryChange = debounce(this.debounce, function (e) {
        _this13.handleQueryChange(e.target.value);
      });
      this.$on('handleOptionClick', this.handleOptionSelect);
      this.$on('setSelected', this.setSelected);
    },
    mounted: function mounted() {
      var _this14 = this;

      if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
        this.currentPlaceholder = '';
      }

      addResizeListener(this.$el, this.handleResize);
      var reference = this.$refs.reference;

      if (reference && reference.$el) {
        var sizeMap = {
          medium: 36,
          small: 32,
          mini: 28
        };
        var input = reference.$el.querySelector('input');
        this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize];
      }

      if (this.remote && this.multiple) {
        this.resetInputHeight();
      }

      this.$nextTick(function () {
        if (reference && reference.$el) {
          _this14.inputWidth = reference.$el.getBoundingClientRect().width;
        }
      });
      this.setSelected();
    },
    beforeDestroy: function beforeDestroy() {
      if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
    }
  };

  /* script */
  var __vue_script__$5 = script$5;
  /* template */

  var __vue_render__$4 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("div", {
      directives: [{
        name: "clickoutside",
        rawName: "v-clickoutside",
        value: _vm.handleClose,
        expression: "handleClose"
      }],
      staticClass: "el-select",
      "class": [_vm.selectSize ? "el-select--" + _vm.selectSize : ""],
      on: {
        click: function click($event) {
          $event.stopPropagation();
          return _vm.toggleMenu.apply(null, arguments);
        }
      }
    }, [_vm.multiple ? _c("div", {
      ref: "tags",
      staticClass: "el-select__tags",
      style: {
        "max-width": _vm.inputWidth - 32 + "px",
        width: "100%"
      }
    }, [_vm.collapseTags && _vm.selected.length ? _c("span", [_c("el-tag", {
      attrs: {
        closable: !_vm.selectDisabled,
        size: _vm.collapseTagSize,
        hit: _vm.selected[0].hitState,
        type: "info",
        "disable-transitions": ""
      },
      on: {
        close: function close($event) {
          return _vm.deleteTag($event, _vm.selected[0]);
        }
      }
    }, [_c("span", {
      staticClass: "el-select__tags-text"
    }, [_vm._v(_vm._s(_vm.selected[0].currentLabel))])]), _vm._v(" "), _vm.selected.length > 1 ? _c("el-tag", {
      attrs: {
        closable: false,
        size: _vm.collapseTagSize,
        type: "info",
        "disable-transitions": ""
      }
    }, [_c("span", {
      staticClass: "el-select__tags-text"
    }, [_vm._v("+ " + _vm._s(_vm.selected.length - 1))])]) : _vm._e()], 1) : _vm._e(), _vm._v(" "), !_vm.collapseTags ? _c("transition-group", {
      on: {
        "after-leave": _vm.resetInputHeight
      }
    }, _vm._l(_vm.selected, function (item) {
      return _c("el-tag", {
        key: _vm.getValueKey(item),
        attrs: {
          closable: !_vm.selectDisabled,
          size: _vm.collapseTagSize,
          hit: item.hitState,
          type: "info",
          "disable-transitions": ""
        },
        on: {
          close: function close($event) {
            return _vm.deleteTag($event, item);
          }
        }
      }, [_c("span", {
        staticClass: "el-select__tags-text"
      }, [_vm._v(_vm._s(item.currentLabel))])]);
    }), 1) : _vm._e(), _vm._v(" "), _vm.filterable ? _c("input", {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: _vm.query,
        expression: "query"
      }],
      ref: "input",
      staticClass: "el-select__input",
      "class": [_vm.selectSize ? "is-" + _vm.selectSize : ""],
      style: {
        "flex-grow": "1",
        width: _vm.inputLength / (_vm.inputWidth - 32) + "%",
        "max-width": _vm.inputWidth - 42 + "px"
      },
      attrs: {
        type: "text",
        disabled: _vm.selectDisabled,
        autocomplete: _vm.autoComplete || _vm.autocomplete
      },
      domProps: {
        value: _vm.query
      },
      on: {
        focus: _vm.handleFocus,
        blur: function blur($event) {
          _vm.softFocus = false;
        },
        keyup: _vm.managePlaceholder,
        keydown: [_vm.resetInputState, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "down", 40, $event.key, ["Down", "ArrowDown"])) {
            return null;
          }

          $event.preventDefault();
          return _vm.handleNavigate("next");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "up", 38, $event.key, ["Up", "ArrowUp"])) {
            return null;
          }

          $event.preventDefault();
          return _vm.handleNavigate("prev");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
            return null;
          }

          $event.preventDefault();
          return _vm.selectOption.apply(null, arguments);
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "esc", 27, $event.key, ["Esc", "Escape"])) {
            return null;
          }

          $event.stopPropagation();
          $event.preventDefault();
          _vm.visible = false;
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "delete", [8, 46], $event.key, ["Backspace", "Delete", "Del"])) {
            return null;
          }

          return _vm.deletePrevTag.apply(null, arguments);
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "tab", 9, $event.key, "Tab")) {
            return null;
          }

          _vm.visible = false;
        }],
        compositionstart: _vm.handleComposition,
        compositionupdate: _vm.handleComposition,
        compositionend: _vm.handleComposition,
        input: [function ($event) {
          if ($event.target.composing) {
            return;
          }

          _vm.query = $event.target.value;
        }, _vm.debouncedQueryChange]
      }
    }) : _vm._e()], 1) : _vm._e(), _vm._v(" "), _c("el-input", {
      ref: "reference",
      "class": {
        "is-focus": _vm.visible
      },
      attrs: {
        type: "text",
        placeholder: _vm.currentPlaceholder,
        name: _vm.name,
        id: _vm.id,
        autocomplete: _vm.autoComplete || _vm.autocomplete,
        size: _vm.selectSize,
        disabled: _vm.selectDisabled,
        readonly: _vm.readonly,
        "validate-event": false,
        tabindex: _vm.multiple && _vm.filterable ? "-1" : null
      },
      on: {
        focus: _vm.handleFocus,
        blur: _vm.handleBlur,
        input: _vm.debouncedOnInputChange,
        compositionstart: _vm.handleComposition,
        compositionupdate: _vm.handleComposition,
        compositionend: _vm.handleComposition
      },
      nativeOn: {
        keydown: [function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "down", 40, $event.key, ["Down", "ArrowDown"])) {
            return null;
          }

          $event.stopPropagation();
          $event.preventDefault();
          return _vm.handleNavigate("next");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "up", 38, $event.key, ["Up", "ArrowUp"])) {
            return null;
          }

          $event.stopPropagation();
          $event.preventDefault();
          return _vm.handleNavigate("prev");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
            return null;
          }

          $event.preventDefault();
          return _vm.selectOption.apply(null, arguments);
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "esc", 27, $event.key, ["Esc", "Escape"])) {
            return null;
          }

          $event.stopPropagation();
          $event.preventDefault();
          _vm.visible = false;
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "tab", 9, $event.key, "Tab")) {
            return null;
          }

          _vm.visible = false;
        }],
        mouseenter: function mouseenter($event) {
          _vm.inputHovering = true;
        },
        mouseleave: function mouseleave($event) {
          _vm.inputHovering = false;
        }
      },
      model: {
        value: _vm.selectedLabel,
        callback: function callback($$v) {
          _vm.selectedLabel = $$v;
        },
        expression: "selectedLabel"
      }
    }, [_vm.$slots.prefix ? _c("template", {
      slot: "prefix"
    }, [_vm._t("prefix")], 2) : _vm._e(), _vm._v(" "), _c("template", {
      slot: "suffix"
    }, [_c("i", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: !_vm.showClose,
        expression: "!showClose"
      }],
      "class": ["el-select__caret", "el-input__icon", "el-icon-" + _vm.iconClass]
    }), _vm._v(" "), _vm.showClose ? _c("i", {
      staticClass: "el-select__caret el-input__icon el-icon-circle-close",
      on: {
        click: _vm.handleClearClick
      }
    }) : _vm._e()])], 2), _vm._v(" "), _c("transition", {
      attrs: {
        name: "el-zoom-in-top"
      },
      on: {
        "before-enter": _vm.handleMenuEnter,
        "after-leave": _vm.doDestroy
      }
    }, [_c("el-select-menu", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.visible && _vm.emptyText !== false,
        expression: "visible && emptyText !== false"
      }],
      ref: "popper",
      attrs: {
        "append-to-body": _vm.popperAppendToBody
      }
    }, [_c("el-scrollbar", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.options.length > 0 && !_vm.loading,
        expression: "options.length > 0 && !loading"
      }],
      ref: "scrollbar",
      "class": {
        "is-empty": !_vm.allowCreate && _vm.query && _vm.filteredOptionsCount === 0
      },
      attrs: {
        tag: "ul",
        "wrap-class": "el-select-dropdown__wrap",
        "view-class": "el-select-dropdown__list"
      }
    }, [_vm.showNewOption ? _c("el-option", {
      attrs: {
        value: _vm.query,
        created: ""
      }
    }) : _vm._e(), _vm._v(" "), _vm._t("default")], 2), _vm._v(" "), _vm.emptyText && (!_vm.allowCreate || _vm.loading || _vm.allowCreate && _vm.options.length === 0) ? [_vm.$slots.empty ? _vm._t("empty") : _c("p", {
      staticClass: "el-select-dropdown__empty"
    }, [_vm._v("\n          " + _vm._s(_vm.emptyText) + "\n        ")])] : _vm._e()], 2)], 1)], 1);
  };

  var __vue_staticRenderFns__$4 = [];
  __vue_render__$4._withStripped = true;
  /* style */

  var __vue_inject_styles__$5 = undefined;
  /* scoped */

  var __vue_scope_id__$5 = undefined;
  /* module identifier */

  var __vue_module_identifier__$5 = undefined;
  /* functional template */

  var __vue_is_functional_template__$5 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$5 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$4,
    staticRenderFns: __vue_staticRenderFns__$4
  }, __vue_inject_styles__$5, __vue_script__$5, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, false, undefined, undefined, undefined);

  /* istanbul ignore next */

  __vue_component__$5.install = function (Vue) {
    Vue.component(__vue_component__$5.name, __vue_component__$5);
  };

  /* istanbul ignore next */

  __vue_component__$3.install = function (Vue) {
    Vue.component(__vue_component__$3.name, __vue_component__$3);
  };

  var members$2 = {};
  members$2.render={m:3,d:3,value:function render(){
  	return this.createElement(__vue_component__$3,this.getConfig(),this.slot('default'));
  }};
  var MyOption = Component.createComponent({
  	name:'es-MyOption'
  });
  Class.creator(6,MyOption,{
  	'id':1,
  	'ns':'',
  	'name':'MyOption',
  	'inherit':Component,
  	'members':members$2
  }, false);

  /*!
    * vue-router v3.5.3
    * (c) 2021 Evan You
    * @license MIT
    */
  /*  */

  function assert$1 (condition, message) {
    if (!condition) {
      throw new Error(("[vue-router] " + message))
    }
  }

  function warn$3 (condition, message) {
    if (!condition) {
      typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
    }
  }

  function extend$4 (a, b) {
    for (var key in b) {
      a[key] = b[key];
    }
    return a
  }

  /*  */

  var encodeReserveRE$1 = /[!'()*]/g;
  var encodeReserveReplacer$1 = function (c) { return '%' + c.charCodeAt(0).toString(16); };
  var commaRE$1 = /%2C/g;

  // fixed encodeURIComponent which is more conformant to RFC3986:
  // - escapes [!'()*]
  // - preserve commas
  var encode$1 = function (str) { return encodeURIComponent(str)
      .replace(encodeReserveRE$1, encodeReserveReplacer$1)
      .replace(commaRE$1, ','); };

  function decode$1 (str) {
    try {
      return decodeURIComponent(str)
    } catch (err) {
      {
        warn$3(false, ("Error decoding \"" + str + "\". Leaving it intact."));
      }
    }
    return str
  }

  function resolveQuery$1 (
    query,
    extraQuery,
    _parseQuery
  ) {
    if ( extraQuery === void 0 ) extraQuery = {};

    var parse = _parseQuery || parseQuery$1;
    var parsedQuery;
    try {
      parsedQuery = parse(query || '');
    } catch (e) {
       warn$3(false, e.message);
      parsedQuery = {};
    }
    for (var key in extraQuery) {
      var value = extraQuery[key];
      parsedQuery[key] = Array.isArray(value)
        ? value.map(castQueryParamValue$1)
        : castQueryParamValue$1(value);
    }
    return parsedQuery
  }

  var castQueryParamValue$1 = function (value) { return (value == null || typeof value === 'object' ? value : String(value)); };

  function parseQuery$1 (query) {
    var res = {};

    query = query.trim().replace(/^(\?|#|&)/, '');

    if (!query) {
      return res
    }

    query.split('&').forEach(function (param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = decode$1(parts.shift());
      var val = parts.length > 0 ? decode$1(parts.join('=')) : null;

      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });

    return res
  }

  function stringifyQuery$1 (obj) {
    var res = obj
      ? Object.keys(obj)
        .map(function (key) {
          var val = obj[key];

          if (val === undefined) {
            return ''
          }

          if (val === null) {
            return encode$1(key)
          }

          if (Array.isArray(val)) {
            var result = [];
            val.forEach(function (val2) {
              if (val2 === undefined) {
                return
              }
              if (val2 === null) {
                result.push(encode$1(key));
              } else {
                result.push(encode$1(key) + '=' + encode$1(val2));
              }
            });
            return result.join('&')
          }

          return encode$1(key) + '=' + encode$1(val)
        })
        .filter(function (x) { return x.length > 0; })
        .join('&')
      : null;
    return res ? ("?" + res) : ''
  }

  /*  */

  var trailingSlashRE$1 = /\/?$/;

  function createRoute$1 (
    record,
    location,
    redirectedFrom,
    router
  ) {
    var stringifyQuery = router && router.options.stringifyQuery;

    var query = location.query || {};
    try {
      query = clone$1(query);
    } catch (e) {}

    var route = {
      name: location.name || (record && record.name),
      meta: (record && record.meta) || {},
      path: location.path || '/',
      hash: location.hash || '',
      query: query,
      params: location.params || {},
      fullPath: getFullPath$1(location, stringifyQuery),
      matched: record ? formatMatch$1(record) : []
    };
    if (redirectedFrom) {
      route.redirectedFrom = getFullPath$1(redirectedFrom, stringifyQuery);
    }
    return Object.freeze(route)
  }

  function clone$1 (value) {
    if (Array.isArray(value)) {
      return value.map(clone$1)
    } else if (value && typeof value === 'object') {
      var res = {};
      for (var key in value) {
        res[key] = clone$1(value[key]);
      }
      return res
    } else {
      return value
    }
  }

  // the starting route that represents the initial state
  var START$1 = createRoute$1(null, {
    path: '/'
  });

  function formatMatch$1 (record) {
    var res = [];
    while (record) {
      res.unshift(record);
      record = record.parent;
    }
    return res
  }

  function getFullPath$1 (
    ref,
    _stringifyQuery
  ) {
    var path = ref.path;
    var query = ref.query; if ( query === void 0 ) query = {};
    var hash = ref.hash; if ( hash === void 0 ) hash = '';

    var stringify = _stringifyQuery || stringifyQuery$1;
    return (path || '/') + stringify(query) + hash
  }

  function isSameRoute$1 (a, b, onlyPath) {
    if (b === START$1) {
      return a === b
    } else if (!b) {
      return false
    } else if (a.path && b.path) {
      return a.path.replace(trailingSlashRE$1, '') === b.path.replace(trailingSlashRE$1, '') && (onlyPath ||
        a.hash === b.hash &&
        isObjectEqual$1(a.query, b.query))
    } else if (a.name && b.name) {
      return (
        a.name === b.name &&
        (onlyPath || (
          a.hash === b.hash &&
        isObjectEqual$1(a.query, b.query) &&
        isObjectEqual$1(a.params, b.params))
        )
      )
    } else {
      return false
    }
  }

  function isObjectEqual$1 (a, b) {
    if ( a === void 0 ) a = {};
    if ( b === void 0 ) b = {};

    // handle null value #1566
    if (!a || !b) { return a === b }
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) {
      return false
    }
    return aKeys.every(function (key, i) {
      var aVal = a[key];
      var bKey = bKeys[i];
      if (bKey !== key) { return false }
      var bVal = b[key];
      // query values can be null and undefined
      if (aVal == null || bVal == null) { return aVal === bVal }
      // check nested equality
      if (typeof aVal === 'object' && typeof bVal === 'object') {
        return isObjectEqual$1(aVal, bVal)
      }
      return String(aVal) === String(bVal)
    })
  }

  function isIncludedRoute$1 (current, target) {
    return (
      current.path.replace(trailingSlashRE$1, '/').indexOf(
        target.path.replace(trailingSlashRE$1, '/')
      ) === 0 &&
      (!target.hash || current.hash === target.hash) &&
      queryIncludes$1(current.query, target.query)
    )
  }

  function queryIncludes$1 (current, target) {
    for (var key in target) {
      if (!(key in current)) {
        return false
      }
    }
    return true
  }

  function handleRouteEntered$1 (route) {
    for (var i = 0; i < route.matched.length; i++) {
      var record = route.matched[i];
      for (var name in record.instances) {
        var instance = record.instances[name];
        var cbs = record.enteredCbs[name];
        if (!instance || !cbs) { continue }
        delete record.enteredCbs[name];
        for (var i$1 = 0; i$1 < cbs.length; i$1++) {
          if (!instance._isBeingDestroyed) { cbs[i$1](instance); }
        }
      }
    }
  }

  var View$2 = {
    name: 'RouterView',
    functional: true,
    props: {
      name: {
        type: String,
        default: 'default'
      }
    },
    render: function render (_, ref) {
      var props = ref.props;
      var children = ref.children;
      var parent = ref.parent;
      var data = ref.data;

      // used by devtools to display a router-view badge
      data.routerView = true;

      // directly use parent context's createElement() function
      // so that components rendered by router-view can resolve named slots
      var h = parent.$createElement;
      var name = props.name;
      var route = parent.$route;
      var cache = parent._routerViewCache || (parent._routerViewCache = {});

      // determine current view depth, also check to see if the tree
      // has been toggled inactive but kept-alive.
      var depth = 0;
      var inactive = false;
      while (parent && parent._routerRoot !== parent) {
        var vnodeData = parent.$vnode ? parent.$vnode.data : {};
        if (vnodeData.routerView) {
          depth++;
        }
        if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
          inactive = true;
        }
        parent = parent.$parent;
      }
      data.routerViewDepth = depth;

      // render previous view if the tree is inactive and kept-alive
      if (inactive) {
        var cachedData = cache[name];
        var cachedComponent = cachedData && cachedData.component;
        if (cachedComponent) {
          // #2301
          // pass props
          if (cachedData.configProps) {
            fillPropsinData$1(cachedComponent, data, cachedData.route, cachedData.configProps);
          }
          return h(cachedComponent, data, children)
        } else {
          // render previous empty view
          return h()
        }
      }

      var matched = route.matched[depth];
      var component = matched && matched.components[name];

      // render empty node if no matched route or no config component
      if (!matched || !component) {
        cache[name] = null;
        return h()
      }

      // cache component
      cache[name] = { component: component };

      // attach instance registration hook
      // this will be called in the instance's injected lifecycle hooks
      data.registerRouteInstance = function (vm, val) {
        // val could be undefined for unregistration
        var current = matched.instances[name];
        if (
          (val && current !== vm) ||
          (!val && current === vm)
        ) {
          matched.instances[name] = val;
        }
      }

      // also register instance in prepatch hook
      // in case the same component instance is reused across different routes
      ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
        matched.instances[name] = vnode.componentInstance;
      };

      // register instance in init hook
      // in case kept-alive component be actived when routes changed
      data.hook.init = function (vnode) {
        if (vnode.data.keepAlive &&
          vnode.componentInstance &&
          vnode.componentInstance !== matched.instances[name]
        ) {
          matched.instances[name] = vnode.componentInstance;
        }

        // if the route transition has already been confirmed then we weren't
        // able to call the cbs during confirmation as the component was not
        // registered yet, so we call it here.
        handleRouteEntered$1(route);
      };

      var configProps = matched.props && matched.props[name];
      // save route and configProps in cache
      if (configProps) {
        extend$4(cache[name], {
          route: route,
          configProps: configProps
        });
        fillPropsinData$1(component, data, route, configProps);
      }

      return h(component, data, children)
    }
  };

  function fillPropsinData$1 (component, data, route, configProps) {
    // resolve props
    var propsToPass = data.props = resolveProps$1(route, configProps);
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend$4({}, propsToPass);
      // pass non-declared props as attrs
      var attrs = data.attrs = data.attrs || {};
      for (var key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key];
          delete propsToPass[key];
        }
      }
    }
  }

  function resolveProps$1 (route, config) {
    switch (typeof config) {
      case 'undefined':
        return
      case 'object':
        return config
      case 'function':
        return config(route)
      case 'boolean':
        return config ? route.params : undefined
      default:
        {
          warn$3(
            false,
            "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
            "expecting an object, function or boolean."
          );
        }
    }
  }

  /*  */

  function resolvePath$1 (
    relative,
    base,
    append
  ) {
    var firstChar = relative.charAt(0);
    if (firstChar === '/') {
      return relative
    }

    if (firstChar === '?' || firstChar === '#') {
      return base + relative
    }

    var stack = base.split('/');

    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }

    // resolve relative path
    var segments = relative.replace(/^\//, '').split('/');
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment === '..') {
        stack.pop();
      } else if (segment !== '.') {
        stack.push(segment);
      }
    }

    // ensure leading slash
    if (stack[0] !== '') {
      stack.unshift('');
    }

    return stack.join('/')
  }

  function parsePath$3 (path) {
    var hash = '';
    var query = '';

    var hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      hash = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }

    var queryIndex = path.indexOf('?');
    if (queryIndex >= 0) {
      query = path.slice(queryIndex + 1);
      path = path.slice(0, queryIndex);
    }

    return {
      path: path,
      query: query,
      hash: hash
    }
  }

  function cleanPath$1 (path) {
    return path.replace(/\/+/g, '/')
  }

  var isarray$1 = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };

  /**
   * Expose `pathToRegexp`.
   */
  var pathToRegexp_1$1 = pathToRegexp$1;
  var parse_1$1 = parse$1;
  var compile_1$1 = compile$1;
  var tokensToFunction_1$1 = tokensToFunction$1;
  var tokensToRegExp_1$1 = tokensToRegExp$1;

  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  var PATH_REGEXP$1 = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
  ].join('|'), 'g');

  /**
   * Parse a string for the raw tokens.
   *
   * @param  {string}  str
   * @param  {Object=} options
   * @return {!Array}
   */
  function parse$1 (str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = options && options.delimiter || '/';
    var res;

    while ((res = PATH_REGEXP$1.exec(str)) != null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;

      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        continue
      }

      var next = str[index];
      var prefix = res[2];
      var name = res[3];
      var capture = res[4];
      var group = res[5];
      var modifier = res[6];
      var asterisk = res[7];

      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
      }

      var partial = prefix != null && next != null && next !== prefix;
      var repeat = modifier === '+' || modifier === '*';
      var optional = modifier === '?' || modifier === '*';
      var delimiter = res[2] || defaultDelimiter;
      var pattern = capture || group;

      tokens.push({
        name: name || key++,
        prefix: prefix || '',
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        partial: partial,
        asterisk: !!asterisk,
        pattern: pattern ? escapeGroup$1(pattern) : (asterisk ? '.*' : '[^' + escapeString$1(delimiter) + ']+?')
      });
    }

    // Match any characters still remaining.
    if (index < str.length) {
      path += str.substr(index);
    }

    // If the path exists, push it onto the end.
    if (path) {
      tokens.push(path);
    }

    return tokens
  }

  /**
   * Compile a string to a template function for the path.
   *
   * @param  {string}             str
   * @param  {Object=}            options
   * @return {!function(Object=, Object=)}
   */
  function compile$1 (str, options) {
    return tokensToFunction$1(parse$1(str, options), options)
  }

  /**
   * Prettier encoding of URI path segments.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeURIComponentPretty$1 (str) {
    return encodeURI(str).replace(/[\/?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeAsterisk$1 (str) {
    return encodeURI(str).replace(/[?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction$1 (tokens, options) {
    // Compile all the tokens into regexps.
    var matches = new Array(tokens.length);

    // Compile all the patterns before compilation.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags$1(options));
      }
    }

    return function (obj, opts) {
      var path = '';
      var data = obj || {};
      var options = opts || {};
      var encode = options.pretty ? encodeURIComponentPretty$1 : encodeURIComponent;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          path += token;

          continue
        }

        var value = data[token.name];
        var segment;

        if (value == null) {
          if (token.optional) {
            // Prepend partial segment prefixes.
            if (token.partial) {
              path += token.prefix;
            }

            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to be defined')
          }
        }

        if (isarray$1(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
          }

          if (value.length === 0) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }
          }

          for (var j = 0; j < value.length; j++) {
            segment = encode(value[j]);

            if (!matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
            }

            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }

          continue
        }

        segment = token.asterisk ? encodeAsterisk$1(value) : encode(value);

        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
        }

        path += token.prefix + segment;
      }

      return path
    }
  }

  /**
   * Escape a regular expression string.
   *
   * @param  {string} str
   * @return {string}
   */
  function escapeString$1 (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
  }

  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {string} group
   * @return {string}
   */
  function escapeGroup$1 (group) {
    return group.replace(/([=!:$\/()])/g, '\\$1')
  }

  /**
   * Attach the keys as a property of the regexp.
   *
   * @param  {!RegExp} re
   * @param  {Array}   keys
   * @return {!RegExp}
   */
  function attachKeys$1 (re, keys) {
    re.keys = keys;
    return re
  }

  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {string}
   */
  function flags$1 (options) {
    return options && options.sensitive ? '' : 'i'
  }

  /**
   * Pull out keys from a regexp.
   *
   * @param  {!RegExp} path
   * @param  {!Array}  keys
   * @return {!RegExp}
   */
  function regexpToRegexp$1 (path, keys) {
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          partial: false,
          asterisk: false,
          pattern: null
        });
      }
    }

    return attachKeys$1(path, keys)
  }

  /**
   * Transform an array into a regexp.
   *
   * @param  {!Array}  path
   * @param  {Array}   keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function arrayToRegexp$1 (path, keys, options) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp$1(path[i], keys, options).source);
    }

    var regexp = new RegExp('(?:' + parts.join('|') + ')', flags$1(options));

    return attachKeys$1(regexp, keys)
  }

  /**
   * Create a path regexp from string input.
   *
   * @param  {string}  path
   * @param  {!Array}  keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function stringToRegexp$1 (path, keys, options) {
    return tokensToRegExp$1(parse$1(path, options), keys, options)
  }

  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {!Array}          tokens
   * @param  {(Array|Object)=} keys
   * @param  {Object=}         options
   * @return {!RegExp}
   */
  function tokensToRegExp$1 (tokens, keys, options) {
    if (!isarray$1(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    var strict = options.strict;
    var end = options.end !== false;
    var route = '';

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        route += escapeString$1(token);
      } else {
        var prefix = escapeString$1(token.prefix);
        var capture = '(?:' + token.pattern + ')';

        keys.push(token);

        if (token.repeat) {
          capture += '(?:' + prefix + capture + ')*';
        }

        if (token.optional) {
          if (!token.partial) {
            capture = '(?:' + prefix + '(' + capture + '))?';
          } else {
            capture = prefix + '(' + capture + ')?';
          }
        } else {
          capture = prefix + '(' + capture + ')';
        }

        route += capture;
      }
    }

    var delimiter = escapeString$1(options.delimiter || '/');
    var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

    // In non-strict mode we allow a slash at the end of match. If the path to
    // match already ends with a slash, we remove it for consistency. The slash
    // is valid at the end of a path match, not in the middle. This is important
    // in non-ending mode, where "/test/" shouldn't match "/test//route".
    if (!strict) {
      route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
    }

    if (end) {
      route += '$';
    } else {
      // In non-ending mode, we need the capturing groups to match as much as
      // possible by using a positive lookahead to the end or next path segment.
      route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
    }

    return attachKeys$1(new RegExp('^' + route, flags$1(options)), keys)
  }

  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(string|RegExp|Array)} path
   * @param  {(Array|Object)=}       keys
   * @param  {Object=}               options
   * @return {!RegExp}
   */
  function pathToRegexp$1 (path, keys, options) {
    if (!isarray$1(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    if (path instanceof RegExp) {
      return regexpToRegexp$1(path, /** @type {!Array} */ (keys))
    }

    if (isarray$1(path)) {
      return arrayToRegexp$1(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
    }

    return stringToRegexp$1(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
  }
  pathToRegexp_1$1.parse = parse_1$1;
  pathToRegexp_1$1.compile = compile_1$1;
  pathToRegexp_1$1.tokensToFunction = tokensToFunction_1$1;
  pathToRegexp_1$1.tokensToRegExp = tokensToRegExp_1$1;

  /*  */

  // $flow-disable-line
  var regexpCompileCache$1 = Object.create(null);

  function fillParams$1 (
    path,
    params,
    routeMsg
  ) {
    params = params || {};
    try {
      var filler =
        regexpCompileCache$1[path] ||
        (regexpCompileCache$1[path] = pathToRegexp_1$1.compile(path));

      // Fix #2505 resolving asterisk routes { name: 'not-found', params: { pathMatch: '/not-found' }}
      // and fix #3106 so that you can work with location descriptor object having params.pathMatch equal to empty string
      if (typeof params.pathMatch === 'string') { params[0] = params.pathMatch; }

      return filler(params, { pretty: true })
    } catch (e) {
      {
        // Fix #3072 no warn if `pathMatch` is string
        warn$3(typeof params.pathMatch === 'string', ("missing param for " + routeMsg + ": " + (e.message)));
      }
      return ''
    } finally {
      // delete the 0 if it was added
      delete params[0];
    }
  }

  /*  */

  function normalizeLocation$1 (
    raw,
    current,
    append,
    router
  ) {
    var next = typeof raw === 'string' ? { path: raw } : raw;
    // named target
    if (next._normalized) {
      return next
    } else if (next.name) {
      next = extend$4({}, raw);
      var params = next.params;
      if (params && typeof params === 'object') {
        next.params = extend$4({}, params);
      }
      return next
    }

    // relative params
    if (!next.path && next.params && current) {
      next = extend$4({}, next);
      next._normalized = true;
      var params$1 = extend$4(extend$4({}, current.params), next.params);
      if (current.name) {
        next.name = current.name;
        next.params = params$1;
      } else if (current.matched.length) {
        var rawPath = current.matched[current.matched.length - 1].path;
        next.path = fillParams$1(rawPath, params$1, ("path " + (current.path)));
      } else {
        warn$3(false, "relative params navigation requires a current route.");
      }
      return next
    }

    var parsedPath = parsePath$3(next.path || '');
    var basePath = (current && current.path) || '/';
    var path = parsedPath.path
      ? resolvePath$1(parsedPath.path, basePath, append || next.append)
      : basePath;

    var query = resolveQuery$1(
      parsedPath.query,
      next.query,
      router && router.options.parseQuery
    );

    var hash = next.hash || parsedPath.hash;
    if (hash && hash.charAt(0) !== '#') {
      hash = "#" + hash;
    }

    return {
      _normalized: true,
      path: path,
      query: query,
      hash: hash
    }
  }

  /*  */

  // work around weird flow bug
  var toTypes$1 = [String, Object];
  var eventTypes$1 = [String, Array];

  var noop$3 = function () {};

  var warnedCustomSlot$1;
  var warnedTagProp$1;
  var warnedEventProp$1;

  var Link$1 = {
    name: 'RouterLink',
    props: {
      to: {
        type: toTypes$1,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      },
      custom: Boolean,
      exact: Boolean,
      exactPath: Boolean,
      append: Boolean,
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      ariaCurrentValue: {
        type: String,
        default: 'page'
      },
      event: {
        type: eventTypes$1,
        default: 'click'
      }
    },
    render: function render (h) {
      var this$1 = this;

      var router = this.$router;
      var current = this.$route;
      var ref = router.resolve(
        this.to,
        current,
        this.append
      );
      var location = ref.location;
      var route = ref.route;
      var href = ref.href;

      var classes = {};
      var globalActiveClass = router.options.linkActiveClass;
      var globalExactActiveClass = router.options.linkExactActiveClass;
      // Support global empty active class
      var activeClassFallback =
        globalActiveClass == null ? 'router-link-active' : globalActiveClass;
      var exactActiveClassFallback =
        globalExactActiveClass == null
          ? 'router-link-exact-active'
          : globalExactActiveClass;
      var activeClass =
        this.activeClass == null ? activeClassFallback : this.activeClass;
      var exactActiveClass =
        this.exactActiveClass == null
          ? exactActiveClassFallback
          : this.exactActiveClass;

      var compareTarget = route.redirectedFrom
        ? createRoute$1(null, normalizeLocation$1(route.redirectedFrom), null, router)
        : route;

      classes[exactActiveClass] = isSameRoute$1(current, compareTarget, this.exactPath);
      classes[activeClass] = this.exact || this.exactPath
        ? classes[exactActiveClass]
        : isIncludedRoute$1(current, compareTarget);

      var ariaCurrentValue = classes[exactActiveClass] ? this.ariaCurrentValue : null;

      var handler = function (e) {
        if (guardEvent$1(e)) {
          if (this$1.replace) {
            router.replace(location, noop$3);
          } else {
            router.push(location, noop$3);
          }
        }
      };

      var on = { click: guardEvent$1 };
      if (Array.isArray(this.event)) {
        this.event.forEach(function (e) {
          on[e] = handler;
        });
      } else {
        on[this.event] = handler;
      }

      var data = { class: classes };

      var scopedSlot =
        !this.$scopedSlots.$hasNormal &&
        this.$scopedSlots.default &&
        this.$scopedSlots.default({
          href: href,
          route: route,
          navigate: handler,
          isActive: classes[activeClass],
          isExactActive: classes[exactActiveClass]
        });

      if (scopedSlot) {
        if ( !this.custom) {
          !warnedCustomSlot$1 && warn$3(false, 'In Vue Router 4, the v-slot API will by default wrap its content with an <a> element. Use the custom prop to remove this warning:\n<router-link v-slot="{ navigate, href }" custom></router-link>\n');
          warnedCustomSlot$1 = true;
        }
        if (scopedSlot.length === 1) {
          return scopedSlot[0]
        } else if (scopedSlot.length > 1 || !scopedSlot.length) {
          {
            warn$3(
              false,
              ("<router-link> with to=\"" + (this.to) + "\" is trying to use a scoped slot but it didn't provide exactly one child. Wrapping the content with a span element.")
            );
          }
          return scopedSlot.length === 0 ? h() : h('span', {}, scopedSlot)
        }
      }

      {
        if ('tag' in this.$options.propsData && !warnedTagProp$1) {
          warn$3(
            false,
            "<router-link>'s tag prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedTagProp$1 = true;
        }
        if ('event' in this.$options.propsData && !warnedEventProp$1) {
          warn$3(
            false,
            "<router-link>'s event prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedEventProp$1 = true;
        }
      }

      if (this.tag === 'a') {
        data.on = on;
        data.attrs = { href: href, 'aria-current': ariaCurrentValue };
      } else {
        // find the first <a> child and apply listener and href
        var a = findAnchor$1(this.$slots.default);
        if (a) {
          // in case the <a> is a static node
          a.isStatic = false;
          var aData = (a.data = extend$4({}, a.data));
          aData.on = aData.on || {};
          // transform existing events in both objects into arrays so we can push later
          for (var event in aData.on) {
            var handler$1 = aData.on[event];
            if (event in on) {
              aData.on[event] = Array.isArray(handler$1) ? handler$1 : [handler$1];
            }
          }
          // append new listeners for router-link
          for (var event$1 in on) {
            if (event$1 in aData.on) {
              // on[event] is always a function
              aData.on[event$1].push(on[event$1]);
            } else {
              aData.on[event$1] = handler;
            }
          }

          var aAttrs = (a.data.attrs = extend$4({}, a.data.attrs));
          aAttrs.href = href;
          aAttrs['aria-current'] = ariaCurrentValue;
        } else {
          // doesn't have <a> child, apply listener to self
          data.on = on;
        }
      }

      return h(this.tag, data, this.$slots.default)
    }
  };

  function guardEvent$1 (e) {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
    // don't redirect when preventDefault called
    if (e.defaultPrevented) { return }
    // don't redirect on right click
    if (e.button !== undefined && e.button !== 0) { return }
    // don't redirect if `target="_blank"`
    if (e.currentTarget && e.currentTarget.getAttribute) {
      var target = e.currentTarget.getAttribute('target');
      if (/\b_blank\b/i.test(target)) { return }
    }
    // this may be a Weex event which doesn't have this method
    if (e.preventDefault) {
      e.preventDefault();
    }
    return true
  }

  function findAnchor$1 (children) {
    if (children) {
      var child;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (child.tag === 'a') {
          return child
        }
        if (child.children && (child = findAnchor$1(child.children))) {
          return child
        }
      }
    }
  }

  var _Vue$1;

  function install$1 (Vue) {
    if (install$1.installed && _Vue$1 === Vue) { return }
    install$1.installed = true;

    _Vue$1 = Vue;

    var isDef = function (v) { return v !== undefined; };

    var registerInstance = function (vm, callVal) {
      var i = vm.$options._parentVnode;
      if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
        i(vm, callVal);
      }
    };

    Vue.mixin({
      beforeCreate: function beforeCreate () {
        if (isDef(this.$options.router)) {
          this._routerRoot = this;
          this._router = this.$options.router;
          this._router.init(this);
          Vue.util.defineReactive(this, '_route', this._router.history.current);
        } else {
          this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
        }
        registerInstance(this, this);
      },
      destroyed: function destroyed () {
        registerInstance(this);
      }
    });

    Object.defineProperty(Vue.prototype, '$router', {
      get: function get () { return this._routerRoot._router }
    });

    Object.defineProperty(Vue.prototype, '$route', {
      get: function get () { return this._routerRoot._route }
    });

    Vue.component('RouterView', View$2);
    Vue.component('RouterLink', Link$1);

    var strats = Vue.config.optionMergeStrategies;
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
  }

  /*  */

  var inBrowser$3 = typeof window !== 'undefined';

  /*  */

  function createRouteMap$1 (
    routes,
    oldPathList,
    oldPathMap,
    oldNameMap,
    parentRoute
  ) {
    // the path list is used to control path matching priority
    var pathList = oldPathList || [];
    // $flow-disable-line
    var pathMap = oldPathMap || Object.create(null);
    // $flow-disable-line
    var nameMap = oldNameMap || Object.create(null);

    routes.forEach(function (route) {
      addRouteRecord$1(pathList, pathMap, nameMap, route, parentRoute);
    });

    // ensure wildcard routes are always at the end
    for (var i = 0, l = pathList.length; i < l; i++) {
      if (pathList[i] === '*') {
        pathList.push(pathList.splice(i, 1)[0]);
        l--;
        i--;
      }
    }

    {
      // warn if routes do not include leading slashes
      var found = pathList
      // check for missing leading slash
        .filter(function (path) { return path && path.charAt(0) !== '*' && path.charAt(0) !== '/'; });

      if (found.length > 0) {
        var pathNames = found.map(function (path) { return ("- " + path); }).join('\n');
        warn$3(false, ("Non-nested routes must include a leading slash character. Fix the following routes: \n" + pathNames));
      }
    }

    return {
      pathList: pathList,
      pathMap: pathMap,
      nameMap: nameMap
    }
  }

  function addRouteRecord$1 (
    pathList,
    pathMap,
    nameMap,
    route,
    parent,
    matchAs
  ) {
    var path = route.path;
    var name = route.name;
    {
      assert$1(path != null, "\"path\" is required in a route configuration.");
      assert$1(
        typeof route.component !== 'string',
        "route config \"component\" for path: " + (String(
          path || name
        )) + " cannot be a " + "string id. Use an actual component instead."
      );

      warn$3(
        // eslint-disable-next-line no-control-regex
        !/[^\u0000-\u007F]+/.test(path),
        "Route with path \"" + path + "\" contains unencoded characters, make sure " +
          "your path is correctly encoded before passing it to the router. Use " +
          "encodeURI to encode static segments of your path."
      );
    }

    var pathToRegexpOptions =
      route.pathToRegexpOptions || {};
    var normalizedPath = normalizePath$1(path, parent, pathToRegexpOptions.strict);

    if (typeof route.caseSensitive === 'boolean') {
      pathToRegexpOptions.sensitive = route.caseSensitive;
    }

    var record = {
      path: normalizedPath,
      regex: compileRouteRegex$1(normalizedPath, pathToRegexpOptions),
      components: route.components || { default: route.component },
      alias: route.alias
        ? typeof route.alias === 'string'
          ? [route.alias]
          : route.alias
        : [],
      instances: {},
      enteredCbs: {},
      name: name,
      parent: parent,
      matchAs: matchAs,
      redirect: route.redirect,
      beforeEnter: route.beforeEnter,
      meta: route.meta || {},
      props:
        route.props == null
          ? {}
          : route.components
            ? route.props
            : { default: route.props }
    };

    if (route.children) {
      // Warn if route is named, does not redirect and has a default child route.
      // If users navigate to this route by name, the default child will
      // not be rendered (GH Issue #629)
      {
        if (
          route.name &&
          !route.redirect &&
          route.children.some(function (child) { return /^\/?$/.test(child.path); })
        ) {
          warn$3(
            false,
            "Named Route '" + (route.name) + "' has a default child route. " +
              "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
              "the default child route will not be rendered. Remove the name from " +
              "this route and use the name of the default child route for named " +
              "links instead."
          );
        }
      }
      route.children.forEach(function (child) {
        var childMatchAs = matchAs
          ? cleanPath$1((matchAs + "/" + (child.path)))
          : undefined;
        addRouteRecord$1(pathList, pathMap, nameMap, child, record, childMatchAs);
      });
    }

    if (!pathMap[record.path]) {
      pathList.push(record.path);
      pathMap[record.path] = record;
    }

    if (route.alias !== undefined) {
      var aliases = Array.isArray(route.alias) ? route.alias : [route.alias];
      for (var i = 0; i < aliases.length; ++i) {
        var alias = aliases[i];
        if ( alias === path) {
          warn$3(
            false,
            ("Found an alias with the same value as the path: \"" + path + "\". You have to remove that alias. It will be ignored in development.")
          );
          // skip in dev to make it work
          continue
        }

        var aliasRoute = {
          path: alias,
          children: route.children
        };
        addRouteRecord$1(
          pathList,
          pathMap,
          nameMap,
          aliasRoute,
          parent,
          record.path || '/' // matchAs
        );
      }
    }

    if (name) {
      if (!nameMap[name]) {
        nameMap[name] = record;
      } else if ( !matchAs) {
        warn$3(
          false,
          "Duplicate named routes definition: " +
            "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
        );
      }
    }
  }

  function compileRouteRegex$1 (
    path,
    pathToRegexpOptions
  ) {
    var regex = pathToRegexp_1$1(path, [], pathToRegexpOptions);
    {
      var keys = Object.create(null);
      regex.keys.forEach(function (key) {
        warn$3(
          !keys[key.name],
          ("Duplicate param keys in route with path: \"" + path + "\"")
        );
        keys[key.name] = true;
      });
    }
    return regex
  }

  function normalizePath$1 (
    path,
    parent,
    strict
  ) {
    if (!strict) { path = path.replace(/\/$/, ''); }
    if (path[0] === '/') { return path }
    if (parent == null) { return path }
    return cleanPath$1(((parent.path) + "/" + path))
  }

  /*  */



  function createMatcher$1 (
    routes,
    router
  ) {
    var ref = createRouteMap$1(routes);
    var pathList = ref.pathList;
    var pathMap = ref.pathMap;
    var nameMap = ref.nameMap;

    function addRoutes (routes) {
      createRouteMap$1(routes, pathList, pathMap, nameMap);
    }

    function addRoute (parentOrRoute, route) {
      var parent = (typeof parentOrRoute !== 'object') ? nameMap[parentOrRoute] : undefined;
      // $flow-disable-line
      createRouteMap$1([route || parentOrRoute], pathList, pathMap, nameMap, parent);

      // add aliases of parent
      if (parent && parent.alias.length) {
        createRouteMap$1(
          // $flow-disable-line route is defined if parent is
          parent.alias.map(function (alias) { return ({ path: alias, children: [route] }); }),
          pathList,
          pathMap,
          nameMap,
          parent
        );
      }
    }

    function getRoutes () {
      return pathList.map(function (path) { return pathMap[path]; })
    }

    function match (
      raw,
      currentRoute,
      redirectedFrom
    ) {
      var location = normalizeLocation$1(raw, currentRoute, false, router);
      var name = location.name;

      if (name) {
        var record = nameMap[name];
        {
          warn$3(record, ("Route with name '" + name + "' does not exist"));
        }
        if (!record) { return _createRoute(null, location) }
        var paramNames = record.regex.keys
          .filter(function (key) { return !key.optional; })
          .map(function (key) { return key.name; });

        if (typeof location.params !== 'object') {
          location.params = {};
        }

        if (currentRoute && typeof currentRoute.params === 'object') {
          for (var key in currentRoute.params) {
            if (!(key in location.params) && paramNames.indexOf(key) > -1) {
              location.params[key] = currentRoute.params[key];
            }
          }
        }

        location.path = fillParams$1(record.path, location.params, ("named route \"" + name + "\""));
        return _createRoute(record, location, redirectedFrom)
      } else if (location.path) {
        location.params = {};
        for (var i = 0; i < pathList.length; i++) {
          var path = pathList[i];
          var record$1 = pathMap[path];
          if (matchRoute$1(record$1.regex, location.path, location.params)) {
            return _createRoute(record$1, location, redirectedFrom)
          }
        }
      }
      // no match
      return _createRoute(null, location)
    }

    function redirect (
      record,
      location
    ) {
      var originalRedirect = record.redirect;
      var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute$1(record, location, null, router))
        : originalRedirect;

      if (typeof redirect === 'string') {
        redirect = { path: redirect };
      }

      if (!redirect || typeof redirect !== 'object') {
        {
          warn$3(
            false, ("invalid redirect option: " + (JSON.stringify(redirect)))
          );
        }
        return _createRoute(null, location)
      }

      var re = redirect;
      var name = re.name;
      var path = re.path;
      var query = location.query;
      var hash = location.hash;
      var params = location.params;
      query = re.hasOwnProperty('query') ? re.query : query;
      hash = re.hasOwnProperty('hash') ? re.hash : hash;
      params = re.hasOwnProperty('params') ? re.params : params;

      if (name) {
        // resolved named direct
        var targetRecord = nameMap[name];
        {
          assert$1(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
        }
        return match({
          _normalized: true,
          name: name,
          query: query,
          hash: hash,
          params: params
        }, undefined, location)
      } else if (path) {
        // 1. resolve relative redirect
        var rawPath = resolveRecordPath$1(path, record);
        // 2. resolve params
        var resolvedPath = fillParams$1(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
        // 3. rematch with existing query and hash
        return match({
          _normalized: true,
          path: resolvedPath,
          query: query,
          hash: hash
        }, undefined, location)
      } else {
        {
          warn$3(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
        }
        return _createRoute(null, location)
      }
    }

    function alias (
      record,
      location,
      matchAs
    ) {
      var aliasedPath = fillParams$1(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
      var aliasedMatch = match({
        _normalized: true,
        path: aliasedPath
      });
      if (aliasedMatch) {
        var matched = aliasedMatch.matched;
        var aliasedRecord = matched[matched.length - 1];
        location.params = aliasedMatch.params;
        return _createRoute(aliasedRecord, location)
      }
      return _createRoute(null, location)
    }

    function _createRoute (
      record,
      location,
      redirectedFrom
    ) {
      if (record && record.redirect) {
        return redirect(record, redirectedFrom || location)
      }
      if (record && record.matchAs) {
        return alias(record, location, record.matchAs)
      }
      return createRoute$1(record, location, redirectedFrom, router)
    }

    return {
      match: match,
      addRoute: addRoute,
      getRoutes: getRoutes,
      addRoutes: addRoutes
    }
  }

  function matchRoute$1 (
    regex,
    path,
    params
  ) {
    var m = path.match(regex);

    if (!m) {
      return false
    } else if (!params) {
      return true
    }

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = regex.keys[i - 1];
      if (key) {
        // Fix #1994: using * with props: true generates a param named 0
        params[key.name || 'pathMatch'] = typeof m[i] === 'string' ? decode$1(m[i]) : m[i];
      }
    }

    return true
  }

  function resolveRecordPath$1 (path, record) {
    return resolvePath$1(path, record.parent ? record.parent.path : '/', true)
  }

  /*  */

  // use User Timing api (if present) for more accurate key precision
  var Time$1 =
    inBrowser$3 && window.performance && window.performance.now
      ? window.performance
      : Date;

  function genStateKey$1 () {
    return Time$1.now().toFixed(3)
  }

  var _key$1 = genStateKey$1();

  function getStateKey$1 () {
    return _key$1
  }

  function setStateKey$1 (key) {
    return (_key$1 = key)
  }

  /*  */

  var positionStore$1 = Object.create(null);

  function setupScroll$1 () {
    // Prevent browser scroll behavior on History popstate
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Fix for #1585 for Firefox
    // Fix for #2195 Add optional third attribute to workaround a bug in safari https://bugs.webkit.org/show_bug.cgi?id=182678
    // Fix for #2774 Support for apps loaded from Windows file shares not mapped to network drives: replaced location.origin with
    // window.location.protocol + '//' + window.location.host
    // location.host contains the port and location.hostname doesn't
    var protocolAndPath = window.location.protocol + '//' + window.location.host;
    var absolutePath = window.location.href.replace(protocolAndPath, '');
    // preserve existing history state as it could be overriden by the user
    var stateCopy = extend$4({}, window.history.state);
    stateCopy.key = getStateKey$1();
    window.history.replaceState(stateCopy, '', absolutePath);
    window.addEventListener('popstate', handlePopState$1);
    return function () {
      window.removeEventListener('popstate', handlePopState$1);
    }
  }

  function handleScroll$1 (
    router,
    to,
    from,
    isPop
  ) {
    if (!router.app) {
      return
    }

    var behavior = router.options.scrollBehavior;
    if (!behavior) {
      return
    }

    {
      assert$1(typeof behavior === 'function', "scrollBehavior must be a function");
    }

    // wait until re-render finishes before scrolling
    router.app.$nextTick(function () {
      var position = getScrollPosition$1();
      var shouldScroll = behavior.call(
        router,
        to,
        from,
        isPop ? position : null
      );

      if (!shouldScroll) {
        return
      }

      if (typeof shouldScroll.then === 'function') {
        shouldScroll
          .then(function (shouldScroll) {
            scrollToPosition$1((shouldScroll), position);
          })
          .catch(function (err) {
            {
              assert$1(false, err.toString());
            }
          });
      } else {
        scrollToPosition$1(shouldScroll, position);
      }
    });
  }

  function saveScrollPosition$1 () {
    var key = getStateKey$1();
    if (key) {
      positionStore$1[key] = {
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
  }

  function handlePopState$1 (e) {
    saveScrollPosition$1();
    if (e.state && e.state.key) {
      setStateKey$1(e.state.key);
    }
  }

  function getScrollPosition$1 () {
    var key = getStateKey$1();
    if (key) {
      return positionStore$1[key]
    }
  }

  function getElementPosition$1 (el, offset) {
    var docEl = document.documentElement;
    var docRect = docEl.getBoundingClientRect();
    var elRect = el.getBoundingClientRect();
    return {
      x: elRect.left - docRect.left - offset.x,
      y: elRect.top - docRect.top - offset.y
    }
  }

  function isValidPosition$1 (obj) {
    return isNumber$1(obj.x) || isNumber$1(obj.y)
  }

  function normalizePosition$1 (obj) {
    return {
      x: isNumber$1(obj.x) ? obj.x : window.pageXOffset,
      y: isNumber$1(obj.y) ? obj.y : window.pageYOffset
    }
  }

  function normalizeOffset$1 (obj) {
    return {
      x: isNumber$1(obj.x) ? obj.x : 0,
      y: isNumber$1(obj.y) ? obj.y : 0
    }
  }

  function isNumber$1 (v) {
    return typeof v === 'number'
  }

  var hashStartsWithNumberRE$1 = /^#\d/;

  function scrollToPosition$1 (shouldScroll, position) {
    var isObject = typeof shouldScroll === 'object';
    if (isObject && typeof shouldScroll.selector === 'string') {
      // getElementById would still fail if the selector contains a more complicated query like #main[data-attr]
      // but at the same time, it doesn't make much sense to select an element with an id and an extra selector
      var el = hashStartsWithNumberRE$1.test(shouldScroll.selector) // $flow-disable-line
        ? document.getElementById(shouldScroll.selector.slice(1)) // $flow-disable-line
        : document.querySelector(shouldScroll.selector);

      if (el) {
        var offset =
          shouldScroll.offset && typeof shouldScroll.offset === 'object'
            ? shouldScroll.offset
            : {};
        offset = normalizeOffset$1(offset);
        position = getElementPosition$1(el, offset);
      } else if (isValidPosition$1(shouldScroll)) {
        position = normalizePosition$1(shouldScroll);
      }
    } else if (isObject && isValidPosition$1(shouldScroll)) {
      position = normalizePosition$1(shouldScroll);
    }

    if (position) {
      // $flow-disable-line
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          left: position.x,
          top: position.y,
          // $flow-disable-line
          behavior: shouldScroll.behavior
        });
      } else {
        window.scrollTo(position.x, position.y);
      }
    }
  }

  /*  */

  var supportsPushState$1 =
    inBrowser$3 &&
    (function () {
      var ua = window.navigator.userAgent;

      if (
        (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1
      ) {
        return false
      }

      return window.history && typeof window.history.pushState === 'function'
    })();

  function pushState$1 (url, replace) {
    saveScrollPosition$1();
    // try...catch the pushState call to get around Safari
    // DOM Exception 18 where it limits to 100 pushState calls
    var history = window.history;
    try {
      if (replace) {
        // preserve existing history state as it could be overriden by the user
        var stateCopy = extend$4({}, history.state);
        stateCopy.key = getStateKey$1();
        history.replaceState(stateCopy, '', url);
      } else {
        history.pushState({ key: setStateKey$1(genStateKey$1()) }, '', url);
      }
    } catch (e) {
      window.location[replace ? 'replace' : 'assign'](url);
    }
  }

  function replaceState$1 (url) {
    pushState$1(url, true);
  }

  /*  */

  function runQueue$1 (queue, fn, cb) {
    var step = function (index) {
      if (index >= queue.length) {
        cb();
      } else {
        if (queue[index]) {
          fn(queue[index], function () {
            step(index + 1);
          });
        } else {
          step(index + 1);
        }
      }
    };
    step(0);
  }

  // When changing thing, also edit router.d.ts
  var NavigationFailureType$1 = {
    redirected: 2,
    aborted: 4,
    cancelled: 8,
    duplicated: 16
  };

  function createNavigationRedirectedError$1 (from, to) {
    return createRouterError$1(
      from,
      to,
      NavigationFailureType$1.redirected,
      ("Redirected when going from \"" + (from.fullPath) + "\" to \"" + (stringifyRoute$1(
        to
      )) + "\" via a navigation guard.")
    )
  }

  function createNavigationDuplicatedError$1 (from, to) {
    var error = createRouterError$1(
      from,
      to,
      NavigationFailureType$1.duplicated,
      ("Avoided redundant navigation to current location: \"" + (from.fullPath) + "\".")
    );
    // backwards compatible with the first introduction of Errors
    error.name = 'NavigationDuplicated';
    return error
  }

  function createNavigationCancelledError$1 (from, to) {
    return createRouterError$1(
      from,
      to,
      NavigationFailureType$1.cancelled,
      ("Navigation cancelled from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" with a new navigation.")
    )
  }

  function createNavigationAbortedError$1 (from, to) {
    return createRouterError$1(
      from,
      to,
      NavigationFailureType$1.aborted,
      ("Navigation aborted from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" via a navigation guard.")
    )
  }

  function createRouterError$1 (from, to, type, message) {
    var error = new Error(message);
    error._isRouter = true;
    error.from = from;
    error.to = to;
    error.type = type;

    return error
  }

  var propertiesToLog$1 = ['params', 'query', 'hash'];

  function stringifyRoute$1 (to) {
    if (typeof to === 'string') { return to }
    if ('path' in to) { return to.path }
    var location = {};
    propertiesToLog$1.forEach(function (key) {
      if (key in to) { location[key] = to[key]; }
    });
    return JSON.stringify(location, null, 2)
  }

  function isError$1 (err) {
    return Object.prototype.toString.call(err).indexOf('Error') > -1
  }

  function isNavigationFailure$1 (err, errorType) {
    return (
      isError$1(err) &&
      err._isRouter &&
      (errorType == null || err.type === errorType)
    )
  }

  /*  */

  function resolveAsyncComponents$1 (matched) {
    return function (to, from, next) {
      var hasAsync = false;
      var pending = 0;
      var error = null;

      flatMapComponents$1(matched, function (def, _, match, key) {
        // if it's a function and doesn't have cid attached,
        // assume it's an async component resolve function.
        // we are not using Vue's default async resolving mechanism because
        // we want to halt the navigation until the incoming component has been
        // resolved.
        if (typeof def === 'function' && def.cid === undefined) {
          hasAsync = true;
          pending++;

          var resolve = once$3(function (resolvedDef) {
            if (isESModule$1(resolvedDef)) {
              resolvedDef = resolvedDef.default;
            }
            // save resolved on async factory in case it's used elsewhere
            def.resolved = typeof resolvedDef === 'function'
              ? resolvedDef
              : _Vue$1.extend(resolvedDef);
            match.components[key] = resolvedDef;
            pending--;
            if (pending <= 0) {
              next();
            }
          });

          var reject = once$3(function (reason) {
            var msg = "Failed to resolve async component " + key + ": " + reason;
             warn$3(false, msg);
            if (!error) {
              error = isError$1(reason)
                ? reason
                : new Error(msg);
              next(error);
            }
          });

          var res;
          try {
            res = def(resolve, reject);
          } catch (e) {
            reject(e);
          }
          if (res) {
            if (typeof res.then === 'function') {
              res.then(resolve, reject);
            } else {
              // new syntax in Vue 2.3
              var comp = res.component;
              if (comp && typeof comp.then === 'function') {
                comp.then(resolve, reject);
              }
            }
          }
        }
      });

      if (!hasAsync) { next(); }
    }
  }

  function flatMapComponents$1 (
    matched,
    fn
  ) {
    return flatten$1(matched.map(function (m) {
      return Object.keys(m.components).map(function (key) { return fn(
        m.components[key],
        m.instances[key],
        m, key
      ); })
    }))
  }

  function flatten$1 (arr) {
    return Array.prototype.concat.apply([], arr)
  }

  var hasSymbol$3 =
    typeof Symbol === 'function' &&
    typeof Symbol.toStringTag === 'symbol';

  function isESModule$1 (obj) {
    return obj.__esModule || (hasSymbol$3 && obj[Symbol.toStringTag] === 'Module')
  }

  // in Webpack 2, require.ensure now also returns a Promise
  // so the resolve/reject functions may get called an extra time
  // if the user uses an arrow function shorthand that happens to
  // return that Promise.
  function once$3 (fn) {
    var called = false;
    return function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (called) { return }
      called = true;
      return fn.apply(this, args)
    }
  }

  /*  */

  var History$1 = function History (router, base) {
    this.router = router;
    this.base = normalizeBase$1(base);
    // start with a route object that stands for "nowhere"
    this.current = START$1;
    this.pending = null;
    this.ready = false;
    this.readyCbs = [];
    this.readyErrorCbs = [];
    this.errorCbs = [];
    this.listeners = [];
  };

  History$1.prototype.listen = function listen (cb) {
    this.cb = cb;
  };

  History$1.prototype.onReady = function onReady (cb, errorCb) {
    if (this.ready) {
      cb();
    } else {
      this.readyCbs.push(cb);
      if (errorCb) {
        this.readyErrorCbs.push(errorCb);
      }
    }
  };

  History$1.prototype.onError = function onError (errorCb) {
    this.errorCbs.push(errorCb);
  };

  History$1.prototype.transitionTo = function transitionTo (
    location,
    onComplete,
    onAbort
  ) {
      var this$1 = this;

    var route;
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
      route = this.router.match(location, this.current);
    } catch (e) {
      this.errorCbs.forEach(function (cb) {
        cb(e);
      });
      // Exception should still be thrown
      throw e
    }
    var prev = this.current;
    this.confirmTransition(
      route,
      function () {
        this$1.updateRoute(route);
        onComplete && onComplete(route);
        this$1.ensureURL();
        this$1.router.afterHooks.forEach(function (hook) {
          hook && hook(route, prev);
        });

        // fire ready cbs once
        if (!this$1.ready) {
          this$1.ready = true;
          this$1.readyCbs.forEach(function (cb) {
            cb(route);
          });
        }
      },
      function (err) {
        if (onAbort) {
          onAbort(err);
        }
        if (err && !this$1.ready) {
          // Initial redirection should not mark the history as ready yet
          // because it's triggered by the redirection instead
          // https://github.com/vuejs/vue-router/issues/3225
          // https://github.com/vuejs/vue-router/issues/3331
          if (!isNavigationFailure$1(err, NavigationFailureType$1.redirected) || prev !== START$1) {
            this$1.ready = true;
            this$1.readyErrorCbs.forEach(function (cb) {
              cb(err);
            });
          }
        }
      }
    );
  };

  History$1.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
      var this$1 = this;

    var current = this.current;
    this.pending = route;
    var abort = function (err) {
      // changed after adding errors with
      // https://github.com/vuejs/vue-router/pull/3047 before that change,
      // redirect and aborted navigation would produce an err == null
      if (!isNavigationFailure$1(err) && isError$1(err)) {
        if (this$1.errorCbs.length) {
          this$1.errorCbs.forEach(function (cb) {
            cb(err);
          });
        } else {
          {
            warn$3(false, 'uncaught error during route navigation:');
          }
          console.error(err);
        }
      }
      onAbort && onAbort(err);
    };
    var lastRouteIndex = route.matched.length - 1;
    var lastCurrentIndex = current.matched.length - 1;
    if (
      isSameRoute$1(route, current) &&
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL();
      if (route.hash) {
        handleScroll$1(this.router, current, route, false);
      }
      return abort(createNavigationDuplicatedError$1(current, route))
    }

    var ref = resolveQueue$1(
      this.current.matched,
      route.matched
    );
      var updated = ref.updated;
      var deactivated = ref.deactivated;
      var activated = ref.activated;

    var queue = [].concat(
      // in-component leave guards
      extractLeaveGuards$1(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks$1(updated),
      // in-config enter guards
      activated.map(function (m) { return m.beforeEnter; }),
      // async components
      resolveAsyncComponents$1(activated)
    );

    var iterator = function (hook, next) {
      if (this$1.pending !== route) {
        return abort(createNavigationCancelledError$1(current, route))
      }
      try {
        hook(route, current, function (to) {
          if (to === false) {
            // next(false) -> abort navigation, ensure current URL
            this$1.ensureURL(true);
            abort(createNavigationAbortedError$1(current, route));
          } else if (isError$1(to)) {
            this$1.ensureURL(true);
            abort(to);
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort(createNavigationRedirectedError$1(current, route));
            if (typeof to === 'object' && to.replace) {
              this$1.replace(to);
            } else {
              this$1.push(to);
            }
          } else {
            // confirm transition and pass on the value
            next(to);
          }
        });
      } catch (e) {
        abort(e);
      }
    };

    runQueue$1(queue, iterator, function () {
      // wait until async components are resolved before
      // extracting in-component enter guards
      var enterGuards = extractEnterGuards$1(activated);
      var queue = enterGuards.concat(this$1.router.resolveHooks);
      runQueue$1(queue, iterator, function () {
        if (this$1.pending !== route) {
          return abort(createNavigationCancelledError$1(current, route))
        }
        this$1.pending = null;
        onComplete(route);
        if (this$1.router.app) {
          this$1.router.app.$nextTick(function () {
            handleRouteEntered$1(route);
          });
        }
      });
    });
  };

  History$1.prototype.updateRoute = function updateRoute (route) {
    this.current = route;
    this.cb && this.cb(route);
  };

  History$1.prototype.setupListeners = function setupListeners () {
    // Default implementation is empty
  };

  History$1.prototype.teardown = function teardown () {
    // clean up event listeners
    // https://github.com/vuejs/vue-router/issues/2341
    this.listeners.forEach(function (cleanupListener) {
      cleanupListener();
    });
    this.listeners = [];

    // reset current history route
    // https://github.com/vuejs/vue-router/issues/3294
    this.current = START$1;
    this.pending = null;
  };

  function normalizeBase$1 (base) {
    if (!base) {
      if (inBrowser$3) {
        // respect <base> tag
        var baseEl = document.querySelector('base');
        base = (baseEl && baseEl.getAttribute('href')) || '/';
        // strip full URL origin
        base = base.replace(/^https?:\/\/[^\/]+/, '');
      } else {
        base = '/';
      }
    }
    // make sure there's the starting slash
    if (base.charAt(0) !== '/') {
      base = '/' + base;
    }
    // remove trailing slash
    return base.replace(/\/$/, '')
  }

  function resolveQueue$1 (
    current,
    next
  ) {
    var i;
    var max = Math.max(current.length, next.length);
    for (i = 0; i < max; i++) {
      if (current[i] !== next[i]) {
        break
      }
    }
    return {
      updated: next.slice(0, i),
      activated: next.slice(i),
      deactivated: current.slice(i)
    }
  }

  function extractGuards$1 (
    records,
    name,
    bind,
    reverse
  ) {
    var guards = flatMapComponents$1(records, function (def, instance, match, key) {
      var guard = extractGuard$1(def, name);
      if (guard) {
        return Array.isArray(guard)
          ? guard.map(function (guard) { return bind(guard, instance, match, key); })
          : bind(guard, instance, match, key)
      }
    });
    return flatten$1(reverse ? guards.reverse() : guards)
  }

  function extractGuard$1 (
    def,
    key
  ) {
    if (typeof def !== 'function') {
      // extend now so that global mixins are applied.
      def = _Vue$1.extend(def);
    }
    return def.options[key]
  }

  function extractLeaveGuards$1 (deactivated) {
    return extractGuards$1(deactivated, 'beforeRouteLeave', bindGuard$1, true)
  }

  function extractUpdateHooks$1 (updated) {
    return extractGuards$1(updated, 'beforeRouteUpdate', bindGuard$1)
  }

  function bindGuard$1 (guard, instance) {
    if (instance) {
      return function boundRouteGuard () {
        return guard.apply(instance, arguments)
      }
    }
  }

  function extractEnterGuards$1 (
    activated
  ) {
    return extractGuards$1(
      activated,
      'beforeRouteEnter',
      function (guard, _, match, key) {
        return bindEnterGuard$1(guard, match, key)
      }
    )
  }

  function bindEnterGuard$1 (
    guard,
    match,
    key
  ) {
    return function routeEnterGuard (to, from, next) {
      return guard(to, from, function (cb) {
        if (typeof cb === 'function') {
          if (!match.enteredCbs[key]) {
            match.enteredCbs[key] = [];
          }
          match.enteredCbs[key].push(cb);
        }
        next(cb);
      })
    }
  }

  /*  */

  var HTML5History$1 = /*@__PURE__*/(function (History) {
    function HTML5History (router, base) {
      History.call(this, router, base);

      this._startLocation = getLocation$1(this.base);
    }

    if ( History ) HTML5History.__proto__ = History;
    HTML5History.prototype = Object.create( History && History.prototype );
    HTML5History.prototype.constructor = HTML5History;

    HTML5History.prototype.setupListeners = function setupListeners () {
      var this$1 = this;

      if (this.listeners.length > 0) {
        return
      }

      var router = this.router;
      var expectScroll = router.options.scrollBehavior;
      var supportsScroll = supportsPushState$1 && expectScroll;

      if (supportsScroll) {
        this.listeners.push(setupScroll$1());
      }

      var handleRoutingEvent = function () {
        var current = this$1.current;

        // Avoiding first `popstate` event dispatched in some browsers but first
        // history route not updated since async guard at the same time.
        var location = getLocation$1(this$1.base);
        if (this$1.current === START$1 && location === this$1._startLocation) {
          return
        }

        this$1.transitionTo(location, function (route) {
          if (supportsScroll) {
            handleScroll$1(router, route, current, true);
          }
        });
      };
      window.addEventListener('popstate', handleRoutingEvent);
      this.listeners.push(function () {
        window.removeEventListener('popstate', handleRoutingEvent);
      });
    };

    HTML5History.prototype.go = function go (n) {
      window.history.go(n);
    };

    HTML5History.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        pushState$1(cleanPath$1(this$1.base + route.fullPath));
        handleScroll$1(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        replaceState$1(cleanPath$1(this$1.base + route.fullPath));
        handleScroll$1(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.ensureURL = function ensureURL (push) {
      if (getLocation$1(this.base) !== this.current.fullPath) {
        var current = cleanPath$1(this.base + this.current.fullPath);
        push ? pushState$1(current) : replaceState$1(current);
      }
    };

    HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
      return getLocation$1(this.base)
    };

    return HTML5History;
  }(History$1));

  function getLocation$1 (base) {
    var path = window.location.pathname;
    var pathLowerCase = path.toLowerCase();
    var baseLowerCase = base.toLowerCase();
    // base="/a" shouldn't turn path="/app" into "/a/pp"
    // https://github.com/vuejs/vue-router/issues/3555
    // so we ensure the trailing slash in the base
    if (base && ((pathLowerCase === baseLowerCase) ||
      (pathLowerCase.indexOf(cleanPath$1(baseLowerCase + '/')) === 0))) {
      path = path.slice(base.length);
    }
    return (path || '/') + window.location.search + window.location.hash
  }

  /*  */

  var HashHistory$1 = /*@__PURE__*/(function (History) {
    function HashHistory (router, base, fallback) {
      History.call(this, router, base);
      // check history fallback deeplinking
      if (fallback && checkFallback$1(this.base)) {
        return
      }
      ensureSlash$1();
    }

    if ( History ) HashHistory.__proto__ = History;
    HashHistory.prototype = Object.create( History && History.prototype );
    HashHistory.prototype.constructor = HashHistory;

    // this is delayed until the app mounts
    // to avoid the hashchange listener being fired too early
    HashHistory.prototype.setupListeners = function setupListeners () {
      var this$1 = this;

      if (this.listeners.length > 0) {
        return
      }

      var router = this.router;
      var expectScroll = router.options.scrollBehavior;
      var supportsScroll = supportsPushState$1 && expectScroll;

      if (supportsScroll) {
        this.listeners.push(setupScroll$1());
      }

      var handleRoutingEvent = function () {
        var current = this$1.current;
        if (!ensureSlash$1()) {
          return
        }
        this$1.transitionTo(getHash$1(), function (route) {
          if (supportsScroll) {
            handleScroll$1(this$1.router, route, current, true);
          }
          if (!supportsPushState$1) {
            replaceHash$1(route.fullPath);
          }
        });
      };
      var eventType = supportsPushState$1 ? 'popstate' : 'hashchange';
      window.addEventListener(
        eventType,
        handleRoutingEvent
      );
      this.listeners.push(function () {
        window.removeEventListener(eventType, handleRoutingEvent);
      });
    };

    HashHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          pushHash$1(route.fullPath);
          handleScroll$1(this$1.router, route, fromRoute, false);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          replaceHash$1(route.fullPath);
          handleScroll$1(this$1.router, route, fromRoute, false);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.go = function go (n) {
      window.history.go(n);
    };

    HashHistory.prototype.ensureURL = function ensureURL (push) {
      var current = this.current.fullPath;
      if (getHash$1() !== current) {
        push ? pushHash$1(current) : replaceHash$1(current);
      }
    };

    HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      return getHash$1()
    };

    return HashHistory;
  }(History$1));

  function checkFallback$1 (base) {
    var location = getLocation$1(base);
    if (!/^\/#/.test(location)) {
      window.location.replace(cleanPath$1(base + '/#' + location));
      return true
    }
  }

  function ensureSlash$1 () {
    var path = getHash$1();
    if (path.charAt(0) === '/') {
      return true
    }
    replaceHash$1('/' + path);
    return false
  }

  function getHash$1 () {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    var href = window.location.href;
    var index = href.indexOf('#');
    // empty path
    if (index < 0) { return '' }

    href = href.slice(index + 1);

    return href
  }

  function getUrl$1 (path) {
    var href = window.location.href;
    var i = href.indexOf('#');
    var base = i >= 0 ? href.slice(0, i) : href;
    return (base + "#" + path)
  }

  function pushHash$1 (path) {
    if (supportsPushState$1) {
      pushState$1(getUrl$1(path));
    } else {
      window.location.hash = path;
    }
  }

  function replaceHash$1 (path) {
    if (supportsPushState$1) {
      replaceState$1(getUrl$1(path));
    } else {
      window.location.replace(getUrl$1(path));
    }
  }

  /*  */

  var AbstractHistory$1 = /*@__PURE__*/(function (History) {
    function AbstractHistory (router, base) {
      History.call(this, router, base);
      this.stack = [];
      this.index = -1;
    }

    if ( History ) AbstractHistory.__proto__ = History;
    AbstractHistory.prototype = Object.create( History && History.prototype );
    AbstractHistory.prototype.constructor = AbstractHistory;

    AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      this.transitionTo(
        location,
        function (route) {
          this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
          this$1.index++;
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      this.transitionTo(
        location,
        function (route) {
          this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.go = function go (n) {
      var this$1 = this;

      var targetIndex = this.index + n;
      if (targetIndex < 0 || targetIndex >= this.stack.length) {
        return
      }
      var route = this.stack[targetIndex];
      this.confirmTransition(
        route,
        function () {
          var prev = this$1.current;
          this$1.index = targetIndex;
          this$1.updateRoute(route);
          this$1.router.afterHooks.forEach(function (hook) {
            hook && hook(route, prev);
          });
        },
        function (err) {
          if (isNavigationFailure$1(err, NavigationFailureType$1.duplicated)) {
            this$1.index = targetIndex;
          }
        }
      );
    };

    AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      var current = this.stack[this.stack.length - 1];
      return current ? current.fullPath : '/'
    };

    AbstractHistory.prototype.ensureURL = function ensureURL () {
      // noop
    };

    return AbstractHistory;
  }(History$1));

  /*  */

  var VueRouter$1 = function VueRouter (options) {
    if ( options === void 0 ) options = {};

    {
      warn$3(this instanceof VueRouter, "Router must be called with the new operator.");
    }
    this.app = null;
    this.apps = [];
    this.options = options;
    this.beforeHooks = [];
    this.resolveHooks = [];
    this.afterHooks = [];
    this.matcher = createMatcher$1(options.routes || [], this);

    var mode = options.mode || 'hash';
    this.fallback =
      mode === 'history' && !supportsPushState$1 && options.fallback !== false;
    if (this.fallback) {
      mode = 'hash';
    }
    if (!inBrowser$3) {
      mode = 'abstract';
    }
    this.mode = mode;

    switch (mode) {
      case 'history':
        this.history = new HTML5History$1(this, options.base);
        break
      case 'hash':
        this.history = new HashHistory$1(this, options.base, this.fallback);
        break
      case 'abstract':
        this.history = new AbstractHistory$1(this, options.base);
        break
      default:
        {
          assert$1(false, ("invalid mode: " + mode));
        }
    }
  };

  var prototypeAccessors$3 = { currentRoute: { configurable: true } };

  VueRouter$1.prototype.match = function match (raw, current, redirectedFrom) {
    return this.matcher.match(raw, current, redirectedFrom)
  };

  prototypeAccessors$3.currentRoute.get = function () {
    return this.history && this.history.current
  };

  VueRouter$1.prototype.init = function init (app /* Vue component instance */) {
      var this$1 = this;

    
      assert$1(
        install$1.installed,
        "not installed. Make sure to call `Vue.use(VueRouter)` " +
          "before creating root instance."
      );

    this.apps.push(app);

    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    app.$once('hook:destroyed', function () {
      // clean out app from this.apps array once destroyed
      var index = this$1.apps.indexOf(app);
      if (index > -1) { this$1.apps.splice(index, 1); }
      // ensure we still have a main app or null if no apps
      // we do not release the router so it can be reused
      if (this$1.app === app) { this$1.app = this$1.apps[0] || null; }

      if (!this$1.app) { this$1.history.teardown(); }
    });

    // main app previously initialized
    // return as we don't need to set up new history listener
    if (this.app) {
      return
    }

    this.app = app;

    var history = this.history;

    if (history instanceof HTML5History$1 || history instanceof HashHistory$1) {
      var handleInitialScroll = function (routeOrError) {
        var from = history.current;
        var expectScroll = this$1.options.scrollBehavior;
        var supportsScroll = supportsPushState$1 && expectScroll;

        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll$1(this$1, routeOrError, from, false);
        }
      };
      var setupListeners = function (routeOrError) {
        history.setupListeners();
        handleInitialScroll(routeOrError);
      };
      history.transitionTo(
        history.getCurrentLocation(),
        setupListeners,
        setupListeners
      );
    }

    history.listen(function (route) {
      this$1.apps.forEach(function (app) {
        app._route = route;
      });
    });
  };

  VueRouter$1.prototype.beforeEach = function beforeEach (fn) {
    return registerHook$1(this.beforeHooks, fn)
  };

  VueRouter$1.prototype.beforeResolve = function beforeResolve (fn) {
    return registerHook$1(this.resolveHooks, fn)
  };

  VueRouter$1.prototype.afterEach = function afterEach (fn) {
    return registerHook$1(this.afterHooks, fn)
  };

  VueRouter$1.prototype.onReady = function onReady (cb, errorCb) {
    this.history.onReady(cb, errorCb);
  };

  VueRouter$1.prototype.onError = function onError (errorCb) {
    this.history.onError(errorCb);
  };

  VueRouter$1.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1.history.push(location, resolve, reject);
      })
    } else {
      this.history.push(location, onComplete, onAbort);
    }
  };

  VueRouter$1.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1.history.replace(location, resolve, reject);
      })
    } else {
      this.history.replace(location, onComplete, onAbort);
    }
  };

  VueRouter$1.prototype.go = function go (n) {
    this.history.go(n);
  };

  VueRouter$1.prototype.back = function back () {
    this.go(-1);
  };

  VueRouter$1.prototype.forward = function forward () {
    this.go(1);
  };

  VueRouter$1.prototype.getMatchedComponents = function getMatchedComponents (to) {
    var route = to
      ? to.matched
        ? to
        : this.resolve(to).route
      : this.currentRoute;
    if (!route) {
      return []
    }
    return [].concat.apply(
      [],
      route.matched.map(function (m) {
        return Object.keys(m.components).map(function (key) {
          return m.components[key]
        })
      })
    )
  };

  VueRouter$1.prototype.resolve = function resolve (
    to,
    current,
    append
  ) {
    current = current || this.history.current;
    var location = normalizeLocation$1(to, current, append, this);
    var route = this.match(location, current);
    var fullPath = route.redirectedFrom || route.fullPath;
    var base = this.history.base;
    var href = createHref$1(base, fullPath, this.mode);
    return {
      location: location,
      route: route,
      href: href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  };

  VueRouter$1.prototype.getRoutes = function getRoutes () {
    return this.matcher.getRoutes()
  };

  VueRouter$1.prototype.addRoute = function addRoute (parentOrRoute, route) {
    this.matcher.addRoute(parentOrRoute, route);
    if (this.history.current !== START$1) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };

  VueRouter$1.prototype.addRoutes = function addRoutes (routes) {
    {
      warn$3(false, 'router.addRoutes() is deprecated and has been removed in Vue Router 4. Use router.addRoute() instead.');
    }
    this.matcher.addRoutes(routes);
    if (this.history.current !== START$1) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };

  Object.defineProperties( VueRouter$1.prototype, prototypeAccessors$3 );

  function registerHook$1 (list, fn) {
    list.push(fn);
    return function () {
      var i = list.indexOf(fn);
      if (i > -1) { list.splice(i, 1); }
    }
  }

  function createHref$1 (base, fullPath, mode) {
    var path = mode === 'hash' ? '#' + fullPath : fullPath;
    return base ? cleanPath$1(base + '/' + path) : path
  }

  VueRouter$1.install = install$1;
  VueRouter$1.version = '3.5.3';
  VueRouter$1.isNavigationFailure = isNavigationFailure$1;
  VueRouter$1.NavigationFailureType = NavigationFailureType$1;
  VueRouter$1.START_LOCATION = START$1;

  if (inBrowser$3 && window.Vue) {
    window.Vue.use(VueRouter$1);
  }

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  Vue.use( VueRouter$1 );
  var Link$2 = Vue.component('RouterLink');

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  var KeepAlive$2 = Vue.component('KeepAlive');

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  Vue.use( VueRouter$1 );
  var Viewport = Vue.component('RouterView');

  var members$3 = {};
  members$3.onInitialized={m:3,d:3,value:function onInitialized(){
  	console.log('====onInitialized========');
  }};
  members$3.address={m:3,d:4,enumerable:true,required:true,get:function address(){var res=this.reactive('address');return res === void 0 ? null : res;},set:function address(value){this.reactive('address',value);}};
  members$3.onBeforeMount={m:3,d:3,value:function onBeforeMount(){
  	console.log('=====beforeMount======');
  }};
  members$3.name={m:3,d:4,enumerable:true,get:function name(){
  	return this.reactive('name');
  },set:function name(value){
  	this.reactive('name',value);
  }};
  members$3.value={m:3,d:4,enumerable:true,get:function value(){
  	return this.reactive('value');
  },set:function value(val){
  	console.log('=====ssssssssss======');
  	this.reactive('value',val);
  }};
  members$3.tips={m:3,d:3,value:function tips(){
  	Notification({"title":'提示成功',"message":'这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案'});
  }};
  members$3.skin={m:3,d:4,enumerable:true,get:function skin(){
  	return null;
  }};
  members$3.childElements={m:3,d:4,enumerable:true,get:function childElements(){
  	return this.reactive('children');
  },set:function childElements(value){
  	this.reactive('children',value);
  }};
  members$3.render={m:3,d:3,value:function render(){
  		var createElement = this.createElement.bind(this);
  	return createElement('div',null, [
  			createElement('p',null, [
  				createElement('h5',{
  					"on":{
  						"click":this.tips.bind(this)
  						}
  					}, ['点击这里提示 ',this.name
  				]),
  				createElement(__vue_component__$5,{
  					"props":{
  						"value":this.value,
  						"name":"name",
  						"size":"mini"
  						},
  					"on":{
  						"input":(function(event){this.value=event && event.target && event.target.nodeType===1 ? event.target.value : event;}).bind(this)
  						},
  					"directives":[
  						{
  						"name":'model',
  						"value":this.value
  						}
  						]
  					}, [
  					createElement(MyOption,{
  						"attrs":{
  							"value":"深圳"
  							}
  						}),
  					createElement(MyOption,{
  						"attrs":{
  							"value":"长沙"
  							}
  						})
  				].concat((this.slot('prefix') || [
  						createElement('div',{
  							"slot":'prefix'
  							}, ['6666'])
  					])))
  			]),
  			createElement(Link$2,{
  				"props":{
  					"to":'/test'
  					}
  				}, ['测试页面']),
  			createElement('br'),
  			createElement(Link$2,{
  				"props":{
  					"to":'/index'
  					}
  				}, ['首页面']),
  			createElement('div',null, [
  				createElement(KeepAlive$2,null, [
  					createElement(Viewport)
  				])
  			])
  		]);
  }};
  members$3.beforeEnter={m:3,d:3,value:function beforeEnter(){
  	var args = Array.prototype.slice.call(arguments,0);
  	console.log(args);
  }};
  members$3.isShow={m:3,d:4,enumerable:true,get:function isShow(){var res=this.reactive('isShow');return res === void 0 ? true : res;},set:function isShow(value){this.reactive('isShow',value);}};
  members$3.toggle={m:3,d:3,value:function toggle(){
  	this.isShow=! this.isShow;
  	console.log('--------',this.isShow);
  }};
  members$3._init={value:function _init(options){
  (function Test(options){
  	Component.prototype._init.call(this,options);
  }).call(this,options);
  }};
  var Test = Component.createComponent({
  	name:'es-Test'
  });
  Class.creator(3,Test,{
  	'id':1,
  	'ns':'',
  	'name':'Test',
  	'inherit':Component,
  	'members':members$3
  }, false);

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  Vue.use( VueRouter$1 );

  var _private$2=Symbol("private");
  function Skin(hostComponent){
  	Object.defineProperty(this,_private$2,{value:{'_hostComponent':null,'_event':null}});
  	EventDispatcher.call(this);
  	this[_private$2]._hostComponent=hostComponent;
  }
  var members$4 = {};
  members$4._hostComponent={m:1,d:1,writable:true,value:null};
  members$4._event={m:1,d:1,writable:true,value:null};
  members$4.hostComponent={m:3,d:4,enumerable:true,get:function hostComponent(){
  	return this[_private$2]._hostComponent;
  }};
  members$4.reactive={m:3,d:3,value:function reactive(name,value){
  	return this.hostComponent.reactive(name,value);
  }};
  members$4.forceUpdate={m:3,d:3,value:function forceUpdate(){
  	return this.hostComponent.forceUpdate();
  }};
  members$4.getElementByRefName={m:3,d:3,value:function getElementByRefName(name){
  	return this.hostComponent.getElementByRefName(name);
  }};
  members$4.slot={m:3,d:3,value:function slot(name,scope,called,params){
  	return this.hostComponent.slot(name,scope,called,params);
  }};
  members$4.createElement={m:3,d:3,value:function createElement(name,data,children){
  	return this.hostComponent.createElement(name,data,children);
  }};
  members$4.render={m:3,d:3,value:function render(){
  	return this.hostComponent.createElement('div');
  }};
  Class.creator(10,Skin,{
  	'id':1,
  	'ns':'web',
  	'name':'Skin',
  	'private':_private$2,
  	'inherit':EventDispatcher,
  	'members':members$4
  }, false);

  var _private$3=Symbol("private");
  function MySkin(context){
  Skin.call(this, context);
  }
  var members$5 = {};
  members$5.render={m:3,d:3,value:function render(){
  	var createElement = this.createElement.bind(this);
  	return createElement('div', null, [
  		this.name ? createElement('div',{
  			"class":'bg'
  			}, ['1']) : 
  		! (this.name) ? createElement('div',null, ['2']) : 
  		createElement('div',null, ['399999'])
  	].concat(
  		['china'].concat(this.list).map((function(item){
  			return createElement('div',null, [
  						createElement('div',null, [item]),
  						createElement('div',{
  							"class":"ssss"
  							}, [
  							createElement('div',null, [
  								createElement('span',null, (this.slot('default') || []))
  							])
  						])
  					]);
  		}).bind(this))).concat(
  		[
  		createElement('div',{
  			"ref":'iss',
  			"class":""
  			}, [
  			createElement('div',null, ['item =====MySkin====  ',this.name,'====='
  			])
  		]),
  		createElement('input',{
  			"attrs":{
  				"value":this.value
  				},
  			"on":{
  				"input":(function(event){this.value=event && event.target && event.target.nodeType===1 ? event.target.value : event;}).bind(this),
  				"change":this.onChange.bind(this)
  				},
  			"directives":[
  				{
  				"name":'model',
  				"value":this.value
  				}
  				]
  			}),
  		createElement('input',{
  			"attrs":{
  				"value":this.value
  				}
  			})
  	]).concat(
  		(this.slot('foot',true,true,{props:this.list}) || [
  			createElement('div',{
  				"slot":'foot'
  				}, ['===============the is foot slot =============='])
  		])));
  }};
  members$5.name={m:3,d:4,enumerable:true,get:function name(){
  	return this.hostComponent.name;
  },set:function name(value){
  	this.reactive('name',value);
  }};
  members$5.list={m:3,d:4,enumerable:true,get:function list(){
  	return ['one','two','three','four','five'];
  }};
  members$5.onChange={m:3,d:3,value:function onChange(){

  }};
  members$5.value={m:3,d:4,enumerable:true,get:function value(){
  	return this.reactive('value') || '9999';
  },set:function value(val){
  	this.reactive('value',val);
  }};
  Class.creator(2,MySkin,{
  	'id':1,
  	'ns':'',
  	'name':'MySkin',
  	'private':_private$3,
  	'inherit':Skin,
  	'members':members$5
  }, false);

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  var TransitionGroup$2 = Vue.component('TransitionGroup');

  var _private$4=Symbol("private");
  function TransitionEvent(){
  }
  var methods$1 = {};
  methods$1.BEFORE_ENTER={m:3,d:2,enumerable:true,value:'before-enter'};
  methods$1.BEFORE_LEAVE={m:3,d:2,enumerable:true,value:'before-leave'};
  methods$1.BEFORE_APPEAR={m:3,d:2,enumerable:true,value:'before-appear'};
  methods$1.ENTER={m:3,d:2,enumerable:true,value:'enter'};
  methods$1.LEAVE={m:3,d:2,enumerable:true,value:'leave'};
  methods$1.APPEAR={m:3,d:2,enumerable:true,value:'appear'};
  methods$1.AFTER_ENTER={m:3,d:2,enumerable:true,value:'after-enter'};
  methods$1.AFTER_LEAVE={m:3,d:2,enumerable:true,value:'after-leave'};
  methods$1.AFTER_APPEAR={m:3,d:2,enumerable:true,value:'after-appear'};
  methods$1.ENTER_CANELLED={m:3,d:2,enumerable:true,value:'enter-cancelled'};
  methods$1.LEAVE_CANELLED={m:3,d:2,enumerable:true,value:'leave-cancelled'};
  methods$1.APPEAR_CANCELLED={m:3,d:2,enumerable:true,value:'appear-cancelled'};
  Class.creator(11,TransitionEvent,{
  	'id':1,
  	'ns':'web.events',
  	'name':'TransitionEvent',
  	'private':_private$4,
  	'methods':methods$1
  }, false);

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */

  function System(){
      throw new SyntaxError('System is not constructor.');
  }System.getIterator=function getIterator(object){
      if( !object )return null;
      if( object[Symbol.iterator] ){
          return object[Symbol.iterator]();
      }
      var type = typeof object;
      if( type==="object" || type ==="boolean" || type ==="number" || object.length === void 0 ){
          throw new TypeError("object is not iterator");
      }
      return (function(object){ 
          return {
              index:0,
              next:function next(){
                  if (this.index < object.length) {
                      return {value:object[this.index++],done:false};
                  }
                  return {value:undefined,done:true};
              }
          };
      })(object);
  };

  System.awaiter = function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };

  System.generator = function (thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  };

  System.is=function is(left,right){
      if(!left || !right || typeof left !== "object")return false;
      var rId = right[Class.key] ? right[Class.key].id : null;
      var description =  left.constructor ? left.constructor[Class.key] : null;
      if( rId === 0 && description && description.id === 1 ){
          return (function check(description,id){
              if( !description )return false;
              var imps = description.imps;
              var inherit = description.inherit;
              if( inherit === right )return true;
              if( imps ){
                  for(var i=0;i<imps.length;i++){
                      if( imps[i] === right || check( imps[i][Class.key], 0 ) )return true;
                  }
              }
              if( inherit && inherit[ Class.key ].id === id){
                  return check( inherit[Class.key], 0);
              }
              return false;
          })(description,1);
      }
      return left instanceof right;
  };

  System.isClass=function isClass(classObject){
      if( !classObject || !classObject.constructor)return false;
      var desc = classObject[ Class.key ];
      return desc && desc.id === 1 || (typeof classObject === "function" && classObject.constructor !== Function);
  };

  System.isInterface=function isInterface(classObject){
      var desc = classObject && classObject[ Class.key ];
      return desc && desc.id === 2;
  };

  System.isEnum=function isEnum(classObject){
      var desc = classObject && classObject[ Class.key ];
      return desc && desc.id === 3;
  };

  System.isFunction=function isFunction(target){
     return target && target.constructor === Function;
  };

  System.isArray=function isArray(object){
      return Array.isArray(object); 
  };

  System.toArray=function toArray(object){
      if( Array.isArray(object) ){
          return object;
      }
      var arr = [];
      for(var key in object){
          if( Object.prototype.hasOwnProperty.call(object,key) ){
              arr.push(object[key]);
          } 
      }
      return arr;
  };

  var __EventDispatcher = null;
  System.getEventDispatcher=function getEventDispatcher(){
      if( __EventDispatcher === null ){
          __EventDispatcher = new EventDispatcher(window);
      }
      return __EventDispatcher;
  };

  /**
   * 根据指定的类名获取类的对象
   * @param name
   * @returns {Object}
   */
   System.getDefinitionByName = function getDefinitionByName(name){
       var module = Class.getClassByName(name);
       if( module ){
           return module;
       }
       throw new TypeError('"' + name + '" is not defined.');
   };
   
   System.hasClass = function hasClass(name){
       return !!Class.getClassByName(name);
   };
   
   /**
    * 返回类的完全限定类名
    * @param value 需要完全限定类名称的对象。
    * 可以将任何类型、对象实例、原始类型和类对象
    * @returns {string}
    */
   System.getQualifiedClassName = function getQualifiedClassName( target ){
       if( target == null )throw new ReferenceError( 'target is null or undefined' );
       if( target===System )return 'System';
       if( typeof target === "function" && target.prototype){
           var desc = target && target[ Class.key ];
           if( desc ){
              return desc.ns ? desc.ns+'.'+desc.name : desc.name;
           }
           var str = target.toString();
           str = str.substr(0, str.indexOf('(') );
           return str.substr(str.lastIndexOf(' ')+1);
       }
       throw new ReferenceError( 'target is not Class' );
   };
   
   /**
    * 返回对象的完全限定类名
    * @param value 需要完全限定类名称的对象。
    * 可以将任何类型、对象实例、原始类型和类对象
    * @returns {string}
    */
   System.getQualifiedObjectName = function getQualifiedObjectName( target ){
       if( target == null || typeof target !== "object"){
           throw new ReferenceError( 'target is not object or is null' );
       }
       return System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
   };
   /**
    * 获取指定实例对象的超类名称
    * @param value
    * @returns {string}
    */
   System.getQualifiedSuperClassName =function getQualifiedSuperClassName(target){
       if( target == null )throw new ReferenceError( 'target is null or undefined' );
       var classname = System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
       var module = Class.getClassByName(classname);
       if( module ){
           return System.getQualifiedClassName( module.inherit || Object );
       }
       return null;
   };
  Class.creator(12,System,{
  	'id':1,
  	'global':true,
  	'dynamic':false,
  	'name':'System'
  }, false);

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */

  var _Reflect = (function(_Reflect){
      var _construct = _Reflect ? _Reflect.construct : function construct(theClass,args){
          if( !System.isFunction( theClass ) ){
              throw new TypeError('is not class or function');
          }
          switch ( args.length ){
              case 0 :
                  return new theClass();
              case 1 :
                  return new theClass(args[0]);
              case 2 :
                  return new theClass(args[0], args[1]);
              case 3 :
                  return new theClass(args[0], args[1], args[2]);
              case 4 :
                  return new theClass(args[0], args[1], args[2],args[3]);
              case 5 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4]);
              case 6 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4],args[5]);
              case 7 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6]);
              case 8 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6],args[7]);
              default :
                  return Function('f,a', 'return new f(a[' + System.range(0, args.length).join('],a[') + ']);')(theClass, args);
          }
      };

      var _apply = _Reflect ? _Reflect.apply : function apply(target, thisArgument, argumentsList){
          if( typeof target !== "function" ){
              throw new TypeError('is not function');
          }
          thisArgument = thisArgument === target ? undefined : thisArgument;
          if (argumentsList != null) {
              return target.apply(thisArgument === target ? undefined : thisArgument, argumentsList);
          }
          if (thisArgument != null) {
              return target.call(thisArgument);
          }
          return target();
      };

      var MODIFIER_PUBLIC=3;
      var MODIFIER_PROTECTED=2;
      var MODIFIER_PRIVATE=1;

      function inContext(context,objClass){
          if( !System.isClass(objClass) )return;
          var inherit = context[ Class.key ].inherit;
          if( inherit === objClass ){
              return true;
          }
          return inContext(inherit, objClass);
      }

      function description(scope,target,name){
          var isStatic = System.isClass(target);
          var objClass = isStatic ? target : target.constructor;
          var context = System.isClass(scope) ? scope : null;
          var description = objClass[ Class.key ];
          if( !isStatic && !System.isClass(objClass) ){
              return target;
          }
          var isDynamic = description && description.dynamic;
          while( objClass && (description = objClass[ Class.key ]) ){
              var dataset = isStatic ? description.methods : description.members;
              if( dataset && dataset.hasOwnProperty( name ) ){
                  const desc = dataset[name];
                  switch( desc.m & MODIFIER_PUBLIC ){
                      case MODIFIER_PRIVATE :
                          return  context === objClass ? desc : false;
                      case MODIFIER_PROTECTED :
                          return context && inContext(context,objClass) ? desc : false;
                      default :
                          return desc;
                  }
              }
              objClass = description.inherit;
          }
          if( isDynamic ){
              return target;
          }
          if( Object.prototype.hasOwnProperty(name) ){
              return {value:Object.prototype[name]};
          }
          return null;
      }
      function Reflect(){ 
          throw new SyntaxError('Reflect is not constructor.');
      }

      Reflect.apply=function apply(target, thisArgument, argumentsList ){
          if( !System.isFunction( target ) ){
              throw new TypeError('target is not function');
          }
          if( !System.isArray(argumentsList) ){
              argumentsList = argumentsList !== void 0 ? [argumentsList] : [];
          }
          return _apply(target, thisArgument, argumentsList);
      };

      Reflect.call=function call(scope,target,propertyKey,argumentsList,thisArgument){
          if( target == null )throw new ReferenceError('target is null or undefined');
          if( propertyKey==null ){
              return Reflect.apply(target, thisArgument, argumentsList);
          }
          return Reflect.apply( Reflect.get(scope,target,propertyKey), thisArgument||target, argumentsList);    
      };

      Reflect.construct=function construct(target, args){
          if( !System.isClass(target) )throw new TypeError('target is not class');
          return _construct(target, args || []);
      };

      Reflect.deleteProperty=function deleteProperty(target, propertyKey){
          if( !target || propertyKey==null )return false;
          if( propertyKey==="__proto__")return false;
          if( System.isClass(target) || System.isClass(target.constructor) ){
              return false;
          }
          if( Object.prototype.hasOwnProperty( target, propertyKey) ){
              return (delete target[propertyKey]);
          }
          return false;
      };

      Reflect.has=function has(target, propertyKey){
          if( propertyKey==null || target == null )return false;
          if( propertyKey==="__proto__")return false;
          if( System.isClass(target) || System.isClass(target.constructor) ) {
              return false;
          }
          return propertyKey in target;
      };

      var DECLARE_PROPERTY_ACCESSOR = 4;
      Reflect.get=function get(scope,target,propertyKey,receiver){
          if( propertyKey==null )return target;
          if( propertyKey === '__proto__' )return null;
          if( target == null )throw new ReferenceError('target is null or undefined');
          var desc = description(scope,target,propertyKey);
          if( desc === target ){
              return target[propertyKey] || null;
          }
          if( desc === false ){
              throw new ReferenceError(`target.${propertyKey} inaccessible`);
          }
          if( !desc ){
              throw new ReferenceError(`target.${propertyKey} is not exists`);
          }
          receiver = !receiver && typeof target ==="object" ? target : null;
          if(typeof receiver !=="object" ){
              throw new ReferenceError(`Assignment receiver can only is an object.`);
          }
          if( desc.d === DECLARE_PROPERTY_ACCESSOR ){
              if( !desc.get ){
                  throw new ReferenceError(`target.${propertyKey} getter is not exists.`);
              }
              return desc.get.call(receiver);
          }
          return desc.value || null;
      };

      var DECLARE_PROPERTY_ACCESSOR = 4;
      var DECLARE_PROPERTY_VAR = 1;

      Reflect.set=function(scope,target,propertyKey,value,receiver){
          if( propertyKey==null )return target;
          if( propertyKey === '__proto__' )return null;
          if( target == null )throw new ReferenceError('target is null or undefined');
          var desc = description(scope,target,propertyKey);
          if( desc === target ){
              return target[propertyKey] = value;
          }
          if( desc === false ){
              throw new ReferenceError(`target.${propertyKey} inaccessible`);
          }
          if( !desc ){
              throw new ReferenceError(`target.${propertyKey} is not exists.`);
          }
          receiver = !receiver && typeof target ==="object" ? target : null;
          if(typeof receiver !=="object" ){
              throw new ReferenceError(`Assignment receiver can only is an object.`);
          }
          if( desc.d === DECLARE_PROPERTY_ACCESSOR ){
              if( !desc.set ){
                  throw new ReferenceError(`target.${propertyKey} setter is not exists.`);
              }
              desc.set.call(receiver);
          }else if( desc.d === DECLARE_PROPERTY_VAR ){
              if( System.isClass(target) ){
                  target[propertyKey] = value;
              }else if( System.isClass(target.constructor) ){
                  var p = target.constructor[Class.key]._private;
                  target[p][propertyKey] = value;
              }else {
                  throw new ReferenceError(`target.${propertyKey} non object.`); 
              }
          }else {
              throw new ReferenceError(`target.${propertyKey} is not writable.`);
          }
      };

      Reflect.incre=function incre(scope,target,propertyKey,flag){
          var val = Reflect.get(scope,target,propertyKey);
          var result = val+1;
          Reflect.set(scope,target, propertyKey, result);
          return flag !== false ? val : result;
      };

      Reflect.decre= function decre(scope,target, propertyKey,flag){
          var val = Reflect.get(scope,target, propertyKey);
          var result = val-1;
          Reflect.set(scope,target, propertyKey,result);
          return flag !== false ? val : result;
      };
      return Reflect;

  }(Reflect));
  Class.creator(7,_Reflect,{
  	'id':1,
  	'global':true,
  	'dynamic':false,
  	'name':'Reflect'
  }, false);

  var members$6 = {};
  members$6.render={m:3,d:3,value:function render(){
  	var _c;
  	var createElement = this.createElement.bind(this);
  	return createElement('div', null, [
  		this.name ? createElement('div',{
  			"class":'bg'
  			}, ['1']) : 
  		! (this.name) ? createElement('div',null, ['2']) : 
  		createElement('div',null, ['399999'])
  	].concat(
  		['china'].concat(this.list).map((function(item){
  			return createElement('div',null, [
  						createElement('div',null, [item]),
  						createElement('div',{
  							"class":"ssss"
  							}, [
  							createElement('div',null, [
  								createElement('span',null, (this.slot('default') || []))
  							])
  						])
  					]);
  		}).bind(this))).concat(
  		[
  		createElement('div',{
  			"ref":'iss',
  			"class":""
  			}, [
  			createElement('div',null, ['item =====PersonSkin====  ',this.name,'====='
  			])
  		]),
  		createElement('input',{
  			"attrs":{
  				"value":this.value
  				},
  			"on":{
  				"input":(function(event){this.value=event && event.target && event.target.nodeType===1 ? event.target.value : event;}).bind(this),
  				"change":this.onChange.bind(this)
  				},
  			"directives":[
  				{
  				"name":'model',
  				"value":this.value
  				}
  				]
  			}),
  		createElement('input',{
  			"attrs":{
  				"value":this.value
  				}
  			})
  	]).concat(
  		(this.slot('foot',true,true,{props:this.list}) || [
  			createElement('div',{
  				"slot":'foot'
  				}, ['===============the is foot slot =============='])
  		])).concat(
  		[
  		createElement('div',{
  			"directives":[
  				{
  				"name":'show',
  				"value":this.isShow
  				}
  				]
  			}, ['the is property   ',this.address
  		]),
  		createElement('button',{
  			"on":{
  				"click":(function(){this.isShow=! this.isShow;}).bind(this)
  				}
  			}, ['Toggle    ']),
  		createElement(TransitionGroup$2,{
  			"props":{
  				"name":"fade"
  				},
  			"on":(_c={},_c[TransitionEvent.BEFORE_ENTER]=this.beforeEnter.bind(this),_c)
  			}, [
  			this.isShow ? createElement('p',{
  				"key":"1"
  				}, ['hello']) : null,
  			this.isShow ? createElement('p',{
  				"key":"2"
  				}, ['hello']) : null,
  			this.isShow ? createElement('p',{
  				"key":"3"
  				}, ['hello']) : null
  		])
  	]).concat(
  		this.isShow ? [
  			createElement('div',null, ['the is a group condition']),
  			createElement('div',null, ['the is a group condition']),
  			createElement('div',null, ['the is a group condition']),
  			createElement('div',null, ['the is a group condition']),
  			createElement('div',null, ['the is a group condition']),
  			createElement('div',null, ['the is a group condition'])
  		]  : [
  			createElement('div',null, ['the is a group elseif'])
  		],
  		this.list.map((function(item,index){
  				return [
  					createElement('div',null, ['====each==',item,'=',index
  					]),
  					createElement('div',null, ['===22=each==',item,'='
  					])
  				];
  			}).bind(this)).reduce(function(acc, val){return acc.concat(val)}, []),
  		(function(_refs2){
  				var __refs2 = [];
  				if( typeof _refs2 ==='number' ){
  					_refs2 = Array.from({length:_refs2}, function(v,i){return i;});
  				}
  				for(var keyName in _refs2){
  					var item = _refs2[keyName];
  					__refs2.push([
  					createElement('div',null, ['====for===',item,',',keyName
  					]),
  					createElement('div',null, ['===222=for===',item,',',keyName
  					])
  				]);
  				}
  				return __refs2;
  			}).call(this,this.list).reduce(function(acc, val){return acc.concat(val)}, []),
  		[
  			createElement('div',{
  				"directives":[
  					{
  					"name":'show',
  					"value":this.isShow
  					}
  					]
  				}, ['====show==']),
  			createElement('div',{
  				"directives":[
  					{
  					"name":'show',
  					"value":this.isShow
  					}
  					]
  				}, ['===222=show==='])
  		]));
  }};
  members$6.address={m:3,d:4,enumerable:true,get:function address(){var res=this.reactive('address');return res === void 0 ? 'address' : res;},set:function address(value){this.reactive('address',value);}};
  members$6.name={m:3,d:4,enumerable:true,get:function name(){
  	return this.reactive('name');
  },set:function name(value){
  	this.reactive('name',value);
  }};
  members$6.list={m:3,d:4,enumerable:true,get:function list(){
  	return ['one','two','three','four','five'];
  }};
  members$6.onChange={m:3,d:3,value:function onChange(e){
  	this.address=_Reflect.get(PersonSkin,_Reflect.get(PersonSkin,e,'target'),'value') + '---';
  }};
  members$6.value={m:3,d:4,enumerable:true,get:function value(){
  	return this.reactive('value') || '9999';
  },set:function value(val){
  	this.reactive('value',val);
  }};
  members$6.beforeEnter={m:3,d:3,value:function beforeEnter(){
  	console.log('=========PersonSkin=====enter');
  }};
  members$6.isShow={m:3,d:4,enumerable:true,get:function isShow(){var res=this.reactive('isShow');return res === void 0 ? true : res;},set:function isShow(value){this.reactive('isShow',value);}};
  var PersonSkin = Component.createComponent({
  	name:'es-PersonSkin'
  });
  Class.creator(5,PersonSkin,{
  	'id':1,
  	'ns':'',
  	'name':'PersonSkin',
  	'inherit':Component,
  	'members':members$6
  }, false);

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  var script$6 = {
    name: 'ElButton',
    inject: {
      elForm: {
        "default": ''
      },
      elFormItem: {
        "default": ''
      }
    },
    props: {
      type: {
        type: String,
        "default": 'default'
      },
      size: String,
      icon: {
        type: String,
        "default": ''
      },
      nativeType: {
        type: String,
        "default": 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      plain: Boolean,
      autofocus: Boolean,
      round: Boolean,
      circle: Boolean
    },
    computed: {
      _elFormItemSize: function _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      buttonSize: function buttonSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      buttonDisabled: function buttonDisabled() {
        return this.$options.propsData.hasOwnProperty('disabled') ? this.disabled : (this.elForm || {}).disabled;
      }
    },
    methods: {
      handleClick: function handleClick(evt) {
        this.$emit('click', evt);
      }
    }
  };

  /* script */
  var __vue_script__$6 = script$6;
  /* template */

  var __vue_render__$5 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("button", {
      staticClass: "el-button",
      "class": [_vm.type ? "el-button--" + _vm.type : "", _vm.buttonSize ? "el-button--" + _vm.buttonSize : "", {
        "is-disabled": _vm.buttonDisabled,
        "is-loading": _vm.loading,
        "is-plain": _vm.plain,
        "is-round": _vm.round,
        "is-circle": _vm.circle
      }],
      attrs: {
        disabled: _vm.buttonDisabled || _vm.loading,
        autofocus: _vm.autofocus,
        type: _vm.nativeType
      },
      on: {
        click: _vm.handleClick
      }
    }, [_vm.loading ? _c("i", {
      staticClass: "el-icon-loading"
    }) : _vm._e(), _vm._v(" "), _vm.icon && !_vm.loading ? _c("i", {
      "class": _vm.icon
    }) : _vm._e(), _vm._v(" "), _vm.$slots["default"] ? _c("span", [_vm._t("default")], 2) : _vm._e()]);
  };

  var __vue_staticRenderFns__$5 = [];
  __vue_render__$5._withStripped = true;
  /* style */

  var __vue_inject_styles__$6 = undefined;
  /* scoped */

  var __vue_scope_id__$6 = undefined;
  /* module identifier */

  var __vue_module_identifier__$6 = undefined;
  /* functional template */

  var __vue_is_functional_template__$6 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$6 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$5,
    staticRenderFns: __vue_staticRenderFns__$5
  }, __vue_inject_styles__$6, __vue_script__$6, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, false, undefined, undefined, undefined);

  /* istanbul ignore next */

  __vue_component__$6.install = function (Vue) {
    Vue.component(__vue_component__$6.name, __vue_component__$6);
  };

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  var script$7 = {
    name: 'ElLink',
    props: {
      type: {
        type: String,
        "default": 'default'
      },
      underline: {
        type: Boolean,
        "default": true
      },
      disabled: Boolean,
      href: String,
      icon: String
    },
    methods: {
      handleClick: function handleClick(event) {
        if (!this.disabled) {
          if (!this.href) {
            this.$emit('click', event);
          }
        }
      }
    }
  };

  /* script */
  var __vue_script__$7 = script$7;
  /* template */

  var __vue_render__$6 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("a", _vm._b({
      "class": ["el-link", _vm.type ? "el-link--" + _vm.type : "", _vm.disabled && "is-disabled", _vm.underline && !_vm.disabled && "is-underline"],
      attrs: {
        href: _vm.disabled ? null : _vm.href
      },
      on: {
        click: _vm.handleClick
      }
    }, "a", _vm.$attrs, false), [_vm.icon ? _c("i", {
      "class": _vm.icon
    }) : _vm._e(), _vm._v(" "), _vm.$slots["default"] ? _c("span", {
      staticClass: "el-link--inner"
    }, [_vm._t("default")], 2) : _vm._e(), _vm._v(" "), _vm.$slots.icon ? [_vm.$slots.icon ? _vm._t("icon") : _vm._e()] : _vm._e()], 2);
  };

  var __vue_staticRenderFns__$6 = [];
  __vue_render__$6._withStripped = true;
  /* style */

  var __vue_inject_styles__$7 = undefined;
  /* scoped */

  var __vue_scope_id__$7 = undefined;
  /* module identifier */

  var __vue_module_identifier__$7 = undefined;
  /* functional template */

  var __vue_is_functional_template__$7 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$7 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$6,
    staticRenderFns: __vue_staticRenderFns__$6
  }, __vue_inject_styles__$7, __vue_script__$7, __vue_scope_id__$7, __vue_is_functional_template__$7, __vue_module_identifier__$7, false, undefined, undefined, undefined);

  /* istanbul ignore next */

  __vue_component__$7.install = function (Vue) {
    Vue.component(__vue_component__$7.name, __vue_component__$7);
  };

  function _extends(){return _extends=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},_extends.apply(this,arguments)}var normalMerge=["attrs","props","domProps"],toArrayMerge=["class","style","directives"],functionalMerge=["on","nativeOn"],mergeJsxProps=function(a){return a.reduce(function(c,a){for(var b in a)if(!c[b])c[b]=a[b];else if(-1!==normalMerge.indexOf(b))c[b]=_extends({},c[b],a[b]);else if(-1!==toArrayMerge.indexOf(b)){var d=c[b]instanceof Array?c[b]:[c[b]],e=a[b]instanceof Array?a[b]:[a[b]];c[b]=d.concat(e);}else if(-1!==functionalMerge.indexOf(b)){for(var f in a[b])if(c[b][f]){var g=c[b][f]instanceof Array?c[b][f]:[c[b][f]],h=a[b][f]instanceof Array?a[b][f]:[a[b][f]];c[b][f]=g.concat(h);}else c[b][f]=a[b][f];}else if("hook"==b)for(var i in a[b])c[b][i]=c[b][i]?mergeFn(c[b][i],a[b][i]):a[b][i];else c[b]=a[b];return c},{})},mergeFn=function(a,b){return function(){a&&a.apply(this,arguments),b&&b.apply(this,arguments);}};var helper=mergeJsxProps;

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  var script$8 = {
    name: 'ElProgress',
    props: {
      type: {
        type: String,
        "default": 'line',
        validator: function validator(val) {
          return ['line', 'circle', 'dashboard'].indexOf(val) > -1;
        }
      },
      percentage: {
        type: Number,
        "default": 0,
        required: true,
        validator: function validator(val) {
          return val >= 0 && val <= 100;
        }
      },
      status: {
        type: String,
        validator: function validator(val) {
          return ['success', 'exception', 'warning'].indexOf(val) > -1;
        }
      },
      strokeWidth: {
        type: Number,
        "default": 6
      },
      strokeLinecap: {
        type: String,
        "default": 'round'
      },
      textInside: {
        type: Boolean,
        "default": false
      },
      width: {
        type: Number,
        "default": 126
      },
      showText: {
        type: Boolean,
        "default": true
      },
      color: {
        type: [String, Array, Function],
        "default": ''
      },
      format: Function
    },
    computed: {
      barStyle: function barStyle() {
        var style = {};
        style.width = this.percentage + '%';
        style.backgroundColor = this.getCurrentColor(this.percentage);
        return style;
      },
      relativeStrokeWidth: function relativeStrokeWidth() {
        return (this.strokeWidth / this.width * 100).toFixed(1);
      },
      radius: function radius() {
        if (this.type === 'circle' || this.type === 'dashboard') {
          return parseInt(50 - parseFloat(this.relativeStrokeWidth) / 2, 10);
        } else {
          return 0;
        }
      },
      trackPath: function trackPath() {
        var radius = this.radius;
        var isDashboard = this.type === 'dashboard';
        return "\n        M 50 50\n        m 0 ".concat(isDashboard ? '' : '-').concat(radius, "\n        a ").concat(radius, " ").concat(radius, " 0 1 1 0 ").concat(isDashboard ? '-' : '').concat(radius * 2, "\n        a ").concat(radius, " ").concat(radius, " 0 1 1 0 ").concat(isDashboard ? '' : '-').concat(radius * 2, "\n        ");
      },
      perimeter: function perimeter() {
        return 2 * Math.PI * this.radius;
      },
      rate: function rate() {
        return this.type === 'dashboard' ? 0.75 : 1;
      },
      strokeDashoffset: function strokeDashoffset() {
        var offset = -1 * this.perimeter * (1 - this.rate) / 2;
        return "".concat(offset, "px");
      },
      trailPathStyle: function trailPathStyle() {
        return {
          strokeDasharray: "".concat(this.perimeter * this.rate, "px, ").concat(this.perimeter, "px"),
          strokeDashoffset: this.strokeDashoffset
        };
      },
      circlePathStyle: function circlePathStyle() {
        return {
          strokeDasharray: "".concat(this.perimeter * this.rate * (this.percentage / 100), "px, ").concat(this.perimeter, "px"),
          strokeDashoffset: this.strokeDashoffset,
          transition: 'stroke-dasharray 0.6s ease 0s, stroke 0.6s ease'
        };
      },
      stroke: function stroke() {
        var ret;

        if (this.color) {
          ret = this.getCurrentColor(this.percentage);
        } else {
          switch (this.status) {
            case 'success':
              ret = '#13ce66';
              break;

            case 'exception':
              ret = '#ff4949';
              break;

            case 'warning':
              ret = '#e6a23c';
              break;

            default:
              ret = '#20a0ff';
          }
        }

        return ret;
      },
      iconClass: function iconClass() {
        if (this.status === 'warning') {
          return 'el-icon-warning';
        }

        if (this.type === 'line') {
          return this.status === 'success' ? 'el-icon-circle-check' : 'el-icon-circle-close';
        } else {
          return this.status === 'success' ? 'el-icon-check' : 'el-icon-close';
        }
      },
      progressTextSize: function progressTextSize() {
        return this.type === 'line' ? 12 + this.strokeWidth * 0.4 : this.width * 0.111111 + 2;
      },
      content: function content() {
        if (typeof this.format === 'function') {
          return this.format(this.percentage) || '';
        } else {
          return "".concat(this.percentage, "%");
        }
      }
    },
    methods: {
      getCurrentColor: function getCurrentColor(percentage) {
        if (typeof this.color === 'function') {
          return this.color(percentage);
        } else if (typeof this.color === 'string') {
          return this.color;
        } else {
          return this.getLevelColor(percentage);
        }
      },
      getLevelColor: function getLevelColor(percentage) {
        var colorArray = this.getColorArray().sort(function (a, b) {
          return a.percentage - b.percentage;
        });

        for (var i = 0; i < colorArray.length; i++) {
          if (colorArray[i].percentage > percentage) {
            return colorArray[i].color;
          }
        }

        return colorArray[colorArray.length - 1].color;
      },
      getColorArray: function getColorArray() {
        var color = this.color;
        var span = 100 / color.length;
        return color.map(function (seriesColor, index) {
          if (typeof seriesColor === 'string') {
            return {
              color: seriesColor,
              percentage: (index + 1) * span
            };
          }

          return seriesColor;
        });
      }
    }
  };

  /* script */
  var __vue_script__$8 = script$8;
  /* template */

  var __vue_render__$7 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("div", {
      staticClass: "el-progress",
      "class": ["el-progress--" + _vm.type, _vm.status ? "is-" + _vm.status : "", {
        "el-progress--without-text": !_vm.showText,
        "el-progress--text-inside": _vm.textInside
      }],
      attrs: {
        role: "progressbar",
        "aria-valuenow": _vm.percentage,
        "aria-valuemin": "0",
        "aria-valuemax": "100"
      }
    }, [_vm.type === "line" ? _c("div", {
      staticClass: "el-progress-bar"
    }, [_c("div", {
      staticClass: "el-progress-bar__outer",
      style: {
        height: _vm.strokeWidth + "px"
      }
    }, [_c("div", {
      staticClass: "el-progress-bar__inner",
      style: _vm.barStyle
    }, [_vm.showText && _vm.textInside ? _c("div", {
      staticClass: "el-progress-bar__innerText"
    }, [_vm._v(_vm._s(_vm.content))]) : _vm._e()])])]) : _c("div", {
      staticClass: "el-progress-circle",
      style: {
        height: _vm.width + "px",
        width: _vm.width + "px"
      }
    }, [_c("svg", {
      attrs: {
        viewBox: "0 0 100 100"
      }
    }, [_c("path", {
      staticClass: "el-progress-circle__track",
      style: _vm.trailPathStyle,
      attrs: {
        d: _vm.trackPath,
        stroke: "#e5e9f2",
        "stroke-width": _vm.relativeStrokeWidth,
        fill: "none"
      }
    }), _vm._v(" "), _c("path", {
      staticClass: "el-progress-circle__path",
      style: _vm.circlePathStyle,
      attrs: {
        d: _vm.trackPath,
        stroke: _vm.stroke,
        fill: "none",
        "stroke-linecap": _vm.strokeLinecap,
        "stroke-width": _vm.percentage ? _vm.relativeStrokeWidth : 0
      }
    })])]), _vm._v(" "), _vm.showText && !_vm.textInside ? _c("div", {
      staticClass: "el-progress__text",
      style: {
        fontSize: _vm.progressTextSize + "px"
      }
    }, [!_vm.status ? [_vm._v(_vm._s(_vm.content))] : _c("i", {
      "class": _vm.iconClass
    })], 2) : _vm._e()]);
  };

  var __vue_staticRenderFns__$7 = [];
  __vue_render__$7._withStripped = true;
  /* style */

  var __vue_inject_styles__$8 = undefined;
  /* scoped */

  var __vue_scope_id__$8 = undefined;
  /* module identifier */

  var __vue_module_identifier__$8 = undefined;
  /* functional template */

  var __vue_is_functional_template__$8 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$8 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$7,
    staticRenderFns: __vue_staticRenderFns__$7
  }, __vue_inject_styles__$8, __vue_script__$8, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, false, undefined, undefined, undefined);

  /* istanbul ignore next */

  __vue_component__$8.install = function (Vue) {
    Vue.component(__vue_component__$8.name, __vue_component__$8);
  };

  //
  var script$9 = {
    name: 'ElUploadList',
    mixins: [Locale],
    data: function data() {
      return {
        focusing: false
      };
    },
    components: {
      ElProgress: __vue_component__$8
    },
    props: {
      files: {
        type: Array,
        "default": function _default() {
          return [];
        }
      },
      disabled: {
        type: Boolean,
        "default": false
      },
      handlePreview: Function,
      listType: String
    },
    methods: {
      parsePercentage: function parsePercentage(val) {
        return parseInt(val, 10);
      },
      handleClick: function handleClick(file) {
        this.handlePreview && this.handlePreview(file);
      }
    }
  };

  /* script */
  var __vue_script__$9 = script$9;
  /* template */

  var __vue_render__$8 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("transition-group", {
      "class": ["el-upload-list", "el-upload-list--" + _vm.listType, {
        "is-disabled": _vm.disabled
      }],
      attrs: {
        tag: "ul",
        name: "el-list"
      }
    }, _vm._l(_vm.files, function (file) {
      return _c("li", {
        key: file.uid,
        "class": ["el-upload-list__item", "is-" + file.status, _vm.focusing ? "focusing" : ""],
        attrs: {
          tabindex: "0"
        },
        on: {
          keydown: function keydown($event) {
            if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "delete", [8, 46], $event.key, ["Backspace", "Delete", "Del"])) {
              return null;
            }

            !_vm.disabled && _vm.$emit("remove", file);
          },
          focus: function focus($event) {
            _vm.focusing = true;
          },
          blur: function blur($event) {
            _vm.focusing = false;
          },
          click: function click($event) {
            _vm.focusing = false;
          }
        }
      }, [_vm._t("default", function () {
        return [file.status !== "uploading" && ["picture-card", "picture"].indexOf(_vm.listType) > -1 ? _c("img", {
          staticClass: "el-upload-list__item-thumbnail",
          attrs: {
            src: file.url,
            alt: ""
          }
        }) : _vm._e(), _vm._v(" "), _c("a", {
          staticClass: "el-upload-list__item-name",
          on: {
            click: function click($event) {
              return _vm.handleClick(file);
            }
          }
        }, [_c("i", {
          staticClass: "el-icon-document"
        }), _vm._v(_vm._s(file.name) + "\n      ")]), _vm._v(" "), _c("label", {
          staticClass: "el-upload-list__item-status-label"
        }, [_c("i", {
          "class": {
            "el-icon-upload-success": true,
            "el-icon-circle-check": _vm.listType === "text",
            "el-icon-check": ["picture-card", "picture"].indexOf(_vm.listType) > -1
          }
        })]), _vm._v(" "), !_vm.disabled ? _c("i", {
          staticClass: "el-icon-close",
          on: {
            click: function click($event) {
              return _vm.$emit("remove", file);
            }
          }
        }) : _vm._e(), _vm._v(" "), !_vm.disabled ? _c("i", {
          staticClass: "el-icon-close-tip"
        }, [_vm._v(_vm._s(_vm.t("el.upload.deleteTip")))]) : _vm._e(), _vm._v(" "), file.status === "uploading" ? _c("el-progress", {
          attrs: {
            type: _vm.listType === "picture-card" ? "circle" : "line",
            "stroke-width": _vm.listType === "picture-card" ? 6 : 2,
            percentage: _vm.parsePercentage(file.percentage)
          }
        }) : _vm._e(), _vm._v(" "), _vm.listType === "picture-card" ? _c("span", {
          staticClass: "el-upload-list__item-actions"
        }, [_vm.handlePreview && _vm.listType === "picture-card" ? _c("span", {
          staticClass: "el-upload-list__item-preview",
          on: {
            click: function click($event) {
              return _vm.handlePreview(file);
            }
          }
        }, [_c("i", {
          staticClass: "el-icon-zoom-in"
        })]) : _vm._e(), _vm._v(" "), !_vm.disabled ? _c("span", {
          staticClass: "el-upload-list__item-delete",
          on: {
            click: function click($event) {
              return _vm.$emit("remove", file);
            }
          }
        }, [_c("i", {
          staticClass: "el-icon-delete"
        })]) : _vm._e()]) : _vm._e()];
      }, {
        file: file
      })], 2);
    }), 0);
  };

  var __vue_staticRenderFns__$8 = [];
  __vue_render__$8._withStripped = true;
  /* style */

  var __vue_inject_styles__$9 = undefined;
  /* scoped */

  var __vue_scope_id__$9 = undefined;
  /* module identifier */

  var __vue_module_identifier__$9 = undefined;
  /* functional template */

  var __vue_is_functional_template__$9 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$9 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$8,
    staticRenderFns: __vue_staticRenderFns__$8
  }, __vue_inject_styles__$9, __vue_script__$9, __vue_scope_id__$9, __vue_is_functional_template__$9, __vue_module_identifier__$9, false, undefined, undefined, undefined);

  function getError(action, option, xhr) {
    var msg;

    if (xhr.response) {
      msg = "".concat(xhr.response.error || xhr.response);
    } else if (xhr.responseText) {
      msg = "".concat(xhr.responseText);
    } else {
      msg = "fail to post ".concat(action, " ").concat(xhr.status);
    }

    var err = new Error(msg);
    err.status = xhr.status;
    err.method = 'post';
    err.url = action;
    return err;
  }

  function getBody(xhr) {
    var text = xhr.responseText || xhr.response;

    if (!text) {
      return text;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  function upload(option) {
    if (typeof XMLHttpRequest === 'undefined') {
      return;
    }

    var xhr = new XMLHttpRequest();
    var action = option.action;

    if (xhr.upload) {
      xhr.upload.onprogress = function progress(e) {
        if (e.total > 0) {
          e.percent = e.loaded / e.total * 100;
        }

        option.onProgress(e);
      };
    }

    var formData = new FormData();

    if (option.data) {
      Object.keys(option.data).forEach(function (key) {
        formData.append(key, option.data[key]);
      });
    }

    formData.append(option.filename, option.file, option.file.name);

    xhr.onerror = function error(e) {
      option.onError(e);
    };

    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        return option.onError(getError(action, option, xhr));
      }

      option.onSuccess(getBody(xhr));
    };

    xhr.open('post', action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    var headers = option.headers || {};

    for (var item in headers) {
      if (headers.hasOwnProperty(item) && headers[item] !== null) {
        xhr.setRequestHeader(item, headers[item]);
      }
    }

    xhr.send(formData);
    return xhr;
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  var script$a = {
    name: 'ElUploadDrag',
    props: {
      disabled: Boolean
    },
    inject: {
      uploader: {
        "default": ''
      }
    },
    data: function data() {
      return {
        dragover: false
      };
    },
    methods: {
      onDragover: function onDragover() {
        if (!this.disabled) {
          this.dragover = true;
        }
      },
      onDrop: function onDrop(e) {
        if (this.disabled || !this.uploader) return;
        var accept = this.uploader.accept;
        this.dragover = false;

        if (!accept) {
          this.$emit('file', e.dataTransfer.files);
          return;
        }

        this.$emit('file', [].slice.call(e.dataTransfer.files).filter(function (file) {
          var type = file.type,
              name = file.name;
          var extension = name.indexOf('.') > -1 ? ".".concat(name.split('.').pop()) : '';
          var baseType = type.replace(/\/.*$/, '');
          return accept.split(',').map(function (type) {
            return type.trim();
          }).filter(function (type) {
            return type;
          }).some(function (acceptedType) {
            if (/\..+$/.test(acceptedType)) {
              return extension === acceptedType;
            }

            if (/\/\*$/.test(acceptedType)) {
              return baseType === acceptedType.replace(/\/\*$/, '');
            }

            if (/^[^\/]+\/[^\/]+$/.test(acceptedType)) {
              return type === acceptedType;
            }

            return false;
          });
        }));
      }
    }
  };

  /* script */
  var __vue_script__$a = script$a;
  /* template */

  var __vue_render__$9 = function __vue_render__() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c("div", {
      staticClass: "el-upload-dragger",
      "class": {
        "is-dragover": _vm.dragover
      },
      on: {
        drop: function drop($event) {
          $event.preventDefault();
          return _vm.onDrop.apply(null, arguments);
        },
        dragover: function dragover($event) {
          $event.preventDefault();
          return _vm.onDragover.apply(null, arguments);
        },
        dragleave: function dragleave($event) {
          $event.preventDefault();
          _vm.dragover = false;
        }
      }
    }, [_vm._t("default")], 2);
  };

  var __vue_staticRenderFns__$9 = [];
  __vue_render__$9._withStripped = true;
  /* style */

  var __vue_inject_styles__$a = undefined;
  /* scoped */

  var __vue_scope_id__$a = undefined;
  /* module identifier */

  var __vue_module_identifier__$a = undefined;
  /* functional template */

  var __vue_is_functional_template__$a = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$a = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$9,
    staticRenderFns: __vue_staticRenderFns__$9
  }, __vue_inject_styles__$a, __vue_script__$a, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, false, undefined, undefined, undefined);

  var script$b = {
    inject: ['uploader'],
    components: {
      UploadDragger: __vue_component__$a
    },
    props: {
      type: String,
      action: {
        type: String,
        required: true
      },
      name: {
        type: String,
        "default": 'file'
      },
      data: Object,
      headers: Object,
      withCredentials: Boolean,
      multiple: Boolean,
      accept: String,
      onStart: Function,
      onProgress: Function,
      onSuccess: Function,
      onError: Function,
      beforeUpload: Function,
      drag: Boolean,
      onPreview: {
        type: Function,
        "default": function _default() {}
      },
      onRemove: {
        type: Function,
        "default": function _default() {}
      },
      fileList: Array,
      autoUpload: Boolean,
      listType: String,
      httpRequest: {
        type: Function,
        "default": upload
      },
      disabled: Boolean,
      limit: Number,
      onExceed: Function
    },
    data: function data() {
      return {
        mouseover: false,
        reqs: {}
      };
    },
    methods: {
      isImage: function isImage(str) {
        return str.indexOf('image') !== -1;
      },
      handleChange: function handleChange(ev) {
        var files = ev.target.files;
        if (!files) return;
        this.uploadFiles(files);
      },
      uploadFiles: function uploadFiles(files) {
        var _this = this;

        if (this.limit && this.fileList.length + files.length > this.limit) {
          this.onExceed && this.onExceed(files, this.fileList);
          return;
        }

        var postFiles = Array.prototype.slice.call(files);

        if (!this.multiple) {
          postFiles = postFiles.slice(0, 1);
        }

        if (postFiles.length === 0) {
          return;
        }

        postFiles.forEach(function (rawFile) {
          _this.onStart(rawFile);

          if (_this.autoUpload) _this.upload(rawFile);
        });
      },
      upload: function upload(rawFile) {
        var _this2 = this;

        this.$refs.input.value = null;

        if (!this.beforeUpload) {
          return this.post(rawFile);
        }

        var before = this.beforeUpload(rawFile);

        if (before && before.then) {
          before.then(function (processedFile) {
            var fileType = Object.prototype.toString.call(processedFile);

            if (fileType === '[object File]' || fileType === '[object Blob]') {
              if (fileType === '[object Blob]') {
                processedFile = new File([processedFile], rawFile.name, {
                  type: rawFile.type
                });
              }

              for (var p in rawFile) {
                if (rawFile.hasOwnProperty(p)) {
                  processedFile[p] = rawFile[p];
                }
              }

              _this2.post(processedFile);
            } else {
              _this2.post(rawFile);
            }
          }, function () {
            _this2.onRemove(null, rawFile);
          });
        } else if (before !== false) {
          this.post(rawFile);
        } else {
          this.onRemove(null, rawFile);
        }
      },
      abort: function abort(file) {
        var reqs = this.reqs;

        if (file) {
          var uid = file;
          if (file.uid) uid = file.uid;

          if (reqs[uid]) {
            reqs[uid].abort();
          }
        } else {
          Object.keys(reqs).forEach(function (uid) {
            if (reqs[uid]) reqs[uid].abort();
            delete reqs[uid];
          });
        }
      },
      post: function post(rawFile) {
        var _this3 = this;

        var uid = rawFile.uid;
        var options = {
          headers: this.headers,
          withCredentials: this.withCredentials,
          file: rawFile,
          data: this.data,
          filename: this.name,
          action: this.action,
          onProgress: function onProgress(e) {
            _this3.onProgress(e, rawFile);
          },
          onSuccess: function onSuccess(res) {
            _this3.onSuccess(res, rawFile);

            delete _this3.reqs[uid];
          },
          onError: function onError(err) {
            _this3.onError(err, rawFile);

            delete _this3.reqs[uid];
          }
        };
        var req = this.httpRequest(options);
        this.reqs[uid] = req;

        if (req && req.then) {
          req.then(options.onSuccess, options.onError);
        }
      },
      handleClick: function handleClick() {
        if (!this.disabled) {
          this.$refs.input.value = null;
          this.$refs.input.click();
        }
      },
      handleKeydown: function handleKeydown(e) {
        if (e.target !== e.currentTarget) return;

        if (e.keyCode === 13 || e.keyCode === 32) {
          this.handleClick();
        }
      }
    },
    render: function render(h) {
      var handleClick = this.handleClick,
          drag = this.drag,
          name = this.name,
          handleChange = this.handleChange,
          multiple = this.multiple,
          accept = this.accept,
          listType = this.listType,
          uploadFiles = this.uploadFiles,
          disabled = this.disabled,
          handleKeydown = this.handleKeydown;
      var data = {
        "class": {
          'el-upload': true
        },
        on: {
          click: handleClick,
          keydown: handleKeydown
        }
      };
      data["class"]["el-upload--".concat(listType)] = true;
      return h("div", helper([{}, data, {
        "attrs": {
          "tabindex": "0"
        }
      }]), [drag ? h("upload-dragger", {
        "attrs": {
          "disabled": disabled
        },
        "on": {
          "file": uploadFiles
        }
      }, [this.$slots["default"]]) : this.$slots["default"], h("input", {
        "class": "el-upload__input",
        "attrs": {
          "type": "file",
          "name": name,
          "multiple": multiple,
          "accept": accept
        },
        "ref": "input",
        "on": {
          "change": handleChange
        }
      })]);
    }
  };

  /* script */
  var __vue_script__$b = script$b;
  /* template */

  /* style */

  var __vue_inject_styles__$b = undefined;
  /* scoped */

  var __vue_scope_id__$b = undefined;
  /* module identifier */

  var __vue_module_identifier__$b = undefined;
  /* functional template */

  var __vue_is_functional_template__$b = undefined;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$b = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__$b, __vue_script__$b, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, false, undefined, undefined, undefined);

  function noop$4() {}

  var script$c = {
    name: 'ElUpload',
    mixins: [Migrating],
    components: {
      ElProgress: __vue_component__$8,
      UploadList: __vue_component__$9,
      Upload: __vue_component__$b
    },
    provide: function provide() {
      return {
        uploader: this
      };
    },
    inject: {
      elForm: {
        "default": ''
      }
    },
    props: {
      action: {
        type: String,
        required: true
      },
      headers: {
        type: Object,
        "default": function _default() {
          return {};
        }
      },
      data: Object,
      multiple: Boolean,
      name: {
        type: String,
        "default": 'file'
      },
      drag: Boolean,
      dragger: Boolean,
      withCredentials: Boolean,
      showFileList: {
        type: Boolean,
        "default": true
      },
      accept: String,
      type: {
        type: String,
        "default": 'select'
      },
      beforeUpload: Function,
      beforeRemove: Function,
      onRemove: {
        type: Function,
        "default": noop$4
      },
      onChange: {
        type: Function,
        "default": noop$4
      },
      onPreview: {
        type: Function
      },
      onSuccess: {
        type: Function,
        "default": noop$4
      },
      onProgress: {
        type: Function,
        "default": noop$4
      },
      onError: {
        type: Function,
        "default": noop$4
      },
      fileList: {
        type: Array,
        "default": function _default() {
          return [];
        }
      },
      autoUpload: {
        type: Boolean,
        "default": true
      },
      listType: {
        type: String,
        "default": 'text' // text,picture,picture-card

      },
      httpRequest: Function,
      disabled: Boolean,
      limit: Number,
      onExceed: {
        type: Function,
        "default": noop$4
      }
    },
    data: function data() {
      return {
        uploadFiles: [],
        dragOver: false,
        draging: false,
        tempIndex: 1
      };
    },
    computed: {
      uploadDisabled: function uploadDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      }
    },
    watch: {
      listType: function listType(type) {
        if (type === 'picture-card' || type === 'picture') {
          this.uploadFiles = this.uploadFiles.map(function (file) {
            if (!file.url && file.raw) {
              try {
                file.url = URL.createObjectURL(file.raw);
              } catch (err) {
                console.error('[Element Error][Upload]', err);
              }
            }

            return file;
          });
        }
      },
      fileList: {
        immediate: true,
        handler: function handler(fileList) {
          var _this = this;

          this.uploadFiles = fileList.map(function (item) {
            item.uid = item.uid || Date.now() + _this.tempIndex++;
            item.status = item.status || 'success';
            return item;
          });
        }
      }
    },
    methods: {
      handleStart: function handleStart(rawFile) {
        rawFile.uid = Date.now() + this.tempIndex++;
        var file = {
          status: 'ready',
          name: rawFile.name,
          size: rawFile.size,
          percentage: 0,
          uid: rawFile.uid,
          raw: rawFile
        };

        if (this.listType === 'picture-card' || this.listType === 'picture') {
          try {
            file.url = URL.createObjectURL(rawFile);
          } catch (err) {
            console.error('[Element Error][Upload]', err);
            return;
          }
        }

        this.uploadFiles.push(file);
        this.onChange(file, this.uploadFiles);
      },
      handleProgress: function handleProgress(ev, rawFile) {
        var file = this.getFile(rawFile);
        this.onProgress(ev, file, this.uploadFiles);
        file.status = 'uploading';
        file.percentage = ev.percent || 0;
      },
      handleSuccess: function handleSuccess(res, rawFile) {
        var file = this.getFile(rawFile);

        if (file) {
          file.status = 'success';
          file.response = res;
          this.onSuccess(res, file, this.uploadFiles);
          this.onChange(file, this.uploadFiles);
        }
      },
      handleError: function handleError(err, rawFile) {
        var file = this.getFile(rawFile);
        var fileList = this.uploadFiles;
        file.status = 'fail';
        fileList.splice(fileList.indexOf(file), 1);
        this.onError(err, file, this.uploadFiles);
        this.onChange(file, this.uploadFiles);
      },
      handleRemove: function handleRemove(file, raw) {
        var _this2 = this;

        if (raw) {
          file = this.getFile(raw);
        }

        var doRemove = function doRemove() {
          _this2.abort(file);

          var fileList = _this2.uploadFiles;
          fileList.splice(fileList.indexOf(file), 1);

          _this2.onRemove(file, fileList);
        };

        if (!this.beforeRemove) {
          doRemove();
        } else if (typeof this.beforeRemove === 'function') {
          var before = this.beforeRemove(file, this.uploadFiles);

          if (before && before.then) {
            before.then(function () {
              doRemove();
            }, noop$4);
          } else if (before !== false) {
            doRemove();
          }
        }
      },
      getFile: function getFile(rawFile) {
        var fileList = this.uploadFiles;
        var target;
        fileList.every(function (item) {
          target = rawFile.uid === item.uid ? item : null;
          return !target;
        });
        return target;
      },
      abort: function abort(file) {
        this.$refs['upload-inner'].abort(file);
      },
      clearFiles: function clearFiles() {
        this.uploadFiles = [];
      },
      submit: function submit() {
        var _this3 = this;

        this.uploadFiles.filter(function (file) {
          return file.status === 'ready';
        }).forEach(function (file) {
          _this3.$refs['upload-inner'].upload(file.raw);
        });
      },
      getMigratingConfig: function getMigratingConfig() {
        return {
          props: {
            'default-file-list': 'default-file-list is renamed to file-list.',
            'show-upload-list': 'show-upload-list is renamed to show-file-list.',
            'thumbnail-mode': 'thumbnail-mode has been deprecated, you can implement the same effect according to this case: http://element.eleme.io/#/zh-CN/component/upload#yong-hu-tou-xiang-shang-chuan'
          }
        };
      }
    },
    beforeDestroy: function beforeDestroy() {
      this.uploadFiles.forEach(function (file) {
        if (file.url && file.url.indexOf('blob:') === 0) {
          URL.revokeObjectURL(file.url);
        }
      });
    },
    render: function render(h) {
      var _this4 = this;

      var uploadList;

      if (this.showFileList) {
        uploadList = h(__vue_component__$9, {
          "attrs": {
            "disabled": this.uploadDisabled,
            "listType": this.listType,
            "files": this.uploadFiles,
            "handlePreview": this.onPreview
          },
          "on": {
            "remove": this.handleRemove
          }
        }, [function (props) {
          if (_this4.$scopedSlots.file) {
            return _this4.$scopedSlots.file({
              file: props.file
            });
          }
        }]);
      }

      var uploadData = {
        props: {
          type: this.type,
          drag: this.drag,
          action: this.action,
          multiple: this.multiple,
          'before-upload': this.beforeUpload,
          'with-credentials': this.withCredentials,
          headers: this.headers,
          name: this.name,
          data: this.data,
          accept: this.accept,
          fileList: this.uploadFiles,
          autoUpload: this.autoUpload,
          listType: this.listType,
          disabled: this.uploadDisabled,
          limit: this.limit,
          'on-exceed': this.onExceed,
          'on-start': this.handleStart,
          'on-progress': this.handleProgress,
          'on-success': this.handleSuccess,
          'on-error': this.handleError,
          'on-preview': this.onPreview,
          'on-remove': this.handleRemove,
          'http-request': this.httpRequest
        },
        ref: 'upload-inner'
      };
      var trigger = this.$slots.trigger || this.$slots["default"];
      var uploadComponent = h("upload", helper([{}, uploadData]), [trigger]);
      return h("div", [this.listType === 'picture-card' ? uploadList : '', this.$slots.trigger ? [uploadComponent, this.$slots["default"]] : uploadComponent, this.$slots.tip, this.listType !== 'picture-card' ? uploadList : '']);
    }
  };

  /* script */
  var __vue_script__$c = script$c;
  /* template */

  /* style */

  var __vue_inject_styles__$c = undefined;
  /* scoped */

  var __vue_scope_id__$c = undefined;
  /* module identifier */

  var __vue_module_identifier__$c = undefined;
  /* functional template */

  var __vue_is_functional_template__$c = undefined;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$c = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__$c, __vue_script__$c, __vue_scope_id__$c, __vue_is_functional_template__$c, __vue_module_identifier__$c, false, undefined, undefined, undefined);

  /* istanbul ignore next */

  __vue_component__$c.install = function (Vue) {
    Vue.component(__vue_component__$c.name, __vue_component__$c);
  };

  var members$7 = {};
  members$7.name={m:3,d:4,enumerable:true,get:function name(){
  	return this.reactive('name');
  },set:function name(value){
  	this.reactive('name',value);
  }};
  members$7.onMounted={m:3,d:3,value:function onMounted(){
  	var _this = this;
  	setTimeout(function(){
  		_this.reactive('name','=====手动设置不再接收上级的值 66666=====');
  	},1000);
  }};
  members$7.render={m:3,d:3,value:function render(){
  		var createElement = this.createElement.bind(this);
  	return createElement('div',null, [
  			createElement(PersonSkin,{
  				"props":{
  					"name":this.name
  					},
  				"scopedSlots":{
  					"foot":(this.slot('foot',true) || (function(props){return [
  					createElement('div',{
  						"slot":'foot'
  						}, ['====the is PersonSkin child====']),
  					createElement('div',{
  						"slot":'foot'
  						}, ['the scope value:',props.props
  					])
  				]}).bind(this))
  					}
  				}, (this.slot('default') || ['==================                            '])),
  			createElement('div',{
  				"attrs":{
  					"id":"person-root-child"
  					}
  				}, ['Person page']),
  			createElement(__vue_component__$6,null, ['button ']),
  			createElement(__vue_component__$7,{
  				"props":{
  					"type":'primary'
  					}
  				}, ['text link ']),
  			createElement(__vue_component__$c,{
  				"props":{
  					"action":'http://sss.com/upload',
  					"data":{"name":'yejun'},
  					"drag":true
  					}
  				}, (this.slot('trigger') || [
  					createElement('div',{
  						"slot":'trigger'
  						}, ['==========='])
  				]).concat(['Upload                         '
  			]))
  		]);
  }};
  members$7._init={value:function _init(options){
  (function Person(options){
  	Component.prototype._init.call(this,options);
  }).call(this,options);
  }};
  var Person = Component.createComponent({
  	name:'es-Person'
  });
  Class.creator(4,Person,{
  	'id':1,
  	'ns':'',
  	'name':'Person',
  	'inherit':Component,
  	'members':members$7
  }, false);

  var _private$5=Symbol("private");
  function Index(){
  	Object.defineProperty(this,_private$5,{value:{'logo':logo1,'_instance':null}});
  }
  var methods$2 = {};
  methods$2.main={m:3,d:3,value:function main(){
  	const index = new Index();
  	console.log(index[_private$5].logo);
  	var v = new MyView();
  	v.skinClass=MySkin;
  	index.instance.childElements=v.render();
  	index.display();
  }};
  var members$8 = {};
  members$8.logo={m:1,d:1,writable:true,value:logo1};
  members$8.display={m:3,d:3,value:function display(){
  	var _this = this;
  	this.instance.value="深圳";
  	this.instance.mount('#app');
  	setTimeout(function(){
  		const vm = _this.instance;
  	},1000);
  }};
  members$8.router={m:3,d:4,enumerable:true,get:function router(){
  	return new VueRouter$1({"routes":[{"path":"/index","component":Person},{"path":"/test","component":PersonSkin}]});
  }};
  members$8._instance={m:1,d:1,writable:true,value:null};
  members$8.instance={m:3,d:4,enumerable:true,get:function instance(){
  	if(this[_private$5]._instance){
  		return this[_private$5]._instance;
  	}
  	this[_private$5]._instance=new Test({"router":this.router});
  	return this[_private$5]._instance;
  }};
  members$8.testRouterClass={m:3,d:3,value:function testRouterClass(){
  	it("should VueRouter eq Router ",function(){
  		expect(VueRouter).toBe(VueRouter$1);
  	});
  }};
  members$8.test8={m:3,d:3,value:function test8(){
  	var args = Array.prototype.slice.call(arguments,0);

  }};
  members$8.testRouterView={m:3,d:3,value:function testRouterView(){
  	var _this = this;
  	this.instance.mount();
  	it('should router page view',function(){
  		_this.instance.name="标题名称";
  		setTimeout(function(){
  			const vm = _this.instance;
  			expect(vm.$el.textContent).toContain('标题名称');
  			expect(vm.$el.textContent).toContain('深圳');
  			expect(vm.$el.textContent).toContain('点击这里提示');
  			expect(vm.$el.textContent).toContain('测试页面');
  			expect(vm.$el.textContent).toContain('首页面');
  		},100);
  	});
  	it('should router page view',function(done){
  		const vm = _this.instance;
  		vm.$router.push({"path":'index'});
  		setTimeout(function(){
  			expect(vm.$el.textContent).toContain('the is PersonSkin child');
  			expect(vm.$el.textContent).toContain('the scope value:onetwothreefourfive');
  			const el = vm.$el.querySelector('#person-root-child');
  			expect('Person page').toContain(el.textContent);
  			done();
  		},100);
  	});
  }};
  Class.creator(0,Index,{
  	'id':1,
  	'ns':'',
  	'name':'Index',
  	'private':_private$5,
  	'methods':methods$2,
  	'members':members$8
  }, false);
  Index.main();

  return Index;

}());

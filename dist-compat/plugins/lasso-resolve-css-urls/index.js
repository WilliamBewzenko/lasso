let defaultUrlResolver = (() => {
    var _ref = _asyncToGenerator(function* (url, lassoContext) {
        if (url.indexOf('//') !== -1) {
            return url;
        }

        var queryStart = url.indexOf('?');
        var query;
        var target = url;

        if (queryStart !== -1) {
            query = url.substring(queryStart + 1);
            target = url.substring(0, queryStart);
        }

        if (target.charAt(0) === '/' && target.charAt(1) !== '/') {
            target = nodePath.join(lassoContext.getProjectRoot(), target);
        } else if (target.startsWith(REQUIRE_PREFIX)) {
            target = target.substring(REQUIRE_PREFIX.length).trim();

            var from;
            if (lassoContext.dependency) {
                from = lassoContext.dependency.getDir(lassoContext);
            } else {
                from = lassoContext.getProjectRoot();
            }

            var resolved = lassoResolveFrom(from, target);

            if (resolved) {
                target = resolved.path;
            } else {
                var err = new Error('Module not found: ' + target + ' (from: ' + from + ')');
                err.target = target;
                err.from = from;
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
        }

        if (query) {
            // Add back the query string
            target += '?' + query;
        }

        return target;
    });

    return function defaultUrlResolver(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const cssParser = require('raptor-css-parser');
const nodePath = require('path');
const lassoResolveFrom = require('lasso-resolve-from');

const REQUIRE_PREFIX = 'require:';

function replaceUrls(code, lassoContext, urlResolver) {
    return new Promise((resolve, reject) => {
        const lasso = lassoContext.lasso;

        cssParser.replaceUrls(code,

        // the replacer function
        (() => {
            var _ref2 = _asyncToGenerator(function* (url, start, end, callback) {
                try {
                    const resolvedUrl = yield urlResolver(url, lassoContext);
                    const bundledResource = yield lasso.lassoResource(resolvedUrl, { lassoContext });
                    callback(null, bundledResource && bundledResource.url);
                } catch (err) {
                    callback(err);
                }
            });

            return function (_x3, _x4, _x5, _x6) {
                return _ref2.apply(this, arguments);
            };
        })(),

        // when everything is done
        function (err, code) {
            return err ? reject(err) : resolve(code);
        });
    });
}

module.exports = function (lasso, pluginConfig) {
    const urlResolver = pluginConfig.urlResolver || defaultUrlResolver;

    lasso.addTransform({
        contentType: 'css',

        name: module.id,

        // true: The transform function will RECEIVE and RETURN a stream that can be used to read the transformed out
        // false: The transform function will RECEIVE full code and RETURN a value or promise
        stream: false,

        transform(code, lassoContext) {
            return _asyncToGenerator(function* () {
                var dependency = lassoContext.dependency;
                if (dependency && dependency.resolveCssUrlsEnabled === false) {
                    return code;
                }

                return replaceUrls(code, lassoContext, urlResolver);
            })();
        }
    });
};
function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = {
    properties: {
        dependencies: 'array'
    },

    init(lassoContext) {
        return _asyncToGenerator(function* () {})();
    },

    getDependencies(lassoContext) {
        var _this = this;

        return _asyncToGenerator(function* () {
            return _this.dependencies || [];
        })();
    },

    calculateKey() {
        return null; // A just use a unique ID for this dependency
    }
};
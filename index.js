
function makeAnonModule() {
    var configFunctions = [];
    var runFunctions = [];

    function runFuncs(funcs, $injector) {
        for (var i = 0; i < funcs.length; i++) {
            $injector.invoke(funcs[i]);
        }
    }

    anonModule.$inject = ['$injector'];
    function anonModule($injector) {
        runFuncs(configFunctions, $injector);
        return runRun;
    }

    runRun.$inject = ['$injector'];
    function runRun($injector) {
        runFuncs(runFunctions, $injector);
    }

    function config(fn) {
        configFunctions.push(fn);
        return anonModule;
    }

    anonModule.config = function (configFn) {
        return config(configFn);
    };
    anonModule.run = function (runFn) {
        runFunctions.push(runFn);
        return anonModule;
    };

    // Wrappers around $provide
    anonModule.provider = function provider(name, provider) {
        return config(['$provide', function ($provide) {
            $provide.provider(name, provider);
        }]);
    };
    anonModule.factory = function factory(name, providerFunction) {
        return config(['$provide', function ($provide) {
            $provide.factory(name, providerFunction);
        }]);
    };
    anonModule.service = function service(name, constructor) {
        return config(['$provide', function ($provide) {
            $provide.service(name, constructor);
        }]);
    };
    anonModule.value = function value(name, object) {
        return config(['$provide', function ($provide) {
            $provide.value(name, object);
        }]);
    };
    anonModule.constant = function constant(name, object) {
        return config(['$provide', function ($provide) {
            $provide.constant(name, object);
        }]);
    };
    anonModule.decorator = function decorator(name, decorFn) {
        return config(['$provide', function ($provide) {
            $provide.decorator(name, decorFn);
        }]);
    };

    // Wrappers around $animateProvider
    anonModule.animation = function animation(name, animationFactory) {
        return config(['$animateProvider', function ($animateProvider) {
            $animateProvider.register(name, animationFactory);
        }]);
    };

    // Wrappers around $filterProvider
    anonModule.filter = function filter(name, filterFactory) {
        return config(['$filterProvider', function ($filterProvider) {
            $filterProvider.register(name, filterFactory);
        }]);
    };

    // Wrappers around $controllerProvider
    anonModule.controller = function controller(name, constructor) {
        return config(['$controllerProvider', function ($controllerProvider) {
            $controllerProvider.register(name, constructor);
        }]);
    };

    // Wrappers around $compileProvider
    anonModule.directive = function directive(name, directiveFactory) {
        return config(['$compileProvider', function ($compileProvider) {
            $compileProvider.directive(name, directiveFactory);
        }]);
    };
    anonModule.component = function component(name, options) {
        return config(['$compileProvider', function ($compileProvider) {
            $compileProvider.component(name, options);
        }]);
    };

    return anonModule;
}

module.exports = makeAnonModule;

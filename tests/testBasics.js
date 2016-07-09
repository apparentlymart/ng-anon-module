
var angular = require('angular');
var AnonModule = require('../index.js');

function testInvoke(module, fn) {
    var $injector = angular.injector(['ng', module]);
    $injector.invoke(fn);
}

describe('ng-anon-module', function () {

    it('can be empty', function () {
        var mod = AnonModule();
        testInvoke(mod, function () {
            // If we get here at all then we're fine!
        });
    });

    it('runs arbitrary "config" functions', function () {
        var mod = AnonModule();
        var configCalled = false;
        mod.config(function ($injector) {
            configCalled = true;

            // Get something from $injector just to prove that
            // it is the *provider* injector, and thus we've
            // been injected properly.
            var $provide = $injector.get('$provide');
            expect(typeof $provide).toEqual('object');
        });
        testInvoke(mod, function () {
            expect(configCalled).toBe(true);
        });
    });

    it('runs arbitrary "run" functions', function () {
        var mod = AnonModule();
        var runCalled = false;
        mod.run(function ($injector) {
            runCalled = true;

            // Get something from $injector just to prove that
            // it is the *runtime* injector, and thus we've
            // been injected properly.
            var $rootScope = $injector.get('$rootScope');
            expect(typeof $rootScope).toEqual('object');
        });
        testInvoke(mod, function () {
            expect(runCalled).toBe(true);
        });
    });


    describe('$provide wrapper', function () {
        it('registers a provider', function () {
            var mod = AnonModule();
            mod.provider('foo', function ($provide) {
                expect(typeof $provide).toBe('object');

                return {
                    $get: function ($rootScope) {
                        expect(typeof $rootScope).toBe('object');
                        return 'bar';
                    }
                };
            });
            testInvoke(mod, function (foo) {
                expect(foo).toEqual('bar');
            });
        });
        it('registers a factory', function () {
            var mod = AnonModule();
            mod.factory('foo', function ($rootScope) {
                expect(typeof $rootScope).toBe('object');
                return 'bar';
            });
            testInvoke(mod, function (foo) {
                expect(foo).toEqual('bar');
            });
        });
        it('registers a service', function () {
            var mod = AnonModule();
            mod.service('foo', function ($rootScope) {
                expect(typeof $rootScope).toBe('object');
                this.baz = 'bar';
            });
            testInvoke(mod, function (foo) {
                expect(foo.baz).toEqual('bar');
            });
        });
        it('registers a value', function () {
            var mod = AnonModule();
            mod.value('foo', 'bar');
            testInvoke(mod, function (foo) {
                expect(foo).toEqual('bar');
            });
        });
        it('registers a constant', function () {
            var mod = AnonModule();
            mod.constant('foo', 'bar');
            // Since this is a constant, it should be available
            // from the provider injector *and* the runtime injector.
            var configCalled = false;
            mod.config(function (foo) {
                configCalled = true;
                expect(foo).toEqual('bar');
            });
            testInvoke(mod, function (foo) {
                expect(configCalled).toEqual(true);
                expect(foo).toEqual('bar');
            });
        });
        it('registers a decorator', function () {
            var mod = AnonModule();
            mod.decorator('$rootScope', function ($delegate) {
                $delegate.baz = 'bar';
                return $delegate;
            });
            testInvoke(mod, function ($rootScope) {
                expect($rootScope.baz).toEqual('bar');
            });
        });
    });

    describe('$animateProvider wrapper', function () {
        it('registers animations', function () {
            var mod = AnonModule();

            var provider;
            mod.config(function ($animateProvider) {
                spyOn($animateProvider, 'register');
                provider = $animateProvider;
            });

            var testFn = function () {};
            mod.animation('foo', testFn);

            testInvoke(mod, function () {
                expect(provider.register).toHaveBeenCalledWith('foo', testFn);
            });
        });
    });

    describe('$filterProvider wrapper', function () {
        it('registers a filter', function () {
            var mod = AnonModule();
            mod.filter('foo', function ($rootScope) {
                expect(typeof $rootScope).toBe('object');

                return function (input) {
                    return 'foo ' + input;
                };
            });
            testInvoke(mod, function ($filter) {
                var fooFilter = $filter('foo');
                expect(fooFilter('bar')).toBe('foo bar');
            });
        });
    });

    describe('$controllerProvider wrapper', function () {
        it('registers a controller', function () {
            var mod = AnonModule();
            mod.controller('FooCtrl', function ($rootScope, val) {
                expect(typeof $rootScope).toBe('object');

                this.val = val;
            });
            testInvoke(mod, function ($controller) {
                var foo = $controller('FooCtrl', {val: 'bar'});
                expect(foo.val).toBe('bar');
            });
        });
    });

    describe('$compileProvider wrapper', function () {
        it('registers a directive', function () {
            var mod = AnonModule();
            mod.directive('foo', function ($rootScope) {
                expect(typeof $rootScope).toBe('object');

                return {
                    restrict: 'E',
                    template: 'bar',
                };
            });
            testInvoke(mod, function ($compile, $rootScope) {
                var elem = $compile('<foo></foo>')($rootScope);
                expect(elem.text()).toBe('bar');
            });
        });
        it('registers a component', function () {
            var mod = AnonModule();
            mod.component('foo', {
                template: 'bar component',
            });
            testInvoke(mod, function ($compile, $rootScope) {
                var elem = $compile('<foo></foo>')($rootScope);
                expect(elem.text()).toBe('bar component');
            });
        });
    });

});

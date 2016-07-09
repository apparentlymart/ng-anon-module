# ng-anon-module

`ng-anon-module` allows you to create AngularJS modules without placing them
in the global registry of modules.

Anonymous modules are more convenient and natural to use in applications that
are built with webpack or browserify, since they make the return value from
`require(...)` something actually useful and meaningful, and remove the need
to worry about separately managing uniqueness within Angular's own module
namespace.

## How to use

`ng-anon-module` is a library that is intended to be used within a CommonJS
module that provides an AngularJS module. Usually in that case it is being
used at build time within a tool like `webpack`, and so it can be installed
as a development dependency:

```
npm install --save-dev ng-anon-module
```

Then in the CommonJS module where you want to provide an Angular module, you
can do something like this, which we'll call `./example-module.js`:

```js
var mod = require('ng-anon-module')();

// 'mod' has all the same methods as the object returned from angular.module
mod.factory('myService', function () {
    return {
        makeHello: function () {
            return 'hello';
        },
    };
});

module.exports = mod;
```

The app that depends on this module can now use it in a straightforward way:

```js
var angular = require('angular');
var example = require('./example-module.js');

angular.element(document).ready(function () {
    // Bootstrap angular with the whole document, using our example module.
    angular.bootstrap(document, [example]);
});
```

Many third-party AngularJS modules available on npm achieve a similar usage pattern
by exporting just a string containing the *name* of the module as registered in
Angular's registry, but with an anonymous module you don't need to think about
the Angular registry and the risk of naming collisions within it.

## Dependencies on Anonymous Modules

The key thing "lost" when using anonymous modules is Angular's ability to automatically
resolve dependencies between modules: since anonymous modules don't have names, you
can't include them in another module's dependency list.

For example, in normal Angular use your app module might declare a dependency on `ngRoute`:

```js
var app = angular.module('app', ['ngRoute']);

// Now we can just say 'app' and Angular will automatically include the ngRoute module
angular.bootstrap(document, ['app']);
```

With anonymous modules, this must be written like this:

```js
var app = require('ng-anon-module')();

angular.bootstrap(document, ['ngRoute', 'app']);
```

The author finds that in practice Angular's automatic dependency resolver is only
marginally more convenient than just listing out all the necessary modules directly
in `angular.bootstrap`, and in fact listing them out directly may be preferable for
some purposes since in a larger app with many distinct modules it makes the load
order explicit *and* truly isolates a module from its dependencies.

## Publishing AngularJS Modules on NPM

If you wish to build an AngularJS module to share with others on NPM, you can use
`ng-anon-module` to export an anonymous module from your package's "main" module.
For example, if the package.json for a hypothetical `ng-example` package were to
export an anonymous module, it could be used by a webpack-based application in a
similar way to the earlier example in this README:

```js
var angular = require('angular');
var ngExample = require('ng-example'); // third-party dependency
var app = require('./app.js'); // anonymous module for the application itself

angular.element(document).ready(function () {
    angular.bootstrap(document, [ngExample, app]);
});
```

If you're releasing a module to the public, it's likely that you'll want to make
it usable both as a CommonJS module via webpack *and* via the old-fashioned practice
of just referring directly to an opaque JS bundle that registers the module
globally, for those who aren't using webpack or browserify.

One way to achieve this is to use webpack within your library codebase to produce the
opaque JS bundle using a separate entry point that shims the module to register
it in the global Angular module registry. If your main CommonJS module is `./index.js`
as in the above example, then the following `./bundle-shim.js` could be used as
a webpack entry point to wrap it up and bundle it:

```js

var mod = require('./index.js');

var shimMod = angular.module('ngExample', []);
shimMod.config(['$injector', function ($injector) {
    $injector.invoke(mod);
}]);
```

Users that are using isolated script bundles will generally expect to load AngularJS
separately, so you'll want to include something like the following in your webpack
configuration so that `angular` isn't included in your library's own bundle:

```js
module.exports = {
    // ...
    "externals": {
        // expect Angular to already be available at window.angular
        "angular": "angular",
    },
    // ...
}
```

## How It Works

Understanding how it works is not necessary for is usage, but if you are curious
then please read on.

The `angular.bootstrap` function accepts an array containing a mixture of strings
that name modules and functions that directly interact with service providers.
`ng-anon-module` produces the latter: a function that, when called on, calls into
all of the relevant providers to register all of the resources that have been
attached to the module.

Thus `ng-anon-module` is just a helper function for creating a registration function.
Written out manually a registration function might look something like this:

```js
var register = ['$provide', '$compileProvider', function ($provide, $compileProvider) {
    $provide.factory('fooService', function () {
        return { /* service implementation... */ };
    });
    $compileProvider.directive('foo', function () {
        return {
            restrict: 'E',
            template: '<p>hello world</p>',
        };
    });
}];
```

The goal of this module is to make it easier to produce such anonymous configuration
functions, using an interface that matches with the idiom of registering resources
via the module object.

Since the function produced by this module itself uses dependency injection, it does
not directly depend on AngularJS itself. Thus it can be used with any AngularJS
version, as long as that version supports the resources that have been registered
on the anonymous module. It is the caller's responsibility to load and configure
Angular.

## Development

The git repository for this codebase uses npm, along with various dependencies, to
run tests and lint:

* `git clone https://github.com/apparentlymart/ng-anon-module.git`
* `cd ng-anon-module`
* `npm install`
* `npm test`
* `npm run lint`

If you'd like to submit a patch, pull requests are welcome. However, the scope
of this module is intentionally quite small and it is unlikely that new features will
be accepted unless they track against improvements to the underlying AngularJS
module API.

## License

Copyright (c) 2016 Martin Atkins

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

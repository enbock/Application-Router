# Application Router for PWA
[![Testing](https://github.com/enbock/Application-Router/workflows/Testing/badge.svg)](https://github.com/enbock/Application-Router/actions)
[![Publishing](https://github.com/enbock/Application-Router/workflows/Publishing/badge.svg)](https://github.com/enbock/Application-Router/actions)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/enbock/Application-Router/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/enbock/Application-Router/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/enbock/Application-Router/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/enbock/Application-Router/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/enbock/Application-Router/badges/build.png?b=master)](https://scrutinizer-ci.com/g/enbock/Application-Router/build-status/master)

A simple application router for Progressive Web Applications.

The Application Router works exclusively with relative paths. So you always 
able to move the page(on the webserver) without need of recompilation.

Also, the router avoid, that the browser create the history log. If the user 
is touching the back-button(eg. on a smartphone with installed app), then the
application closes.     
In combination with the [Simple-Storage] the router can restore the last opened
page.    
The best result you get by using the [Service Worker].

## Features
* Implemented with dependency injection methodology.
* `Router` component to control the History API.
* `Registry` manage and update a catalog of pages/sites/modules.

## Usage
```typescript
// --> Imagine here an config loader, instead of hard coded data
const mainPage: IPageData = {
  baseUrl: './',
  currentUrl: './',
  name: 'main'
};
const subPage: IPageData = {
  baseUrl: './main/subPage.html',
  currentUrl: './main/subPage.html',
  name: 'mainSubPage'
};
const otherPage: IPageData = {
  baseUrl: './other/',
  currentUrl: './other/',
  name: 'otherModule'
};

const adapter: ListenerAdapter<IPageData | null> = new ListenerAdapter<IPageData | null>();
const currentPage: IObserver<IPageData | null> = new Observer<IPageData | null>(mainPage, adapter);
const router: Router = new Router(currentPage, window.history);
router.initialize(); // Set browser URL to http://.../

const registry: Registry = new Registry(currentPage);
registry.attachAdapter(adapter);

// --> the registration could also be triggered via an config loader
registry.registerPage(mainPage);
registry.registerPage(subPage);
registry.registerPage(otherPage);

registry.getPages().forEach(
  function (page: IPageData): void {
    console.log('The page "' + page.name + '" is currently to reach via:', page.currentUrl);
  }
);
/**
 * Output:
 * -------
 *
 * The page "main" is currently to reach via: ./
 * The page "mainSubPage" is currently to reach via: ./main/subPage.html
 * The page "otherModule" is currently to reach via: ./other/
 */

router.changePage(subPage);

setTimeout( // ListenerAdapter runs callback in separated threads/frames
  function callOnLaterFrame(): void {
    registry.getPages().forEach(
      function (page: IPageData): void {
        console.log('The page "' + page.name + '" is currently to reach via:', page.currentUrl);
      }
    );
  },
  100
);
/**
 * Output:
 * -------
 *
 * The page "main" is currently to reach via: ../
 * The page "mainSubPage" is currently to reach via: ./subPage.html
 * The page "otherModule" is currently to reach via: ../other/
 */
```

#### Using [Simple-Storage] to save current/last page
```typescript
const storage: DataStorage = new DataStorage('router', window.localStorage);
const adapter: ListenerAdapter<IPageData | null> = new ListenerAdapter<IPageData | null>();
const currentPage: IObserver<IPageData | null> = new Observer<IPageData | null>(
  storage.loadData('lastPage', mainPage), // load last page from storage (mainPage if store empty)
  storage.attach<IPageData | null>('lastPage', adapter) // attach storage as middle ware
);

const registry: Registry = new Registry(currentPage);
registry.attachAdapter(adapter);
// register pages here (eg. via an config loader)

const router: Router = new Router(currentPage, window.history);
router.initialize(); // Set browser URL to last page or mainPage
```
*Tip:* 
> Using  webserver redirect rules to redirect always to the root-page. Then you
> can reload the browser(or app). 

## Testing
### Using this library in our project
This library is providing in [ECMAScript® 2020] language. When you use **jest**,
you get this error by using my library:
```text
  Details:
  
  <YOUR_PATH>\node_modules\@enbock\state-value-observer\ListenerAdapter.js:1
  export default class ListenerAdapter {
  ^^^^^^
  
  SyntaxError: Unexpected token 'export'
      at compileFunction (vm.js:341:18)
```

See more: https://jestjs.io/docs/en/tutorial-react-native#transformignorepatterns-customization

#### Reason and solution
Jest running internally on **ES5**, that does not know the ES6-imports.

##### Force converting ES6+ Libraries
To solve this, you have to *exclude* all my libraries from the *exclusion-list*:
```
"transformIgnorePatterns": [
  "/node_modules/(?!(@enbock)/)"
]
```

##### Let babel "learn" ES6+
`babel.config.js`
```js
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript'
  ]
};
```
See more: https://github.com/facebook/jest#using-typescript

### Run tests
```shell script
yarn test
```

## Building
```shell script
yarn build
```

[ECMAScript® 2020]:https://tc39.es/ecma262/
[Service Worker]:(https://developers.google.com/web/fundamentals/primers/service-workers)
[Simple-Storage]:(https://github.com/enbock/Simple-Storage)

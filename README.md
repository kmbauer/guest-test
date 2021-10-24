# Is Guest Loader issue

Sample repo to demonstrate loader issue reported in https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07EE00000GDOJYYA5/view

In this repo I have generated a static site than tweaked the output to try to demonstrate the issue reported in W-10029063

In general I have created an app that references the module example/guest using the specifiers ('example/guest' and 'example/guest/v/1').

The static server only knows work to respond to the the URL for this module via 'http://localhost:5000/1/module/amd/1/l/en-US/mi/example%2Fguest/example_guest.js'

I have updated the import map in the root html doc to resolve the specifier 'example/guest' to this URL.

I have also added a loader hook that will resolve the specifier 'example/guest/v/1' to 'example/guest'

In the root app module I do 2 dynamic imports...

```javascript
const {
    default: guestName
} = await _0_5_6.load('example/guest/v/0_0_1');
this.whoIsGuest = guestName;
```

and

```javascript
const {
    default: guestName
} = await _0_5_6.load('example/guestProxy/v/0_0_1');
this.whoIsTheProxy = guestName;
```

example/guestProxy/v/0_0_1 has a static dependency on the un-versioned specifier example/guest

This results in the unexpected error of...

``` javascript
lwr_loaderLegacy.js:27 Uncaught (in promise) Error: LWR3006: Failed to load dependency: example/guest
    at VM232 lwr_loaderLegacy.js:750
    at async Promise.all (:5000/index 1)
    at async ModuleRegistry.evaluateModule (VM232 lwr_loaderLegacy.js:741)
    at async getProxy (example_app.js:25)
```

To run the app run...

``` shell
yarn install
yarn start:static
```



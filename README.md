# ember-geoservice

This addon is a go-to solution for integrating HTML5 Geolocation API into your Ember.js web app. Forked from https://github.com/igorpreston/ember-cli-geo but updated and maintained. Thanks to  [@igorpreston](https://github.com/igorpreston) for the code base to this addon.
It is production-ready and backwards compatible.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-geoservice
```

## Usage
#### getLocation()
`getLocation()` gets user location from the browser and writes its coordinates to `currentLocation` tracked property on the service. Accepts __geoOptions__ as an argument. Returns an Promise which is either resolved with __geoObject__ containing all data about user location or is rejected with __reason__ which explains why geolocation failed.
It is used like this:
```js
this.geolocation.getLocation().then(function(geoObject) {
  // do anything with geoObject here
  // you can also access currentLocation property and manipulate its data however you like
});
```
It corresponds to _getCurrentPosition() in HTML5 Geolocation API_. Learn more at [getCurentPosition() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
It emits an event `geolocationSuccess` with an object describing the geolocation when the position is available. If it fails, it emits an event `geolocationFail` with a reason.
#### trackLocation()
`trackLocation()` gets user location and setups a watcher which observes any changes occuring to user location. It then constantly updates `currentLocation` with the most recent location coordinates.

It accepts __geoOptions__ as an argument. Returns an Promise which is either resolved with __geoObject__ containing all data about user location or is rejected with __reason__ which explains why geolocation failed.
It accepts an optional __callback__ function, that is called whenever the position is updated.
It emits an event `geolocationSuccess` with an object describing the geolocation whenever a new position is available. If it fails, it emits an event `geolocationFail` with a reason.

It is used like this:
```js
this.geolocation.trackLocation().then(function(geoObject) {
  // do anything with geoObject here
  // currentLocation is constantly updated if user location is changed
});
// or
this.geolocation.trackLocation(null, (geoObject) => { /* will be called with new positiond */ })
// or
const service = this.geolocation;
service.on('geolocationSuccess', (geoObject) => { { /* will be called with new position */);
```
It corresponds to _watchPosition() in HTML5 Geolocation API_. Learn more at [watchPosition() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition).
#### stopTracking
`stopTracking()` stops the app from continuously updating the user location.

It accepts an optional boolean parameter that clears `currentLocation` if it's true.

It is used like this:
```js
this.geolocation.stopTracking(true);
```
It corresponds to _watchPosition() in HTML5 Geolocation API_. Learn more at [clearWatch() on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/clearWatch).
#### currentLocation
`currentLocation` is a tracked property of geolocation service which stores the __array__ of user location coordinates in the format of __[lat, lon]__.
It is used like this:
 ```js
this.geolocation.currentLocation;
```
#### geoObject
`geoObject` is an object which contains all data about user location. Both `getLocation()` and `trackLocation()` promises are resolved with it. It looks like this:
```js
{
  coords: {
    accuracy: 100,
    altitude: 0,
    altitudeAccuracy: 0,
    heading: NaN,
    latitude: 37.789,
    longitude: -122.412,
    speed: NaN
  },
  timestamp: 1435861233751
}
```
It corresponds to _Position object in HTML5 Geolocation API_. Learn more at [Position object on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Position).
#### reason
`reason` is an error object which contains data about why geolocation has failed. Both `getLocation()` and `trackLocation()` promises are rejected with it.
It corresponds to _PositionError object in HTML5 Geolocation API_. Learn more at [PositionError object on MDN](https://developer.mozilla.org/en-US/docs/Web/API/PositionError).
#### geoOptions
`geoOptions` is an optional object that can be passed to both `getLocation()` and `trackLocation()` to customize geolocation query. If you didn't pass it to functions, then next defaults will be automatically passed:
```js
{
  enableHighAccuracy: false,
  timeout: Infinity,
  maximumAge: 0
}
```
It corresponds to _PositionOptions object in HMTL5 Geolocation API_. Learn more at [PositionOptions object on MDN](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions).
### Usage Examples

#### Setup geolocation service
In order to use geolocation inside of your _Ember.Route_ you should directly inject it to the one:
```js
export default class GeoRoute extends Route {
  @service geolocation;
};
```

#### Get user location and display it in your component template
You need to implement a custom action which will call the geolocation service.
In your component:
```js
// app/components/geolocation-test.js

export default class GeolocationTest extends Component {
  @service geolocation;
  
  @action getUserLocation() {
    this.showLoader = true;
    this.geolocation.getLocation({timeout:10000}).then(
      () => {
        this.showLoader = false;
      },
      (reason) => {
        this.showLoader = false;
        // eslint-disable-next-line no-console
        console.error('Geolocation failed because ' + reason);
      }
    );
  }
}

```

In your template:
```js
// app/components/geolocation-test.hbs

<button type="button" {{on "click" this.getUserLocation}}>Geolocate me!</button>
{{#if this.geolocation.currentLocation}}
  {{this.geolocation.currentLocation}}
{{/if}}
```

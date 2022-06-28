import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default class Geolocation extends Service.extend(Evented) {
  @tracked currentLocation = null;
  trackingCallback = null;
  @tracked watcherId = null;

  get geolocator () {
    return window.navigator.geolocation;
  }

  _handleNewPosition(geoObject) {
    if (geoObject) {
      this.currentLocation = [
        geoObject.coords.latitude,
        geoObject.coords.longitude,
      ];
      const callback = this.trackingCallback;
      if (callback) {
        callback(geoObject);
      }
      this.trigger('geolocationSuccess', geoObject);
    } else {
      this.currentLocation = null;
    }
  }

  getLocation(geoOptions) {
    return new Promise((resolve, reject) => {
      this.geolocator.getCurrentPosition(
        (geoObject) => {
          this._handleNewPosition(geoObject);
          resolve(geoObject);
        },
        (reason) => {
          this.trigger('geolocationFail', reason);
          reject(reason);
        },
        geoOptions
      );
    });
  }

  trackLocation(geoOptions, callback) {
    let watcherId = this.watcherId;

    assert(
      watcherId == null,
      'Warning: `trackLocation` was called but a tracker is already set'
    );

    if (callback != null) {
      assert(typeof callback === 'function', 'callback should be a function');
    }
    this.trackingCallback = callback;

    return new Promise((resolve, reject) => {
      watcherId = this.geolocator.watchPosition(
        (geoObject) => {
          // make sure this logic is run only once
          if (resolve) {
            this.watcherId = watcherId;
            resolve(geoObject);
            resolve = null;
          }
          this._handleNewPosition(geoObject);
        },
        (reason) => {
          this.trigger('geolocationFail', reason);
          reject(reason);
        },
        geoOptions
      );
    });
  }

  stopTracking(clearLocation) {
    let watcher = this.watcherId;
    assert(
      watcher != null,
      "Warning: `stopTracking` was called but location isn't tracked"
    );
    this.geolocator.clearWatch(watcher);
    this.watcherId = null;
    if (clearLocation === true) {
      this._handleNewPosition(null);
    }
  }
};

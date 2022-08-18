import sinon from 'sinon';
import { expect } from 'chai';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | GeolocationService', function(hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    let service = this.owner.lookup('service:geolocation');
    assert.ok(service);
  });

  module('checks if it', function (hooks) {
    test('responds to `geolocation`', function (assert) {
      assert.expect(0);
      let service = this.owner.lookup('service:geolocation');
      expect(service).itself.to.respondTo('getLocation');
    });

    test('responds to `trackLocation`', function (assert) {
      assert.expect(0);
      let service = this.owner.lookup('service:geolocation');
      expect(service).itself.to.respondTo('trackLocation');
    });

    test('has property `currentLocation`', function (assert) {
      assert.expect(0);
      let service = this.owner.lookup('service:geolocation');
      expect(service).to.have.property('currentLocation');
    });

    test('responds to `stopTracking`', function (assert) {
      assert.expect(0);
      let service = this.owner.lookup('service:geolocation');
      expect(service).to.have.property('stopTracking');
    });
  });

  module('determines geolocation and', function (hooks) {
    const geoObject = {
      coords: {
        accuracy: 100,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: NaN,
        latitude: 37.789,
        longitude: -122.412,
        speed: NaN,
      },
      timestamp: 1435861233751,
    };
    let sandbox;

    hooks.beforeEach(function () {
      sandbox = sinon.sandbox.create();

      sandbox
        .stub(window.navigator.geolocation, 'getCurrentPosition')
        .callsFake((fn) => {
          fn.call(null, geoObject);
        });
    });

    hooks.afterEach(function () {
      sandbox.restore();
    });

    test('gets user geolocation from window.navigator', function (assert) {
      const done = assert.async();
      assert.expect(0);
      const service = this.owner.lookup('service:geolocation');

      service.getLocation().then(function (result) {
        expect(result).to.equal(geoObject);
        done();
      });
    });

    test("sets user's current location in the `currentLocation` property", function (assert) {
      const done = assert.async();
      assert.expect(0);
      const service = this.owner.lookup('service:geolocation');

      expect(service).to.have.property('currentLocation').that.is.null;
      service.getLocation().then(function () {
        expect(service)
          .to.have.property('currentLocation')
          .that.is.an('array').and.not.null;
        done();
      });
    });

    test("#startTracking receives a callback function that's called whenever a new position is tracked", function (assert) {
      assert.expect(0);
      const service = this.owner.lookup('service:geolocation');

      sandbox
        .stub(window.navigator.geolocation, 'watchPosition')
        .callsFake((fn) => {
          fn.call(null, geoObject);
          fn.call(null, geoObject);
          fn.call(null, geoObject);
        });

      let spy = sinon.spy();

      service.trackLocation(null, spy);

      expect(spy.callCount).to.equal(
        3,
        'callback is not called when new position is available'
      );
    });

    test('#stopTracking removes tracker from browser loop', function (assert) {
      assert.expect(0);
      const service = this.owner.lookup('service:geolocation');
      let spy = sandbox.spy(window.navigator.geolocation, 'clearWatch');

      service.stopTracking();

      expect(spy.calledOnce).to.equal(
        true,
        '#clearWatch should be called on browser geolocation'
      );
    });

    test('#stopTracking can clear currentLocation', function (assert) {
      assert.expect(0);
      const service = this.owner.lookup('service:geolocation');
      let spy = sandbox.spy(window.navigator.geolocation, 'clearWatch');

      service.stopTracking(true);

      expect(spy.calledOnce).to.equal(
        true,
        '#clearWatch should be called on browser geolocation'
      );
      expect(service.get('currentLocation')).to.equal(
        null,
        'currentLocation should be cleared'
      );
    });

    test('fails if the browser cannot provide location', function (assert) {
      const done = assert.async();
      assert.expect(0);
      const service = this.owner.lookup('service:geolocation');
      let successCbCalled = false;

      sandbox.restore();
      sandbox
        .stub(window.navigator.geolocation, 'getCurrentPosition')
        .callsFake((success, fail) => {
          // PositionError is a number `short` representing the error
          fail.call(null, 1);
        });

      service.getLocation().then(
        () => {
          successCbCalled = true;
        },
        (result) => {
          expect(service).to.have.property('currentLocation').that.is.null;
          expect(result).to.equal(
            1,
            "the error callback didn't receive the correct param"
          );
          expect(successCbCalled).to.not.equal(
            true,
            "succcess callback shouldn't have been called"
          );
          done();
        }
      );
    });

    test("emits an event `geolocationSuccess` with the position when it's fetched", function (assert) {
      const done = assert.async();
      assert.expect(0);
      const service = this.owner.lookup('service:geolocation');

      service.on('geolocationSuccess', (result) => {
        expect(result).to.equal(
          geoObject,
          'results should be sent to the listener'
        );
        done();
      });

      service.getLocation();
    });
    
    test('emits an event `geolocationFail` with the error when it fails', function (assert) {
      const done = assert.async();
      const service = this.owner.lookup('service:geolocation');

      sandbox.restore();
      sandbox
        .stub(window.navigator.geolocation, 'getCurrentPosition')
        .callsFake((success, fail) => {
          // PositionError is a number `short` representing the error
          fail.call(null, 1);
        });

      const callback = (result) => {
        assert.equal(result, 1);
        service.off('geolocationFail', callback);
        done();
      };

      service.on('geolocationFail', callback);

      service.getLocation({ timeout: 1000 }).catch(e => {
        if (e === 1) {
          return true
        }
        throw e;
      });
    });
  });
});

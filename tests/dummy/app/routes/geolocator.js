import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  geolocation: service(),

  actions: {
    getUserLocation() {
      this.geolocation.getLocation().then(
        () => {
          let currentLocation = this.geolocation.get('currentLocation');
          this.controllerFor('geolocator').set('userLocation', currentLocation);
        },
        (reason) => {
          // eslint-disable-next-line no-console
          console.error('Geolocation failed because ' + reason);
        }
      );
    },

    trackUserLocation() {
      this.geolocation.trackLocation().then(
        () => {
          let currentLocation = this.geolocation.get('currentLocation');
          this.controllerFor('geolocator').set('userLocation', currentLocation);
        },
        (reason) => {
          // eslint-disable-next-line no-console
          console.error('Geolocation failed because ' + reason);
        }
      );
    },
  },
});

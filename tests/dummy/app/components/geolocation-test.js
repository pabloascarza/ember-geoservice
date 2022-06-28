import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class GeolocationTest extends Component {
  @service geolocation;
  @tracked userLocation = null;
  @tracked showLoader = false;

  @action getUserLocation() {
    this.showLoader = true;
    this.geolocation.getLocation({timeout:10000}).then(
      () => {
        this.showLoader = false;
        let currentLocation = this.geolocation.get('currentLocation');
        this.userLocation = currentLocation;
      },
      (reason) => {
        this.showLoader = false;
        // eslint-disable-next-line no-console
        console.error('Geolocation failed because ' + reason);
      }
    );
  }

  @action trackUserLocation() {
    this.showLoader = true;
    this.geolocation.trackLocation({timeout:10000}, this.trackedCallback).then(
      () => {
        this.showLoader = false;
        let currentLocation = this.geolocation.get('currentLocation');
        this.userLocation = currentLocation;
      },
      (reason) => {
        this.showLoader = false;
        // eslint-disable-next-line no-console
        console.error('Geolocation failed because ' + reason);
      }
    );
  }

  trackedCallback () {
    window.alert("Being tracked");
  }
}
/* eslint-disable */
import jsonp from '@/api/services/http/jsonp'

const baseUrl = "https://apis.map.qq.com/ws/",
  KEY = "OVKBZ-BOZ3G-WTVQE-IPVR6-HVVOF-JPFYI";

class qqMap {
  
  geocoder(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new qq.maps.Geocoder({
        complete: function (result) {
          if (result && result.detail && result.detail.location) {
            resolve(result.detail.location);
          } else {
            console.log(result.detail);
            reject(result.detail);
          }
        },
      });
      geocoder.getLocation(address);
    })
  }
  async getDistance(from,to) {
    const fromLatLng = `${from.lat},${from.lng}`;
    const toLatLng = `${to.lat},${to.lng}`;
    return new Promise((resolve, reject) => {
      jsonp(`${baseUrl}distance/v1`, {
        key: KEY,
        from: fromLatLng,
        to: toLatLng,
        output: "jsonp"
      }, (err, data) => {
        if (!err) {
          const {
            result
          } = data
          if (result) {
            const distance = result.elements[0].distance / 1000;
            resolve(distance);
          } else {
            resolve(false);
          }
        } else {
          reject(err)
        }
      })
    })
  }
}

const qqMaps = new qqMap()
export default qqMaps

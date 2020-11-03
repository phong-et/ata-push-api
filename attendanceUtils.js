const fetch = require('node-fetch'),
  log = console.log,
  hostPushAPI =
    process.env.NODE_ENV === 'production'
      ? 'https://ata-push-api.herokuapp.com'
      : 'http://localhost:8888',
  hostAta =
    process.env.NODE_ENV === 'production'
      ? 'https://atacore.azurewebsites.net'
      : 'http://localhost:5000';

function notify(type) {
  let url =
      hostPushAPI +
      '/subscription/notify-all?' +
      new URLSearchParams({
        title: `HAVE YOU CHECKED ${type.toUpperCase()} YET ?`,
        text: `Please click here go to check${type.toLowerCase()} page`,
      }),
    options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  fetch(url, options).then((response) => {
    log(`${response.url}: ${response.status}(${response.statusText})`);
  });
}

async function fetchOfficeSettings() {
  // return JSON.parse(
  //   await (await fetch(hostAta + '/api/officesettings')).text()
  // );
  return {
    lazyLoader: {},
    id: '32274e29-84cb-403d-9e11-08d8354337cc',
    ipAddress: '42.119.146.86',
    latitude: 10.743219786522866,
    longitude: 106.70158412307501,
    authRange: 150,
    startTime: '2000-01-01T02:30:00+00:00',
    endTime: '2000-01-01T18:00:00+07:00',
  };
}

function formatMH(mhNumber) {
  return mhNumber >= 10 ? mhNumber : '0' + mhNumber;
}
module.exports = {
  notify,
  fetchOfficeSettings,
  formatMH,
};

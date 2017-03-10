import Ember from 'ember';
import DeviseAuthenticator from 'ember-simple-auth/authenticators/devise';

const { RSVP: { Promise }, isEmpty, getProperties, run, get } = Ember;

export default DeviseAuthenticator.extend({
  loginEndpoint: '/api/auth/sign_in',
  logoutEndpoint: '/api/auth/sign_out',

  identificationAttributeName: 'email',

  authenticate(identification, password) {
    return new Promise((resolve, reject) => {
      let { identificationAttributeName } = getProperties(this, 'identificationAttributeName');
      let data = { password };
      data[identificationAttributeName] = identification;

      let requestOptions = { url: get(this, 'loginEndpoint') };

      this.makeRequest(data, requestOptions).then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            let data = {
              account: json,
              accessToken: response.headers.get('access-token'),
              expiry: response.headers.get('expiry'),
              tokenType: response.headers.get('token-type'),
              uid: response.headers.get('uid'),
              client: response.headers.get('client')
            };

            if (this._validate(data)) {
              run(null, resolve, result);
            } else {
              run(null, reject, 'Check that server response header includes data token and valid.');
            }
          });
        } else {
          response.json().then((json) => run(null, reject, json));
        }
      }).catch((error) => run(null, reject, error));
    });
  },

  invalidate(data) {
    return new Promise((resolve, reject) => {
      let headers = {
        'access-token': data.accessToken,
        'expiry': data.expiry,
        'token-type': data.tokenType,
        'uid': data.uid,
        'client': data.client
      };

      let requestOptions = {
        url: get(this, 'logoutEndpoint'),
        type: 'DELETE',
        headers
      };

      this.makeRequest({}, requestOptions).then((response) => {
        response.json().then((json) => {
          if (response.ok) {
            run(null, resolve, json);
          } else {
            run(null, reject, json);
          }
        });
      }).catch((error) => run(null, reject, error));
    });
  },

  _validate(data) {
    let now = (new Date()).getTime();

    return !isEmpty(data.accessToken) && !isEmpty(data.expiry) && (data.expiry * 1000 > now) &&
      !isEmpty(data.tokenType) && !isEmpty(data.uid) && !isEmpty(data.client);
  }
});

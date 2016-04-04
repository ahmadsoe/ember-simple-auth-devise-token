import Ember from 'ember';
import DeviseAuthenticator from 'ember-simple-auth/authenticators/devise';

const { RSVP: { Promise }, isEmpty, getProperties, run, get } = Ember;

export default DeviseAuthenticator.extend({
  loginEndpoint: '/api/auth/sign_in',
  logoutEndpoint: '/api/auth/sign_out',

  identificationAttributeName: 'email',

  restore(data) {
    let now = (new Date()).getTime();

    if (!isEmpty(data.accessToken) && !isEmpty(data.expiry) && (data.expiry * 1000 > now) &&
        !isEmpty(data.tokenType) && !isEmpty(data.uid) && !isEmpty(data.client)) {
      return Promise.resolve(data);
    } else {
      return Promise.reject();
    }
  },

  authenticate(identification, password) {
    return new Promise((resolve, reject) => {
      let { identificationAttributeName } = getProperties(this, 'identificationAttributeName');
      let data = { password };
      data[identificationAttributeName] = identification;

      let requestOptions = { url: get(this, 'loginEndpoint') };

      return this.makeRequest(data, requestOptions).then((response, status, xhr) => {
        let result = {
          accessToken: xhr.getResponseHeader('access-token'),
          expiry: xhr.getResponseHeader('expiry'),
          tokenType: xhr.getResponseHeader('token-type'),
          uid: xhr.getResponseHeader('uid'),
          client: xhr.getResponseHeader('client')
        };

        run(null, resolve, result);
      }, (xhr) => {
        run(null, reject, xhr.responseJSON || xhr.responseText);
      });
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

      return this.makeRequest({}, requestOptions).then(
        (response) => run(null, resolve, response),
        (xhr) => run(null, reject, xhr.responseJSON || xhr.responseText)
      );
    });
  }
});

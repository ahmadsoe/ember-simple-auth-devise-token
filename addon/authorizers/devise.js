import Ember from 'ember';
import DeviseAuthorizer from 'ember-simple-auth/authorizers/devise';

const { isEmpty } = Ember;

export default DeviseAuthorizer.extend({
  authorize(data, block) {
    let now = (new Date()).getTime();

    if (!isEmpty(data.accessToken) && !isEmpty(data.expiry) && (data.expiry * 1000 > now) &&
        !isEmpty(data.tokenType) && !isEmpty(data.uid) && !isEmpty(data.client)) {
      block('access-token', data.accessToken);
      block('expiry', data.expiry);
      block('token-type', data.tokenType);
      block('uid', data.uid);
      block('client', data.client);
    }
  }
});

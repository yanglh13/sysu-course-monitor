/**
 * 发送微信通知
 */
const config = require('../config');
let promise = Promise.resolve();

if (config.wechatInform) {
  const wi = require('wechat-inform')(config);
  module.exports = async (status, message) => {
    promise = promise.then(() => wi.send({
      data: {
        status: {
          value: status,
          color: '#337ab7'
        },
        message: {
          value: message
        }
      }
    }));
    return promise;
  };
} else {
  module.exports = () => {};
}

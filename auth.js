const CryptoJS = require('crypto-js'),
  log = console.log,
  key = require('./config.json')[process.env.NODE_ENV || 'development'][
    'keyPushAPIToken'
  ],
  hasNotExpired = (token) => {
    let decryptedToken = JSON.parse(
      CryptoJS.AES.decrypt(token, key).toString(CryptoJS.enc.Utf8)
    );
    return (
      new Date().getTime() - new Date(decryptedToken.expiredTime).getTime() <= 0
    );
  };
module.exports = async (req, res, next) => {
  try {
    log(req.path);
    if (req.path.indexOf('/api-docs') > -1) next();
    else if (req.path.indexOf('/subscription/create') > -1) next();
    else {
      const { authorization } = req.headers;
      if (!authorization) {
        res.send({
          success: false,
          message: 'You must send an Authorization header',
        });
        return;
      }

      const [authType, token] = authorization.trim().split(' ');
      if (authType !== 'Bearer') {
        res.send({ success: false, message: 'Expected a Bearer token' });
        return;
      }

      const isTokenAvailable = hasNotExpired(token);
      if (!isTokenAvailable) {
        res.send({ success: false, message: 'Token has expirated' });
        return;
      }
      next();
    }
  } catch (error) {
    next(error.message);
  }
};

const CryptoJS = require('crypto-js'),
  log = console.log,
  key = require('./config.json')[process.env.NODE_ENV || 'development'][
    'keyPushAPIToken'
  ];

// Encrypt
let expiratedDay = process.argv[2] || 365;
let expiredTime = expiratedDay * 24 * 3600 * 1000; // 0.365*24*3600*1000
let token = CryptoJS.AES.encrypt(
  JSON.stringify({ expiredTime: new Date().getTime() + expiredTime }),
  key
).toString();

// Decrypt
let bytes = CryptoJS.AES.decrypt(token, key);
let decryptedToken = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
log('Expired day number: %s days', expiratedDay);
log('Token: Bearer %s', token);
log('Decrypted Token:%s', decryptedToken);
log('Expired Date :%s', new Date(decryptedToken.expiredTime).toLocaleString());
log('------- check token whether has expired yet -------');
setTimeout(() => {
  let d1 = new Date().getTime(),
    d2 = new Date(decryptedToken.expiredTime).getTime();
  log('d1 - d2: %s miliseconds', d1 - d2);
  log('==> %s', d1 - d2 <= 0 ? 'Token is available' : 'Token was expired');
}, 2000);

const CryptoJS = require('crypto-js'),
  log = console.log,
  key = require('./config.json')[process.env.NODE_ENV || 'development'][
    'keyPushAPIToken'
  ];

// Encrypt
let expiredTime = 60 * 1000; // 0.365*24*3600*1000
let ciphertext = CryptoJS.AES.encrypt(
  JSON.stringify({ expiredDate: new Date().getTime() + expiredTime }),
  key
).toString();

// Decrypt
let bytes = CryptoJS.AES.decrypt(ciphertext, key);
let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
log('Token: Bearer %s', ciphertext);
log('Decrypted Token:%s', decryptedData); // [{id: 1}, {id: 2}]
log('------- check token whether has expired yet -------');
setTimeout(() => {
  let d1 = new Date().getTime(),
    d2 = new Date(decryptedData.expiredDate).getTime();
  log('d1 - d2: %s miliseconds', d1 - d2);
  log('==> %s', d1 - d2 <= 0 ? 'Token is available' : 'Token was expired');
}, 2000);

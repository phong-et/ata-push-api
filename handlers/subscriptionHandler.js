const env = process.env.NODE_ENV || 'development',
  config = require('../config.json')[env],
  webpush = require('web-push'),
  log = console.log,
  crypto = require('crypto'),
  fetch = require('node-fetch');

global.subscriptions = {};
const vapidKeys = {
  privateKey: 'bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU',
  publicKey:
    'BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8',
};

webpush.setVapidDetails(
  'mailto:phillip7.et@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function fetchAllSubscriptionsFromDb(cfg) {
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + cfg.tokenAtaCoreForPushServiceUserRole,
    },
  };
  let url =
    cfg.hostAta + '/api/admin/AttendanceNotificationService/subscription/list';
  return await fetch(url, options)
    .then(async (response) => {
      log(`${response.url}: ${response.status}(${response.statusText})`);
      let message = '';
      switch (response.status) {
        case 401:
          return {
            success: false,
            message: ' Access token is missing or invalid',
          };
        case 500:
          return { success: false, message: response.statusText + message };
        case 200:
          let subscriptions = await response.json();
          return { success: true, subscriptions: subscriptions };
        default:
          return {
            success: false,
            message: response.url + ' ' + response.statusText,
          };
      }
    })
    .catch((error) => {
      log(error.message);
      return { success: false, message: error.message };
    });
}

function createHash(input) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(Buffer.from(input));
  return md5sum.digest('hex');
}

function handlePushNotificationSubscription(req, res) {
  const subscriptionRequest = req.body;
  const susbscriptionId = createHash(JSON.stringify(subscriptionRequest));
  global.subscriptions[susbscriptionId] = subscriptionRequest;
  res.status(201).json({ id: susbscriptionId });
}

async function pushSubscription(req, res) {
  const subscriptionId = req.params.id.trim();
  const pushSubscription = global.subscriptions[subscriptionId];
  let success = true,
    message = '';
  await webpush
    .sendNotification(
      pushSubscription,
      JSON.stringify({
        title: req.body['title'] || 'TESTING TITLE ?',
        text: req.body['text'] || 'Testing body',
        image: config.backgroundPopupNotification,
        url: req.body['url'] || '/testing',
      })
    )
    .catch((err) => {
      success = false;
      message = err.body;
      log(err);
    });
  res.send({ success, message });
}
async function sendNotification(subscription, notificationData) {
  notificationData = {
    title: notificationData.title || 'HAVE YOU JOINED ATTENDANCE YET ?',
    text: notificationData.text || 'Please click here go to attendance page',
    image: config.backgroundPopupNotification,
    url: notificationData.url || '/record-attendance',
  };
  let success = true;
  await webpush
    .sendNotification(subscription, JSON.stringify(notificationData))
    .catch((err) => {
      log(err);
      success = false;
    });
  return success;
}
async function pushSubscriptions(req, res) {
  try {
    log('notify all subscriptions');
    let notificationData = {
      title: req.body['title'],
      text: req.body['text'],
      image: req.body['image'],
      tag: req.body['tag'],
      url: req.body['url'],
    };
    let notifiedSubscriptions = { success: [], failed: [] };
    let subscriptionIds = req.params.ids;
    if (Object.keys(global.subscriptions).length === 0)
      res.status(200).json({
        status: false,
        message: "Hasn't any subscription",
      });
    else {
      for (let subscriptionId of subscriptionIds) {
        let success = await sendNotification(
          global.subscriptions[subscriptionId],
          notificationData
        );
        if (success) notifiedSubscriptions.success.push(subscriptionId);
        else notifiedSubscriptions.failed.push(subscriptionId);
      }
      res.status(202).json({
        status: true,
        message: 'Notification statements were sent',
        notifiedSubscriptions: notifiedSubscriptions,
      });
    }
  } catch (error) {
    res.status(202).json({ status: false, message: error.message });
  }
}
async function pushAllSubscriptions(req, res) {
  try {
    log('notify all subscriptions');
    let notificationData = {
      title: req.body['title'],
      text: req.body['text'],
      image: req.body['image'],
      tag: req.body['tag'],
      url: req.body['url'],
    };
    let notifiedSubscriptions = { success: [], failed: [] };
    if (Object.keys(global.subscriptions).length === 0)
      res.status(200).json({
        status: false,
        message: "Hasn't any subscription",
      });
    else {
      for (let subscriptionId in global.subscriptions) {
        let success = await sendNotification(
          global.subscriptions[subscriptionId],
          notificationData
        );
        if (success) notifiedSubscriptions.success.push(subscriptionId);
        else notifiedSubscriptions.failed.push(subscriptionId);
      }
      res.status(202).json({
        status: true,
        message: 'Notification statements were sent',
        notifiedSubscriptions: notifiedSubscriptions,
      });
    }
  } catch (error) {
    res.status(202).json({ status: false, message: error.message });
  }
}

function listSubscriptions(_, res) {
  res.send(
    JSON.stringify(
      {
        subscriptionCount: Object.keys(global.subscriptions).length,
        subscriptions: global.subscriptions,
      },
      null,
      4
    )
  );
}
async function listSubscriptionsFromDb(req, res) {
  res.send(await fetchAllSubscriptionsFromDb(config));
}

function isExistedSubscriptionId(req, res) {
  res.send({ isExisted: global.subscriptions[req.params.id] ? true : false });
}

module.exports = {
  handlePushNotificationSubscription,
  pushSubscription,
  pushSubscriptions,
  pushAllSubscriptions,
  listSubscriptions,
  listSubscriptionsFromDb,
  isExistedSubscriptionId,
  fetchAllSubscriptionsFromDb,
};

const env = process.env.NODE_ENV || 'development',
  config = require('../config.json')[env],
  webpush = require('web-push'),
  log = console.log,
  crypto = require('crypto'),
  fetch = require('node-fetch');

let subscriptions = {};
fetchAllSubscriptionsFromDb().then((response) => {
  if (response.success) {
    response.subscriptions.forEach((subscription) => {
      subscriptions[subscription.subscriptionHashId] = JSON.parse(
        subscription.subscriptionJSON
      );
    });
  }
});
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

async function fetchAllSubscriptionsFromDb() {
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + config.tokenAtaCoreForPushServiceUserRole,
    },
  };
  let url = config.hostAta + '/api/RecordAttendance/subscription/list';

  return await fetch(url, options)
    .then(async (response) => {
      log(`${response.url}: ${response.status}(${response.statusText})`);
      let message = '';
      switch (response.status) {
        case 401:
          return {
            success: true,
            message: ' Access token is missing or invalid',
          };
        case 500:
          return { success: true, message: response.statusText + message };
        case 200:
          let subscriptions = await response.json();
          return { success: true, subscriptions: subscriptions };
        default:
          return { success: false, message: 'unkonwn error' };
      }
    })
    .catch((error) => {
      log(message);
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
  subscriptions[susbscriptionId] = subscriptionRequest;
  res.status(201).json({ id: susbscriptionId });
}

function sendPushNotification(req, res) {
  log(subscriptions);
  const subscriptionId = req.params.id;
  const pushSubscription = subscriptions[subscriptionId];
  webpush
    .sendNotification(
      pushSubscription,
      JSON.stringify({
        title: 'HAVE YOU CHECKED IN YET ?',
        text: 'Please click here go to checkin page',
        image: '/media/error/bg1.jpg',
        tag: 'check-in notification',
        url: '/record-attendance',
      })
    )
    .catch((err) => {
      log(err);
    });
  res.status(202).json({});
}
async function sendPushNotificationToOne(subscription, notificationData) {
  notificationData = {
    title: notificationData.title || 'HAVE YOU JOINED ATTENDANCE YET ?',
    text: notificationData.text || 'Please click here go to attendance page',
    image: notificationData.image || '/media/error/bg1.jpg',
    tag: notificationData.tag || 'Attendance notification',
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
async function sendPushNotificationToAll(req, res) {
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
    if (Object.keys(subscriptions).length === 0)
      res.status(200).json({
        status: false,
        message: "Hasn't any subscription",
      });
    else {
      for (let subscriptionId in subscriptions) {
        let success = await sendPushNotificationToOne(
          subscriptions[subscriptionId],
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

function listSubscription(_, res) {
  res.send(
    JSON.stringify(
      {
        subscriptionCount: Object.keys(subscriptions).length,
        subscriptions: subscriptions,
      },
      null,
      4
    )
  );
}
async function listSubscriptionFromDb(req, res) {
  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + config.tokenAtaCoreForPushServiceUserRole,
    },
  };
  let url = config.hostAta + '/api/RecordAttendance/subscription/list';

  let response = await fetch(url, options);
  log(`${response.url}: ${response.status}(${response.statusText})`);
  let message = '';
  switch (response.status) {
    case 401:
      message = ' Access token is missing or invalid';
    case 500:
      res.status(response.status).send(response.statusText + message);
      break;
    case 200:
      let subscriptions = await response.json();
      res.send({ success: true, subscriptions: subscriptions });
      break;
  }
}

function isExistedSubscriptionId(req, res) {
  res.send({ isExisted: subscriptions[req.params.id] ? true : false });
}

module.exports = {
  handlePushNotificationSubscription,
  sendPushNotification,
  sendPushNotificationToAll,
  listSubscription,
  listSubscriptionFromDb,
  isExistedSubscriptionId,
};

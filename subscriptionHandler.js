const subscriptions = {},
  webpush = require("web-push"),
  log = console.log,
  crypto = require("crypto")

const vapidKeys = {
  privateKey: "bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU",
  publicKey: "BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8"
};

webpush.setVapidDetails("mailto:phillip7.et@gmail.com", vapidKeys.publicKey, vapidKeys.privateKey);

function createHash(input) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(Buffer.from(input));
  return md5sum.digest("hex");
}

function handlePushNotificationSubscription(req, res) {
  const subscriptionRequest = req.body;
  const susbscriptionId = createHash(JSON.stringify(subscriptionRequest));
  subscriptions[susbscriptionId] = subscriptionRequest;
  res.status(201).json({ id: susbscriptionId });
}

function sendPushNotification(req, res) {
  console.log(subscriptions)
  const subscriptionId = req.params.id;
  const pushSubscription = subscriptions[subscriptionId];
  webpush
    .sendNotification(
      pushSubscription,
      JSON.stringify({
        title: "HAVE YOU CHECKED IN YET ?",
        text: 'Please click here go to checkin page',
        image: "/media/error/bg1.jpg",
        tag: "check-in notification",
        url: "/record-attendance"
      })
    )
    .catch(err => {
      console.log(err);
    });
  res.status(202).json({})
}
function sendPushNotificationToOne(subscription) {
  webpush
    .sendNotification(
      subscription,
      JSON.stringify({
        title: "HAVE YOU CHECKED IN YET ?",
        text: 'Please click here go to checkin page',
        image: "/media/error/bg1.jpg",
        tag: "check-in notification",
        url: "/record-attendance"
      })
    )
    .catch(err => {
      console.log(err);
    })
}
async function sendPushNotificationToAll(req, res) {
  log('notify all subscriptions')
  let notifiedSubscriptions = []
  for (let subscriptionId in subscriptions) {
    log(subscriptions[subscriptionId])
    await sendPushNotificationToOne(subscriptions[subscriptionId])
    notifiedSubscriptions.push(subscriptionId)
  }
  res.status(202).json({ "notifiedSubscriptions": notifiedSubscriptions });
}

function listSubscription(_, res) {
  let ids = [],
    sum = {}
  for (let subscriptionId in subscriptions)
    ids.push(subscriptionId)
  sum[Object.keys(subscriptions).length] = ids
  log(sum)
  res.send(sum);
}

function isExistedSubscriptionId(req, res) {
  res.send({ isExisted: subscriptions[req.params.id] ? true : false })
}

module.exports = { handlePushNotificationSubscription, sendPushNotification, sendPushNotificationToAll, listSubscription, isExistedSubscriptionId };

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, CircularProgress } from '@material-ui/core';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import {
  askUserPermission,
  createNotificationSubscription,
  getUserSubscription,
  registerServiceWorker,
  isPushNotificationSupported,
  post,
  get,
} from './notifications';

const useStyles = makeStyles((theme) => ({
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
}));

export function SubscribeButton(props) {
  const css = useStyles(),
    [isSubscribed, setIsSubscribed] = useState(false),
    [isSubscribing, setIsSubscribing] = useState(false),
    sendSubscription = async () => {
      let subscription =
        (await getUserSubscription()) ||
        (await createNotificationSubscription());
      console.log(subscription);
      post('/subscription/create', subscription)
        .then((response) => {
          localStorage.setItem('subscriptionId', response.id);
          setIsSubscribing(false);
          setIsSubscribed(true);
        })
        .catch((err) => {
          console.log(err);
          setIsSubscribing(false);
          setIsSubscribed(false);
        });
    },
    subscribe = async () => {
      setIsSubscribed(true);
      setIsSubscribing(true);
      let consent = await askUserPermission();
      if (consent !== 'granted') {
        alert(`You denied the consent to receive notifications.
                  Please allow notification at 
                  chrome://settings/content/siteDetails?site=<domain>`);
        setIsSubscribed(false);
        setIsSubscribing(false);
      } else {
        sendSubscription();
      }
    };

  useEffect(() => {
    if (isPushNotificationSupported()) {
      registerServiceWorker();
      async function IsExistedSubscriptionId() {
        setIsSubscribed(true);
        setIsSubscribing(true);
        // Check wheter subscription is existed
        // If client allowed notification at browser before, it will be true
        // In contrast it will be false
        // Note: When user changed notification to "Ask(default)" after user allowed notification before
        //       the push subscription will be created new and service push api will add more subscription id to list,
        //       so the push service api will notify duplicately
        //       => TODO
        //          Implement authentication for push service api
        //          Check duplicate subscription by username
        let isExistedSubscription = (await getUserSubscription())
          ? true
          : false;
        if (!isExistedSubscription) {
          setIsSubscribed(false);
          setIsSubscribing(false);
          return;
        }
        // check when server lost subscription data (either service is stopped or another reason of service)
        get('/subscription/check/' + localStorage.getItem('subscriptionId'))
          .then((response) => {
            let isExistedId = response['isExisted'];
            if (isExistedId) setIsSubscribed(true);
            else {
              setIsSubscribed(false);
              // send again
              sendSubscription();
            }
            setIsSubscribing(false);
          })
          .catch((err) => {
            console.log(err);
            setIsSubscribing(false);
            setIsSubscribed(false);
          });
      }
      IsExistedSubscriptionId();
    }
  }, []);
  return (
    <Button
      onClick={subscribe}
      disabled={isSubscribed}
      variant='contained'
      color='primary'
      className={css.leftIcon}
    >
      {props.text || 'Notify Attendance'}
      {isSubscribing ? (
        <CircularProgress size={18} className={css.rightIcon} />
      ) : (
        <AccessAlarmIcon className={css.rightIcon} />
      )}
    </Button>
  );
}

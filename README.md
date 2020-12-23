# ata-push-api

## Push Notification API(OAS 3.0 and authentication with Bearer token)

- API docs included Routing Execution
  - Docs API: <https://ata-push-api.xyz/api-docs>
  - Testing page : <https://ata-push-api.xyz>
- Inject other services
- Check infomation of injected service

## Subscribe Button

- When Push Notification server restarted, notification is only available if user browse page again(the browser will update the subscription to server automaticly , don't need click to "Notify Attendance")

## Notification Attendance Service

- Get office's working hours and notify to all users already have subscribed (Clicked to Notify Attendance button and allowed)
- Notify check-in early 5 minutes
- Notify check-out as end time

## ATA Core API

- Public get /api/officesettings

## Setup

```js
npm install
npm start
```

## Tips

- Broadcast all existed subscriptions with customized notification

    ```js
    let url =
        hostPushAPI +
        '/subscription/notify-all?' +
        new URLSearchParams({
            
        }),
        options = {
            method: 'GET',
            authorization :'Bearer tokenxxxxx',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                title: 'titile',
                text: 'content',
                image: 'path to bg img',
                tag: 'tag',
                url: 'url',
            })
        };
    fetch(url, options).then((response) => {
        log(`${response.url}: ${response.status}(${response.statusText})`);
    });
    ```

- Generate bearer token for authorization api : ```node genAPIToken```
  - Default expired date quantity is 365 days
  - Adjust expirated date quantity to 1 day by statement : ```node genAPIToken 1```

## Notes

- Tino host smoothly
  - Clone from github
  - Create App
    - /api (folder path clone from github)
    - server.js (file start app)
    - Development (enviroiment)
  - Stop app 1st
  - Npm install modules (keep development mode)
  - Start again

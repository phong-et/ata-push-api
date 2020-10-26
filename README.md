# ata-push-api

The push notification service

## Live demo and api docs

- <https://ata-push-api.herokuapp.com/api-docs/>

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
            title: 'titile',
            text: 'content',
            image: 'path to bg img',
            tag: 'tag',
            url: 'url',
        }),
        options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
    fetch(url, options).then((response) => {
        log(`${response.url}: ${response.status}(${response.statusText})`);
    });
    ```

## Notes

- Server restart
  - Client must to browse page again to send subscription automaticly

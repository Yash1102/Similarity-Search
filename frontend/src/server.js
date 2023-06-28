const corsProxy = require('cors-anywhere');




const host = 'localhost';

const port = 9091;




corsProxy

  .createServer({

    originWhitelist: [], // Allow all origins

    requireHeader: ['origin', 'x-requested-with'],

    removeHeaders: ['cookie', 'cookie2'],

  })

  .listen(port, host, () => {

    console.log(`CORS proxy server running on http://${host}:${port}`);

  });
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b1f360a44cf818da40e9ca83de7ddaf3@o4509541403197440.ingest.us.sentry.io/4509541416632320",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

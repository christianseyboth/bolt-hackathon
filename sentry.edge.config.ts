// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b1f360a44cf818da40e9ca83de7ddaf3@o4509541403197440.ingest.us.sentry.io/4509541416632320",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

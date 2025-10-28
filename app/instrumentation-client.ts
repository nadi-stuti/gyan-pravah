// import posthog from "posthog-js"

// posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//   api_host: "/ingest",
//   ui_host: "https://us.posthog.com",
//   defaults: '2025-05-24',
//   capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
//   debug: process.env.NODE_ENV === "development",
// });

import posthog from "posthog-js";

// Detect environment
const isDevelopment = process.env.NODE_ENV === "development";
const environment = isDevelopment ? "development" : "production";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2025-05-24",
  person_profiles: "identified_only", // Updated from 'defaults'
  capture_exceptions: true,
  debug: isDevelopment,

  // Add environment tracking
  loaded: (posthog) => {
    // Register environment as a super property (added to all events)
    posthog.register({
      environment: environment,
      app_version: "0.0.1", // You can update this later
    });

    // Optional: Completely disable tracking in development
    // Uncomment the next 2 lines if you don't want ANY dev events
    // if (isDevelopment) {
    //   posthog.opt_out_capturing()
    // }
  },
});

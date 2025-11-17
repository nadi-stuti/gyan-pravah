export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "res.cloudinary.com",
            "https://gyan-pravah.vercel.app",
          ], // Add your image provider domain if necessary
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "res.cloudinary.com",
            "https://gyan-pravah.vercel.app",
          ], // Add your media provider domain
          "script-src": ["'self'", "editor.unlayer.com"],
          "frame-src": ["'self'", "editor.unlayer.com"],
          // ... other directives
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: [
        "http://localhost:3000", // Your local Next.js development URL
        "https://gyan-pravah.vercel.app",
        "https://gyan-pravah.nadistuti.com",
        // Add any other specific Vercel preview domains if needed
      ],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

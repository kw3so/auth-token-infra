## Setup 
- Helmet
  Helmet is a collection of middleware functions for Nodejs designed to secure web apps by setting crucial HTTP headers
  Importance includes:
  - Security by default 
  - Vulnerability mitigation
  - Content security policy
  - No-sniff defense
  By adding `app.use(helmet())` to your app, helmet will set several security headers based on industry standards

- express-rate-limit
  
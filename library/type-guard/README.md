# @tw050x.net/middleware

This package provides the authentication and authorization capabilities for other services. It includes the following exports:

* Authorization verification middleware

## Installation

```bash
yarn add @tw050x.net/middleware
```

## Usage
```typescript
import { verifyAuthMiddleware } from '@tw050x.net/middleware';
import { default as secret } from '../secret';
import { default as settings } from '../settings';

...

export const serviceStack: Array<RequestHandler> = [
  verifyAuthMiddleware({
    key: secret.jwtSecretKey
    settings
  }),
  getPrivatePageResponseMiddleware(),
]
```

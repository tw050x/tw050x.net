# Certificates

This document outlines the process used for machine to machine authorisation. This is specifically useful for the Authorisation Service to determine that a permissions review request is coming from a trusted service allowing us to avoid using tokens for service to service communication.

## How it works.

The Authorisation Service uses a mutual TLS (mTLS) setup to authenticate requests from other services. Each service that needs to communicate with the Authorisation Service must present a valid client certificate issued by a trusted Certificate Authority (CA).

The CA certificate is attached to the authorisation service at startup. All requests made to the authorisation service must be made using a client certificate signed by that CA.

Certificates are created using the certificte tool included as a script in the root package.json. It can be run using the following command:

```bash
yarn certificate
```

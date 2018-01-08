# Secure Infrastructure with Node.js and Vault

> A tutorial how to rotate secrets for critical infrastructure components via Vault with Node.js applications.

## TL;DR

```bash
npm run e2e
```

## Introspect Vault

```bash
# be sure to the a non-HTTPS endpoint during running dev server
export VAULT_ADDR=http://127.0.0.1:8200
vault read database/creds/readonly
```

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## License

MIT

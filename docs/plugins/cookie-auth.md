# Plugins — Cookie Auth

## Cookies

- `refresh_token`: httpOnly, secure en prod, sameSite strict/lax según entorno. Path `/api/auth`. MaxAge 7 días.
- `temp_access_token`: NO httpOnly (el front lo lee), maxAge 60s. Usado para OAuth flow.

## TODO

- Evaluar mover `maxAge` del refresh token a variable de entorno si se necesita configurarlo sin redesplegar.

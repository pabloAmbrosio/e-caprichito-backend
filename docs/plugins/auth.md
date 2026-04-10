# Plugins — Auth

## Decoradores

- `authenticate`: Verifica JWT. Si falla → 401.
- `authenticateOptional`: Verifica JWT sin bloquear. Si falla → `request.user` queda `undefined`.
- `requirePhoneVerified`: Valida que el usuario tenga teléfono verificado.

## TODO

- `requirePhoneVerified` tiene doble responsabilidad: valida que `request.user` exista Y que tenga teléfono verificado. Evaluar extraer un decorador `requireAuth` independiente para rutas que usen `authenticateOptional` y necesiten verificar si hay usuario. Actualmente no es problema porque siempre se usa después de `authenticate`, pero viola single responsibility.

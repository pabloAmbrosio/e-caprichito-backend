# Módulo User

Gestión de usuarios desde el backoffice. No expone endpoints públicos — el consumidor final se gestiona a través del módulo auth.

## Permisos por rol

La lógica de acceso sigue una jerarquía: los niveles superiores (OWNER, ADMIN) deciden sobre los usuarios, mientras que MANAGER solo puede consultar información que necesite para operar.

| Acción | OWNER | ADMIN | MANAGER |
|--------|:-----:|:-----:|:-------:|
| Listar usuarios | si | si | si |
| Ver detalle de usuario | si | si | si |
| Crear usuario | si | si | no |
| Actualizar usuario | si | si | no |
| Eliminar usuario (soft delete) | si | si | no |
| Restaurar usuario | si | si | no |

### Restricciones adicionales en runtime

Más allá de los roles permitidos en la ruta, existen guards a nivel de servicio:

- **Nadie puede modificar a un OWNER** (excepto otro OWNER)
- **Nadie puede cambiar su propio rol** (ni siquiera el OWNER a sí mismo)
- **Solo OWNER puede asignar el rol ADMIN**
- **Nadie puede eliminarse a sí mismo**
- **No se puede eliminar ni modificar a un OWNER** (guard en `getUserOrFail`)

## Endpoints

| Método | Path | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/backoffice/users` | OWNER, ADMIN, MANAGER | Listar usuarios con filtros y paginación |
| GET | `/api/backoffice/users/:id` | OWNER, ADMIN, MANAGER | Detalle de un usuario |
| POST | `/api/backoffice/users` | OWNER, ADMIN | Crear usuario |
| PATCH | `/api/backoffice/users/:id` | OWNER, ADMIN | Actualizar usuario |
| DELETE | `/api/backoffice/users/:id` | OWNER, ADMIN | Soft delete de usuario |
| PATCH | `/api/backoffice/users/:id/restore` | OWNER, ADMIN | Restaurar usuario eliminado |

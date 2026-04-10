import * as v from 'valibot';

export const CreateAddressSchema = v.strictObject({
    label: v.pipe(
        v.string('El nombre de la direccion debe ser texto'),
        v.minLength(1, 'El nombre de la direccion no puede estar vacio'),
        v.maxLength(100, 'El nombre de la direccion no puede superar los 100 caracteres'),
    ),
    formattedAddress: v.pipe(
        v.string('La direccion formateada debe ser texto'),
        v.minLength(1, 'La direccion formateada no puede estar vacia'),
    ),
    details: v.optional(v.pipe(
        v.string('Los detalles deben ser texto'),
        v.maxLength(500, 'Los detalles no pueden superar los 500 caracteres'),
    )),
    lat: v.pipe(
        v.number('La latitud debe ser un numero'),
        v.minValue(-90, 'La latitud debe estar entre -90 y 90'),
        v.maxValue(90, 'La latitud debe estar entre -90 y 90'),
    ),
    lng: v.pipe(
        v.number('La longitud debe ser un numero'),
        v.minValue(-180, 'La longitud debe estar entre -180 y 180'),
        v.maxValue(180, 'La longitud debe estar entre -180 y 180'),
    ),
    isDefault: v.optional(v.boolean('isDefault debe ser booleano')),
});

export type CreateAddressInput = v.InferInput<typeof CreateAddressSchema>;

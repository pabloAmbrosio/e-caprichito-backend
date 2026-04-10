/**
 * PromotionResolver - Resuelve qué promociones se aplican según prioridad y stacking.
 *
 * Algoritmo de resolución:
 * 1. Ordenar promociones válidas por prioridad (mayor primero)
 * 2. La primera promoción siempre se aplica
 * 3. Las siguientes solo se aplican si AMBAS condiciones se cumplen:
 *    a) La promoción actual tiene stackable: true
 *    b) La nueva promoción también tiene stackable: true
 * 4. Si una promoción tiene stackable: false, bloquea todas las de menor prioridad
 *
 * Este resolver se ejecuta DESPUÉS de evaluar las reglas, solo con las promociones
 * que ya pasaron la fase de evaluación de reglas.
 */
import type { Promotion } from '../../../lib/prisma';

/**
 * Tipo genérico que extiende Promotion para que el resolver
 * pueda recibir y devolver promociones con relaciones (rules, actions).
 */
type PromotionLike = Promotion & Record<string, unknown>;

export class PromotionResolver {
  /**
   * Filtra y ordena las promociones validas segun prioridad y reglas de stacking.
   *
   * #6 [MEDIO]: Documentacion detallada de la logica de stacking.
   *
   * ## Algoritmo de Stacking
   *
   * El stacking (acumulacion) determina si multiples promociones pueden aplicarse
   * simultaneamente a un mismo carrito. La logica funciona asi:
   *
   * 1. **Ordenamiento**: Las promociones se ordenan por prioridad descendente
   *    (mayor numero = mayor prioridad). Esto garantiza que la promo mas
   *    importante se aplique primero.
   *
   * 2. **Primera promocion**: Siempre se aplica la de mayor prioridad,
   *    independientemente de su flag `stackable`.
   *
   * 3. **Acumulacion**: Las siguientes promociones solo se agregan si:
   *    - La primera promocion (mayor prioridad) tiene `stackable: true`
   *    - La nueva promocion tambien tiene `stackable: true`
   *    - Esto crea una "cadena" de promos acumulables
   *
   * 4. **Corte**: En cuanto se encuentra una promocion con `stackable: false`:
   *    - Se incluye esa promocion (tiene prioridad sobre las de menor rango)
   *    - Se detiene la acumulacion (ninguna promo de menor prioridad se incluye)
   *
   * ## Ejemplos
   *
   * ```
   * Promos ordenadas: [A(p=100,stack=true), B(p=50,stack=true), C(p=10,stack=false)]
   * Resultado: [A, B, C] -> C se incluye pero corta la cadena
   *
   * Promos ordenadas: [A(p=100,stack=false), B(p=50,stack=true)]
   * Resultado: [A] -> A no es stackable, se ignoran las demas
   *
   * Promos ordenadas: [A(p=100,stack=true), B(p=50,stack=true), C(p=10,stack=true)]
   * Resultado: [A, B, C] -> Todas son stackable, se acumulan
   * ```
   *
   * @template T - Tipo que extiende Promotion (puede incluir rules y actions)
   * @param validPromotions - Promociones que ya pasaron la evaluacion de reglas
   * @returns Array de promociones que se deben aplicar, en orden de prioridad
   */
  resolve<T extends PromotionLike>(validPromotions: T[]): T[] {
    if (validPromotions.length === 0) return [];

    /** Paso 1: Ordenar por prioridad descendente (mayor prioridad primero) */
    const sorted = [...validPromotions].sort((a, b) => b.priority - a.priority);

    /** Paso 2: La primera promocion siempre aplica */
    const result: T[] = [sorted[0]];

    /**
     * Paso 3: Si la primera NO es stackable, no se puede combinar con ninguna otra.
     * Se retorna solo la de mayor prioridad.
     */
    if (!sorted[0].stackable) {
      return result;
    }

    /**
     * Paso 4: Iterar las demas y agregar solo si ambas son stackable.
     * En cuanto encontremos una que NO sea stackable, dejamos de agregar.
     */
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];

      if (current.stackable) {
        /** Ambas son stackable: se puede acumular */
        result.push(current);
      } else {
        /**
         * La promocion actual NO es stackable: la agregamos (tiene prioridad)
         * pero dejamos de agregar mas despues de ella.
         */
        result.push(current);
        break;
      }
    }

    return result;
  }
}

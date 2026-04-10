/**
 * Schema de validación para agregar una regla a una promoción.
 * Valida el body de la petición POST /promotions/:id/rules.
 *
 * #2 [ALTO]: Incluye validación custom que verifica la coherencia entre
 * type, operator y value según el tipo de regla. Cada tipo tiene operadores
 * válidos y formatos de value esperados.
 */
import * as v from 'valibot';
import { RULE_TYPES, COMPARISON_OPERATORS } from '../constants';

/** Operadores válidos para reglas de igualdad (PRODUCT, CATEGORY, TAG, CUSTOMER_ROLE) */
const EQUALITY_OPERATORS = ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN'] as const;

/** Operadores válidos para reglas numéricas (CART_MIN_TOTAL, CART_MIN_QUANTITY) */
const NUMERIC_OPERATORS = ['EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_OR_EQUAL', 'LESS_OR_EQUAL'] as const;

/** Roles de cliente válidos para reglas CUSTOMER_ROLE */
const VALID_CUSTOMER_ROLES = ['MEMBER', 'VIP_FAN', 'VIP_LOVER', 'VIP_LEGEND'] as const;

/** Schema de validación para el body de crear regla */
export const CreateRuleSchema = v.pipe(
  v.object({
    /** Tipo de regla: qué dato se evalúa (PRODUCT, CATEGORY, TAG, etc.) */
    type: v.pipe(
      v.string('El tipo de regla debe ser texto'),
      v.picklist(RULE_TYPES, 'Tipo de regla inválido. Valores permitidos: PRODUCT, CATEGORY, TAG, CART_MIN_TOTAL, CART_MIN_QUANTITY, CUSTOMER_ROLE, FIRST_PURCHASE')
    ),

    /** Operador de comparación: cómo se compara el valor (EQUALS, IN, GREATER_THAN, etc.) */
    operator: v.pipe(
      v.string('El operador debe ser texto'),
      v.picklist(COMPARISON_OPERATORS, 'Operador inválido. Valores permitidos: EQUALS, NOT_EQUALS, IN, NOT_IN, GREATER_THAN, LESS_THAN, GREATER_OR_EQUAL, LESS_OR_EQUAL')
    ),

    /** Valor contra el que se compara (ej: "uuid-producto", "ROPA", "100", "VIP_FAN", "true") */
    value: v.pipe(
      v.string('El valor debe ser texto'),
      v.nonEmpty('El valor es requerido'),
      v.maxLength(1000, 'El valor no puede tener más de 1000 caracteres')
    ),
  }),
  /**
   * #2 [ALTO]: Validación custom por tipo de regla.
   * Verifica que el operador sea válido para el tipo y que el value tenga el formato correcto.
   */
  v.check((input) => {
    const { type, operator, value } = input;

    switch (type) {
      case 'PRODUCT':
      case 'CATEGORY':
      case 'TAG':
        /** Solo operadores de igualdad/pertenencia */
        if (!(EQUALITY_OPERATORS as readonly string[]).includes(operator)) {
          return false;
        }
        /** Para IN/NOT_IN, validar que sea una lista separada por comas */
        if ((operator === 'IN' || operator === 'NOT_IN') && !value.includes(',')) {
          /** Permitimos un solo valor en IN/NOT_IN como caso válido */
          return value.trim().length > 0;
        }
        return true;

      case 'CART_MIN_TOTAL':
        /** Solo operadores numéricos */
        if (!(NUMERIC_OPERATORS as readonly string[]).includes(operator)) {
          return false;
        }
        /** El valor debe ser un número válido positivo */
        const totalNum = parseFloat(value);
        return !isNaN(totalNum) && totalNum >= 0;

      case 'CART_MIN_QUANTITY':
        /** Solo operadores numéricos */
        if (!(NUMERIC_OPERATORS as readonly string[]).includes(operator)) {
          return false;
        }
        /** El valor debe ser un entero positivo */
        const qtyNum = parseInt(value, 10);
        return !isNaN(qtyNum) && qtyNum >= 0 && String(qtyNum) === value.trim();

      case 'CUSTOMER_ROLE':
        /** Solo operadores de igualdad/pertenencia */
        if (!(EQUALITY_OPERATORS as readonly string[]).includes(operator)) {
          return false;
        }
        /** Validar que los roles sean válidos */
        const roles = value.split(',').map((r) => r.trim());
        return roles.every((r) => (VALID_CUSTOMER_ROLES as readonly string[]).includes(r));

      case 'FIRST_PURCHASE':
        /** Solo EQUALS */
        if (operator !== 'EQUALS') {
          return false;
        }
        /** Solo "true" o "false" */
        return value === 'true' || value === 'false';

      default:
        return true;
    }
  }, 'Combinación inválida de tipo/operador/valor. Verifica que el operador sea compatible con el tipo de regla y que el valor tenga el formato correcto.')
);

/** Tipo inferido del schema de creación de regla */
export type CreateRuleInput = v.InferInput<typeof CreateRuleSchema>;

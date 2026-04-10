import { RuleType, ComparisonOperator, RuleOperator, ActionType, ActionTarget } from '../../../lib/prisma';

interface DemoRule {
  type: RuleType;
  operator: ComparisonOperator;
  value: string;
}

interface DemoAction {
  type: ActionType;
  value: string;
  target: ActionTarget;
  maxDiscountInCents?: number;
}

export interface DemoPromotion {
  name: string;
  description: string;
  couponCode: string | null;
  priority: number;
  stackable: boolean;
  isActive: boolean;
  startsAt: Date;
  endsAt: Date | null;
  maxUsesPerUser: number | null;
  ruleOperator: RuleOperator;
  imageUrl: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  rules: DemoRule[];
  actions: DemoAction[];
}

const now = new Date();

export const DEMO_PROMOTIONS: DemoPromotion[] = [
  {
    name: 'Bienvenida: 10% off',
    description: '10% de descuento en tu primera compra en El Caprichito',
    couponCode: 'BIENVENIDA',
    priority: 1,
    stackable: false,
    isActive: true,
    startsAt: now,
    endsAt: null,
    maxUsesPerUser: 1,
    imageUrl: 'https://res.cloudinary.com/dsr0fsx4v/image/upload/v1775848057/promotions/promo-bienvenida.jpg',
    colorPrimary: '#00897B',
    colorSecondary: '#E0F2F1',
    badgeText: '-10%',
    badgeColor: '#00897B',
    ruleOperator: RuleOperator.ALL,
    rules: [
      {
        type: RuleType.FIRST_PURCHASE,
        operator: ComparisonOperator.EQUALS,
        value: 'true',
      },
    ],
    actions: [
      {
        type: ActionType.PERCENTAGE_DISCOUNT,
        value: '10',
        target: ActionTarget.CART,
      },
    ],
  },

  {
    name: '10% en productos Rosa',
    description: '10% de descuento en todos los productos con el tag rosa',
    couponCode: null,
    priority: 2,
    stackable: true,
    isActive: true,
    startsAt: now,
    endsAt: null,
    maxUsesPerUser: null,
    imageUrl: 'https://res.cloudinary.com/dsr0fsx4v/image/upload/v1775848060/promotions/promo-rosa.jpg',
    colorPrimary: '#E91E63',
    colorSecondary: '#FCE4EC',
    badgeText: '-10%',
    badgeColor: '#E91E63',
    ruleOperator: RuleOperator.ALL,
    rules: [
      {
        type: RuleType.TAG,
        operator: ComparisonOperator.IN,
        value: 'rosa',
      },
    ],
    actions: [
      {
        type: ActionType.PERCENTAGE_DISCOUNT,
        value: '10',
        target: ActionTarget.CART,
      },
    ],
  },

  {
    name: '3% off en compras de $299+',
    description: '3% de descuento en compras mayores a $299 MXN',
    couponCode: null,
    priority: 3,
    stackable: true,
    isActive: true,
    startsAt: now,
    endsAt: null,
    maxUsesPerUser: null,
    imageUrl: 'https://res.cloudinary.com/dsr0fsx4v/image/upload/v1775848067/promotions/promo-500.jpg',
    colorPrimary: '#1565C0',
    colorSecondary: '#E3F2FD',
    badgeText: '-3%',
    badgeColor: '#1565C0',
    ruleOperator: RuleOperator.ALL,
    rules: [
      {
        type: RuleType.CART_MIN_TOTAL,
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: '299',
      },
    ],
    actions: [
      {
        type: ActionType.PERCENTAGE_DISCOUNT,
        value: '3',
        target: ActionTarget.CART,
      },
    ],
  },
];

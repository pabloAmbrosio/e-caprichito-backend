import { FastifyReply, FastifyRequest } from "fastify";
import { DefaultOrderErrorHandler } from './default.error';
import { OrderNotFoundErrorHandler } from './custom/order-not-found.error';
import { InsufficientStockErrorHandler } from './custom/insufficient-stock.error';
import { InventoryNotRegisteredErrorHandler } from './custom/inventory-not-registered.error';
import { InvalidStatusTransitionErrorHandler } from './custom/invalid-status-transition.error';
import { OrderNotCancellableErrorHandler } from './custom/order-not-cancellable.error';
import { SameStatusErrorHandler } from './custom/same-status.error';
import { AddressRequiredErrorHandler } from './custom/address-required.error';
import { DeliveryNotAvailableErrorHandler } from './custom/delivery-not-available.error';
import { CodRequiresHomeDeliveryErrorHandler } from './custom/cod-requires-home-delivery.error';

const errorHandlers = [
    new OrderNotFoundErrorHandler(),
    new InsufficientStockErrorHandler(),
    new InventoryNotRegisteredErrorHandler(),
    new InvalidStatusTransitionErrorHandler(),
    new OrderNotCancellableErrorHandler(),
    new SameStatusErrorHandler(),
    new AddressRequiredErrorHandler(),
    new DeliveryNotAvailableErrorHandler(),
    new CodRequiresHomeDeliveryErrorHandler(),
    new DefaultOrderErrorHandler()
];

export const handleOrderError = (
  error: unknown,
  reply: FastifyReply,
  request: FastifyRequest,
  context: string
) => {
  for (const handler of errorHandlers) {
    const result = handler.handle(error, reply, request, context);
    if (result) return result;
  }
};

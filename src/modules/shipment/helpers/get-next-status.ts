import type { DeliveryType, ShipmentStatus } from "../../../lib/prisma";
import { DELIVERY_TYPE_STEPS, TERMINAL_STATUSES } from "../constants";
import { ShipmentAlreadyTerminalError, InvalidShipmentTransitionError } from "../errors";

export function getNextStatus(type: DeliveryType, currentStatus: ShipmentStatus): ShipmentStatus {
    if (TERMINAL_STATUSES.includes(currentStatus)) {
        throw new ShipmentAlreadyTerminalError(currentStatus);
    }

    const steps = DELIVERY_TYPE_STEPS[type];
    const currentIndex = steps.indexOf(currentStatus);

    if (currentIndex === -1 || currentIndex === steps.length - 1) {
        throw new InvalidShipmentTransitionError(currentStatus, "siguiente");
    }

    return steps[currentIndex + 1];
}

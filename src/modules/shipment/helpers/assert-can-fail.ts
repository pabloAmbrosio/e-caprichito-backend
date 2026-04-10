import type { ShipmentStatus } from "../../../lib/prisma";
import { TERMINAL_STATUSES } from "../constants";
import { ShipmentAlreadyTerminalError } from "../errors";

export function assertCanFail(currentStatus: ShipmentStatus): void {
    if (TERMINAL_STATUSES.includes(currentStatus)) {
        throw new ShipmentAlreadyTerminalError(currentStatus);
    }
}

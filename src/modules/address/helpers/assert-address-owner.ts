import { AddressNotOwnedError } from "../errors";
export function assertAddressOwner(userId: string, address: { userId: string }) {
    if (address.userId !== userId) {
        throw new AddressNotOwnedError();
    }
}

import { db } from "../../../../lib/prisma";

export type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

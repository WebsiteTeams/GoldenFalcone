import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, COST);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// Compared against when an email is unknown, so response timing does not reveal whether an account exists.
let dummyHash: Promise<string> | undefined;
export const dummyPasswordHash = () => (dummyHash ??= bcrypt.hash("goldenfalcone-timing-equaliser", COST));

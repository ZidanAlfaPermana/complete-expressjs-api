import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(passwordAsli: string): Promise<string> {
    return bcrypt.hash(passwordAsli, SALT_ROUNDS);
}

export async function cekPassword(passwordInput: string, hashDiDatabase: string): Promise<boolean> {
    return bcrypt.compare(passwordInput, hashDiDatabase);
}

export function tanpaPassword<T>(data: T): Omit<T, "password"> {
    const { password, ...aman } = data as any;
    return aman as Omit<T, "password">;
}
export function isUserSame(loggedInUserId: number, targetUserId: number|undefined|null): boolean {
    return Number(loggedInUserId) === Number(targetUserId);
}
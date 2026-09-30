export function isUserSame(loggedInUserId: number, targetUserId: number|undefined): boolean {
    return Number(loggedInUserId) === Number(targetUserId);
}
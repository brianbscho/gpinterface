export function isAccessible(
  thread: { isPublic: boolean; userHashId: string | null | undefined },
  user: { hashId: string }
) {
  if (thread.isPublic) return true;
  if (thread.userHashId === user.hashId) return true;

  throw { statusCode: 401, msg: "This thread is private" };
}

import { and, eq, gt, isNull } from "drizzle-orm";
import type { IdentityDb } from "@/db/identity/client";
import { passwordResetChallenges } from "@/db/identity/schema";

export class PasswordResetClaimError extends Error {}

export async function claimPasswordResetChallenge(
  tx: Pick<IdentityDb, "update">,
  challengeId: string,
  expectedUserId: string,
) {
  const [claimed] = await tx
    .update(passwordResetChallenges)
    .set({ usedAt: new Date() })
    .where(and(
      eq(passwordResetChallenges.id, challengeId),
      eq(passwordResetChallenges.userId, expectedUserId),
      isNull(passwordResetChallenges.usedAt),
      gt(passwordResetChallenges.expiresAt, new Date()),
    ))
    .returning({ userId: passwordResetChallenges.userId });
  return claimed?.userId === expectedUserId;
}

import { prisma } from "./prisma";

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; resetAt: Date }> {
  const now = new Date();

  // Clean up expired rate limits occasionally to keep the table compact
  try {
    await prisma.rateLimit.deleteMany({
      where: {
        resetAt: { lt: now },
      },
    });
  } catch (err) {
    console.error("Pruning expired rate limits failed:", err);
  }

  // Find or create rate limit record
  let record = await prisma.rateLimit.findUnique({
    where: { key },
  });

  if (!record) {
    const resetAt = new Date(now.getTime() + windowMs);
    record = await prisma.rateLimit.create({
      data: {
        key,
        count: 1,
        resetAt,
      },
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt,
    };
  }

  if (record.resetAt < now) {
    // Window expired - reset count and window expiration
    const resetAt = new Date(now.getTime() + windowMs);
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: 1,
        resetAt,
      },
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: updated.resetAt,
    };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count
  const updated = await prisma.rateLimit.update({
    where: { key },
    data: {
      count: { increment: 1 },
    },
  });

  return {
    success: true,
    limit,
    remaining: limit - updated.count,
    resetAt: updated.resetAt,
  };
}

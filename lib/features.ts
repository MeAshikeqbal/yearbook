import { prisma } from "./prisma"

/**
 * Server-side helper to check if a feature flag is enabled in the database.
 * If the flag does not exist, it automatically registers it with the defaultValue.
 *
 * @param key Unique feature flag key (e.g., 'FLIPBOOK')
 * @param defaultValue Default boolean status to use and seed if not present (default: true)
 */
export async function isFeatureEnabled(key: string, defaultValue = true): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    })

    if (!flag) {
      // Auto-register feature flag in the background if it's missing
      try {
        await prisma.featureFlag.create({
          data: {
            key,
            value: defaultValue,
            description: `Auto-registered flag for ${key} module.`,
          },
        })
      } catch (e) {
        // Ignore unique constraint race conditions
      }
      return defaultValue
    }

    return flag.value
  } catch (error) {
    console.error(`Error querying feature flag '${key}':`, error)
    return defaultValue
  }
}

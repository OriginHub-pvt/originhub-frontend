/**
 * Helper utilities for working with Clerk user metadata
 */

export interface UserPublicMetadata {
  bio?: string;
  location?: string;
  website?: string;
  // Add more custom fields as needed
}

/**
 * Type guard to check if metadata has the expected shape
 */
export function getUserMetadata(user: any): UserPublicMetadata {
  if (!user?.publicMetadata) {
    return {};
  }
  
  return user.publicMetadata as UserPublicMetadata;
}

/**
 * Get user bio from metadata
 */
export function getUserBio(user: any): string | undefined {
  const metadata = getUserMetadata(user);
  return metadata.bio;
}

/**
 * Update user metadata via API
 */
export async function updateUserMetadata(
  metadata: Partial<UserPublicMetadata>
): Promise<boolean> {
  try {
    const response = await fetch("/api/user/update-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicMetadata: metadata,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return false;
  }
}


/** Populated user fields returned by populate('user', 'username profileImage') */
export interface PopulatedUser {
  _id: string;
  username: string;
  profileImage?: string;
}

/** Type guard for populated vs string-id user fields */
export function isPopulatedUser(
  v: string | PopulatedUser,
): v is PopulatedUser {
  return typeof v === 'object' && v !== null && '_id' in v;
}

/** Safely extract user ID from populated or string field */
export function getUserId(v: string | PopulatedUser): string {
  return isPopulatedUser(v) ? v._id : v;
}

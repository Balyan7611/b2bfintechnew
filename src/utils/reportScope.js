import { getSession } from './authUtils';
import { resolveMemberId, getLoginId } from './memberIdentity';

/**
 * Resolves the id that report queries must be scoped to.
 *
 * The member panel and the API panel share the same report components, and the
 * underlying /Transaction endpoint does NOT scope rows by the JWT — if it is
 * called with a blank memberId it returns EVERY member's transactions. That is
 * how an API user could see another partner's data.
 *
 * So these reports must always send an explicit id. When the id cannot be
 * determined we fail CLOSED (return an error and let the caller skip the
 * request) rather than falling back to a blank value, which would leak.
 *
 * @returns {Promise<{ id: number|null, error: string|null }>}
 */
export const resolveReportScopeId = async () => {
  try {
    const id = await resolveMemberId();
    if (id) return { id, error: null };
  } catch (err) {
    console.error('[reportScope] resolveMemberId threw:', err);
  }

  const session = getSession();
  const who = getLoginId() || session?.loginId || 'this account';
  console.warn('[reportScope] could not resolve a numeric account id for', who,
    '- refusing to query reports unscoped.');

  return {
    id: null,
    error: `Could not determine which account to load records for (${who}). ` +
           `Reports were not loaded, to avoid showing another account's data. ` +
           `Please sign out and sign in again, or contact support if this persists.`,
  };
};

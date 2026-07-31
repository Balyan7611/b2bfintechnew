// Resolves the identity of the logged-in member (numeric Member.Id + LoginId).
//
// Why this exists: LoginPage / ApiLoginPage build the session from the JWT and
// used `decoded.sub` as `msrno`. On this backend `sub` is the LoginId string
// (e.g. "RT100"), not the numeric Member.Id. Any call like
// `GetMemberService?MemberID=RT100` then silently returns an empty list, which
// is why requested/approved services never appeared in the panels even though
// the rows existed in the database.

import { getSession, saveSession, decodeToken } from './authUtils';
import { API } from '../api/endpoints';

export const isNumericId = (val) => {
    if (val === null || val === undefined) return false;
    const s = String(val).trim();
    return s !== '' && s !== '0' && /^\d+$/.test(s);
};

const readToken = () =>
    sessionStorage.getItem('access_token') || localStorage.getItem('access_token') ||
    sessionStorage.getItem('member_token') || localStorage.getItem('member_token') ||
    sessionStorage.getItem('api_token') || localStorage.getItem('api_token');

// The LoginId is always reliable — it's what the user typed to log in.
export const getLoginId = () => {
    const session = getSession();
    const fromSession = session?.loginId || session?.username || session?.memberId;
    if (fromSession) return String(fromSession).trim();

    const decoded = decodeToken(readToken());
    const fromToken = decoded?.LoginId || decoded?.loginId || decoded?.unique_name || decoded?.sub;
    return fromToken ? String(fromToken).trim() : '';
};

// Scans every JWT claim for a numeric id, preferring the most explicit names.
const memberIdFromToken = () => {
    const decoded = decodeToken(readToken());
    if (!decoded) return null;

    console.log('[memberIdentity] JWT claims:', decoded);

    const preferred = ['MemberId', 'memberId', 'MemberID', 'memberID', 'member_id',
        'UserId', 'userId', 'UserID', 'Id', 'id', 'nameid', 'uid', 'sub'];
    for (const key of preferred) {
        if (isNumericId(decoded[key])) return parseInt(decoded[key], 10);
    }
    // Anything else that looks like an id claim.
    for (const [key, val] of Object.entries(decoded)) {
        if (/id$/i.test(key) && isNumericId(val)) return parseInt(val, 10);
    }
    return null;
};

let cachedId = null;
let cachedForToken = null;
let inFlight = null;

export const resolveMemberId = async () => {
    // Tie the cache to the current token so a re-login never reuses the
    // previous user's id.
    const token = readToken();
    if (cachedForToken !== token) {
        cachedId = null;
        inFlight = null;
        cachedForToken = token;
    }
    if (cachedId) return cachedId;

    // 1. Session already holds a usable numeric id.
    const session = getSession();
    for (const candidate of [session?.msrno, session?.userId, session?.id]) {
        if (isNumericId(candidate)) {
            cachedId = parseInt(candidate, 10);
            return cachedId;
        }
    }

    // 2. A numeric claim inside the JWT.
    const fromToken = memberIdFromToken();
    if (fromToken) {
        cachedId = fromToken;
        const current = getSession();
        if (current) saveSession({ ...current, msrno: cachedId, userId: cachedId });
        return cachedId;
    }

    if (inFlight) return inFlight;

    // 3. Member master lookup by LoginId.
    const loginId = getLoginId();
    if (!loginId || !API.member?.getAll) {
        console.warn('[memberIdentity] no LoginId available to resolve member id');
        return null;
    }

    inFlight = (async () => {
        try {
            const res = await API.member.getAll({ search: loginId });
            const items = res?.data?.items || res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
            const matched = (Array.isArray(items) ? items : []).find(m =>
                String(m.loginId || m.loginID || m.LoginID || m.memberId || '').trim().toLowerCase() === loginId.toLowerCase()
            );
            const realId = matched?.id ?? matched?.ID ?? matched?.uniqueID ?? matched?.msrno;
            if (isNumericId(realId)) {
                cachedId = parseInt(realId, 10);
                const current = getSession();
                if (current) saveSession({ ...current, msrno: cachedId, userId: cachedId });
                return cachedId;
            }
            console.warn('[memberIdentity] LoginId', loginId, 'found no numeric Id in Member master');
            return null;
        } catch (err) {
            console.error('[memberIdentity] Member lookup failed:', err);
            return null;
        } finally {
            inFlight = null;
        }
    })();

    return inFlight;
};

// Call on logout so a stale id isn't reused by the next user.
export const clearMemberIdCache = () => {
    cachedId = null;
    cachedForToken = null;
    inFlight = null;
};

/**
 * Simple client-side HTML sanitizer to mitigate XSS attacks (OWASP Cross-Site Scripting).
 * Removes scripts, object/embed/iframe tags, inline events, and javascript: links.
 */
export const sanitizeHTML = (dirtyHTML) => {
  if (!dirtyHTML || typeof dirtyHTML !== 'string') return '';

  // 1. Remove script tags and their content
  let clean = dirtyHTML.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');

  // 2. Remove other dangerous tags like iframe, object, embed, frame, frameset, applet, meta, link
  clean = clean.replace(/<\/?(iframe|object|embed|frame|frameset|applet|meta|link|style)[^>]*>/gi, '');

  // 3. Remove inline events (e.g. onload, onerror, onclick, onmouseover)
  // Match any attribute starting with "on" followed by word characters and equal sign: onxxx=
  clean = clean.replace(/(\s)on[a-zA-Z]+=(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '$1');

  // 4. Remove javascript: pseudo-protocol in href, src, etc.
  clean = clean.replace(/(href|src|action)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|[^\s>]*javascript:[^\s>]*)/gi, '$1="#"');

  return clean;
};

/**
 * Detects SQL injection, XSS, or other malicious payloads in input fields.
 * Returns { isValid: boolean, reason: string }
 */
export const checkMaliciousInput = (input, fieldName = 'Input', isPassword = false) => {
  if (!input || typeof input !== 'string') return { isValid: true, reason: '' };

  const trimmed = input.trim();
  if (trimmed.length === 0) return { isValid: true, reason: '' };



  // 1. Check for basic SQL Injection special characters and sequences
  const maliciousPatterns = [];
  
  if (isPassword) {
    // For passwords, ONLY block scripting tags and active SQLi logic, allow all other characters
    maliciousPatterns.push({ regex: /('|")\s*(or|and)\s*[\d\w]+\s*=\s*[\d\w]+/i, reason: 'Active SQL injection logic detected.' });
    maliciousPatterns.push({ regex: /<script[^>]*>|javascript:/i, reason: 'Scripting elements are not allowed.' });
  } else {
    // Strict checks for User IDs / general inputs
    maliciousPatterns.push(
      { regex: /['";]/, reason: 'Special characters like quotes (\', ") or semicolons (;) are not allowed.' },
      { regex: /--/, reason: 'SQL comment markers (--) are not allowed.' },
      { regex: /\/\*/, reason: 'SQL comment markers (/*) are not allowed.' },
      { regex: /#/, reason: 'SQL comment markers (#) are not allowed.' },
      { regex: /\b(select|union|insert|update|delete|drop|alter|create|truncate|rename|replace|grant|revoke|execute|exec|declare|cast|convert)\b/i, reason: 'SQL keywords/commands are strictly prohibited for security reasons.' },
      { regex: /\b(or|and)\b\s*[\d\w]+\s*=\s*[\d\w]+/i, reason: 'SQL logic queries (e.g. OR 1=1) are strictly prohibited.' },
      { regex: /<script[^>]*>|javascript:/i, reason: 'Scripting elements are not allowed.' },
      { regex: /xp_[\w]+/i, reason: 'SQL system stored procedures are not allowed.' }
    );
  }

  for (const pattern of maliciousPatterns) {
    if (pattern.regex.test(trimmed)) {
      const msg = isPassword ? `${fieldName} contains potentially unsafe SQL injection patterns or comment blocks.` : `${fieldName}: ${pattern.reason}`;
      return { isValid: false, reason: msg };
    }
  }

  // 2. Strict character set check: Alphanumeric and a few safe special characters: @, _, -, .
  // Bypassed for password fields.
  if (!isPassword) {
    const invalidCharRegex = /[^a-zA-Z0-9@_.\-\s]/;
    if (invalidCharRegex.test(trimmed)) {
      return {
        isValid: false,
        reason: `${fieldName} can only contain alphanumeric characters, spaces, @, _, -, and .`
      };
    }
  }

  return { isValid: true, reason: '' };
};


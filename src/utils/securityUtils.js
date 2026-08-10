export const sanitizeHTML = (dirtyHTML) => {
  if (!dirtyHTML || typeof dirtyHTML !== 'string') return '';

    let clean = dirtyHTML.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');

    clean = clean.replace(/<\/?(iframe|object|embed|frame|frameset|applet|meta|link|style)[^>]*>/gi, '');

      clean = clean.replace(/(\s)on[a-zA-Z]+=(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '$1');

    clean = clean.replace(/(href|src|action)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|[^\s>]*javascript:[^\s>]*)/gi, '$1="#"');

  return clean;
};

export const checkMaliciousInput = (input, fieldName = 'Input', isPassword = false) => {
  if (!input || typeof input !== 'string') return { isValid: true, reason: '' };

  const trimmed = input.trim();
  if (trimmed.length === 0) return { isValid: true, reason: '' };

    const maliciousPatterns = [];
  
  if (isPassword) {
        maliciousPatterns.push({ regex: /('|")\s*(or|and)\s*[\d\w]+\s*=\s*[\d\w]+/i, reason: 'Active SQL injection logic detected.' });
    maliciousPatterns.push({ regex: /<script[^>]*>|javascript:/i, reason: 'Scripting elements are not allowed.' });
  } else {
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

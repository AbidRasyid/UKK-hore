const unsafeMessagePattern =
  /(?:<[^>]*>|sqlstate|pdoexception|stack trace|exception\b|\.php\b|\/(?:var|home|srv|app|etc)\/|[a-z]:\\|select\s+.+\s+from|insert\s+into|update\s+\w+\s+set|delete\s+from|authorization:|bearer\s+[\w.-]+|password\s*[:=]|token\s*[:=]|secret\s*[:=])/i;

export function getSafeApiMessage(errorOrMessage, fallback) {
  const message = typeof errorOrMessage === "string"
    ? errorOrMessage
    : errorOrMessage?.response?.data?.message ?? errorOrMessage?.data?.message;
  const containsControlCharacter = typeof message === "string"
    && [...message].some((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint < 32 && codePoint !== 9;
    });

  if (
    typeof message !== "string"
    || message.length > 240
    || containsControlCharacter
    || unsafeMessagePattern.test(message)
  ) {
    return fallback;
  }

  const normalizedMessage = message.trim();
  return normalizedMessage || fallback;
}

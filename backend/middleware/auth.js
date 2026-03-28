function getUserId(req) {
  // Try header first (for fetch requests)
  const fromHeader = parseInt(req.headers["x-user-id"], 10);
  if (fromHeader) return fromHeader;
  
  // Fallback to query parameter (for browser access)
  const fromQuery = parseInt(req.query.token, 10);
  return fromQuery || 0;
}

module.exports = { getUserId };

function isLocalMode() {
  return String(process.env.LOCAL_MODE || '').toLowerCase() === 'true';
}

module.exports = { isLocalMode };

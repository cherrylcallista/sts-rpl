function getErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function hasErrorCode(error, code) {
  return typeof error === 'object' && error !== null && error.code === code;
}

module.exports = { getErrorMessage, hasErrorCode };
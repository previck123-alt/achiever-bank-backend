const crypto = require('crypto');

const PIN_LENGTH = 4;

function validatePin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

function hashPin(pin) {
  if (!validatePin(pin)) {
    throw new Error('Transaction PIN must be exactly 4 digits.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPin(pin, storedValue) {
  if (!validatePin(pin) || !storedValue || !storedValue.includes(':')) {
    return false;
  }

  const [salt, storedHash] = storedValue.split(':');
  const derivedHash = crypto.scryptSync(pin, salt, 64).toString('hex');

  const a = Buffer.from(storedHash, 'hex');
  const b = Buffer.from(derivedHash, 'hex');

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { PIN_LENGTH, validatePin, hashPin, verifyPin };

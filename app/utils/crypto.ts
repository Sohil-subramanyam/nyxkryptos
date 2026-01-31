import CryptoJS from 'crypto-js';

// --- Advanced Encryption Standard (AES-256) + HMAC-SHA256 ---

export const generateMasterKey = (): string => {
  // Generate a cryptographically secure 256-bit key
  const key = CryptoJS.lib.WordArray.random(32);
  return key.toString(CryptoJS.enc.Hex);
};

export const encryptData = (secret: string, keyHex: string): { iv: string; ciphertext: string; hmac: string } => {
  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.lib.WordArray.random(16);
  
  // 1. Encrypt
  const encrypted = CryptoJS.AES.encrypt(secret, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  const ciphertextStr = encrypted.toString();
  const ivStr = iv.toString(CryptoJS.enc.Hex);

  // 2. Generate HMAC (Hash of IV + Ciphertext using the same key)
  const dataToSign = ivStr + ciphertextStr;
  const hmac = CryptoJS.HmacSHA256(dataToSign, key).toString(CryptoJS.enc.Hex);

  return {
    iv: ivStr,
    ciphertext: ciphertextStr,
    hmac: hmac
  };
};

export const decryptData = (vault: { iv: string; ciphertext: string; hmac: string }, keyHex: string): string | null => {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    
    // 1. Verify HMAC (Integrity Check)
    const dataToSign = vault.iv + vault.ciphertext;
    const calculatedHmac = CryptoJS.HmacSHA256(dataToSign, key).toString(CryptoJS.enc.Hex);

    if (calculatedHmac !== vault.hmac) {
      console.error("Integrity Check Failed: Key is wrong or data is tampered.");
      return null;
    }

    // 2. Decrypt
    const iv = CryptoJS.enc.Hex.parse(vault.iv);
    const decrypted = CryptoJS.AES.decrypt(vault.ciphertext, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) return null;
    
    return result;
  } catch (error) {
    console.warn("Decryption failed:", error);
    return null;
  }
};

// --- Finite Field Arithmetic for Shamir's Secret Sharing ---

// Convert hex string to BigInt
const hexToBigInt = (hex: string): bigint => BigInt('0x' + hex);

// Convert BigInt to hex string with CRITICAL padding
const bigIntToHex = (n: bigint): string => {
  let hex = n.toString(16);
  // Ensure even length for byte alignment
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  return hex;
};

// Use Mersenne Prime 2^521 - 1
// This is significantly larger than the 256-bit key space, preventing overflow.
const PRIME = 2n ** 521n - 1n;

const randomBigInt = (max: bigint): bigint => {
  // Generate random 64 bytes (512 bits) - close enough to 521 without going over easily
  const hex = CryptoJS.lib.WordArray.random(64).toString(CryptoJS.enc.Hex);
  return BigInt('0x' + hex) % max;
};

// f(x) evaluation
const evalPoly = (coefficients: bigint[], x: bigint): bigint => {
  let y = BigInt(0);
  let powerOfX = BigInt(1);
  
  for (let i = 0; i < coefficients.length; i++) {
    const term = (coefficients[i] * powerOfX) % PRIME;
    y = (y + term) % PRIME;
    powerOfX = (powerOfX * x) % PRIME;
  }
  return y;
};

export const splitKey = (secretHex: string, n: number, k: number): { id: number; data: string }[] => {
  const secret = hexToBigInt(secretHex);
  const coefficients: bigint[] = [secret]; 

  for (let i = 1; i < k; i++) {
    coefficients.push(randomBigInt(PRIME));
  }

  const shares: { id: number; data: string }[] = [];

  for (let i = 1; i <= n; i++) {
    const x = BigInt(i);
    const y = evalPoly(coefficients, x);
    shares.push({ id: i, data: bigIntToHex(y) });
  }

  return shares;
};

// Lagrange Interpolation
export const reconstructKey = (shares: { id: number; data: string }[]): string | null => {
  if (shares.length === 0) return null;

  let secret = BigInt(0);

  const modInverse = (a: bigint, m: bigint): bigint => {
      let base = a % m;
      let exp = m - 2n;
      let res = BigInt(1);
      
      while (exp > 0n) {
          if (exp % 2n === 1n) res = (res * base) % m;
          exp = exp / 2n;
          base = (base * base) % m;
      }
      return res;
  }

  for (let j = 0; j < shares.length; j++) {
    const xj = BigInt(shares[j].id);
    const yj = hexToBigInt(shares[j].data);

    let numerator = BigInt(1);
    let denominator = BigInt(1);

    for (let m = 0; m < shares.length; m++) {
      if (j === m) continue;
      
      const xm = BigInt(shares[m].id);
      
      let numTerm = (BigInt(0) - xm) % PRIME;
      if (numTerm < 0n) numTerm += PRIME;
      numerator = (numerator * numTerm) % PRIME;
      
      let denTerm = (xj - xm) % PRIME;
      if (denTerm < 0n) denTerm += PRIME;
      denominator = (denominator * denTerm) % PRIME;
    }

    const inverseDenominator = modInverse(denominator, PRIME);
    const lagrangeTerm = (yj * numerator * inverseDenominator) % PRIME;
    
    secret = (secret + lagrangeTerm) % PRIME;
  }

  if (secret < 0n) secret += PRIME;

  let hex = bigIntToHex(secret);
  
  // CRITICAL FIX FOR DATA LOSS:
  // 256-bit keys are 32 bytes = 64 hex characters.
  // Leading zeros are mathematically "0" so BigInt drops them. 
  // We MUST pad back to 64 chars to restore the original key byte structure.
  while (hex.length < 64) {
    hex = '0' + hex;
  }

  return hex;
};
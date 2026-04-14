/**
 * Chiffrement AES-256-GCM pour les clés BYOK.
 * La clé de chiffrement est dérivée de SUPABASE_SERVICE_ROLE_KEY via SHA-256.
 * Compatible Node.js et Edge Runtime (Web Crypto API).
 *
 * Si SUPABASE_SERVICE_ROLE_KEY change, les clés stockées deviennent illisibles
 * et devront être re-saisies par les utilisateurs.
 */

async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('SUPABASE_SERVICE_ROLE_KEY non défini')
  const encoded = new TextEncoder().encode(`${secret}:byok-v1`)
  const keyMaterial = await crypto.subtle.digest('SHA-256', encoded)
  return crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

function toBase64(buf: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(s: string): Uint8Array {
  const binary = atob(s)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Chiffre une clé API en clair. Retourne "base64(iv).base64(cipher)". */
export async function encryptApiKey(plain: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plain)
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return `${toBase64(iv.buffer)}.${toBase64(cipherBuffer)}`
}

/** Déchiffre une clé stockée en DB. Retourne null si invalide ou clé absente. */
export async function decryptApiKey(encrypted: string): Promise<string | null> {
  try {
    const key = await getEncryptionKey()
    const [ivB64, cipherB64] = encrypted.split('.')
    if (!ivB64 || !cipherB64) return null
    // Copie explicite vers ArrayBuffer strict pour satisfaire les types Web Crypto
    const iv = new Uint8Array(fromBase64(ivB64)).buffer as ArrayBuffer
    const cipher = new Uint8Array(fromBase64(cipherB64)).buffer as ArrayBuffer
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

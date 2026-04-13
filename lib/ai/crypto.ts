/**
 * Utilitaire crypto universel (Node.js + Edge runtime)
 * Utilise l'API Web Crypto disponible dans les deux environnements.
 */
export function createCrypto() {
  return {
    async sha256(input: string): Promise<string> {
      const encoded = new TextEncoder().encode(input)
      const buffer = await crypto.subtle.digest('SHA-256', encoded)
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    },
  }
}

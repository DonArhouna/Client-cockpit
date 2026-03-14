/**
 * Utilitaire pour le cache local du navigateur avec expiration (TTL).
 * Atténue le rate limiting du backend en servant des données mises en cache.
 */

const CACHE_PREFIX = 'cockpit_cache_';
const LAST_UPDATE_KEY = 'cockpit_last_update';
const DEFAULT_TTL = 60; // 60 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Stocke les données dans le localStorage avec un timestamp.
 * @param key Clé de cache unique
 * @param data Données à stocker
 */
export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    localStorage.setItem(LAST_UPDATE_KEY, entry.timestamp.toString());
  } catch (e) {
    console.warn('Échec de la sauvegarde dans le cache :', e);
  }
}

/**
 * Récupère l'horodatage de la dernière mise à jour globale.
 * @returns Horodatage au format ISO ou null
 */
export function getLastUpdate(): string | null {
  const ts = localStorage.getItem(LAST_UPDATE_KEY);
  if (!ts) return null;
  return new Date(parseInt(ts)).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Récupère des données valides du localStorage.
 * @param key Clé de cache unique
 * @param ttlMinutes Durée de validité en minutes
 * @returns Données mises en cache ou null si expiré ou manquant
 */
export function getCache<T>(key: string, ttlMinutes: number = DEFAULT_TTL): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();
    const ageMinutes = (now - entry.timestamp) / (1000 * 60);

    if (ageMinutes > ttlMinutes) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (e) {
    console.warn('Failed to read from cache:', e);
    return null;
  }
}

/**
 * Efface toutes les entrées de cache gérées par cet utilitaire.
 */
export function clearAllCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Assistant de rafraîchissement forcé : vide le cache et recharge la page.
 */
export function forceRefresh(): void {
  clearAllCache();
  localStorage.removeItem(LAST_UPDATE_KEY);
  window.location.reload();
}

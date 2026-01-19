/**
 * Configuration de la connexion à la base de données MySQL
 *
 * Ce fichier contient les paramètres de connexion à la base de données.
 * ATTENTION: Les identifiants sont en dur dans le code (mauvaise pratique volontaire)
 *
 * @module config/database
 */
import mysql from 'mysql2/promise';
/**
 * Pool de connexions MySQL
 * Permet de réutiliser les connexions pour de meilleures performances
 */
declare const pool: mysql.Pool;
/**
 * Fonction pour obtenir une connexion depuis le pool
 * @returns Promise<Connection> Une connexion MySQL
 */
export declare const getConnection: () => Promise<mysql.PoolConnection>;
/**
 * Export du pool pour utilisation directe
 */
export default pool;
//# sourceMappingURL=database.d.ts.map
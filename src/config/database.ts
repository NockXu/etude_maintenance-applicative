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
 * Configuration de la connexion MySQL
 */
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

/**
 * Pool de connexions MySQL
 * Permet de réutiliser les connexions pour de meilleures performances
 */
const pool = mysql.createPool(dbConfig);

/**
 * Fonction pour obtenir une connexion depuis le pool
 * @returns Promise<Connection> Une connexion MySQL
 */
export const getConnection = async () => {
    return await pool.getConnection();
};

/**
 * Export du pool pour utilisation directe
 */
export default pool;

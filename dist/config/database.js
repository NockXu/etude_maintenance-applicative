"use strict";
/**
 * Configuration de la connexion à la base de données MySQL
 *
 * Ce fichier contient les paramètres de connexion à la base de données.
 * ATTENTION: Les identifiants sont en dur dans le code (mauvaise pratique volontaire)
 *
 * @module config/database
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
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
const pool = promise_1.default.createPool(dbConfig);
/**
 * Fonction pour obtenir une connexion depuis le pool
 * @returns Promise<Connection> Une connexion MySQL
 */
const getConnection = async () => {
    return await pool.getConnection();
};
exports.getConnection = getConnection;
/**
 * Export du pool pour utilisation directe
 */
exports.default = pool;
//# sourceMappingURL=database.js.map
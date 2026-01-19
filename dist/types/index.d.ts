/**
 * Définitions des types TypeScript pour l'application
 *
 * Ce fichier contient toutes les interfaces et types utilisés
 * dans l'application pour assurer le typage fort.
 *
 * @module types
 */
/**
 * Interface représentant un utilisateur de la base de données
 */
export interface User {
    id: number;
    username: string;
    password: string;
    role: 'admin' | 'user';
}
/**
 * Interface représentant un produit
 */
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    created_at?: Date;
}
/**
 * Extension de l'interface Session pour inclure les données utilisateur
 */
declare module 'express-session' {
    interface SessionData {
        userId?: number;
        username?: string;
        role?: string;
        isLoggedIn?: boolean;
    }
}
//# sourceMappingURL=index.d.ts.map
-- ============================================================
-- Script d'initialisation de la base de données
-- Mini Site Web - TP Maintenance Applicative
-- ============================================================

-- Désactivation des contraintes pour permettre le nettoyage
SET FOREIGN_KEY_CHECKS = 0;

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS mini_site;
USE mini_site;

-- ============================================================
-- Table des utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table des produits
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table des achats
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================
-- Nettoyage des données existantes (Reset)
-- ============================================================
TRUNCATE TABLE purchases;
TRUNCATE TABLE products;
TRUNCATE TABLE users;

-- ============================================================
-- Données de test - Utilisateurs
-- ============================================================
INSERT INTO users (username, password, role) VALUES
    ('admin', '$2b$10$Exq0LaeUn0wSCQxNMDMzZOZRYk.s/T4DbJWSfB48meYGCgw5Bfqfq', 'admin'),
    ('user', '$2b$10$cnYid4zhD4QZrG11XcCLuepGNGp5xAQZSWwS4kAn63TQhHS8P6nUC', 'user');

-- ============================================================
-- Données de test - Produits
-- ============================================================
INSERT INTO products (name, description, price, quantity) VALUES
    ('Laptop HP', 'Ordinateur portable HP 15 pouces, 8GB RAM, 256GB SSD', 799.99, 15),
    ('Souris Logitech', 'Souris sans fil ergonomique Logitech MX Master', 89.99, 45),
    ('Clavier Mécanique', 'Clavier gaming mécanique RGB Cherry MX', 129.99, 30),
    ('Écran 27 pouces', 'Moniteur LED 27" Full HD IPS', 249.99, 20),
    ('Webcam HD', 'Webcam 1080p avec microphone intégré', 59.99, 50);

-- Réactivation des contraintes
SET FOREIGN_KEY_CHECKS = 1;
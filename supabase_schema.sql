-- ========================================================
-- DamShop E-Commerce - Script de Création de Base de Données Supabase
-- Exécutez ce script dans l'Éditeur SQL de votre projet Supabase (SQL Editor)
-- ========================================================

-- 1. Table des Catégories
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Sparkles',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Produits
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    category TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    image TEXT,
    images TEXT[],
    description TEXT,
    stock INT DEFAULT 10,
    sizes TEXT[],
    colors TEXT[],
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_whatsapp TEXT,
    customer_city TEXT DEFAULT 'Lomé',
    delivery_address TEXT,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des Avis Clients
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table des Notifications Admin
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table des Comptes Administrateurs & Collaborateurs
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'collaborator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- Politiques d'Accès Sécurisées (Row Level Security - RLS)
-- Permet la lecture publique et l'insertion de commandes/avis
-- ========================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Accès Public en Lecture (Catalogues, Produits, Catégories, Avis)
CREATE POLICY "Lecture publique des catégories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Lecture publique des produits" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lecture publique des avis" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Lecture publique des réglages" ON public.settings FOR SELECT USING (true);

-- Permettre aux clients de créer des commandes et des avis
CREATE POLICY "Création de commande publique" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Création d'avis publique" ON public.reviews FOR INSERT WITH CHECK (true);

-- Accès d'administration et opérations publiques contrôlées
CREATE POLICY "Gestion admin catégories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Gestion admin produits" ON public.products FOR ALL USING (true);
CREATE POLICY "Gestion admin avis" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Gestion admin réglages" ON public.settings FOR ALL USING (true);
CREATE POLICY "Gestion admin commandes" ON public.orders FOR ALL USING (true);
CREATE POLICY "Gestion admin comptes" ON public.admin_accounts FOR ALL USING (true);

-- Activer les notifications en temps réel pour les nouvelles commandes
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_accounts;

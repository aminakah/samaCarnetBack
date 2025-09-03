# 🩺 SamaCarnet Backend - API Carnet de Santé Digital

## 📋 Description

SamaCarnet est une API backend complète pour la gestion informatisée d'un carnet de santé digital, spécialement conçue pour le suivi de grossesse et la vaccination au Sénégal. Cette API supporte le multitenant, la synchronisation offline et le multilingue (Français, Wolof, Anglais).

## ✨ Fonctionnalités

### 🔐 Authentification & Multitenant
- Authentification par tokens (Sanctum)
- Support multitenant avec isolation complète des données
- Gestion des rôles (Admin, Docteur, Sage-femme, Patient)
- Registration de tenants et utilisateurs

### 🤰 Suivi de Grossesse
- Création et suivi des grossesses
- Calculs automatiques (âge gestationnel, DPA)
- Gestion des facteurs de risque
- Suivi par trimestre

### 👩‍⚕️ Consultations Médicales
- Enregistrement des consultations
- Vitaux complets (TA, poids, hauteur utérine)
- Surveillance fœtale
- Prescriptions et recommandations
- Évaluation des risques

### 💉 Gestion Vaccination
- Calendrier vaccinal automatique
- Enregistrement des vaccinations
- Génération de certificats
- Suivi des séries de vaccins
- Gestion des effets indésirables

### 🔄 Synchronisation Offline
- Sync bidirectionnelle (pull/push)
- Résolution de conflits intelligente
- Versioning des données
- Logs de synchronisation

### 🌐 Support Multilingue
- Français (fr)
- Wolof (wo) 
- Anglais (en)

## 🚀 Installation

### Prérequis
- Node.js >= 18
- MySQL >= 8.0
- npm ou yarn

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
```bash
cp .env.example .env
```

Modifiez le fichier `.env` :
```env
# Base
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
NODE_ENV=development

# Générer une clé d'application
APP_KEY=your_32_character_secret_key_here

# Base de données
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=samacarnet_dev

# Multitenant
DEFAULT_TENANT=demo
TENANT_CACHE_TTL=3600

# Synchronisation
SYNC_BATCH_SIZE=100
SYNC_TIMEOUT_MS=30000

# Multilingue
DEFAULT_LOCALE=fr
SUPPORTED_LOCALES=fr,wo,en
```

### 3. Génération de la clé d'application
```bash
node ace generate:key
```

### 4. Migrations de la base de données
```bash
node ace migration:run
```

### 5. Seed des données de développement
```bash
node ace db:seed --files=dev_seeder.ts
```

### 6. Démarrage du serveur
```bash
# Développement avec hot reload
node ace serve --watch

# Production
npm start
```

## 🧪 Tests

### Test de l'API de base
```bash
# Rendre le script exécutable
chmod +x test_api.sh

# Lancer les tests
./test_api.sh
```

### Tests unitaires
```bash
node ace test
```

### Tests spécifiques
```bash
# Tests d'authentification
node ace test --grep="Auth"

# Tests d'API
node ace test tests/functional/
```

## 📡 Utilisation de l'API

### Endpoints Principaux

#### 🔓 Endpoints Publics
- `GET /health` - Vérification de l'état de l'API
- `POST /api/v1/public/auth/login` - Connexion utilisateur
- `POST /api/v1/public/tenants/register` - Enregistrement nouveau tenant

#### 🔐 Endpoints Authentifiés
- `GET /api/v1/auth/profile` - Profil utilisateur
- `PUT /api/v1/auth/profile` - Modifier profil
- `POST /api/v1/auth/logout` - Déconnexion

#### 🤰 Grossesses
- `GET /api/v1/pregnancies` - Liste des grossesses
- `POST /api/v1/pregnancies` - Créer une grossesse
- `GET /api/v1/pregnancies/:id` - Détails grossesse
- `PUT /api/v1/pregnancies/:id` - Modifier grossesse
- `GET /api/v1/pregnancies/:id/summary` - Résumé grossesse

#### 👩‍⚕️ Consultations
- `GET /api/v1/consultations` - Liste des consultations
- `POST /api/v1/consultations` - Créer une consultation
- `GET /api/v1/consultations/:id` - Détails consultation
- `PUT /api/v1/consultations/:id` - Modifier consultation

#### 💉 Vaccinations
- `GET /api/v1/vaccinations` - Liste des vaccinations
- `POST /api/v1/vaccinations` - Enregistrer vaccination
- `GET /api/v1/vaccinations/schedule/:patient_id` - Calendrier vaccinal
- `POST /api/v1/vaccinations/schedule/:patient_id/generate` - Générer calendrier

#### 🔄 Synchronisation
- `GET /api/v1/sync/status` - Statut sync
- `POST /api/v1/sync/pull` - Télécharger changements
- `POST /api/v1/sync/push` - Envoyer changements
- `GET /api/v1/sync/conflicts` - Conflits non résolus

### Headers Requis

Tous les endpoints nécessitent :
```bash
Content-Type: application/json
x-tenant-id: 1  # ID du tenant
```

Les endpoints authentifiés nécessitent aussi :
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

### Exemple d'utilisation

#### 1. Connexion
```bash
curl -X POST http://localhost:3333/api/v1/public/auth/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 1" \
  -d '{
    "email": "fatou.seck@demo.com",
    "password": "password123"
  }'
```

#### 2. Récupération du profil
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-tenant-id: 1" \
  http://localhost:3333/api/v1/auth/profile
```

#### 3. Créer une grossesse
```bash
curl -X POST http://localhost:3333/api/v1/pregnancies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 1" \
  -d '{
    "patientId": 1,
    "lastMenstrualPeriod": "2024-01-15",
    "isFirstPregnancy": true
  }'
```

## 🎯 Données de Test

Après le seeding, les données suivantes sont disponibles :

### 👤 Utilisateurs de Test
- **Admin** : `admin@demo.com` / `password123`
- **Docteur** : `fatou.seck@demo.com` / `password123`
- **Sage-femme** : `awa.ndiaye@demo.com` / `password123`
- **Patiente 1** : `aminata.diallo@demo.com` / `password123`
- **Patiente 2** : `khadija.ba@demo.com` / `password123`

### 🏥 Tenant de Test
- **Nom** : Clinique Demo Dakar
- **Subdomain** : demo
- **ID** : 1

### 💉 Vaccins Préchargés
- Tétanos-Diphtérie (femmes enceintes)
- BCG (nourrissons)
- Pentavalent (nourrissons)

## 🔧 Architecture

### Structure des Dossiers
```
app/
├── controllers/          # Contrôleurs API
├── models/              # Modèles Lucid ORM
├── services/            # Services métier
├── validators/          # Validation des données
├── middleware/          # Middleware (auth, tenant, rôles)
└── exceptions/          # Exceptions personnalisées

database/
├── migrations/          # Migrations de DB
└── seeders/            # Seeds de données

tests/
├── functional/         # Tests d'API
└── unit/              # Tests unitaires
```

### Technologies
- **Framework** : AdonisJS v6
- **Base de données** : MySQL
- **ORM** : Lucid
- **Authentification** : Access Tokens
- **Validation** : Vine
- **Tests** : Japa

## 🌍 Multitenant

L'API supporte plusieurs méthodes d'identification des tenants :

1. **Header x-tenant-id** : `x-tenant-id: 1`
2. **Subdomain** : `demo.api.com`
3. **Domain personnalisé** : `clinique-demo.com`

## 🔄 Synchronisation Offline

### Processus de Sync
1. **Pull** : Client récupère les changements serveur
2. **Push** : Client envoie ses modifications
3. **Conflict Resolution** : Résolution automatique ou manuelle des conflits

### Stratégies de Conflit
- `client_wins` : Les données client sont prioritaires
- `server_wins` : Les données serveur sont prioritaires  
- `merge` : Fusion intelligente des données
- `manual` : Résolution manuelle requise

## 📝 Logs & Monitoring

### Logs disponibles
- Logs d'authentification
- Logs de synchronisation
- Logs d'erreurs API
- Logs d'audit des données médicales

### Monitoring
- Métriques de performance sync
- Statistiques d'utilisation
- Monitoring de santé API

## 🚀 Déploiement

### Production
1. Configurer les variables d'environnement production
2. Optimiser la base de données
3. Configurer HTTPS et CORS
4. Setup monitoring et logs
5. Backup réguliers

### Docker (Optionnel)
```dockerfile
# Dockerfile disponible pour containerisation
FROM node:18-alpine
# ... configuration Docker
```

## 🤝 Contribution

### Développement
1. Fork du repository
2. Créer une branche feature
3. Développer avec tests
4. Soumettre une Pull Request

### Standards de Code
- ESLint pour le linting
- Prettier pour le formatting
- Tests obligatoires pour nouvelles features
- Documentation des endpoints

## 📞 Support

Pour toute question ou problème :
- **Email** : aminata.kah@isi.sn
- **GitHub Issues** : Créer un ticket
- **Documentation** : Voir `/docs` pour plus de détails

## 📄 Licence

Ce projet est développé dans le cadre du mémoire de fin de cycle d'Aminata Adama BA à l'Institut Supérieur d'Informatique (ISI) - Dakar, Sénégal.

---

**🎓 Projet Académique - Licence Informatique 2023-2024**  
**📍 Institut Supérieur d'Informatique (ISI) - Dakar, Sénégal**

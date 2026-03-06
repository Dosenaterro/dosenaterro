# Portfolio Backend - Real Dosenaterro

Backend server pour le portfolio de Real Dosenaterro avec fonctionnalité d'envoi d'emails.

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

1. Clonez ce repository
2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   ```bash
   cp .env.example .env
   ```
   Modifiez le fichier `.env` avec vos propres valeurs.

4. Lancez le serveur en mode développement :
   ```bash
   npm run dev
   ```

Le serveur sera accessible sur `http://localhost:3001`

## 📧 Configuration Email

### Développement (Ethereal - recommandé pour les tests)

Le serveur est préconfiguré pour utiliser Ethereal Email pour les tests. Les emails sont envoyés vers un service de test et vous pouvez voir les emails dans le navigateur.

### Production

Pour la production, configurez un vrai fournisseur SMTP dans le fichier `.env` :

```env
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
```

## 📡 API Endpoints

### POST /api/contact

Envoie un email de contact.

**Corps de la requête :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "project_type": "web-development",
  "budget": "5000-10000",
  "message": "Bonjour, je suis intéressé par vos services...",
  "privacy": true
}
```

**Réponse de succès :**
```json
{
  "success": true,
  "message": "Message envoyé avec succès !"
}
```

**Réponse d'erreur :**
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

### GET /api/health

Vérifie l'état du serveur.

## 🛡️ Sécurité

- Rate limiting (5 requêtes par IP toutes les 15 minutes)
- Validation des données d'entrée
- Headers de sécurité (Helmet)
- CORS configuré
- Sanitisation des entrées

## 📦 Dépendances

- **express** - Framework web
- **nodemailer** - Envoi d'emails
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Headers de sécurité
- **express-rate-limit** - Limitation du taux de requêtes
- **dotenv** - Variables d'environnement

## 🔧 Scripts disponibles

- `npm start` - Lance le serveur en production
- `npm run dev` - Lance le serveur en mode développement avec nodemon

## 🚀 Déploiement

### Heroku

1. Créez une application Heroku
2. Configurez les variables d'environnement dans les settings Heroku
3. Déployez avec git push

### Autres plateformes

Assurez-vous de configurer les variables d'environnement et d'installer les dépendances.

## 📝 Licence

MIT
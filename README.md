# GitHub Codespaces ♥️ Flask

Welcome to your shiny new Codespace running Flask! We've got everything fired up and running for you to explore Flask.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

To run this application:

```
flask --debug run
```

# Fitness RPG - Application Dockerisée

## 🐳 Utilisation avec Docker

### Méthode 1: Docker Compose (Recommandée)

```bash
# Construire et démarrer l'application
docker-compose up --build

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter l'application
docker-compose down
```

### Méthode 2: Docker seul

```bash
# Construire l'image
docker build -t fitness-rpg .

# Lancer le conteneur
docker run -p 5000:5000 fitness-rpg
```

## 🌐 Accès à l'application

- **Application principale**: http://localhost:5000
- **Avec Nginx**: http://localhost:80
- **Health check**: http://localhost:5000/health

## 🔧 Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Entrer dans le conteneur
docker-compose exec fitness-app bash

# Redémarrer seulement l'app
docker-compose restart fitness-app

# Voir les conteneurs actifs
docker-compose ps
```

## 📦 Structure Docker

- `Dockerfile`: Configuration de l'image Docker
- `docker-compose.yml`: Orchestration des services
- `requirements.txt`: Dépendances Python
- `nginx.conf`: Configuration du reverse proxy (optionnel)

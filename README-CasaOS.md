# 🏠 Déploiement sur CasaOS

## Méthode 1: Installation via Docker Compose (Recommandée)

### 1. Préparer les fichiers
```bash
# Créer un dossier pour l'application
mkdir -p /DATA/AppData/fitness-rpg
cd /DATA/AppData/fitness-rpg

# Copier tous les fichiers du projet
```

### 2. Déployer avec Docker Compose
```bash
# Dans le répertoire de l'application
docker-compose up -d --build
```

### 3. Accéder à l'application
- URL locale: `http://[IP-CASAOS]:5000`
- Interface CasaOS: Applications > Fitness RPG

## Méthode 2: Installation via l'interface CasaOS

### 1. Accéder à CasaOS
1. Ouvrir l'interface web CasaOS
2. Aller dans "App Store" ou "Applications"
3. Cliquer sur "Install a custom app"

### 2. Configuration de l'application
```yaml
Nom: Fitness RPG
Image: fitness-rpg:latest
Port: 5000:5000
Volumes:
  - /DATA/AppData/fitness-rpg/data:/app/data
  - /DATA/AppData/fitness-rpg/logs:/app/logs
Variables d'environnement:
  - FLASK_ENV=production
  - TZ=Europe/Paris
```

### 3. Construire l'image Docker
```bash
# Dans le répertoire du projet
docker build -t fitness-rpg:latest .
```

## Méthode 3: Via Git et build automatique

### 1. Cloner le repository
```bash
cd /DATA/AppData
git clone https://github.com/yourusername/fitness-rpg.git
cd fitness-rpg
```

### 2. Build et run
```bash
docker-compose up -d --build
```

## 🔧 Configuration post-installation

### Volumes de données
- **Données app**: `/DATA/AppData/fitness-rpg/data`
- **Logs**: `/DATA/AppData/fitness-rpg/logs`

### Ports utilisés
- **5000**: Interface web principale

### Variables d'environnement importantes
- `FLASK_ENV`: Mode de production/développement
- `TZ`: Fuseau horaire (Europe/Paris par défaut)

## 🛠️ Maintenance

### Mettre à jour l'application
```bash
cd /DATA/AppData/fitness-rpg
git pull
docker-compose down
docker-compose up -d --build
```

### Voir les logs
```bash
docker-compose logs -f fitness-app
```

### Sauvegarder les données
```bash
tar -czf fitness-rpg-backup.tar.gz /DATA/AppData/fitness-rpg/data
```

## 🔥 Troubleshooting

### L'application ne démarre pas
```bash
# Vérifier les logs
docker-compose logs fitness-app

# Vérifier l'état des conteneurs
docker-compose ps
```

### Problème de permissions
```bash
# Corriger les permissions
sudo chown -R 1000:1000 /DATA/AppData/fitness-rpg
```

### Reset complet
```bash
docker-compose down -v
docker-compose up -d --build
```

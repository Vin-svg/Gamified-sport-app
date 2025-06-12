# Utiliser l'image officielle Python 3.11 slim
FROM python:3.11-slim

# Métadonnées pour CasaOS
LABEL maintainer="your-email@example.com"
LABEL description="Fitness RPG - Application de fitness gamifiée"
LABEL version="1.0.0"

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Définir les variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV TZ=Europe/Paris

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier requirements.txt
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p /app/data /app/logs

# Créer un utilisateur non-root pour la sécurité
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Exposer le port 5000
EXPOSE 5000

# Commande de santé pour vérifier que l'app fonctionne
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Commande pour démarrer l'application
CMD ["python", "app.py"]

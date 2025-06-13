# Utilise l'image officielle Python 3.12 slim
FROM python:3.12-slim

# Installe curl pour le healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie le fichier requirements.txt et installe les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie le code de l'application
COPY . .

# Expose le port 5000 (port par défaut de Flask)
EXPOSE 5000

# Définit les variables d'environnement
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=5000

# Crée un utilisateur non-root pour la sécurité
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Healthcheck pour vérifier si l'application fonctionne
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Commande par défaut pour démarrer l'application avec Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]

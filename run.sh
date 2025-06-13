#!/bin/bash

# Script pour construire et démarrer l'application FitQuest avec Docker

echo "🏋️  Démarrage de FitQuest - App de Fitness Gamifiée"
echo "=================================================="

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  build     Construire l'image Docker"
    echo "  start     Démarrer l'application (avec construction si nécessaire)"
    echo "  stop      Arrêter l'application"
    echo "  restart   Redémarrer l'application"
    echo "  logs      Afficher les logs"
    echo "  clean     Nettoyer les conteneurs et images"
    echo "  nginx     Démarrer avec nginx en proxy reverse"
    echo "  help      Afficher cette aide"
    echo ""
}

# Fonction pour construire l'image
build_image() {
    echo "🔨 Construction de l'image Docker..."
    docker build -t fitquest-app:latest .
    if [ $? -eq 0 ]; then
        echo "✅ Image construite avec succès!"
    else
        echo "❌ Erreur lors de la construction de l'image"
        exit 1
    fi
}

# Fonction pour démarrer l'application
start_app() {
    echo "🚀 Démarrage de l'application..."
    
    # Vérifier si l'image existe, sinon la construire
    if ! docker images fitquest-app:latest | grep -q fitquest-app; then
        echo "Image non trouvée, construction en cours..."
        build_image
    fi
    
    docker-compose up -d fitquest-app
    
    if [ $? -eq 0 ]; then
        echo "✅ Application démarrée avec succès!"
        echo "🌐 Accédez à l'application sur: http://localhost:5000"
        echo "❤️  Health check disponible sur: http://localhost:5000/health"
    else
        echo "❌ Erreur lors du démarrage"
        exit 1
    fi
}

# Fonction pour démarrer avec nginx
start_with_nginx() {
    echo "🚀 Démarrage avec nginx en proxy reverse..."
    
    # Vérifier si l'image existe, sinon la construire
    if ! docker images fitquest-app:latest | grep -q fitquest-app; then
        echo "Image non trouvée, construction en cours..."
        build_image
    fi
    
    docker-compose --profile nginx up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ Application et nginx démarrés avec succès!"
        echo "🌐 Accédez à l'application sur: http://localhost"
        echo "🔧 Health check nginx: http://localhost/nginx-health"
        echo "❤️  Health check app: http://localhost/health"
    else
        echo "❌ Erreur lors du démarrage"
        exit 1
    fi
}

# Fonction pour arrêter l'application
stop_app() {
    echo "🛑 Arrêt de l'application..."
    docker-compose down
    echo "✅ Application arrêtée"
}

# Fonction pour redémarrer
restart_app() {
    stop_app
    start_app
}

# Fonction pour afficher les logs
show_logs() {
    echo "📋 Logs de l'application:"
    docker-compose logs -f fitquest-app
}

# Fonction pour nettoyer
clean_up() {
    echo "🧹 Nettoyage des conteneurs et images..."
    docker-compose down --volumes --remove-orphans
    docker rmi fitquest-app:latest 2>/dev/null || true
    echo "✅ Nettoyage terminé"
}

# Traitement des arguments
case "$1" in
    build)
        build_image
        ;;
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    nginx)
        start_with_nginx
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Option invalide: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

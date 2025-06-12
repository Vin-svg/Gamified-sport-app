from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', title='FitQuest - App de Fitness Gamifiée')

@app.route('/api/save-data', methods=['POST'])
def save_data():
    # API pour sauvegarder les données (backup serveur optionnel)
    return jsonify({'status': 'success'})

@app.route('/api/get-data', methods=['GET'])
def get_data():
    # API pour récupérer les données (backup serveur optionnel)
    return jsonify({'status': 'success'})

@app.route('/api/reset-progress', methods=['POST'])
def reset_progress():
    """
    Réinitialise complètement la progression de l'utilisateur
    Remet tout à zéro : niveau, XP, entrainements, statistiques
    """
    try:
        print("API reset-progress appelée")  # Debug
        
        # Structure des données par défaut après reset
        default_data = {
            'level': 1,
            'xp': 0,
            'totalXp': 0,
            'streak': 0,
            'badges': [],
            'theme': 'blue',
            'workoutHistory': [],
            'totalWorkouts': 0,
            'lastWorkout': None,
            'customReps': {},
            'playerName': None
        }
        
        print("Reset réussi, données par défaut:", default_data)  # Debug
        
        return jsonify({
            'status': 'success',
            'message': 'Progression réinitialisée avec succès',
            'data': default_data
        })
        
    except Exception as e:
        print(f"Erreur dans reset_progress: {str(e)}")  # Debug
        return jsonify({
            'status': 'error',
            'message': f'Erreur lors de la réinitialisation : {str(e)}'
        }), 500

# Route de santé pour le healthcheck Docker
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Application is running'}), 200

if __name__ == '__main__':
    # Configuration pour Docker
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(debug=debug, host='0.0.0.0', port=port)
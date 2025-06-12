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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
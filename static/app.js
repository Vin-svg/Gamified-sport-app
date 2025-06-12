class FitnessApp {
    constructor() {
        this.currentScreen = 'loader';
        this.playerData = this.loadPlayerData();
        this.exercisesData = null;
        this.workoutProgram = [];
        this.currentWorkout = null;
        this.currentExerciseIndex = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isWorkoutActive = false;
        this.isRecoveryTime = false;
        this.recoveryTimer = 0;
        
        this.initializeApp();
    }

    async initializeApp() {
        // Activer l'affichage du contenu
        document.documentElement.classList.add('css-loaded');
        document.documentElement.setAttribute('data-theme', this.playerData.theme);
        
        // Charger les données des exercices
        await this.loadExercisesData();
        
        // Initialiser le programme d'entraînement
        this.workoutProgram = this.initializeWorkoutProgram();
        
        this.createLoaderScreen();
        this.showLoaderOrSetup();
    }

    async loadExercisesData() {
        try {
            const response = await fetch('/static/db.json');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des données');
            }
            this.exercisesData = await response.json();
            console.log('Données des exercices chargées:', this.exercisesData);
        } catch (error) {
            console.error('Erreur lors du chargement de db.json:', error);
            // Fallback vers les données par défaut si le fichier n'est pas accessible
            this.exercisesData = this.getDefaultExercisesData();
        }
    }

    getDefaultExercisesData() {
        // Données de fallback si db.json n'est pas accessible
        return {
            exercises: [
                {
                    id: 'warmup',
                    name: 'Échauffement - Marche sur place',
                    icon: '🚶‍♀️',
                    description: 'Marchez sur place en levant les genoux. Bougez vos bras naturellement.',
                    duration: 120,
                    type: 'timed',
                    category: 'warmup',
                    recoveryTime: 30,
                    defaultReps: null
                },
                {
                    id: 'squats',
                    name: 'Squats adaptés',
                    icon: '🦵',
                    description: 'Descendez comme si vous vous asseyiez sur une chaise. Gardez le dos droit.',
                    duration: null,
                    type: 'reps',
                    category: 'strength',
                    recoveryTime: 45,
                    defaultReps: 8
                }
                // ... autres exercices par défaut
            ],
            badges: []
        };
    }

    initializeWorkoutProgram() {
        if (!this.exercisesData || !this.exercisesData.exercises) {
            console.error('Données des exercices non disponibles');
            return [];
        }

        const savedReps = this.playerData.customReps || {};
        
        // Créer le programme en appliquant les répétitions personnalisées
        return this.exercisesData.exercises.map(exerciseData => {
            const exercise = { ...exerciseData };
            
            // Appliquer les répétitions personnalisées sauvegardées
            if (exercise.type === 'reps' && exercise.defaultReps) {
                exercise.targetReps = savedReps[exercise.id] || exercise.defaultReps;
            }
            
            return exercise;
        });
    }

    loadPlayerData() {
        const defaultData = {
            level: 1,
            xp: 0,
            totalXp: 0,
            streak: 0,
            badges: [],
            theme: 'blue',
            workoutHistory: [],
            totalWorkouts: 0,
            lastWorkout: null,
            customReps: {},
            playerName: null
        };

        const saved = localStorage.getItem('fitnessAppData');
        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    }

    savePlayerData() {
        localStorage.setItem('fitnessAppData', JSON.stringify(this.playerData));
    }

    createLoaderScreen() {
        // Créer l'écran de chargement/setup dynamiquement
        const app = document.getElementById('app');
        
        // Créer l'écran loader s'il n'existe pas
        if (!document.getElementById('loader-screen')) {
            const loaderScreen = document.createElement('div');
            loaderScreen.id = 'loader-screen';
            loaderScreen.className = 'screen';
            loaderScreen.innerHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; text-align: center; padding: 20px;">
                    <div id="loader-content">
                        <!-- Contenu dynamique -->
                    </div>
                </div>
            `;
            app.insertBefore(loaderScreen, app.firstChild);
        }
    }

    showLoaderOrSetup() {
        const loaderContent = document.getElementById('loader-content');
        
        if (!this.playerData.playerName) {
            // Mode setup - demander le nom
            loaderContent.innerHTML = `
                <div style="max-width: 400px;">
                    <h1 style="color: var(--primary-color); margin-bottom: 30px;">🏋️ Fitness RPG</h1>
                    <p style="margin-bottom: 30px; font-size: 18px;">Bienvenue dans votre aventure fitness !</p>
                    <p style="margin-bottom: 20px;">Comment souhaitez-vous être appelé ?</p>
                    <input type="text" id="player-name-input" placeholder="Votre pseudo" 
                           style="width: 100%; padding: 15px; border: 2px solid var(--primary-color); border-radius: 10px; font-size: 16px; margin-bottom: 20px; text-align: center;">
                    <button id="start-app-btn" class="btn-primary btn-large" style="width: 100%;">Commencer l'aventure !</button>
                </div>
            `;
            
            // Bind des événements
            document.getElementById('player-name-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.setPlayerName();
                }
            });
            
            document.getElementById('start-app-btn').addEventListener('click', () => {
                this.setPlayerName();
            });
            
            // Focus sur l'input
            setTimeout(() => {
                document.getElementById('player-name-input').focus();
            }, 100);
            
        } else {
            // Mode chargement - afficher bienvenue
            loaderContent.innerHTML = `
                <div>
                    <h1 style="color: var(--primary-color); margin-bottom: 30px;">🏋️ Fitness RPG</h1>
                    <div style="font-size: 24px; margin-bottom: 30px;">
                        Bienvenue, <strong style="color: var(--primary-color);">${this.playerData.playerName}</strong> !
                    </div>
                    <div class="loading-spinner" style="margin: 20px 0;">
                        <div style="width: 40px; height: 40px; border: 4px solid var(--surface); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                    <p style="color: var(--text-secondary);">Chargement de votre profil...</p>
                </div>
            `;
            
            // Ajouter l'animation CSS
            if (!document.getElementById('spinner-style')) {
                const style = document.createElement('style');
                style.id = 'spinner-style';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Transition vers l'app après 2 secondes
            setTimeout(() => {
                this.startMainApp();
            }, 2000);
        }
        
        // Afficher l'écran loader
        this.showScreen('loader');
    }

    setPlayerName() {
        const nameInput = document.getElementById('player-name-input');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showNotification('Veuillez entrer un nom !', 'error');
            nameInput.focus();
            return;
        }
        
        if (name.length > 20) {
            this.showNotification('Le nom doit faire moins de 20 caractères !', 'error');
            nameInput.focus();
            return;
        }
        
        this.playerData.playerName = name;
        this.savePlayerData();
        
        // Afficher un message de confirmation
        const loaderContent = document.getElementById('loader-content');
        loaderContent.innerHTML = `
            <div>
                <h1 style="color: var(--primary-color); margin-bottom: 30px;">🎉</h1>
                <div style="font-size: 24px; margin-bottom: 20px;">
                    Parfait, <strong style="color: var(--primary-color);">${name}</strong> !
                </div>
                <p style="margin-bottom: 30px;">Votre aventure fitness commence maintenant !</p>
                <div class="loading-spinner" style="margin: 20px 0;">
                    <div style="width: 40px; height: 40px; border: 4px solid var(--surface); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.startMainApp();
        }, 2000);
    }

    startMainApp() {
        this.bindEvents();
        this.updateUI();
        this.showScreen('home');
    }

    bindEvents() {
        // Navigation
        document.getElementById('nav-home')?.addEventListener('click', () => this.showScreen('home'));
        document.getElementById('nav-training')?.addEventListener('click', () => this.showScreen('training'));
        document.getElementById('nav-profile')?.addEventListener('click', () => this.showScreen('profile'));
        
        // Boutons retour
        document.getElementById('back-to-home')?.addEventListener('click', () => this.showScreen('home'));
        document.getElementById('back-to-home-profile')?.addEventListener('click', () => this.showScreen('home'));
        
        // Commencer l'entraînement
        document.getElementById('start-workout')?.addEventListener('click', () => this.startWorkout());
        
        // Sélection de couleur
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.changeTheme(theme);
            });
        });
    }

    checkForBadges() {
        if (!this.exercisesData || !this.exercisesData.badges) {
            return;
        }

        const newBadges = [];
        
        this.exercisesData.badges.forEach(badgeData => {
            // Vérifier si le badge n'est pas déjà obtenu
            if (this.playerData.badges.includes(badgeData.id)) {
                return;
            }

            let requirementMet = false;
            const req = badgeData.requirement;

            switch (req.type) {
                case 'totalWorkouts':
                    requirementMet = this.playerData.totalWorkouts >= req.value;
                    break;
                case 'level':
                    requirementMet = this.playerData.level >= req.value;
                    break;
                case 'totalXp':
                    requirementMet = this.playerData.totalXp >= req.value;
                    break;
            }

            if (requirementMet) {
                newBadges.push(badgeData);
                this.playerData.badges.push(badgeData.id);
            }
        });
        
        newBadges.forEach(badge => {
            this.showNotification(`🏆 Nouveau badge: ${badge.name} ${badge.icon}!`, 'badge');
        });
    }

    updateBadgesDisplay() {
        const container = document.getElementById('badges-display');
        
        if (!this.exercisesData || !this.exercisesData.badges || this.playerData.badges.length === 0) {
            container.innerHTML = '<p>Aucun badge pour le moment. Continuez à vous entraîner!</p>';
            return;
        }
        
        // Filtrer les badges obtenus
        const earnedBadges = this.exercisesData.badges.filter(badge => 
            this.playerData.badges.includes(badge.id)
        );
        
        container.innerHTML = earnedBadges.map(badge => {
            return `<div style="display: inline-block; background: var(--primary-color); color: white; padding: 8px 12px; margin: 5px; border-radius: 15px; font-size: 14px;">${badge.icon} ${badge.name}</div>`;
        }).join('');
    }

    // ... le reste des méthodes reste identique sauf les méthodes modifiées ci-dessus
    
    showScreen(screenName) {
        this.pauseTimer();
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(`${screenName}-screen`).classList.add('active');
        
        // Mettre à jour la navigation seulement si ce n'est pas le loader
        if (screenName !== 'loader') {
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`nav-${screenName}`)?.classList.add('active');
        }
        
        this.currentScreen = screenName;
        
        if (screenName === 'home') {
            this.updateHomeScreen();
        } else if (screenName === 'profile') {
            this.updateProfileScreen();
        } else if (screenName === 'training') {
            this.updateTrainingScreen();
        }
    }

    startWorkout() {
        this.currentWorkout = [...this.workoutProgram];
        this.currentExerciseIndex = 0;
        this.isWorkoutActive = true;
        
        // Assurer que nous sommes sur l'écran de workout avant de charger l'exercice
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('workout-session-screen').classList.add('active');
        
        // Petit délai pour s'assurer que le DOM est mis à jour
        setTimeout(() => {
            this.loadCurrentExercise();
        }, 100);
    }

    loadCurrentExercise() {
        if (this.currentExerciseIndex >= this.currentWorkout.length) {
            this.finishWorkout();
            return;
        }

        this.isRecoveryTime = false;
        const exercise = this.currentWorkout[this.currentExerciseIndex];
        const totalExercises = this.currentWorkout.length;
        
        console.log('Loading exercise:', exercise.name, exercise.type); // Debug
        
        // Mettre à jour l'interface
        document.getElementById('current-exercise-name').textContent = exercise.name;
        document.getElementById('exercise-step').textContent = `${this.currentExerciseIndex + 1} / ${totalExercises}`;
        document.getElementById('exercise-icon').textContent = exercise.icon;
        document.getElementById('exercise-description').textContent = exercise.description;
        
        // Mettre à jour la barre de progression
        const progress = ((this.currentExerciseIndex) / totalExercises) * 100;
        document.getElementById('workout-progress-fill').style.width = `${progress}%`;
        
        // Configurer selon le type d'exercice
        if (exercise.type === 'timed') {
            this.setupTimedExercise(exercise);
        } else {
            this.setupRepsExercise(exercise);
        }
    }

    setupTimedExercise(exercise) {
        console.log('Setting up timed exercise'); // Debug
        
        document.getElementById('exercise-target').textContent = `Objectif: ${this.formatDuration(exercise.duration)}`;
        document.getElementById('reps-section').style.display = 'none';
        this.timer = exercise.duration;
        this.updateTimerDisplay();
        
        // Mettre à jour les contrôles
        const controlsContainer = document.querySelector('.workout-controls');
        controlsContainer.innerHTML = `
            <button id="start-exercise" class="btn-primary btn-large">Commencer</button>
            <button id="pause-exercise" class="btn-secondary btn-large" style="display:none;">Pause</button>
            <button id="complete-exercise" class="btn-success btn-large" style="display:none;">Terminé</button>
            <button id="skip-exercise" class="btn-danger">Passer</button>
        `;
        
        this.bindCurrentExerciseControls();
    }

    setupRepsExercise(exercise) {
        console.log('Setting up reps exercise'); // Debug
        
        document.getElementById('exercise-target').textContent = `Objectif suggéré: ${exercise.targetReps} répétitions`;
        document.getElementById('reps-section').style.display = 'block';
        document.getElementById('reps-completed').value = exercise.targetReps;
        document.getElementById('workout-timer').textContent = '-- : --';
        
        // Mettre à jour les contrôles
        const controlsContainer = document.querySelector('.workout-controls');
        controlsContainer.innerHTML = `
            <button id="complete-exercise" class="btn-success btn-large">Terminé</button>
            <button id="skip-exercise" class="btn-danger">Passer</button>
        `;
        
        this.bindCurrentExerciseControls();
    }

    bindCurrentExerciseControls() {
        console.log('Binding exercise controls'); // Debug
        
        // Nettoyer d'abord tous les anciens event listeners
        const startBtn = document.getElementById('start-exercise');
        const pauseBtn = document.getElementById('pause-exercise');
        const completeBtn = document.getElementById('complete-exercise');
        const skipBtn = document.getElementById('skip-exercise');
        const quitBtn = document.getElementById('quit-workout');
        
        // Utiliser des event listeners avec une seule utilisation pour éviter les doublons
        if (startBtn) {
            startBtn.onclick = () => this.startExercise();
            console.log('Start button bound'); // Debug
        }
        if (pauseBtn) {
            pauseBtn.onclick = () => this.pauseExercise();
        }
        if (completeBtn) {
            completeBtn.onclick = () => this.completeExercise();
            console.log('Complete button bound'); // Debug
        }
        if (skipBtn) {
            skipBtn.onclick = () => this.skipExercise();
            console.log('Skip button bound'); // Debug
        }
        if (quitBtn) {
            quitBtn.onclick = () => this.quitWorkout();
        }
    }

    startExercise() {
        console.log('Starting exercise'); // Debug
        const exercise = this.currentWorkout[this.currentExerciseIndex];
        
        if (exercise.type === 'timed') {
            document.getElementById('start-exercise').style.display = 'none';
            document.getElementById('pause-exercise').style.display = 'block';
            document.getElementById('complete-exercise').style.display = 'block';
            
            this.startTimer();
        }
    }

    pauseExercise() {
        console.log('Pausing exercise'); // Debug
        this.pauseTimer();
        document.getElementById('start-exercise').style.display = 'block';
        document.getElementById('pause-exercise').style.display = 'none';
    }

    completeExercise() {
        console.log('Completing exercise'); // Debug
        this.pauseTimer();
        
        const exercise = this.currentWorkout[this.currentExerciseIndex];
        let reps = 0;
        
        if (exercise.type === 'reps') {
            reps = parseInt(document.getElementById('reps-completed').value) || 0;
            if (reps <= 0) {
                this.showNotification('Veuillez entrer un nombre de répétitions valide!', 'error');
                return;
            }
            
            // Sauvegarder le nombre de répétitions
            if (!this.playerData.customReps) {
                this.playerData.customReps = {};
            }
            this.playerData.customReps[exercise.id] = Math.max(reps, exercise.targetReps);
            this.savePlayerData();
        }
        
        // Calculer XP
        const baseXP = 15;
        let xpGained = baseXP;
        
        if (exercise.type === 'reps') {
            const repsMultiplier = Math.min(reps / exercise.targetReps, 2);
            xpGained = Math.floor(baseXP * repsMultiplier);
        } else {
            const completionRate = (exercise.duration - this.timer) / exercise.duration;
            const timeMultiplier = Math.max(0.5, Math.min(completionRate * 1.5, 1.5));
            xpGained = Math.floor(baseXP * timeMultiplier);
        }
        
        this.gainXP(xpGained);
        this.currentExerciseIndex++;
        
        this.showNotification(`+${xpGained} XP! Excellent! 💪`);
        
        setTimeout(() => {
            this.loadRecoveryTime();
        }, 1500);
    }

    skipExercise() {
        console.log('Skipping exercise'); // Debug
        if (confirm('Êtes-vous sûr de vouloir passer cet exercice ?')) {
            this.pauseTimer();
            this.currentExerciseIndex++;
            this.loadRecoveryTime();
        }
    }

    quitWorkout() {
        console.log('Quitting workout'); // Debug
        if (confirm('Êtes-vous sûr de vouloir quitter l\'entraînement ?')) {
            this.pauseTimer();
            this.isWorkoutActive = false;
            this.showScreen('training');
        }
    }

    loadRecoveryTime() {
        const exercise = this.currentWorkout[this.currentExerciseIndex - 1];
        
        if (!exercise || !exercise.recoveryTime || exercise.recoveryTime === 0) {
            this.loadCurrentExercise();
            return;
        }

        this.isRecoveryTime = true;
        this.recoveryTimer = exercise.recoveryTime;
        
        document.getElementById('current-exercise-name').textContent = 'Temps de récupération';
        document.getElementById('exercise-icon').textContent = '😌';
        document.getElementById('exercise-description').textContent = 'Reposez-vous et respirez calmement. Préparez-vous pour le prochain exercice.';
        document.getElementById('exercise-target').textContent = `Récupération: ${this.formatDuration(this.recoveryTimer)}`;
        document.getElementById('reps-section').style.display = 'none';
        
        this.showRecoveryControls();
        this.startRecoveryTimer();
    }

    showRecoveryControls() {
        const controlsContainer = document.querySelector('.workout-controls');
        controlsContainer.innerHTML = `
            <button id="add-10s" class="btn-primary btn-large">+10 secondes</button>
            <button id="skip-recovery" class="btn-secondary btn-large">Passer la récupération</button>
        `;
        
        document.getElementById('add-10s').onclick = () => this.add10Seconds();
        document.getElementById('skip-recovery').onclick = () => this.skipRecovery();
    }

    add10Seconds() {
        this.recoveryTimer += 10;
        document.getElementById('exercise-target').textContent = `Récupération: ${this.formatDuration(this.recoveryTimer)}`;
        this.showNotification('+10 secondes ajoutées! 😌');
    }

    skipRecovery() {
        this.pauseTimer();
        this.loadCurrentExercise();
    }

    startRecoveryTimer() {
        if (this.timerInterval) return;
        
        this.timerInterval = setInterval(() => {
            this.recoveryTimer--;
            this.updateRecoveryDisplay();
            
            if (this.recoveryTimer <= 0) {
                this.pauseTimer();
                this.showNotification('Récupération terminée! C\'est parti! 💪');
                setTimeout(() => {
                    this.loadCurrentExercise();
                }, 1500);
            }
        }, 1000);
    }

    updateRecoveryDisplay() {
        const minutes = Math.floor(this.recoveryTimer / 60);
        const seconds = this.recoveryTimer % 60;
        document.getElementById('workout-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('exercise-target').textContent = `Récupération: ${this.formatDuration(this.recoveryTimer)}`;
    }

    startTimer() {
        if (this.timerInterval) return;
        
        this.timerInterval = setInterval(() => {
            const exercise = this.currentWorkout[this.currentExerciseIndex];
            
            if (exercise.type === 'timed') {
                this.timer--;
                this.updateTimerDisplay();
                
                if (this.timer <= 0) {
                    this.completeExercise();
                }
            }
        }, 1000);
    }

    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(Math.abs(this.timer) / 60);
        const seconds = Math.abs(this.timer) % 60;
        document.getElementById('workout-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    finishWorkout() {
        this.pauseTimer();
        this.isWorkoutActive = false;
        
        const workoutData = {
            date: new Date().toISOString(),
            exercises: this.currentWorkout.length,
            duration: this.getTotalWorkoutTime(),
            completed: true
        };
        
        this.playerData.workoutHistory.unshift(workoutData);
        this.playerData.totalWorkouts++;
        this.playerData.lastWorkout = workoutData.date;
        
        this.gainXP(50);
        this.checkForBadges();
        this.savePlayerData();
        
        this.showNotification('🎉 Entraînement terminé! +50 XP bonus!', 'success');
        
        setTimeout(() => {
            this.showScreen('home');
        }, 3000);
    }

    getTotalWorkoutTime() {
        return this.workoutProgram.reduce((total, exercise) => {
            return total + (exercise.duration || 60) + (exercise.recoveryTime || 0);
        }, 0);
    }

    gainXP(amount) {
        this.playerData.xp += amount;
        this.playerData.totalXp += amount;
        
        const xpForNextLevel = this.getXPForLevel(this.playerData.level + 1);
        if (this.playerData.xp >= xpForNextLevel) {
            this.playerData.level++;
            this.playerData.xp -= xpForNextLevel;
            this.showNotification(`🏆 Niveau ${this.playerData.level} atteint!`, 'success');
            this.checkForBadges();
        }
        
        this.savePlayerData();
        this.updateUI();
    }

    getXPForLevel(level) {
        return level * 100;
    }

    updateHomeScreen() {
        document.getElementById('player-level').textContent = this.playerData.level;
        document.getElementById('streak-count').textContent = this.playerData.streak;
        document.getElementById('total-xp').textContent = this.playerData.totalXp;
        document.getElementById('badges-count').textContent = this.playerData.badges.length;
        
        const currentXP = this.playerData.xp;
        const xpForNextLevel = this.getXPForLevel(this.playerData.level + 1);
        const percentage = (currentXP / xpForNextLevel) * 100;
        
        document.getElementById('xp-progress').style.width = `${percentage}%`;
        document.getElementById('xp-text').textContent = `${currentXP} / ${xpForNextLevel} XP`;
        
        this.updateRecentWorkouts();
    }

    updateRecentWorkouts() {
        const container = document.getElementById('recent-list');
        const recent = this.playerData.workoutHistory.slice(0, 3);
        
        if (recent.length === 0) {
            container.innerHTML = '<p>Aucun entraînement récent. Commencez dès maintenant! 💪</p>';
            return;
        }
        
        container.innerHTML = recent.map(workout => {
            const date = new Date(workout.date).toLocaleDateString('fr-FR');
            const duration = this.formatDuration(workout.duration);
            return `
                <div class="workout-item" style="background: var(--surface); padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid var(--primary-color);">
                    <strong>Entraînement complet</strong><br>
                    <small>📅 ${date} • ⏱️ ~${duration} • ✅ ${workout.exercises} exercices</small>
                </div>
            `;
        }).join('');
    }

    updateTrainingScreen() {
        this.updateWorkoutHistory();
    }

    updateWorkoutHistory() {
        const container = document.getElementById('workout-sessions');
        if (!container) return;
        
        const recent = this.playerData.workoutHistory.slice(0, 5);
        
        if (recent.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Aucune session terminée</p>';
            return;
        }
        
        container.innerHTML = recent.map(workout => {
            const date = new Date(workout.date).toLocaleDateString('fr-FR');
            return `
                <div style="background: var(--surface); padding: 10px; margin: 5px 0; border-radius: 8px; font-size: 14px;">
                    <strong>✅ Session terminée</strong><br>
                    <small>${date} • ${workout.exercises} exercices</small>
                </div>
            `;
        }).join('');
    }

    updateProfileScreen() {
        document.getElementById('player-name').textContent = this.playerData.playerName || 'Guerrier';
        document.getElementById('avatar').textContent = this.getAvatarEmoji();
        this.updateBadgesDisplay();
        this.updateDetailedStats();
        this.setupNameEditor();
    }

    setupNameEditor() {
        const nameElement = document.getElementById('player-name');
        
        // Ajouter un bouton d'édition s'il n'existe pas
        if (!document.getElementById('edit-name-btn')) {
            const editBtn = document.createElement('button');
            editBtn.id = 'edit-name-btn';
            editBtn.innerHTML = '✏️';
            editBtn.style.cssText = `
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                margin-left: 10px;
                font-size: 14px;
            `;
            editBtn.onclick = () => this.showNameEditor();
            nameElement.parentNode.appendChild(editBtn);
        }
    }

    showNameEditor() {
        const nameElement = document.getElementById('player-name');
        
        // Créer l'input d'édition
        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.playerData.playerName;
        input.style.cssText = `
            background: var(--surface);
            border: 2px solid var(--primary-color);
            border-radius: 5px;
            padding: 5px 10px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            color: var(--text-primary);
            max-width: 200px;
        `;
        
        // Créer les boutons de validation
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '✓';
        saveBtn.style.cssText = `
            background: var(--secondary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            margin-left: 5px;
            font-size: 16px;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '✕';
        cancelBtn.style.cssText = `
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            margin-left: 5px;
            font-size: 16px;
        `;
        
        // Remplacer temporairement l'affichage
        const originalContent = nameElement.parentNode.innerHTML;
        nameElement.parentNode.innerHTML = '';
        nameElement.parentNode.appendChild(input);
        nameElement.parentNode.appendChild(saveBtn);
        nameElement.parentNode.appendChild(cancelBtn);
        
        // Focus sur l'input
        input.focus();
        input.select();
        
        // Fonction de sauvegarde
        const saveName = () => {
            const newName = input.value.trim();
            if (newName && newName.length <= 20) {
                this.playerData.playerName = newName;
                this.savePlayerData();
                this.showNotification('Nom mis à jour! 👍', 'success');
                this.updateProfileScreen();
            } else if (!newName) {
                this.showNotification('Le nom ne peut pas être vide!', 'error');
            } else {
                this.showNotification('Le nom doit faire moins de 20 caractères!', 'error');
            }
        };
        
        // Fonction d'annulation
        const cancelEdit = () => {
            nameElement.parentNode.innerHTML = originalContent;
            this.setupNameEditor();
        };
        
        // Bind des événements
        saveBtn.onclick = saveName;
        cancelBtn.onclick = cancelEdit;
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveName();
            if (e.key === 'Escape') cancelEdit();
        });
    }

    getAvatarEmoji() {
        if (this.playerData.level >= 20) return '🦸‍♀️';
        if (this.playerData.level >= 15) return '🏆';
        if (this.playerData.level >= 10) return '💪';
        if (this.playerData.level >= 5) return '🥇';
        return '🌟';
    }

    updateDetailedStats() {
        const container = document.getElementById('detailed-stats');
        container.innerHTML = `
            <div style="background: var(--surface); padding: 15px; border-radius: 10px;">
                <div style="margin: 10px 0;">🏋️ Entraînements totaux: ${this.playerData.totalWorkouts}</div>
                <div style="margin: 10px 0;">⭐ XP total: ${this.playerData.totalXp}</div>
                <div style="margin: 10px 0;">📈 Niveau actuel: ${this.playerData.level}</div>
                <div style="margin: 10px 0;">🏆 Badges obtenus: ${this.playerData.badges.length}</div>
                <div style="margin: 10px 0;">👤 Nom: ${this.playerData.playerName}</div>
            </div>
        `;
    }

    changeTheme(theme) {
        this.playerData.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.savePlayerData();
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.style.border = option.dataset.theme === theme ? 
                '3px solid white' : '3px solid transparent';
        });
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return secs > 0 ? `${mins}min ${secs}s` : `${mins}min`;
        }
        return `${secs}s`;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const colors = {
            success: 'var(--secondary-color)',
            error: 'var(--accent-color)',
            badge: 'var(--primary-color)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.success};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 2000;
            font-weight: bold;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    updateUI() {
        if (this.currentScreen === 'home') {
            this.updateHomeScreen();
        } else if (this.currentScreen === 'profile') {
            this.updateProfileScreen();
        } else if (this.currentScreen === 'training') {
            this.updateTrainingScreen();
        }
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.fitnessApp = new FitnessApp();
});
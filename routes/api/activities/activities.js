const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../../../middleware/authenticate');
const { User, Activity, UserActivity } = require('../../../models');
const { Op } = require('sequelize');

// Obtenir toutes les activités disponibles
router.get('/', authenticate, async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { isActive: true },
            order: [['order', 'ASC'], ['createdAt', 'ASC']],
            attributes: ['id', 'title', 'description', 'category', 'difficulty', 'maxPoints', 'order']
        });

        // Récupérer les progrès de l'utilisateur
        const userActivities = await UserActivity.findAll({
            where: { userId: req.user.id },
            attributes: ['activityId', 'currentStep', 'isCompleted', 'pointsEarned']
        });

        // Mapper les progrès par activité
        const progressMap = {};
        userActivities.forEach(ua => {
            progressMap[ua.activityId] = {
                currentStep: ua.currentStep,
                isCompleted: ua.isCompleted,
                pointsEarned: ua.pointsEarned
            };
        });

        // Ajouter les progrès aux activités
        const activitiesWithProgress = activities.map(activity => ({
            ...activity.toJSON(),
            progress: progressMap[activity.id] || {
                currentStep: 0,
                isCompleted: false,
                pointsEarned: 0
            }
        }));

        res.json({ activities: activitiesWithProgress });
    } catch (error) {
        console.error('Erreur récupération activités:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des activités' });
    }
});

// Obtenir une activité spécifique avec son contenu
router.get('/:id', authenticate, async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activité non trouvée' });
        }

        // Récupérer ou créer le progrès utilisateur
        let userActivity = await UserActivity.findOne({
            where: { userId: req.user.id, activityId: activity.id }
        });

        if (!userActivity) {
            userActivity = await UserActivity.create({
                userId: req.user.id,
                activityId: activity.id,
                currentStep: 0,
                pointsEarned: 0
            });
        }

        res.json({
            activity: {
                id: activity.id,
                title: activity.title,
                description: activity.description,
                category: activity.category,
                difficulty: activity.difficulty,
                content: activity.content,
                maxPoints: activity.maxPoints
            },
            progress: {
                currentStep: userActivity.currentStep,
                isCompleted: userActivity.isCompleted,
                pointsEarned: userActivity.pointsEarned,
                attempts: userActivity.attempts
            }
        });
    } catch (error) {
        console.error('Erreur récupération activité:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'activité' });
    }
});

// Soumettre une réponse à une étape
router.post('/:id/submit', authenticate, [
    body('step').isInt({ min: 0 }).withMessage('L\'étape doit être un nombre positif'),
    body('answer').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { step, answer } = req.body;
        
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activité non trouvée' });
        }

        let userActivity = await UserActivity.findOne({
            where: { userId: req.user.id, activityId: activity.id }
        });

        if (!userActivity) {
            userActivity = await UserActivity.create({
                userId: req.user.id,
                activityId: activity.id,
                currentStep: 0,
                pointsEarned: 0
            });
        }

        // Vérifier que l'étape est valide
        const steps = activity.content.steps;
        if (step >= steps.length) {
            return res.status(400).json({ error: 'Étape invalide' });
        }

        const currentStepData = steps[step];
        let isCorrect = false;
        let pointsEarned = 0;
        let feedback = '';

        // Traitement selon le type d'étape
        switch (currentStepData.type) {
            case 'lesson':
                // Les leçons sont toujours "correctes"
                isCorrect = true;
                pointsEarned = currentStepData.points || 0;
                break;

            case 'multiple_choice':
                isCorrect = answer === currentStepData.correctAnswer;
                if (isCorrect) {
                    pointsEarned = currentStepData.points || 0;
                }
                feedback = currentStepData.explanation || '';
                break;

            case 'text_input':
                const userAnswer = answer ? answer.trim() : '';
                if (currentStepData.caseSensitive === false) {
                    isCorrect = currentStepData.correctAnswers.some(
                        correct => correct.toLowerCase() === userAnswer.toLowerCase()
                    );
                } else {
                    isCorrect = currentStepData.correctAnswers.includes(userAnswer);
                }
                if (isCorrect) {
                    pointsEarned = currentStepData.points || 0;
                }
                feedback = currentStepData.explanation || '';
                break;

            case 'multiple_input':
                const answers = answer || [];
                let correctCount = 0;
                let totalInputs = currentStepData.inputs.length;
                
                currentStepData.inputs.forEach((input, index) => {
                    const userAnswer = answers[index] ? answers[index].trim() : '';
                    let inputCorrect = false;
                    
                    if (input.caseSensitive === false) {
                        inputCorrect = input.correctAnswers.some(
                            correct => correct.toLowerCase() === userAnswer.toLowerCase()
                        );
                    } else {
                        inputCorrect = input.correctAnswers.includes(userAnswer);
                    }
                    
                    if (inputCorrect) {
                        correctCount++;
                        pointsEarned += input.points || 0;
                    }
                });
                
                isCorrect = correctCount === totalInputs;
                feedback = currentStepData.explanation || '';
                break;

            case 'drag_drop':
                const userMapping = answer || {};
                let correctMappings = 0;
                
                currentStepData.items.forEach(item => {
                    if (userMapping[item.id] === item.category) {
                        correctMappings++;
                    }
                });
                
                isCorrect = correctMappings === currentStepData.items.length;
                if (isCorrect) {
                    pointsEarned = currentStepData.points || 0;
                }
                feedback = currentStepData.explanation || '';
                break;
        }

        // Enregistrer la tentative
        const attempts = userActivity.attempts || [];
        attempts.push({
            step,
            answer,
            isCorrect,
            pointsEarned,
            timestamp: new Date()
        });

        // Mettre à jour les points de l'utilisateur seulement si c'est correct et premier essai
        if (isCorrect && !attempts.some(a => a.step === step && a.isCorrect)) {
            await User.increment('points', { 
                by: pointsEarned, 
                where: { id: req.user.id } 
            });
        }

        // Mettre à jour le progrès
        const newCurrentStep = isCorrect ? Math.max(userActivity.currentStep, step + 1) : userActivity.currentStep;
        const newPointsEarned = userActivity.pointsEarned + (isCorrect ? pointsEarned : 0);
        const isCompleted = newCurrentStep >= steps.length;

        await userActivity.update({
            currentStep: newCurrentStep,
            pointsEarned: newPointsEarned,
            isCompleted,
            attempts,
            completedAt: isCompleted ? new Date() : null
        });

        res.json({
            success: true,
            isCorrect,
            pointsEarned,
            feedback,
            nextStep: isCorrect ? step + 1 : step,
            isCompleted: isCompleted && isCorrect
        });

    } catch (error) {
        console.error('Erreur soumission réponse:', error);
        res.status(500).json({ error: 'Erreur lors de la soumission de la réponse' });
    }
});

module.exports = router;

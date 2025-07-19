const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../../../middleware/authenticate');
const { requireGameSession } = require('../../../middleware/requireGameSession');
const { User, Activity, UserActivity, TeamActivity } = require('../../../models');
const { Op } = require('sequelize');

// Obtenir toutes les activités disponibles
router.get('/', authenticate, requireGameSession, async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(400).json({ error: 'Vous devez faire partie d\'une équipe pour accéder aux activités' });
        }

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

        // Récupérer l'état des activités d'équipe
        const teamActivities = await TeamActivity.findAll({
            where: { teamId: req.user.teamId },
            include: [
                {
                    model: User,
                    as: 'currentUser',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'completedByUser',
                    attributes: ['id', 'username']
                }
            ]
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

        // Mapper l'état d'équipe par activité
        const teamStateMap = {};
        teamActivities.forEach(ta => {
            teamStateMap[ta.activityId] = {
                isLocked: ta.isLocked,
                isCompleted: ta.isCompleted,
                currentUser: ta.currentUser,
                completedBy: ta.completedByUser,
                pointsEarned: ta.pointsEarned
            };
        });

        // Ajouter les progrès et l'état d'équipe aux activités
        const activitiesWithProgress = activities.map(activity => {
            const teamState = teamStateMap[activity.id] || {
                isLocked: false,
                isCompleted: false,
                currentUser: null,
                completedBy: null,
                pointsEarned: 0
            };

            const userProgress = progressMap[activity.id] || {
                currentStep: 0,
                isCompleted: false,
                pointsEarned: 0
            };

            return {
                ...activity.toJSON(),
                progress: userProgress,
                teamState: teamState,
                canStart: !teamState.isCompleted && (!teamState.isLocked || teamState.currentUser?.id === req.user.id)
            };
        });

        res.json({ activities: activitiesWithProgress });
    } catch (error) {
        console.error('Erreur récupération activités:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des activités' });
    }
});

// Obtenir une activité spécifique avec son contenu (sans les réponses)
router.get('/:id', authenticate, requireGameSession, async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(400).json({ error: 'Vous devez faire partie d\'une équipe pour accéder aux activités' });
        }

        const activity = await Activity.findByPk(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activité non trouvée' });
        }

        // Vérifier l'état de l'activité pour l'équipe
        let teamActivity = await TeamActivity.findOne({
            where: { teamId: req.user.teamId, activityId: activity.id },
            include: [
                {
                    model: User,
                    as: 'currentUser',
                    attributes: ['id', 'username']
                }
            ]
        });

        // Si l'activité est terminée par l'équipe, interdire l'accès
        if (teamActivity && teamActivity.isCompleted) {
            return res.status(403).json({ 
                error: 'Cette activité a déjà été terminée par votre équipe',
                completedBy: teamActivity.completedByUser?.username 
            });
        }

        // Si l'activité est verrouillée par un autre membre de l'équipe
        if (teamActivity && teamActivity.isLocked && teamActivity.currentUserId !== req.user.id) {
            return res.status(423).json({ 
                error: `Cette activité est actuellement utilisée par ${teamActivity.currentUser.username}`,
                currentUser: teamActivity.currentUser.username
            });
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

        // Verrouiller l'activité pour l'équipe si pas encore fait
        if (!teamActivity) {
            teamActivity = await TeamActivity.create({
                teamId: req.user.teamId,
                activityId: activity.id,
                isLocked: true,
                currentUserId: req.user.id
            });
        } else if (!teamActivity.isLocked) {
            await teamActivity.update({
                isLocked: true,
                currentUserId: req.user.id
            });
        }

        // Nettoyer le contenu pour supprimer les réponses
        const cleanContent = {
            ...activity.content,
            steps: activity.content.steps.map(step => {
                const cleanStep = { ...step };
                
                // Supprimer les réponses selon le type d'étape
                if (step.type === 'multiple_choice') {
                    delete cleanStep.correctAnswer;
                    delete cleanStep.explanation;
                } else if (step.type === 'text_input') {
                    delete cleanStep.correctAnswers;
                    delete cleanStep.explanation;
                } else if (step.type === 'multiple_input') {
                    if (cleanStep.inputs) {
                        cleanStep.inputs = cleanStep.inputs.map(input => {
                            const cleanInput = { ...input };
                            delete cleanInput.correctAnswers;
                            return cleanInput;
                        });
                    }
                    delete cleanStep.explanation;
                } else if (step.type === 'drag_drop') {
                    if (cleanStep.items) {
                        cleanStep.items = cleanStep.items.map(item => {
                            const cleanItem = { ...item };
                            delete cleanItem.category;
                            return cleanItem;
                        });
                    }
                    delete cleanStep.explanation;
                }
                
                // Supprimer les points pour éviter la triche
                delete cleanStep.points;
                
                return cleanStep;
            })
        };

        res.json({
            activity: {
                id: activity.id,
                title: activity.title,
                description: activity.description,
                category: activity.category,
                difficulty: activity.difficulty,
                content: cleanContent,
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

// Route de soumission (utilise l'étape envoyée par le frontend)
router.post('/:id/submit', authenticate, requireGameSession, [
    body('step').isInt({ min: 0 }).withMessage('L\'étape doit être un nombre positif'),
    body('answer').optional()
], async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(400).json({ error: 'Vous devez faire partie d\'une équipe' });
        }

        // Récupérer l'étape actuelle de l'utilisateur
        const userActivity = await UserActivity.findOne({
            where: { userId: req.user.id, activityId: req.params.id }
        });

        if (!userActivity) {
            return res.status(404).json({ error: 'Progrès utilisateur non trouvé' });
        }

        // Valider avec l'étape envoyée par le frontend
        const { step, answer } = req.body;
        
        // Vérifier que l'étape envoyée est cohérente avec le progrès de l'utilisateur
        if (step !== userActivity.currentStep) {
            return res.status(400).json({ 
                error: `Étape incohérente. Vous devriez être à l\'étape ${userActivity.currentStep}, mais vous tentez de soumettre l\'étape ${step}.`
            });
        }
        
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activité non trouvée' });
        }

        // Vérifier l'état de l'équipe
        const teamActivity = await TeamActivity.findOne({
            where: { teamId: req.user.teamId, activityId: activity.id }
        });

        if (!teamActivity || teamActivity.currentUserId !== req.user.id) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à faire cette activité' });
        }

        if (teamActivity.isCompleted) {
            return res.status(403).json({ error: 'Cette activité a déjà été terminée par votre équipe' });
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

        // Enregistrer la tentative avec logique anti-triche
        const attempts = userActivity.attempts || [];
        const existingCorrectAttempt = attempts.find(a => a.step === step && a.isCorrect);
        
        // Ajouter la nouvelle tentative
        attempts.push({
            step,
            answer,
            isCorrect,
            pointsEarned: 0, // On calculera les points après
            timestamp: new Date()
        });

        // Calculer les points : seulement si c'est correct ET si c'est la première tentative correcte
        let actualPointsEarned = 0;
        if (isCorrect && !existingCorrectAttempt) {
            actualPointsEarned = pointsEarned;
            // Mettre à jour les points de l'utilisateur
            await User.increment('points', { 
                by: pointsEarned, 
                where: { id: req.user.id } 
            });
            
            // Mettre à jour les points dans la tentative
            attempts[attempts.length - 1].pointsEarned = pointsEarned;
        }

        // Mettre à jour le progrès
        const newCurrentStep = isCorrect ? Math.max(userActivity.currentStep, step + 1) : userActivity.currentStep;
        const newPointsEarned = userActivity.pointsEarned + actualPointsEarned;
        const isCompleted = newCurrentStep >= steps.length;

        await userActivity.update({
            currentStep: newCurrentStep,
            pointsEarned: newPointsEarned,
            isCompleted,
            attempts,
            completedAt: isCompleted ? new Date() : null
        });

        // Si l'activité est terminée, mettre à jour l'état de l'équipe
        if (isCompleted && isCorrect) {
            await teamActivity.update({
                isCompleted: true,
                isLocked: false,
                completedBy: req.user.id,
                completedAt: new Date(),
                pointsEarned: newPointsEarned
            });
        }

        res.json({
            success: true,
            isCorrect,
            pointsEarned: actualPointsEarned,
            totalPoints: newPointsEarned,
            feedback,
            currentStep: newCurrentStep,
            isCompleted: isCompleted && isCorrect
        });

    } catch (error) {
        console.error('Erreur soumission:', error);
        res.status(500).json({ error: 'Erreur lors de la soumission' });
    }
});

// Libérer une activité (abandon)
router.post('/:id/release', authenticate, requireGameSession, async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(400).json({ error: 'Vous devez faire partie d\'une équipe' });
        }

        const teamActivity = await TeamActivity.findOne({
            where: { 
                teamId: req.user.teamId, 
                activityId: req.params.id,
                currentUserId: req.user.id
            }
        });

        if (!teamActivity) {
            return res.status(404).json({ error: 'Activité non trouvée ou non verrouillée par vous' });
        }

        if (teamActivity.isCompleted) {
            return res.status(400).json({ error: 'Cette activité est déjà terminée' });
        }

        await teamActivity.update({
            isLocked: false,
            currentUserId: null
        });

        res.json({ success: true, message: 'Activité libérée avec succès' });

    } catch (error) {
        console.error('Erreur libération activité:', error);
        res.status(500).json({ error: 'Erreur lors de la libération de l\'activité' });
    }
});

// Route pour avancer sur les étapes lesson
router.post('/:id/next', authenticate, requireGameSession, async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(400).json({ error: 'Vous devez faire partie d\'une équipe' });
        }

        const userActivity = await UserActivity.findOne({
            where: { userId: req.user.id, activityId: req.params.id }
        });

        if (!userActivity) {
            return res.status(404).json({ error: 'Progrès utilisateur non trouvé' });
        }

        const activity = await Activity.findByPk(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activité non trouvée' });
        }

        // Vérifier l'état de l'équipe
        const teamActivity = await TeamActivity.findOne({
            where: { teamId: req.user.teamId, activityId: activity.id }
        });

        if (!teamActivity || teamActivity.currentUserId !== req.user.id) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à faire cette activité' });
        }

        if (teamActivity.isCompleted) {
            return res.status(403).json({ error: 'Cette activité a déjà été terminée par votre équipe' });
        }

        const steps = activity.content.steps;
        const currentStep = userActivity.currentStep;

        // Vérifier que l'étape actuelle est une lesson
        if (currentStep >= steps.length) {
            return res.status(400).json({ error: 'Étape invalide' });
        }

        const currentStepData = steps[currentStep];
        if (currentStepData.type !== 'lesson') {
            return res.status(400).json({ error: 'Cette étape nécessite une soumission via /submit' });
        }

        // Avancer à l'étape suivante
        const newCurrentStep = currentStep + 1;
        const pointsEarned = currentStepData.points || 0;
        
        await userActivity.update({
            currentStep: newCurrentStep,
            pointsEarned: userActivity.pointsEarned + pointsEarned
        });

        // Vérifier si l'activité est terminée
        const isCompleted = newCurrentStep >= steps.length;
        
        if (isCompleted) {
            await userActivity.update({ isCompleted: true });
            await teamActivity.update({
                isCompleted: true,
                completedByUserId: req.user.id,
                isLocked: false,
                currentUserId: null
            });
        }

        res.json({
            success: true,
            currentStep: newCurrentStep,
            pointsEarned: pointsEarned,
            totalPoints: userActivity.pointsEarned + pointsEarned,
            isCompleted: isCompleted
        });

    } catch (error) {
        console.error('Erreur avancement étape:', error);
        res.status(500).json({ error: 'Erreur lors de l\'avancement' });
    }
});

module.exports = router;

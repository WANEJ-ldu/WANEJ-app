const fs = require('fs');
const path = require('path');
const { Activity } = require('./models');

async function seedActivities() {
    try {
        // Lire le fichier JSON d'exemple
        const activityPath = path.join(__dirname, 'data/activities/souris-basics.json');
        const activityData = JSON.parse(fs.readFileSync(activityPath, 'utf8'));

        // Créer ou mettre à jour l'activité
        const [activity, created] = await Activity.findOrCreate({
            where: { title: activityData.title },
            defaults: {
                title: activityData.title,
                description: activityData.description,
                category: activityData.category,
                difficulty: activityData.difficulty,
                content: activityData.content,
                maxPoints: activityData.maxPoints,
                order: 1
            }
        });

        if (created) {
            console.log(`✅ Activité créée: ${activity.title}`);
        } else {
            console.log(`ℹ️  Activité existante: ${activity.title}`);
        }

        // Créer d'autres activités d'exemple
        const additionalActivities = [
            {
                title: "Premiers pas sur Internet",
                description: "Apprenez à naviguer sur Internet en toute sécurité",
                category: "internet",
                difficulty: "beginner",
                maxPoints: 30,
                order: 2,
                content: {
                    steps: [
                        {
                            type: "lesson",
                            title: "Qu'est-ce qu'Internet ?",
                            content: "🌐 Internet est un réseau mondial d'ordinateurs connectés entre eux.\n\nIl permet de :\n• Consulter des sites web\n• Envoyer des emails\n• Regarder des vidéos\n• Communiquer avec d'autres personnes",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Question 1",
                            question: "Que signifie WWW ?",
                            options: [
                                "World Wide Web",
                                "World Wide Window",
                                "World Web Way",
                                "Wide World Web"
                            ],
                            correctAnswer: 0,
                            explanation: "WWW signifie World Wide Web, le système de pages web interconnectées.",
                            points: 15
                        },
                        {
                            type: "text_input",
                            title: "Question 2",
                            question: "Quel est le nom du programme utilisé pour naviguer sur Internet ?",
                            placeholder: "Tapez votre réponse",
                            correctAnswers: ["navigateur", "browser", "navigateur web", "navigateur internet"],
                            caseSensitive: false,
                            explanation: "Un navigateur (ou browser en anglais) est le programme qui permet de consulter des sites web.",
                            points: 15
                        }
                    ]
                }
            },
            {
                title: "Sécurité numérique",
                description: "Apprenez à protéger vos données et éviter les pièges",
                category: "security",
                difficulty: "intermediate",
                maxPoints: 40,
                order: 3,
                content: {
                    steps: [
                        {
                            type: "lesson",
                            title: "Importance de la sécurité",
                            content: "🔒 La sécurité numérique est essentielle pour protéger vos données personnelles et éviter les arnaques.\n\nLes principales menaces :\n• Virus et malwares\n• Phishing (faux emails)\n• Mots de passe faibles\n• Réseaux Wi-Fi non sécurisés",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Mots de passe",
                            question: "Quel est le meilleur mot de passe ?",
                            options: [
                                "123456",
                                "password",
                                "MonMotDePasse123!",
                                "Tr0ub4dor&3"
                            ],
                            correctAnswer: 3,
                            explanation: "Un bon mot de passe combine lettres, chiffres et symboles de façon imprévisible.",
                            points: 20
                        },
                        {
                            type: "multiple_choice",
                            title: "Phishing",
                            question: "Comment reconnaître un email de phishing ?",
                            options: [
                                "Il demande des informations personnelles",
                                "L'expéditeur est inconnu",
                                "Il y a des fautes d'orthographe",
                                "Toutes ces réponses"
                            ],
                            correctAnswer: 3,
                            explanation: "Les emails de phishing présentent souvent plusieurs signes suspects combinés.",
                            points: 20
                        }
                    ]
                }
            }
        ];

        for (const activityData of additionalActivities) {
            const [activity, created] = await Activity.findOrCreate({
                where: { title: activityData.title },
                defaults: activityData
            });

            if (created) {
                console.log(`✅ Activité créée: ${activity.title}`);
            } else {
                console.log(`ℹ️  Activité existante: ${activity.title}`);
            }
        }

        console.log('\n🎉 Seeding des activités terminé !');
        
    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
    }
}

module.exports = { seedActivities };

// Exécuter si appelé directement
if (require.main === module) {
    seedActivities().then(() => process.exit(0));
}

const fs = require('fs');
const path = require('path');
const { Activity } = require('./models');

async function seedActivities() {
    try {

        // Activité "Souris : les bases" directement dans le code
        const sourisBasics = {
            title: "Souris : les bases",
            description: "Découvrir les bases de l'utilisation de la souris.",
            category: "ordinateur",
            difficulty: "beginner",
            maxPoints: 20,
            order: 1,
            content: {
                steps: [
                    {
                        type: "lesson",
                        title: "Qu'est-ce qu'une souris ?",
                        content: "La souris est un périphérique qui permet de déplacer un curseur à l'écran et d'interagir avec l'ordinateur.",
                        points: 0
                    },
                    {
                        type: "multiple_choice",
                        title: "Quel bouton de la souris utilise-t-on le plus souvent ?",
                        question: "Quel bouton de la souris utilise-t-on le plus souvent ?",
                        options: [
                            "Le bouton gauche",
                            "Le bouton droit",
                            "La molette"
                        ],
                        correctAnswer: 0,
                        explanation: "Le bouton gauche sert à la plupart des actions (cliquer, sélectionner, etc.)",
                        points: 10
                    },
                    {
                        type: "multiple_choice",
                        title: "À quoi sert la molette ?",
                        question: "À quoi sert la molette ?",
                        options: [
                            "À faire défiler la page",
                            "À éteindre l'ordinateur",
                            "À ouvrir un menu secret"
                        ],
                        correctAnswer: 0,
                        explanation: "La molette permet de faire défiler le contenu d'une page vers le haut ou le bas.",
                        points: 10
                    }
                ]
            }
        };

        // Créer ou mettre à jour l'activité "Souris : les bases"
        const [activity, created] = await Activity.findOrCreate({
            where: { title: sourisBasics.title },
            defaults: sourisBasics
        });

        if (created) {
            console.log(`✅ Activité créée: ${activity.title}`);
        } else {
            console.log(`ℹ️  Activité existante: ${activity.title}`);
        }

        // Créer d'autres activités d'exemple
        const additionalActivities = [
            {
                title: "Quiz HTML & CSS",
                description: "Testez vos connaissances sur les bases du HTML et du CSS !",
                category: "web",
                difficulty: "beginner",
                maxPoints: 90,
                order: 2,
                content: {
                    steps: [
                        {
                            type: "multiple_choice",
                            title: "HTML, c’est pour faire…",
                            question: "HTML, c’est pour faire…",
                            options: [
                                "Un gâteau au chocolat 🎂",
                                "Une page web 🌐",
                                "Un avion en papier ✈️"
                            ],
                            correctAnswer: 1,
                            explanation: "Réponse : b) Une page web. Mais si tu as choisi a), on peut être amis.",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "La balise <p>, elle sert à…",
                            question: "La balise <p>, elle sert à…",
                            options: [
                                "Allumer la lumière 💡",
                                "Dessiner un panda 🐼",
                                "Faire un paragraphe 📝"
                            ],
                            correctAnswer: 2,
                            explanation: "Réponse : c) Faire un paragraphe. La balise <panda> n’existe pas… pour l’instant.",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "Pour écrire 'Bonjour' en gros, j’utilise…",
                            question: "Pour écrire 'Bonjour' en gros, j’utilise…",
                            options: [
                                "<h1>Bonjour</h1> 📢",
                                "<gros>Bonjour</gros> 🐘",
                                "<cri>Bonjour</cri> 📣"
                            ],
                            correctAnswer: 0,
                            explanation: "Réponse : a) <h1>. Désolé, <cri> n’est pas encore une balise HTML (mais ça serait marrant).",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "Comment faire un lien vers Google ?",
                            question: "Comment faire un lien vers Google ?",
                            options: [
                                "<a href=\"https://google.com\">Aller sur Google</a> 🏄‍♂️",
                                "<google>Clique ici</google> 🔍",
                                "<lien>Google</lien> 🧶"
                            ],
                            correctAnswer: 0,
                            explanation: "Réponse : a) La bonne balise est <a>. Non, Google n’a pas encore sa propre balise HTML (mais qui sait ?).",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "Quelle balise montre une image de chat ?",
                            question: "Quelle balise montre une image de chat ?",
                            options: [
                                "<img src=\"chat.jpg\"> 🐱",
                                "<photo>chat</photo> 📸",
                                "<emoji>🐱</emoji> 😺"
                            ],
                            correctAnswer: 0,
                            explanation: "Réponse : a) <img>. Désolé, <emoji> ne fonctionne pas… pour le moment.",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "Pour faire une liste à puces, j’utilise…",
                            question: "Pour faire une liste à puces, j’utilise…",
                            options: [
                                "<liste> 🧾",
                                "<ul> •",
                                "<points>...</points> ⚫"
                            ],
                            correctAnswer: 1,
                            explanation: "Réponse : b) <ul>. Non, <liste> n’existe pas (mais ça serait pratique).",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "Comment écrire un commentaire invisible en HTML ?",
                            question: "Comment écrire un commentaire invisible en HTML ?",
                            options: [
                                "<cache>Chut !</cache> 🤫",
                                "<!-- Ceci est un secret --> 🙊",
                                "// Ceci est un commentaire 🕵️"
                            ],
                            correctAnswer: 1,
                            explanation: "Réponse : b) <!-- -->. Les autres, c’est du JavaScript ou… de la magie noire.",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "La balise <br> sert à…",
                            question: "La balise <br> sert à…",
                            options: [
                                "Casser quelque chose 💥",
                                "Faire un burger 🍔",
                                "Aller à la ligne ↩️"
                            ],
                            correctAnswer: 2,
                            explanation: "Réponse : c) Aller à la ligne. Mais si tu veux un burger, il faut utiliser <food>… ah non, ça n’existe pas.",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "Quelle balise met le texte en gras ?",
                            question: "Quelle balise met le texte en gras ?",
                            options: [
                                "<gras> 🏋️",
                                "<strong> 💪",
                                "<bold> ✨"
                            ],
                            correctAnswer: 1,
                            explanation: "Réponse : b) <strong>. <gras> aurait été trop facile, non ?",
                            points: 10
                        },
                        {
                            type: "multiple_choice",
                            title: "Que signifie 'CSS' dans le contexte du développement web ?",
                            question: "Que signifie 'CSS' dans le contexte du développement web ?",
                            options: [
                                "Counter-Strike: Source 🔫",
                                "Café Sans Sucre ☕",
                                "Feuilles de Style en Cascade (Cascading Style Sheets) 🎨"
                            ],
                            correctAnswer: 2,
                            explanation: "Réponse : c) Feuilles de Style en Cascade. Les autres, c’est pour les pauses café ou le gaming !",
                            points: 10
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

const fs = require('fs');
const path = require('path');
const { Activity } = require('./models');

async function seedActivities() {
    try {
        // Créer les activités
        const additionalActivities = [
            {
                title: "Intelligence Artificielle Démystifiée",
                description: "Découvrez les secrets de l'IA et comment elle fonctionne vraiment !",
                category: "ai",
                difficulty: "beginner",
                maxPoints: 80,
                order: 2,
                content: {
                    steps: [
                        {
                            type: "lesson",
                            title: "Qu'est-ce que l'Intelligence Artificielle ?",
                            content: "🤖 L'IA est partout autour de nous ! Elle recommande vos vidéos YouTube, traduit des langues, et aide même les médecins à diagnostiquer des maladies.\n\n💡 Fun fact : Le terme 'Intelligence Artificielle' a été inventé en 1956 par John McCarthy. Aujourd'hui, votre smartphone contient plus de puissance de calcul que les ordinateurs utilisés pour envoyer l'homme sur la Lune !\n\n🧠 L'IA imite le cerveau humain en apprenant à partir d'exemples, comme un enfant qui apprend à reconnaître un chat en voyant plein de photos de chats.",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Les types d'IA",
                            question: "Quel type d'IA utilise Netflix pour vous recommander des films ?",
                            options: [
                                "IA générative",
                                "IA de recommandation",
                                "IA de vision",
                                "IA vocale"
                            ],
                            correctAnswer: 1,
                            explanation: "Netflix utilise des algorithmes de recommandation qui analysent vos goûts et ceux d'utilisateurs similaires pour suggérer du contenu.",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "Comment l'IA apprend-elle ?",
                            content: "🎯 L'IA apprend comme vous ! Imaginez apprendre à reconnaître des visages :\n\n1️⃣ On montre à l'IA des milliers de photos avec des noms\n2️⃣ Elle trouve des patterns (forme des yeux, distance entre le nez...)\n3️⃣ Elle s'entraîne à deviner sur de nouvelles photos\n4️⃣ On corrige ses erreurs jusqu'à ce qu'elle soit très douée !\n\n🚗 C'est exactement comme ça que les voitures autonomes apprennent à conduire en analysant des millions d'heures de conduite humaine.",
                            points: 0
                        },
                        {
                            type: "text_input",
                            title: "IA dans votre quotidien",
                            question: "Citez une application ou un service que vous utilisez qui contient de l'IA :",
                            placeholder: "Ex: Siri, Google Maps, Instagram...",
                            correctAnswers: ["siri", "google", "instagram", "snapchat", "tiktok", "youtube", "netflix", "spotify", "alexa", "maps", "traduction", "google maps", "google translate", "assistant", "cortana", "chatgpt", "messenger", "whatsapp", "facebook"],
                            caseSensitive: false,
                            explanation: "Bravo ! L'IA est partout : assistants vocaux, réseaux sociaux, GPS, streaming... Elle améliore notre quotidien !",
                            points: 20
                        },
                        {
                            type: "multiple_choice",
                            title: "L'avenir de l'IA",
                            question: "Quelle affirmation sur l'IA est VRAIE ?",
                            options: [
                                "L'IA va remplacer tous les humains",
                                "L'IA peut créer de l'art et de la musique",
                                "L'IA comprend les émotions mieux que nous",
                                "L'IA n'a pas besoin d'électricité"
                            ],
                            correctAnswer: 1,
                            explanation: "L'IA peut effectivement créer de l'art, de la musique et même écrire des poèmes ! Des IA comme DALL-E créent des images incroyables.",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "Les limites et défis de l'IA",
                            content: "⚖️ L'IA n'est pas magique ! Elle a des limites importantes :\n\n🚫 Problèmes actuels :\n• Biais : si on entraîne une IA avec des données biaisées, elle sera biaisée\n• Hallucinations : parfois elle invente des informations\n• Consommation énorme d'énergie\n• Ne comprend pas vraiment, elle imite\n\n🤔 L'IA peut confondre un chien avec un muffin si les images se ressemblent ! Elle voit des patterns mais ne 'comprend' pas comme nous.",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Éthique de l'IA",
                            question: "Quel est le plus grand défi éthique de l'IA aujourd'hui ?",
                            options: [
                                "Elle coûte trop cher",
                                "Elle peut reproduire et amplifier les discriminations humaines",
                                "Elle est trop lente",
                                "Elle ne fonctionne que en anglais"
                            ],
                            correctAnswer: 1,
                            explanation: "C'est le grand défi ! Si une IA apprend sur des données où certains groupes sont discriminés, elle reproduira ces biais. C'est pourquoi la diversité dans la tech est cruciale.",
                            points: 20
                        },
                        {
                            type: "drag_drop",
                            title: "Métiers VS IA : Qui gagne ?",
                            question: "Classez ces métiers selon leur résistance à l'IA. Glissez-les dans la bonne catégorie ! 🥊",
                            items: [
                                { id: "psychologue", text: "Psychologue 🧠" },
                                { id: "caissier", text: "Caissier 💰" },
                                { id: "artiste", text: "Artiste 🎨" },
                                { id: "comptable", text: "Comptable 📊" },
                                { id: "enseignant", text: "Enseignant 👩‍🏫" },
                                { id: "traducteur", text: "Traducteur 🌍" }
                            ],
                            categories: ["Difficiles à remplacer 💪", "Facilement remplaçables 🤖"],
                            correctAnswers: {
                                "psychologue": "Difficiles à remplacer 💪",
                                "caissier": "Facilement remplaçables 🤖",
                                "artiste": "Difficiles à remplacer 💪",
                                "comptable": "Facilement remplaçables 🤖",
                                "enseignant": "Difficiles à remplacer 💪",
                                "traducteur": "Facilement remplaçables 🤖"
                            },
                            explanation: "Les métiers nécessitant créativité, empathie et relations humaines résistent mieux ! Même si l'IA peut aider, elle ne peut pas remplacer le cœur humain ❤️",
                            points: 15
                        }
                    ]
                }
            },
            {
                title: "Premiers pas sur Internet",
                description: "Explorez le web en toute sécurité et découvrez ses secrets",
                category: "internet",
                difficulty: "beginner",
                maxPoints: 90,
                order: 3,
                content: {
                    steps: [
                        {
                            type: "lesson",
                            title: "L'incroyable histoire d'Internet",
                            content: "🌐 Internet a été créé en 1969 par des scientifiques américains pour connecter 4 ordinateurs ! Aujourd'hui, plus de 5 milliards de personnes l'utilisent.\n\n🚀 En 1 seconde sur Internet :\n• 9 000 tweets sont envoyés\n• 1 000 photos Instagram sont postées\n• 85 000 recherches Google sont faites\n• 3 millions d'emails sont envoyés\n\n💡 Le premier site web de l'histoire existe encore : info.cern.ch - allez le voir !",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Anatomie d'une URL",
                            question: "Dans 'https://www.youtube.com/watch', que signifie 'https' ?",
                            options: [
                                "Hyper Text Transfer Protocol Secure",
                                "High Tech Transfer Protocol System",
                                "Hyper Time Transfer Protocol Simple",
                                "Home Text Transfer Protocol Safe"
                            ],
                            correctAnswer: 0,
                            explanation: "HTTPS = sécurisé ! Le 'S' final signifie que vos données sont chiffrées. Cherchez toujours le cadenas 🔒 dans votre navigateur !",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "Les moteurs de recherche : vos super-pouvoirs",
                            content: "🔍 Google traite 8,5 milliards de recherches par jour ! Mais connaissez-vous ces astuces de ninja ?\n\n🎯 Astuces secrètes :\n• Guillemets \"\" : recherche exacte\n• Tiret - : exclure un mot\n• site:youtube.com : chercher sur un site précis\n• filetype:pdf : chercher des PDF uniquement\n\n🎮 Tapez 'do a barrel roll' dans Google pour une surprise !",
                            points: 0
                        },
                        {
                            type: "text_input",
                            title: "Maître de la recherche",
                            question: "Comment chercheriez-vous des recettes de cookies SANS chocolat ? (Aide: utilisez le signe - pour exclure un mot)",
                            placeholder: "recettes cookies ...",
                            correctAnswers: ["recettes cookies -chocolat", "cookies -chocolat", "recette cookies -chocolat", "\"recettes cookies\" -chocolat", "recettes -chocolat", "cookies recettes -chocolat"],
                            caseSensitive: false,
                            explanation: "Parfait ! Le tiret (-) exclut le mot 'chocolat' de vos résultats. Vous êtes un ninja de la recherche !",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "Les dangers du web et fake news",
                            content: "🕵️ Internet contient tout : le meilleur comme le pire ! Comment distinguer le vrai du faux ?\n\n✅ Sources fiables :\n• Sites gouvernementaux (.gouv.fr)\n• Universités (.edu, .ac.uk)\n• Médias reconnus avec journalistes\n• Wikipédia (pour commencer, puis vérifier les sources)\n\n🚨 Méfiez-vous de :\n• Articles sans auteur ni date\n• Sites avec plein de pub\n• Informations trop 'choquantes'\n• Réseaux sociaux comme seule source",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Détective des fake news",
                            question: "Vous voyez cette info : 'Les licornes existent vraiment selon une étude de Harvard !' Que faire ?",
                            options: [
                                "Partager immédiatement sur les réseaux sociaux",
                                "Vérifier sur le site officiel de Harvard",
                                "Chercher d'autres sources fiables",
                                "Ignorer cette information"
                            ],
                            correctAnswer: 1,
                            explanation: "Il faut toujours vérifier les informations à la source officielle. Une vraie étude de Harvard serait disponible sur leur site institutionnel.",
                            points: 20
                        },
                        {
                            type: "drag_drop",
                            title: "Tri des sources : Fiable ou Bidon ?",
                            question: "Aidez-moi à trier ces sources ! Glissez-les dans la bonne catégorie 🗂️",
                            items: [
                                { id: "science_gouv", text: "science.gouv.fr 🏛️" },
                                { id: "monblog", text: "monblog-perso.com 📝" },
                                { id: "wikipedia", text: "Wikipédia 📚" },
                                { id: "facebook_post", text: "Post Facebook de Mamie 👵" },
                                { id: "le_monde", text: "Le Monde (journal) 📰" },
                                { id: "site_bizarr", text: "verites-cachees-aliens.net 👽" }
                            ],
                            categories: ["Sources fiables ✅", "Sources douteuses ❌"],
                            correctAnswers: {
                                "science_gouv": "Sources fiables ✅",
                                "monblog": "Sources douteuses ❌",
                                "wikipedia": "Sources fiables ✅",
                                "facebook_post": "Sources douteuses ❌",
                                "le_monde": "Sources fiables ✅",
                                "site_bizarr": "Sources douteuses ❌"
                            },
                            explanation: "Bien joué ! Les sites officiels, médias reconnus et encyclopédies sont plus fiables que les blogs persos et les théories du complot ! 🕵️‍♀️",
                            points: 15
                        },
                        {
                            type: "multiple_choice",
                            title: "Culture web",
                            question: "Quel est le site web le plus visité au monde ?",
                            options: [
                                "Facebook",
                                "YouTube",
                                "Google",
                                "Instagram"
                            ],
                            correctAnswer: 2,
                            explanation: "Google est le site le plus visité au monde avec plus de 90 milliards de visites par mois. C'est devenu le point d'entrée principal d'Internet.",
                            points: 15
                        }
                    ]
                }
            },
            {
                title: "Cybersécurité : Devenez un Cyber-Héros",
                description: "Protégez-vous des pirates et devenez un expert en sécurité numérique",
                category: "security",
                difficulty: "intermediate",
                maxPoints: 120,
                order: 4,
                content: {
                    steps: [
                        {
                            type: "lesson",
                            title: "Les cyber-attaques : un monde invisible",
                            content: "🦹‍♀️ Chaque 39 secondes, un pirate attaque quelqu'un sur Internet ! Mais ne paniquez pas, vous allez apprendre à vous défendre.\n\n🎯 Les pirates ciblent :\n• Vos mots de passe (pour voler votre identité)\n• Vos photos et données personnelles\n• Votre argent via de fausses boutiques\n\n💰 Le cybercrime rapporte 1 500 milliards $ par an ! Plus que le PIB de l'Espagne entière. C'est pourquoi il faut se protéger.",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Mots de passe de super-héros",
                            question: "Quel mot de passe est le plus sûr ?",
                            options: [
                                "123456789",
                                "MonNom2025",
                                "Tr0ub4dor&3",
                                "J'aime_les_Cookies_au_Chocolat!"
                            ],
                            correctAnswer: 3,
                            explanation: "Les phrases de passe longues avec des caractères spéciaux sont les plus sécurisées. Elles combinent longueur, complexité et facilité de mémorisation.",
                            points: 20
                        },
                        {
                            type: "lesson",
                            title: "Phishing : l'art de la manipulation",
                            content: "🎣 Le phishing, c'est comme la pêche, mais pour attraper VOS données ! Les pirates créent de faux emails qui ressemblent à Netflix, Amazon...\n\n🚩 Signaux d'alarme :\n• 'Votre compte sera supprimé dans 24h !'\n• Fautes d'orthographe bizarres\n• Liens suspects (hoover dessus sans cliquer !)\n• Demandes d'infos personnelles urgentes\n\n🛡️ Règle d'or : En cas de doute, allez directement sur le vrai site !",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Détective anti-phishing",
                            question: "Cet email est-il suspect : 'Bonjour, votre compte Netflix sera suspendu. Cliquez ici : netfl1x-secure.com' ?",
                            options: [
                                "Non, Netflix a des problèmes techniques",
                                "Oui, à cause des fautes de frappe",
                                "Oui, à cause de l'URL suspecte", 
                                "Oui, c'est clairement une tentative de phishing"
                            ],
                            correctAnswer: 3,
                            explanation: "L'URL 'netfl1x-secure.com' utilise un chiffre '1' au lieu de la lettre 'i', ce qui est un signe classique de phishing. De plus, Netflix ne demande jamais de cliquer sur des liens dans les emails.",
                            points: 15
                        },
                        {
                            type: "drag_drop",
                            title: "Sécurité des mots de passe : Fort ou Faible ?",
                            question: "Classez ces mots de passe selon leur niveau de sécurité ! 🛡️",
                            items: [
                                { id: "password123", text: "password123 🤦‍♀️" },
                                { id: "phrase_longue", text: "MonChienAdoreLesEpinards!2024 🐕🥬" },
                                { id: "prenom_date", text: "Marie1985 👩" },
                                { id: "aleatoire", text: "Xk9$mP#vL2qR 🎲" },
                                { id: "simple", text: "azerty 😴" },
                                { id: "phrase_fun", text: "Pizza+Licorne=Bonheur!7 🍕🦄" }
                            ],
                            categories: ["Mots de passe FORTS 💪", "Mots de passe FAIBLES 😱"],
                            correctAnswers: {
                                "password123": "Mots de passe FAIBLES 😱",
                                "phrase_longue": "Mots de passe FORTS 💪",
                                "prenom_date": "Mots de passe FAIBLES 😱",
                                "aleatoire": "Mots de passe FORTS 💪",
                                "simple": "Mots de passe FAIBLES 😱",
                                "phrase_fun": "Mots de passe FORTS 💪"
                            },
                            explanation: "Super ! Les phrases longues avec chiffres et symboles sont les plus sûres. Et en bonus, elles vous font sourire ! 😊🔐",
                            points: 20
                        },
                        {
                            type: "lesson",
                            title: "Wi-Fi public : ami ou ennemi ?",
                            content: "📶 Les Wi-Fi gratuits, c'est tentant ! Mais attention aux pièges...\n\n⚠️ Dangers du Wi-Fi public :\n• Vos données peuvent être interceptées\n• Faux hotspots créés par des pirates\n• Impossible de savoir qui surveille\n• Pas de chiffrement = tout est visible\n\n🛡️ Conseils de ninja :\n• Évitez les achats/banque sur Wi-Fi public\n• Utilisez un VPN si possible\n• Vérifiez le nom exact du Wi-Fi officiel\n• Activez le partage de connexion de votre téléphone plutôt !",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Piège Wi-Fi",
                            question: "Vous êtes dans un café 'Le Petit Paris'. Quel Wi-Fi choisir ?",
                            options: [
                                "Le_Petit_Paris_WiFi",
                                "WiFi_Gratuit_Rapide",
                                "Petit-Paris-Guest",
                                "Demander le nom exact au serveur"
                            ],
                            correctAnswer: 3,
                            explanation: "Il faut toujours demander le nom officiel du réseau Wi-Fi. Les pirates créent souvent de faux réseaux avec des noms similaires pour piéger les utilisateurs.",
                            points: 25
                        },
                        {
                            type: "multiple_choice",
                            title: "Authentification à deux facteurs (2FA)",
                            question: "Qu'est-ce que l'authentification à deux facteurs ?",
                            options: [
                                "Utiliser deux mots de passe différents",
                                "Se connecter depuis deux appareils en même temps",
                                "Mot de passe + code SMS/application",
                                "Avoir deux comptes identiques"
                            ],
                            correctAnswer: 2,
                            explanation: "L'authentification à deux facteurs combine quelque chose que vous savez (mot de passe) avec quelque chose que vous possédez (téléphone). Cela renforce considérablement la sécurité.",
                            points: 20
                        }
                    ]
                }
            },
            {
                title: "Créez votre première page web",
                description: "Découvrez la magie du HTML et créez votre propre site web",
                category: "web",
                difficulty: "beginner",
                maxPoints: 120,
                order: 5,
                content: {
                    steps: [
                        {
                            type: "lesson",
                            title: "HTML : Le langage du web",
                            content: "🌟 HTML (HyperText Markup Language) est le squelette de TOUS les sites web ! Même Facebook, Instagram et TikTok utilisent HTML.\n\n🏗️ HTML fonctionne avec des 'balises' comme des boîtes :\n• <h1> pour les gros titres\n• <p> pour les paragraphes\n• <img> pour les images\n• <a> pour les liens\n\n🎨 Fun fact : Le premier site web créé en 1991 n'avait que du texte ! Aujourd'hui, une page web moyenne contient 2MB de données.",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Anatomie d'une balise",
                            question: "À quoi sert cette balise : <img src='chat.jpg' alt='Mon chat mignon'> ?",
                            options: [
                                "Créer un lien vers une image",
                                "Afficher une image de chat",
                                "Créer un titre avec une image",
                                "Télécharger une image"
                            ],
                            correctAnswer: 1,
                            explanation: "Exact ! <img> affiche une image. 'src' indique le fichier, 'alt' décrit l'image pour les malvoyants et les moteurs de recherche.",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "Structure d'une page web",
                            content: "🏠 Une page HTML, c'est comme une maison :\n\n• <html> = les fondations\n• <head> = les plans (titre, style) - invisible\n• <body> = les pièces visibles\n• <header> = l'entrée/toit\n• <main> = le salon principal\n• <footer> = le sous-sol/cave\n\n🎯 Chaque balise a un rôle précis ! Google et les autres moteurs de recherche adorent les pages bien structurées.",
                            points: 0
                        },
                        {
                            type: "text_input",
                            title: "Votre première balise",
                            question: "Écrivez la balise HTML pour créer un titre principal qui dit 'Bienvenue sur mon site' :",
                            placeholder: "<...>Bienvenue sur mon site</...>",
                            correctAnswers: ["<h1>Bienvenue sur mon site</h1>", "<h1>bienvenue sur mon site</h1>", "<H1>Bienvenue sur mon site</H1>"],
                            caseSensitive: false,
                            explanation: "Parfait ! <h1> crée le titre principal. C'est la balise la plus importante pour le référencement Google !",
                            points: 20
                        },
                        {
                            type: "drag_drop",
                            title: "Construisez votre première page web !",
                            question: "Glissez les balises dans le bon ordre pour créer une page HTML basique ! 🏗️",
                            items: [
                                { id: "html", text: "<html> (les fondations)" },
                                { id: "head", text: "<head> (les plans secrets)" },
                                { id: "title", text: "<title> (le nom de la maison)" },
                                { id: "body", text: "<body> (les pièces visibles)" },
                                { id: "h1", text: "<h1> (l'enseigne géante)" },
                                { id: "p", text: "<p> (les meubles = texte)" }
                            ],
                            categories: ["Structure de base 🏠", "Contenu visible 👀"],
                            correctAnswers: {
                                "html": "Structure de base 🏠",
                                "head": "Structure de base 🏠",
                                "title": "Structure de base 🏠",
                                "body": "Contenu visible 👀",
                                "h1": "Contenu visible 👀",
                                "p": "Contenu visible 👀"
                            },
                            explanation: "Excellent ! Vous venez de construire votre première maison HTML ! La structure invisible (head) et le contenu visible (body) ! 🏗️✨",
                            points: 15
                        },
                        {
                            type: "multiple_choice",
                            title: "Les super-pouvoirs du web",
                            question: "Quelle technologie rend les pages web interactives ?",
                            options: [
                                "HTML",
                                "CSS",
                                "JavaScript",
                                "Python"
                            ],
                            correctAnswer: 2,
                            explanation: "JavaScript est le langage qui apporte l'interactivité aux pages web. HTML structure le contenu, CSS le stylise, et JavaScript le rend dynamique.",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "CSS : Rendre le web beau",
                            content: "🎨 CSS (Cascading Style Sheets) transforme une page moche en chef-d'œuvre !\n\n✨ CSS contrôle :\n• Les couleurs et polices\n• La disposition des éléments\n• Les animations et transitions\n• L'adaptation aux mobiles (responsive)\n\n🌈 Sans CSS, tous les sites ressembleraient à des documents Word basiques. CSS = la différence entre un site des années 90 et Instagram !",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Votre première CSS",
                            question: "En CSS, comment rendre un titre rouge ?",
                            options: [
                                "color: rouge;",
                                "red-color: yes;",
                                "color: red;",
                                "make-it-red: true;"
                            ],
                            correctAnswer: 2,
                            explanation: "La propriété CSS 'color: red;' permet de changer la couleur du texte en rouge. CSS utilise des mots-clés anglais pour les propriétés et valeurs.",
                            points: 20
                        },
                        {
                            type: "multiple_choice",
                            title: "Responsive design",
                            question: "Qu'est-ce que le 'responsive design' ?",
                            options: [
                                "Un site qui répond aux commandes vocales",
                                "Un site qui s'adapte à tous les écrans",
                                "Un site qui utilise beaucoup de JavaScript",
                                "Un site qui change de couleurs automatiquement"
                            ],
                            correctAnswer: 1,
                            explanation: "Le responsive design permet à un site web de s'adapter automatiquement à différentes tailles d'écran (mobile, tablette, ordinateur).",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "L'avenir du web : tendances 2025",
                            content: "🚀 Le web évolue sans cesse ! Tendances actuelles :\n\n⚡ Performance :\n• Sites ultra-rapides (moins de 2 secondes)\n• Progressive Web Apps (comme des apps natives)\n• IA intégrée partout\n\n🎯 Accessibilité :\n• Sites utilisables par tous (malvoyants, handicaps...)\n• Commande vocale\n• Dark mode par défaut\n\n🌱 Éco-responsabilité : sites moins polluants !",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Votre vision créative",
                            question: "Si vous créiez un site web, quel serait son thème principal ?",
                            options: [
                                "Un portfolio professionnel",
                                "Un blog sur vos hobbies",
                                "Un site d'information spécialisé",
                                "Peu importe, tant que c'est votre passion !"
                            ],
                            correctAnswer: 3,
                            explanation: "L'important est de créer un site web qui vous passionne. Chaque idée créative peut devenir un projet web intéressant et engageant.",
                            points: 15
                        }
                    ]
                }
            },
            {
                title: "Culture Numérique & Quiz Final",
                description: "Testez vos connaissances et découvrez des anecdotes fascinantes",
                category: "culture",
                difficulty: "mixed",
                maxPoints: 125,
                order: 6,
                content: {
                    steps: [
                        {
                            type: "lesson",
                            title: "Records et anecdotes du numérique",
                            content: "🎮 Le numérique regorge d'histoires folles !\n\n🏆 Records incroyables :\n• Le jeu mobile le plus rentable : Pokémon GO (1 milliard $ en 7 mois !)\n• Le tweet le plus liké : un œuf (55 millions de likes)\n• La vidéo YouTube la plus vue : Baby Shark (13 milliards !)\n\n💎 Le premier ordinateur pesait 30 tonnes ! Votre smartphone est 120 000 fois plus puissant que l'ordinateur d'Apollo 11.",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Géants de la tech",
                            question: "Quelle entreprise a été créée dans un garage par deux Steve ?",
                            options: [
                                "Microsoft",
                                "Google",
                                "Apple",
                                "Facebook"
                            ],
                            correctAnswer: 2,
                            explanation: "Apple ! Steve Jobs et Steve Wozniak ont créé Apple dans le garage des parents de Jobs en 1976. Aujourd'hui, Apple vaut plus de 3 000 milliards $ !",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "L'impact environnemental du numérique",
                            content: "🌍 Le numérique représente 4% des émissions mondiales de CO2 ! Mais il aide aussi à sauver la planète :\n\n♻️ Solutions vertes :\n• Visioconférences = moins de voyages\n• Dématérialisation = moins de papier\n• Smart grids = économies d'énergie\n• Agriculture connectée = moins de pesticides\n\n💡 1 email avec pièce jointe = 19g de CO2. Un simple 'merci' par mail = 1g de CO2 !",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Réseaux sociaux",
                            question: "Combien de temps en moyenne les gens passent-ils sur leur smartphone par jour ?",
                            options: [
                                "2 heures",
                                "4 heures",
                                "7 heures",
                                "10 heures"
                            ],
                            correctAnswer: 2,
                            explanation: "7 heures ! Soit presque la moitié de notre temps éveillé. Les apps sont conçues pour être addictives avec des notifications et récompenses.",
                            points: 15
                        },
                        {
                            type: "text_input",
                            title: "Votre vision du futur",
                            question: "Selon vous, quelle innovation numérique va changer le monde dans les 10 prochaines années ?",
                            placeholder: "Voitures autonomes, IA, réalité virtuelle, robots...",
                            correctAnswers: ["ia", "intelligence artificielle", "voiture", "autonome", "robot", "realite virtuelle", "vr", "blockchain", "quantique", "metaverse", "5g", "biotechnologie", "nanotechnologie"],
                            caseSensitive: false,
                            explanation: "Excellente vision ! L'avenir numérique sera façonné par nos choix d'aujourd'hui. Vous faites partie de cette révolution ! 🚀",
                            points: 15
                        },
                        {
                            type: "multiple_choice",
                            title: "Quiz final - Devenir un champion du numérique",
                            question: "Quelle est la règle d'OR pour être un citoyen numérique responsable ?",
                            options: [
                                "Utiliser le numérique le plus possible",
                                "Réfléchir avant de cliquer, partager, ou poster",
                                "Faire confiance à tout ce qu'on voit en ligne",
                                "Ne jamais utiliser Internet"
                            ],
                            correctAnswer: 1,
                            explanation: "Bravo ! Réfléchir avant d'agir en ligne, c'est le secret d'un usage intelligent et sûr du numérique. Vous êtes maintenant un vrai expert ! 🏆",
                            points: 15
                        },
                        {
                            type: "lesson",
                            title: "Les métiers du futur",
                            content: "🔮 Le numérique crée de nouveaux métiers chaque année !\n\n🚀 Métiers émergents :\n• Prompt Engineer (expert en IA)\n• Data Scientist (détective des données)\n• Cybersecurity Analyst (garde du corps digital)\n• UX Designer (architecte d'expériences)\n• DevOps Engineer (magicien du déploiement)\n\n💡 85% des emplois de 2030 n'existent pas encore ! L'important : rester curieux et continuer d'apprendre.",
                            points: 0
                        },
                        {
                            type: "multiple_choice",
                            title: "Défi économie numérique",
                            question: "Quelle est la valorisation approximative d'Apple en 2024 ?",
                            options: [
                                "500 milliards $",
                                "1 000 milliards $",
                                "3 000 milliards $",
                                "10 000 milliards $"
                            ],
                            correctAnswer: 2,
                            explanation: "Apple vaut environ 3 000 milliards de dollars, ce qui en fait l'entreprise la plus valorisée au monde, dépassant le PIB de nombreux pays.",
                            points: 25
                        },
                        {
                            type: "drag_drop",
                            title: "Impact environnemental : Bon ou Mauvais ?",
                            question: "Classez ces actions selon leur impact sur l'environnement numérique ! 🌱💻",
                            items: [
                                { id: "supprimer_emails", text: "Supprimer ses vieux emails 📧🗑️" },
                                { id: "streaming_hd", text: "Regarder Netflix en 4K H24 📺" },
                                { id: "eteindre_devices", text: "Éteindre ses appareils la nuit 🌙" },
                                { id: "acheter_nouveau", text: "Acheter un nouveau smartphone chaque année 📱" },
                                { id: "reparer", text: "Réparer au lieu de jeter 🔧" },
                                { id: "crypto_mining", text: "Miner des cryptomonnaies ⛏️💰" }
                            ],
                            categories: ["Bon pour la planète 🌍✅", "Mauvais pour la planète 🌍❌"],
                            correctAnswers: {
                                "supprimer_emails": "Bon pour la planète 🌍✅",
                                "streaming_hd": "Mauvais pour la planète 🌍❌",
                                "eteindre_devices": "Bon pour la planète 🌍✅",
                                "acheter_nouveau": "Mauvais pour la planète 🌍❌",
                                "reparer": "Bon pour la planète 🌍✅",
                                "crypto_mining": "Mauvais pour la planète 🌍❌"
                            },
                            explanation: "Super ! Chaque geste compte : supprimer ses emails, éteindre ses appareils, réparer plutôt que racheter... Merci pour la planète ! 🌍❤️",
                            points: 20
                        },
                        {
                            type: "multiple_choice",
                            title: "Test final - Expert numérique",
                            question: "Combien de données sont créées chaque jour dans le monde ?",
                            options: [
                                "2,5 téraoctets",
                                "2,5 pétaoctets", 
                                "2,5 exaoctets",
                                "2,5 zettaoctets"
                            ],
                            correctAnswer: 2,
                            explanation: "2,5 exaoctets de données sont créées chaque jour dans le monde, soit l'équivalent de millions de bibliothèques numériques.",
                            points: 30
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

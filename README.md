# Diagnostic / 01 — V1 Netlify

Petit diagnostic interactif propulsé par l'API OpenAI.

## Déploiement le plus simple

1. Mets ce dossier dans un dépôt GitHub.
2. Dans Netlify, crée un nouveau projet depuis ce dépôt.
3. Aucun build command n'est nécessaire.
4. Le dossier publié est `.`.
5. Dans **Project configuration → Environment variables**, ajoute :
   - `OPENAI_API_KEY` = ta clé API OpenAI
   - optionnel : `OPENAI_MODEL` = `gpt-5-mini`
6. Redéploie le site après avoir ajouté/modifié la variable.

Ne mets jamais ta clé OpenAI dans `app.js`, `index.html`, GitHub ou un fichier public.

## Structure

- `index.html` : squelette de l'interface
- `styles.css` : design
- `app.js` : questionnaire + affichage des résultats
- `netlify/functions/analyze.mjs` : prompt et appel API OpenAI
- `netlify.toml` : configuration Netlify

## Modifier les questions

Dans `app.js`, édite le tableau `steps`.

## Modifier le comportement du GPT

Dans `netlify/functions/analyze.mjs`, édite `INSTRUCTIONS`.

## Test local (optionnel)

Avec la CLI Netlify installée :

```bash
npm install -g netlify-cli
netlify dev
```

Puis ouvre l'adresse locale indiquée par Netlify.

## Confidentialité

Le front sauvegarde temporairement les réponses dans `sessionStorage` du navigateur.
L'appel à OpenAI utilise `store: false` dans cette V1.
Aucune base de données n'est incluse.


## V3 — Capture avant diagnostic
Prénom + e-mail obligatoires, avec validation front et serveur. Le prénom personnalise le parcours.
Cette V3 prépare l'adresse pour l'envoi, mais un fournisseur transactionnel (Resend/Brevo/Postmark) doit encore être branché pour expédier réellement l'e-mail.


## V5.3
Correction Supabase Secret Key : la clé `sb_secret_...` est envoyée uniquement via l'en-tête `apikey`, conformément au nouveau format Supabase.


## V6 — Diagnostic / 01
Rebranding + message e-mail + CTA final session 1:1 Instagram. IMPORTANT : l'envoi transactionnel par e-mail n'est pas encore branché ; connecter un fournisseur e-mail avant diffusion publique de la promesse d'envoi.


## V6.1
- Correction robuste de la génération finale : lecture texte + parsing JSON sécurisé.
- 1 nouvelle tentative automatique en cas d'erreur réseau, 429 ou 5xx.
- Message utilisateur simplifié en cas d'échec temporaire.
- Remplacement des dernières occurrences de « Ton Fil Rouge » par « Diagnostic / 01 ».


## V6.2.1 Hotfix
Correction de l'erreur `res is not defined` dans la génération finale. Aucun changement aux variables Netlify/Supabase/Resend.


## V6.2.2 — Rapport plus lisible
Le nom du profil conserve la typographie display. La synthèse passe en texte courant 17–21 px, line-height 1.6, largeur limitée à 700 px.



## V6.3 - Rapport PDF
- Suppression de l'envoi automatique Resend.
- Suppression de la promesse d'envoi du rapport par e-mail.
- Nouveau bouton principal : « Télécharger mon diagnostic PDF ».
- Le bouton ouvre une version A4 brandée puis déclenche la boîte de dialogue d'impression du navigateur. L'utilisateur choisit « Enregistrer au format PDF ».
- Le rapport reprend profil, synthèse, forces, opportunités, recommandation, plan d'action 7 jours et CTA 1:1 Instagram.
- `RESEND_API_KEY` n'est plus utilisée par cette version et peut être supprimée de Netlify.

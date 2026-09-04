
const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    profil: { type: "string" },
    synthese: { type: "string" },
    indice_clarte: { type: "integer", minimum: 0, maximum: 100 },
    forces: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    },
    pistes: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          titre: { type: "string" },
          pourquoi: { type: "string" }
        },
        required: ["titre", "pourquoi"]
      }
    },
    recommandation: {
      type: "object",
      additionalProperties: false,
      properties: {
        titre: { type: "string" },
        explication: { type: "string" }
      },
      required: ["titre", "explication"]
    },
    plan_7_jours: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    }
  },
  required: [
    "profil", "synthese", "indice_clarte", "forces",
    "pistes", "recommandation", "plan_7_jours"
  ]
};

const INSTRUCTIONS = `
Tu es "Ton Fil Rouge", un coach d'introspection pragmatique.
Ta mission est d'aider une personne à identifier les compétences, aptitudes et schémas de comportement
qu'elle possède déjà, puis à en tirer des pistes de monétisation réalistes.

PRINCIPES :
- Ne flatte pas artificiellement la personne.
- Ne transforme pas chaque hobby en "business".
- Cherche les motifs récurrents entre comportements naturels, compétences acquises, projets et résultats.
- Distingue ce que la personne aime, ce qu'elle sait faire et ce pour quoi quelqu'un pourrait réellement payer.
- Tiens compte des contraintes de vie et du type d'activité souhaité.
- Préfère les micro-tests simples aux grands projets.
- Évite le jargon marketing.
- Sois direct, concret, chaleureux et lisible.
- Ne prétends pas connaître des informations absentes des réponses.
- Les pistes doivent être légales, sûres et réalistes.
- Réponds en français.
`;

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Méthode non autorisée." }, { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY n'est pas configurée côté Netlify." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const answers = body?.answers || {};
  const lead = body?.lead || {};
  const prenom = String(lead.prenom || "").trim().slice(0, 60);
  const email = String(lead.email || "").trim().toLowerCase().slice(0, 254);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  if (prenom.length < 2 || !emailOk) {
    return Response.json({ error: "Prénom ou adresse mail invalide." }, { status: 400 });
  }
  const required = ["naturel", "competences", "preuves", "blocages", "objectif"];
  const missing = required.filter(k => !answers[k] || String(answers[k]).trim().length < 8);

  if (missing.length) {
    return Response.json({ error: "Certaines réponses sont trop courtes ou manquantes." }, { status: 400 });
  }

  const userInput = `
Voici les réponses de l'utilisateur.
Son prénom est : ${prenom}.
Utilise occasionnellement son prénom pour rendre le diagnostic naturel, sans le répéter artificiellement.

1. CE QU'IL FAIT NATURELLEMENT
${answers.naturel}

2. COMPÉTENCES APPRISES
${answers.competences}

3. PROJETS / RÉSULTATS / PREUVES
${answers.preuves}

4. ABANDONS / BLOCAGES
${answers.blocages}

5. OBJECTIF ET CONTRAINTES
${answers.objectif}

Analyse les motifs récurrents. Donne un profil court et mémorable, 3 à 5 forces précises,
3 à 5 pistes monétisables classées implicitement de la plus cohérente à la moins prioritaire,
puis UNE piste à tester en premier et un plan de test en 3 actions réalisables sur 7 jours.

L'indice_clarte ne mesure pas la "valeur" de la personne : il indique simplement à quel point
les réponses fournissent des signaux cohérents pour choisir une première direction.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        store: false,
        instructions: INSTRUCTIONS,
        input: userInput,
        text: {
          format: {
            type: "json_schema",
            name: "fil_rouge_analysis",
            strict: true,
            schema
          }
        }
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error("OpenAI error", payload);
      return Response.json(
        { error: payload?.error?.message || "L'analyse IA a échoué." },
        { status: 502 }
      );
    }

    const outputText =
      payload.output_text ||
      payload.output?.flatMap(item => item.content || [])
        ?.find(content => content.type === "output_text")?.text;

    if (!outputText) {
      return Response.json({ error: "Réponse IA vide." }, { status: 502 });
    }

    return Response.json(JSON.parse(outputText));
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Impossible de contacter le service d'analyse." }, { status: 500 });
  }
};

export const config = {
  path: "/api/analyze"
};

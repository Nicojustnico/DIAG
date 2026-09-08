
const app = document.querySelector("#app");

const steps = [
  {
    eyebrow: "01 / 05 · Naturel",
    title: "Qu'est-ce que tu fais mieux que la moyenne ?",
    copy: "Ne cherche pas quelque chose d’impressionnant. Pense plutôt à ce que tu fais presque sans effort et que les autres remarquent.",
    question: "Quand les gens viennent spontanément te demander de l’aide, c’est généralement pour quoi ?",
    placeholder: "Ex. organiser, donner un avis, réparer, expliquer, créer, trouver une solution…",
    key: "naturel"
  },
  {
    eyebrow: "02 / 05 · Compétences",
    title: "Qu'est-ce que tu as appris tout seul ?",
    copy: "Tes compétences ne viennent pas forcément d’un diplôme. Regarde aussi ce que tu as appris par curiosité, nécessité ou obsession.",
    question: "Qu’est-ce que tu sais faire aujourd’hui que tu ne savais pas faire il y a quelques années ?",
    placeholder: "Ex. montage vidéo, Excel, bricolage, Photoshop, vente, cuisine, sport, gestion de projet…",
    key: "competences"
  },
  {
    eyebrow: "03 / 05 · Preuves",
    title: "Qu'est-ce que tu as déjà réussi ?",
    copy: "Un résultat concret vaut souvent plus qu’un intitulé de poste. Même un petit projet peut révéler une vraie compétence.",
    question: "De quoi es-tu fier : projet terminé, problème résolu, progression, résultat obtenu pour toi ou quelqu’un d’autre ?",
    placeholder: "Raconte 2 ou 3 exemples, même s’ils te paraissent banals.",
    key: "preuves"
  },
  {
    eyebrow: "04 / 05 · Blocages",
    title: "Qu'est-ce qui te fait toujours décrocher ?",
    copy: "Tes abandons sont utiles. Ils montrent ce qui ne te correspond pas… ou ce qui t’empêche de transformer une idée en projet concret.",
    question: "Qu’as-tu déjà essayé puis abandonné, et qu’est-ce qui t’a bloqué ?",
    placeholder: "Ex. manque de temps, peur de vendre, ennui, trop de technique, difficulté à rester régulier…",
    key: "blocages"
  },
  {
    eyebrow: "05 / 05 · Direction",
    title: "À quoi doit ressembler ta liberté ?",
    copy: "Ton projet doit financer ta vie — pas devenir une deuxième prison.",
    question: "Si tu pouvais générer un revenu complémentaire avec une activité réaliste, à quoi voudrais-tu que ça ressemble ?",
    placeholder: "Ex. 500 €/mois, travailler le soir, ne pas montrer ma vie privée, vendre un service, créer un produit…",
    key: "objectif"
  }
];

let state = {
  step: -1,
  lead: JSON.parse(sessionStorage.getItem("filrouge_lead") || '{"prenom":"","email":"","marketing_consent":false,"lead_id":null}'),
  answers: JSON.parse(sessionStorage.getItem("filrouge_answers") || "{}"),
  result: null
};

function esc(str="") {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function start() {
  renderLead();
}

function restart() {
  sessionStorage.removeItem("filrouge_answers");
  sessionStorage.removeItem("filrouge_lead");
  state = { step: -1, lead: { prenom: "", email: "" }, answers: {}, result: null };
  renderHome();
}


function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

function renderLead() {
  const prenom = state.lead?.prenom || "";
  const email = state.lead?.email || "";
  app.innerHTML = `
    <div class="frame lead-card">
      <div class="topline">Avant de commencer</div>
      <h2 class="step-title">On fait connaissance ?</h2>
      <p class="step-copy">Ton diagnostic sera plus personnel — et tu pourras le recevoir directement dans ta boîte mail.</p>
      <div class="lead-fields">
        <label class="field"><span>Ton prénom</span>
          <input id="firstName" type="text" autocomplete="given-name" maxlength="60" placeholder="Ex. Nico" value="${esc(prenom)}">
        </label>
        <label class="field"><span>Ton adresse mail</span>
          <input id="email" type="email" autocomplete="email" inputmode="email" placeholder="toi@email.com" value="${esc(email)}">
          <small id="emailHelp">Elle servira à t'envoyer ton diagnostic.</small>
        </label>
      </div>
      <div class="lead-consent">En continuant, tu acceptes que ton prénom et ton e-mail soient utilisés pour générer et t'envoyer ce diagnostic. Ils ne sont pas ajoutés à une newsletter dans cette V1.</div>
      <div class="actions">
        <button class="secondary" id="leadBack">← Retour</button>
        <button class="primary" id="leadNext" disabled>Commencer le diagnostic <span class="arrow">→</span></button>
      </div>
    </div>`;
  const firstName=document.querySelector("#firstName"), emailInput=document.querySelector("#email"),
        next=document.querySelector("#leadNext"), help=document.querySelector("#emailHelp");
  function validate(){
    const okName=firstName.value.trim().length>=2, okMail=validEmail(emailInput.value);
    next.disabled=!(okName&&okMail);
    if(emailInput.value.length&&!okMail){help.textContent="Entre une adresse mail valide, par exemple prenom@email.com.";help.classList.add("invalid");}
    else{help.textContent="Elle servira à t'envoyer ton diagnostic.";help.classList.remove("invalid");}
  }
  firstName.addEventListener("input",validate); emailInput.addEventListener("input",validate); validate();
  document.querySelector("#leadBack").addEventListener("click",renderHome);
  next.addEventListener("click",()=>{
    state.lead={prenom:firstName.value.trim(),email:emailInput.value.trim().toLowerCase()};
    sessionStorage.setItem("filrouge_lead",JSON.stringify(state.lead));
    state.step=0; renderStep();
  });
}

function renderHome() {
  app.innerHTML = `
    <div class="frame hero">
      <div class="topline">Diagnostic guidé</div>
      <h1>Tu penses n'avoir <span class="acid">rien à vendre ?</span></h1>

      <div class="hero-sub">
        Le problème n'est peut-être pas que tu n'as aucune compétence.
      </div>

      <p class="hero-copy">
        Tu ne sais simplement pas encore laquelle peut devenir une vraie opportunité.
        <strong>On va relier les points.</strong>
      </p>

      <div class="meta-row">
        <span class="pill">5 étapes</span>
        <span class="pill">≈ 7 minutes</span>
        <span class="pill">gratuit</span>
      </div>

      <button class="primary" id="startBtn">
        Trouver mon fil rouge <span class="arrow">→</span>
      </button>
    </div>`;
  document.querySelector("#startBtn").addEventListener("click", start);
}

function renderStep() {
  const s = steps[state.step];
  const current = state.answers[s.key] || "";
  const pct = ((state.step + 1) / steps.length) * 100;

  app.innerHTML = `
    <div class="frame step-card">
      <div class="progress-top">
        <div class="step-label">${esc(s.eyebrow)}</div>
        <div class="step-count">${state.step + 1} / ${steps.length}</div>
      </div>
      <div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div>

      <h2 class="step-title">${esc(s.title)}</h2>
      <div class="personal-note">${esc(state.lead?.prenom || "")}, réponds instinctivement.</div>
      <p class="step-copy">${esc(s.copy)}</p>

      <div class="question">${esc(s.question)}</div>
      <textarea id="answer" maxlength="1800" placeholder="${esc(s.placeholder)}">${esc(current)}</textarea>
      <div class="hint">Écris comme tu parlerais. Même une réponse floue suffit pour commencer.</div>

      <div class="coach-actions">
        <button class="coach-btn" id="stuckBtn"><span>?</span> Je ne sais pas quoi répondre</button>
        <button class="coach-btn" id="deepenBtn"><span>✦</span> Aide-moi à creuser</button>
      </div>
      <div id="coachZone"></div>

      <div class="actions">
        <button class="secondary" id="backBtn">${state.step === 0 ? "Accueil" : "← Retour"}</button>
        <button class="primary" id="nextBtn" ${current.trim().length < 8 ? "disabled" : ""}>
          ${state.step === steps.length - 1 ? "Voir mon profil" : "Continuer"} <span class="arrow">→</span>
        </button>
      </div>
    </div>`;

  const textarea = document.querySelector("#answer");
  const nextBtn = document.querySelector("#nextBtn");

  textarea.focus();
  textarea.addEventListener("input", () => {
    state.answers[s.key] = textarea.value;
    sessionStorage.setItem("filrouge_answers", JSON.stringify(state.answers));
    nextBtn.disabled = textarea.value.trim().length < 8;
  });

  document.querySelector("#backBtn").addEventListener("click", () => {
    if (state.step === 0) renderHome();
    else {
      state.step--;
      renderStep();
    }
  });

  document.querySelector("#stuckBtn").addEventListener("click", () => runCoach("stuck"));
  document.querySelector("#deepenBtn").addEventListener("click", () => runCoach("deepen"));

  nextBtn.addEventListener("click", async () => {
    state.answers[s.key] = textarea.value.trim();
    sessionStorage.setItem("filrouge_answers", JSON.stringify(state.answers));

    if (state.step < steps.length - 1) {
      state.step++;
      renderStep();
    } else {
      await analyze();
    }
  });
}


async function runCoach(mode, followupAnswer = "") {
  const s = steps[state.step];
  const zone = document.querySelector("#coachZone");
  const textarea = document.querySelector("#answer");
  zone.innerHTML = `<div class="coach-box coach-loading"><div class="mini-loader"></div><div>${mode === "stuck" ? "On va prendre la question autrement…" : "Je regarde ce qu'on peut creuser…"}</div></div>`;
  try {
    const res = await fetch("/api/coach", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        lead: state.lead, step: {index:state.step,key:s.key,title:s.title,question:s.question},
        mode, currentAnswer: textarea.value.trim(), followupAnswer, previousAnswers: state.answers
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur");
    renderCoach(data);
  } catch (err) {
    zone.innerHTML = `<div class="coach-box">Je n'arrive pas à t'aider pour le moment. ${esc(err.message)}</div>`;
  }
}

function renderCoach(data) {
  const zone = document.querySelector("#coachZone");
  const options = (data.options || []).map((o,i) =>
    `<button class="choice" data-value="${esc(o)}"><span>${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join("");
  zone.innerHTML = `<div class="coach-box">
    <div class="coach-kicker">✦ Coup de pouce</div>
    <div class="coach-message">${esc(data.message || "")}</div>
    ${data.question ? `<div class="coach-question">${esc(data.question)}</div>` : ""}
    ${options ? `<div class="choices">${options}</div>` : ""}
    <div class="coach-follow"><input id="followText" placeholder="Ou réponds avec tes propres mots…"><button class="mini-primary" id="followSend">Envoyer →</button></div>
  </div>`;
  const send = value => { if (value.trim()) synthesize(value); };
  zone.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => send(b.dataset.value)));
  document.querySelector("#followSend").addEventListener("click", () => send(document.querySelector("#followText").value));
}

async function synthesize(value) {
  const s=steps[state.step], zone=document.querySelector("#coachZone"), textarea=document.querySelector("#answer");
  zone.innerHTML=`<div class="coach-box coach-loading"><div class="mini-loader"></div><div>Je reformule ce que ça dit de toi…</div></div>`;
  try {
    const res=await fetch("/api/coach",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      lead:state.lead,step:{index:state.step,key:s.key,title:s.title,question:s.question},mode:"synthesize",
      currentAnswer:textarea.value.trim(),followupAnswer:value,previousAnswers:state.answers
    })});
    const data=await res.json(); if(!res.ok)throw new Error(data.error||"Erreur");
    zone.innerHTML=`<div class="coach-box synthesis"><div class="coach-kicker">Voilà ce que je retiens</div>
      <blockquote>${esc(data.suggestedAnswer)}</blockquote>
      <div class="synth-actions"><button class="mini-primary" id="useAnswer">✓ C'est ça</button><button class="coach-btn" id="editAnswer">Modifier moi-même</button></div></div>`;
    document.querySelector("#useAnswer").onclick=()=>{
      textarea.value=data.suggestedAnswer;state.answers[s.key]=textarea.value;
      sessionStorage.setItem("filrouge_answers",JSON.stringify(state.answers));
      document.querySelector("#nextBtn").disabled=textarea.value.trim().length<8;zone.innerHTML="";textarea.focus();
    };
    document.querySelector("#editAnswer").onclick=()=>{zone.innerHTML="";textarea.focus()};
  } catch(err){zone.innerHTML=`<div class="coach-box">${esc(err.message)}</div>`}
}

async function analyze() {
  app.innerHTML = `
    <div class="frame loading">
      <div class="loader"></div>
      <h2>${esc(state.lead?.prenom || "")}, je relie les points.</h2>
      <p>Je cherche les motifs qui reviennent dans ton parcours, tes forces naturelles et les pistes que tu pourrais réellement tester.</p>
    </div>`;

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ answers: state.answers, lead: state.lead })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur inconnue");

    state.result = data;
    renderResult();
  } catch (err) {
    app.innerHTML = `
      <div class="frame error">
        <div class="icon">↯</div>
        <h2>Impossible de générer ton profil.</h2>
        <p>${esc(err.message)}<br>Vérifie notamment que la variable <strong>OPENAI_API_KEY</strong> est configurée dans Netlify.</p>
        <button class="primary" id="retryBtn">Réessayer <span class="arrow">→</span></button>
      </div>`;
    document.querySelector("#retryBtn").addEventListener("click", analyze);
  }
}

function renderResult() {
  const r = state.result;
  const strengths = (r.forces || []).map(x => `<li>${esc(x)}</li>`).join("");
  const ideas = (r.pistes || []).map((x,i) => `
    <div class="idea">
      <div class="idea-num">0${i+1}</div>
      <div>
        <div class="idea-title">${esc(x.titre)}</div>
        <div class="idea-desc">${esc(x.pourquoi)}</div>
      </div>
    </div>`).join("");
  const nextSteps = (r.plan_7_jours || []).slice(0,3).map((x,i) => `
    <div class="next-step"><span>Action ${i+1}</span>${esc(x)}</div>`).join("");

  app.innerHTML = `
    <div class="result-wrap">
      <div class="frame result-card">
        <div class="result-header">
          <div>
            <div class="result-kicker">Le fil rouge de ${esc(state.lead?.prenom || "ton profil")}</div>
            <h2 class="profile-name">${esc(r.profil || "Profil hybride")}</h2>
            <p class="profile-summary">${esc(r.synthese || "")}</p>
          </div>
          <div class="score"><strong>${esc(r.indice_clarte ?? 75)}</strong>/100</div>
        </div>

        <div class="grid">
          <section class="panel strengths">
            <h3>Ton avantage caché</h3>
            <ul class="clean">${strengths}</ul>
          </section>

          <section class="panel ideas">
            <h3>Pistes monétisables</h3>
            ${ideas}
          </section>

          <section class="panel recommend">
            <div class="tag">À tester en premier</div>
            <h3>${esc(r.recommandation?.titre || "")}</h3>
            <p>${esc(r.recommandation?.explication || "")}</p>
            <div class="next-steps">${nextSteps}</div>
          </section>
        </div>

        <div class="result-actions">
          <button class="primary" id="copyBtn">Copier mon résultat <span class="arrow">↗</span></button>
          <button class="secondary" id="restartBtn">Recommencer</button>
        </div>
      </div>
    </div>`;

  document.querySelector("#restartBtn").addEventListener("click", restart);
  document.querySelector("#copyBtn").addEventListener("click", async (e) => {
    const text = [
      `TON FIL ROUGE — ${r.profil}`,
      "",
      r.synthese,
      "",
      "Mes forces :",
      ...(r.forces || []).map(x => `- ${x}`),
      "",
      "Pistes :",
      ...(r.pistes || []).map(x => `- ${x.titre}: ${x.pourquoi}`),
      "",
      `À tester en premier : ${r.recommandation?.titre || ""}`,
      r.recommandation?.explication || ""
    ].join("\n");

    await navigator.clipboard.writeText(text);
    e.currentTarget.textContent = "Résultat copié ✓";
  });
}

document.querySelectorAll("[data-restart]").forEach(el => el.addEventListener("click", (e) => {
  e.preventDefault();
  restart();
}));

renderHome();

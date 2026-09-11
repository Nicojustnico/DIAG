
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


async function fetchJsonRobust(url, options = {}, { retries = 1, retryDelay = 900 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const raw = await res.text();

      let data = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          const err = new Error(
            res.ok
              ? "Réponse serveur invalide. Réessaie dans quelques secondes."
              : `Le serveur a répondu avec une erreur (${res.status}).`
          );
          err.status = res.status;
          err.raw = raw.slice(0, 300);
          throw err;
        }
      }

      if (!res.ok) {
        const message =
          data?.error ||
          data?.message ||
          `Le serveur a rencontré une erreur (${res.status}).`;
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      if (!data) {
        throw new Error("Le serveur n'a renvoyé aucune donnée. Réessaie dans quelques secondes.");
      }

      return data;
    } catch (err) {
      lastError = err;

      const status = err?.status;
      const retryable =
        !status ||
        status === 408 ||
        status === 425 ||
        status === 429 ||
        status >= 500;

      if (attempt < retries && retryable) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  throw lastError || new Error("Une erreur inattendue est survenue.");
}


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
  state = { step: -1, lead: { prenom: "", email: "", marketing_consent: false, lead_id: null }, answers: {}, result: null };
  renderHome();
}


function maskEmail(email=""){const [l,d]=String(email).split("@");if(!l||!d)return email;return `${l.slice(0,2)}***@${d}`;}

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
      <div class="lead-consent">En continuant, tu acceptes que ton prénom, ton e-mail et tes réponses soient enregistrés afin de générer et sauvegarder ton diagnostic et ton plan d'action.</div>
      <label class="marketing-optin">
        <input id="marketingConsent" type="checkbox" ${state.lead?.marketing_consent ? "checked" : ""}>
        <span>Je souhaite aussi recevoir les conseils, contenus et actualités de <strong>Nico.just.Nico</strong> par e-mail.</span>
      </label>
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
  next.addEventListener("click",async()=>{
    next.disabled=true;
    const originalLabel=next.innerHTML;
    next.innerHTML="Enregistrement…";
    try{
      const marketing=document.querySelector("#marketingConsent")?.checked || false;
      const params=new URLSearchParams(window.location.search);
      const payload={
        prenom:firstName.value.trim(),
        email:emailInput.value.trim().toLowerCase(),
        marketing_consent:marketing,
        referrer:document.referrer || "",
        utm_source:params.get("utm_source") || "",
        utm_medium:params.get("utm_medium") || "",
        utm_campaign:params.get("utm_campaign") || ""
      };

      const res=await fetch("/api/save-lead",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      const data=await res.json();
state.lead={...payload,lead_id:data.id};
      sessionStorage.setItem("filrouge_lead",JSON.stringify(state.lead));
      state.step=0;
      renderStep();
    }catch(err){
      alert(err.message);
      next.disabled=false;
      next.innerHTML=originalLabel;
    }
  });
}

function renderHome() {
  app.innerHTML = `
    <div class="frame hero">
      <div class="topline">Diagnostic guidé</div>
      <h1>Tu penses n'avoir <span class="acid">rien à vendre ?</span></h1>

      <div class="hero-sub">
        Potentiel · Opportunités · Revenus complémentaires
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
        Commencer mon diagnostic <span class="arrow">→</span>
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
    const data=await res.json();
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
    const data = await fetchJsonRobust("/api/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ answers: state.answers, lead: state.lead })
    }, { retries: 1, retryDelay: 1000 });
state.result = data;

    if(state.lead?.lead_id){
      try{
        const saveRes=await fetch("/api/complete-lead",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            lead_id:state.lead.lead_id,
            answers:state.answers,
            result:data
          })
        });
        if(!saveRes.ok){
          const saveData=await saveRes.json().catch(()=>({}));
          console.warn("Sauvegarde Supabase finale :", saveData.error || saveRes.status);
        }
      }catch(saveErr){
        console.warn("Sauvegarde Supabase finale non bloquante :", saveErr);
      }
    }
    renderResult();
  } catch (err) {
    app.innerHTML = `
      <div class="frame error">
        <div class="icon">↯</div>
        <h2>Impossible de générer ton profil.</h2>
        <p>${esc(err.message)}<br>Tes réponses sont conservées. La génération a rencontré un problème temporaire : tu peux réessayer dans quelques secondes.</p>
        <button class="primary" id="retryBtn">Réessayer <span class="arrow">→</span></button>
      </div>`;
    document.querySelector("#retryBtn").addEventListener("click", analyze);
  }
}


function downloadDiagnosticPdf() {
  const r = state.result || {};
  const lead = state.lead || {};
  const escPdf = (v="") => esc(v);
  const forces = (r.forces || []).map(x => `<li>${escPdf(x)}</li>`).join("");
  const pistes = (r.pistes || []).map((x,i) => `
    <div class="pdf-idea">
      <div class="pdf-num">0${i+1}</div>
      <div><h3>${escPdf(x?.titre || "")}</h3><p>${escPdf(x?.pourquoi || "")}</p></div>
    </div>`).join("");
  const plan = (r.plan_7_jours || []).map((x,i) => `
    <div class="pdf-action"><strong>JOUR ${i+1}</strong><span>${escPdf(x)}</span></div>`).join("");

  const report = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Diagnostic 01 - ${escPdf(lead.prenom || "Rapport")}</title>
<style>
@page{size:A4;margin:14mm}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.5}
.cover{min-height:255mm;background:#0b0b0b;color:#f5f3ec;padding:22mm 18mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always}
.kicker{color:#c9f917;font-size:10pt;font-weight:800;letter-spacing:2px}
.cover h1{font-size:42pt;line-height:.95;text-transform:uppercase;margin:20mm 0 5mm;letter-spacing:-1px}
.cover h1 span{color:#c9f917}
.cover p{max-width:125mm;color:#c8c8c1;font-size:14pt}
.meta{border-top:1px solid #333;padding-top:7mm;color:#aaa;font-size:9pt}
.page{padding:3mm 0}
.section{margin:0 0 11mm;break-inside:avoid}
.label{font-size:8.5pt;font-weight:900;letter-spacing:1.5px;color:#668000;text-transform:uppercase;margin-bottom:2mm}
h2{font-size:25pt;line-height:1.05;text-transform:uppercase;margin:0 0 4mm}
.summary{font-size:12pt;line-height:1.65;color:#333;max-width:170mm}
ul{padding-left:6mm}
li{margin-bottom:2.5mm}
.pdf-idea{display:grid;grid-template-columns:13mm 1fr;gap:3mm;border-top:1px solid #ddd;padding:4mm 0;break-inside:avoid}
.pdf-num{font-weight:900;color:#668000}
.pdf-idea h3{font-size:14pt;margin:0 0 1mm}.pdf-idea p{margin:0;color:#444}
.reco{background:#c9f917;padding:7mm;border-radius:5mm;break-inside:avoid}
.reco h3{font-size:19pt;margin:1mm 0 2mm;text-transform:uppercase}.reco p{margin:0}
.pdf-action{display:grid;grid-template-columns:25mm 1fr;gap:4mm;padding:4mm 0;border-bottom:1px solid #ddd;break-inside:avoid}
.pdf-action strong{font-size:9pt;color:#668000}
.cta{margin-top:12mm;background:#0b0b0b;color:#f5f3ec;padding:9mm;border-radius:5mm;break-inside:avoid}
.cta h2{color:#fff}.cta h2 span{color:#c9f917}.cta p{color:#c8c8c1}
.cta .handle{color:#c9f917;font-weight:800}
.footer{margin-top:10mm;font-size:8.5pt;color:#777}
@media print{.no-print{display:none!important}}
</style></head><body>
<section class="cover">
 <div>
  <div class="kicker">DIAGNOSTIC / 01</div>
  <h1>${escPdf(lead.prenom || "")},<br>tu ne pars pas de <span>zéro.</span></h1>
  <p>Potentiel · Opportunités · Revenus complémentaires</p>
 </div>
 <div class="meta">Rapport personnalisé - Nico.just.Nico</div>
</section>
<main class="page">
 <section class="section">
  <div class="label">Ton profil</div>
  <h2>${escPdf(r.profil || "Profil hybride")}</h2>
  <div class="summary">${escPdf(r.synthese || "")}</div>
 </section>
 <section class="section">
  <div class="label">Tes forces</div>
  <ul>${forces}</ul>
 </section>
 <section class="section">
  <div class="label">Tes opportunités</div>
  ${pistes}
 </section>
 <section class="section reco">
  <div style="font-size:8.5pt;font-weight:900;letter-spacing:1.3px">À TESTER EN PREMIER</div>
  <h3>${escPdf(r.recommandation?.titre || "")}</h3>
  <p>${escPdf(r.recommandation?.explication || "")}</p>
 </section>
 <section class="section" style="margin-top:10mm">
  <div class="label">Ton plan d'action - 7 jours</div>
  ${plan}
 </section>
 <section class="cta">
  <div class="label" style="color:#c9f917">Et maintenant ?</div>
  <h2>On passe du diagnostic à <span>l'action.</span></h2>
  <p>Grâce à ce diagnostic, je t'offre une session 1:1 pour t'aider à transformer ces pistes en premières actions concrètes et lancer la machine.</p>
  <p>Écris-moi <strong>« DIAGNOSTIC »</strong> sur Instagram : <span class="handle">@nico.just.nico</span></p>
 </section>
 <div class="footer">Diagnostic / 01 - Nico.just.Nico</div>
</main>
<script>
window.onload=()=>{setTimeout(()=>window.print(),250)}
</script></body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Ton navigateur bloque l'ouverture du rapport. Autorise les fenêtres pop-up puis réessaie.");
    return;
  }
  w.document.open();
  w.document.write(report);
  w.document.close();
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
            <div class="result-kicker">Diagnostic / 01 — ${esc(state.lead?.prenom || "ton profil")}</div>
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
          <button class="primary pdf-download" id="pdfBtn">Télécharger mon diagnostic PDF <span class="arrow">↓</span></button>
          <button class="secondary" id="copyBtn">Copier mon résultat <span class="arrow">↗</span></button>
          <section class="result-cta">
          <div class="result-cta-kicker">ET MAINTENANT ?</div>
          <h2>ON PASSE DU DIAGNOSTIC À <span>L'ACTION.</span></h2>
          <p>Grâce à ce diagnostic, je t'offre une <strong>session 1:1</strong> pour t'aider à transformer ce qui ressort ici en premières actions concrètes, choisir par quoi commencer et lancer la machine.</p>
          <p class="result-cta-note">Écris-moi simplement <strong>« DIAGNOSTIC »</strong> sur Instagram pour qu'on regarde ensemble la suite.</p>
          <a class="result-cta-button" href="https://www.instagram.com/nico.just.nico/" target="_blank" rel="noopener noreferrer">RÉSERVER MA SESSION 1:1 OFFERTE <span>→</span></a>
          <div class="result-cta-handle">@nico.just.nico</div>
        </section>
        <button class="secondary" id="restartBtn">Recommencer</button>
        </div>
      </div>
    </div>`;

  document.querySelector("#restartBtn").addEventListener("click", restart);
  document.querySelector("#pdfBtn").addEventListener("click", downloadDiagnosticPdf);
  document.querySelector("#copyBtn").addEventListener("click", async (e) => {
    const text = [
      `DIAGNOSTIC / 01 — ${r.profil}`,
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

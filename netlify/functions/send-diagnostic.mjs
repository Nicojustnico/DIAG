
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}})}
function esc(v=""){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function validEmail(v=""){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim())}

export default async(req)=>{
 if(req.method!=="POST") return json({error:"Méthode non autorisée."},405);
 const apiKey=process.env.RESEND_API_KEY;
 if(!apiKey) return json({error:"Configuration e-mail incomplète."},500);
 let b;try{b=await req.json()}catch{return json({error:"Requête invalide."},400)}
 const prenom=String(b?.prenom||"").trim().slice(0,60);
 const email=String(b?.email||"").trim().toLowerCase().slice(0,254);
 const r=b?.result||{};
 if(!prenom||!validEmail(email)) return json({error:"Prénom ou adresse e-mail invalide."},400);

 const from=process.env.RESEND_FROM_EMAIL||"Diagnostic 01 <onboarding@resend.dev>";
 const items=(r.forces||[]).map(x=>`<li style="margin-bottom:8px">${esc(x)}</li>`).join("");
 const pistes=(r.pistes||[]).map((x,i)=>`<div style="padding:12px 0;border-bottom:1px solid #2d2d2d"><b>0${i+1} — ${esc(x?.titre||"")}</b><div style="color:#b8b8b2;margin-top:4px">${esc(x?.pourquoi||"")}</div></div>`).join("");
 const plan=(r.plan_7_jours||[]).map(x=>`<li style="margin-bottom:9px">${esc(x)}</li>`).join("");

 const html=`<!doctype html><html><body style="margin:0;background:#0b0b0b;font-family:Arial,sans-serif;color:#f4f1e9">
 <div style="max-width:680px;margin:auto;padding:28px 18px">
  <div style="color:#c9f917;font-size:12px;font-weight:800;letter-spacing:2px;margin-bottom:20px">DIAGNOSTIC / 01</div>
  <div style="background:#141414;border:1px solid #292929;border-radius:22px;padding:30px">
   <h1 style="font-size:40px;line-height:1;margin:0 0 16px;text-transform:uppercase">${esc(prenom)}, tu ne pars pas de <span style="color:#c9f917">zéro.</span></h1>
   <p style="color:#c8c8c1;line-height:1.6">Voici ton diagnostic personnalisé et ton plan d'action.</p>
   <div style="color:#c9f917;font-size:11px;font-weight:800;letter-spacing:1.5px;margin-top:28px">TON PROFIL</div>
   <h2>${esc(r.profil||"")}</h2>
   <p style="color:#c8c8c1;line-height:1.6">${esc(r.synthese||"")}</p>
   <div style="color:#c9f917;font-size:11px;font-weight:800;letter-spacing:1.5px;margin-top:28px">TES FORCES</div>
   <ul style="line-height:1.5">${items}</ul>
   <div style="color:#c9f917;font-size:11px;font-weight:800;letter-spacing:1.5px;margin-top:28px">TES OPPORTUNITÉS</div>
   <div>${pistes}</div>
   <div style="background:#c9f917;color:#0b0b0b;border-radius:18px;padding:20px;margin-top:28px">
    <div style="font-size:10px;font-weight:900;letter-spacing:1.4px">À TESTER EN PREMIER</div>
    <h3>${esc(r.recommandation?.titre||"")}</h3>
    <p style="line-height:1.55">${esc(r.recommandation?.explication||"")}</p>
   </div>
   <div style="color:#c9f917;font-size:11px;font-weight:800;letter-spacing:1.5px;margin-top:28px">TON PLAN D'ACTION — 7 JOURS</div>
   <ol style="line-height:1.6">${plan}</ol>
   <div style="border-top:1px solid #2d2d2d;margin-top:30px;padding-top:26px">
    <h2 style="text-transform:uppercase">On passe du diagnostic à <span style="color:#c9f917">l'action.</span></h2>
    <p style="color:#c8c8c1;line-height:1.6">Grâce à ce diagnostic, je t'offre une session 1:1 pour t'aider à mettre en place concrètement les premières actions et lancer la machine.</p>
    <p>Écris-moi simplement <b style="color:#c9f917">« DIAGNOSTIC »</b> sur Instagram.</p>
    <a href="https://www.instagram.com/nico.just.nico/" style="display:block;text-align:center;background:#c9f917;color:#0b0b0b;text-decoration:none;font-weight:900;padding:16px;border-radius:999px">ÉCHANGER AVEC NICO →</a>
   </div>
  </div>
 </div></body></html>`;

 try{
  const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:`${prenom}, ton Diagnostic / 01 est prêt`,html})});
  const raw=await resp.text();let data={};try{data=raw?JSON.parse(raw):{}}catch{}
  if(!resp.ok) return json({error:data?.message||"L'e-mail n'a pas pu être envoyé.",resend_status:resp.status},502);
  return json({ok:true,id:data?.id||null});
 }catch(e){return json({error:"Impossible de contacter le service d'e-mail."},500)}
};
export const config={path:"/api/send-diagnostic"};

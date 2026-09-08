
function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}});
}
export default async(req)=>{
  if(req.method!=="POST") return json({error:"Méthode non autorisée."},405);
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
  if(!url||!key) return json({error:"Supabase n'est pas configuré."},500);
  let b; try{ b=await req.json(); } catch{ return json({error:"Requête invalide."},400); }
  const id=String(b.lead_id||"").trim();
  if(!id) return json({error:"Lead ID manquant."},400);
  const r=b.result||{}, a=b.answers||{};
  const patch={
    status:"completed",
    completed_at:new Date().toISOString(),
    answers:a,
    profil:r.profil||null,
    synthese:r.synthese||null,
    indice_clarte:r.indice_clarte??null,
    forces:r.forces||[],
    pistes:r.pistes||[],
    recommandation:r.recommandation||{},
    plan_7_jours:r.plan_7_jours||[]
  };
  const resp=await fetch(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`,{
    method:"PATCH",
    headers:{"apikey":key,"Authorization":`Bearer ${key}`,"Content-Type":"application/json","Prefer":"return=minimal"},
    body:JSON.stringify(patch)
  });
  if(!resp.ok){const t=await resp.text();return json({error:t||"Erreur de sauvegarde finale."},502);}
  return json({ok:true});
};
export const config={path:"/api/complete-lead"};

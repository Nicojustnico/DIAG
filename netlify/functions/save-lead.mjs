
function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}});
}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);}
export default async(req)=>{
  if(req.method!=="POST") return json({error:"Méthode non autorisée."},405);
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!url||!key) return json({error:"Supabase n'est pas configuré dans Netlify."},500);

  let b; try{b=await req.json()}catch{return json({error:"Requête invalide."},400)}
  const prenom=String(b.prenom||"").trim().slice(0,60);
  const email=String(b.email||"").trim().toLowerCase().slice(0,254);
  if(prenom.length<2||!validEmail(email)) return json({error:"Prénom ou e-mail invalide."},400);

  const row={
    prenom,email,
    marketing_consent:Boolean(b.marketing_consent),
    marketing_consent_at:b.marketing_consent?new Date().toISOString():null,
    referrer:String(b.referrer||"").slice(0,500),
    utm_source:String(b.utm_source||"").slice(0,120),
    utm_medium:String(b.utm_medium||"").slice(0,120),
    utm_campaign:String(b.utm_campaign||"").slice(0,120),
    status:"started"
  };

  const r=await fetch(`${url}/rest/v1/leads`,{
    method:"POST",
    headers:{
      "apikey":key,
      "Authorization":`Bearer ${key}`,
      "Content-Type":"application/json",
      "Prefer":"return=representation"
    },
    body:JSON.stringify(row)
  });
  const text=await r.text();
  let data={}; try{data=JSON.parse(text)}catch{}
  if(!r.ok) return json({error:data?.message||text||"Erreur Supabase."},502);
  return json({id:data?.[0]?.id});
};
export const config={path:"/api/save-lead"};

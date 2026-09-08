const schema={type:"object",additionalProperties:false,properties:{message:{type:"string"},question:{type:"string"},options:{type:"array",maxItems:5,items:{type:"string"}},suggestedAnswer:{type:"string"}},required:["message","question","options","suggestedAnswer"]};
export default async(req)=>{
 if(req.method!=="POST")return Response.json({error:"Méthode non autorisée."},{status:405});
 if(!process.env.OPENAI_API_KEY)return Response.json({error:"OPENAI_API_KEY n'est pas configurée."},{status:500});
 let b;try{b=await req.json()}catch{return Response.json({error:"Requête invalide."},{status:400})}
 const name=String(b?.lead?.prenom||"").slice(0,60), mode=b?.mode||"stuck";
 const instructions=`Tu es le coach conversationnel de Ton Fil Rouge. Tu aides ${name||"la personne"} à répondre à UNE question d'introspection sans inventer à sa place.
Question: ${b?.step?.question||""}
Réponse actuelle: ${b?.currentAnswer||"(aucune)"}
Réponse au coup de pouce: ${b?.followupAnswer||"(aucune)"}
Contexte précédent: ${JSON.stringify(b?.previousAnswers||{})}
Mode=${mode}.
Si stuck: reformule plus simplement, puis pose UNE question concrète et donne 3 à 5 options variées et non orientées.
Si deepen: pars de ce qui est écrit, pose UNE question précise pour faire émerger un exemple, une preuve ou un motif; donne 2 à 4 angles possibles.
Si synthesize: reformule uniquement ce que la personne a réellement dit en une réponse naturelle directement copiable; n'invente rien; options=[].
Pour stuck/deepen suggestedAnswer="". Réponds en français, direct, humain, bref.`;
 try{
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5-mini",store:false,instructions,input:"Réponds maintenant.",text:{format:{type:"json_schema",name:"coach_reply",strict:true,schema}}})});
  const x=await r.json();if(!r.ok)return Response.json({error:x?.error?.message||"Erreur IA."},{status:502});
  const txt=x.output_text||x.output?.flatMap(i=>i.content||[]).find(c=>c.type==="output_text")?.text;
  return Response.json(JSON.parse(txt));
 }catch(e){return Response.json({error:"Impossible de contacter le coach."},{status:500})}
};
export const config={path:"/api/coach"};
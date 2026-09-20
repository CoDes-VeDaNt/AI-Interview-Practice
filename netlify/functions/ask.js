exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405,{error:"Method not allowed"});
  try {
    const {question=""}=JSON.parse(event.body||"{}");
    if(!question.trim()) return json(400,{error:"Question is required."});
    const url=process.env.AI_API_URL,key=process.env.AI_API_KEY,model=process.env.AI_MODEL;
    if(!url||!key||!model) throw new Error("AI backend is not configured. Add AI_API_URL, AI_API_KEY and AI_MODEL in Netlify.");
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"system",content:"You are an interview practice assistant. Answer clearly. For coding questions explain the solution and provide code when useful. Return readable HTML using h3,p,ul,ol,li,pre,code,strong,br."},{role:"user",content:question}],temperature:.3})});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error?.message||d.error||`AI provider returned ${r.status}`);
    return json(200,{answer:d.choices?.[0]?.message?.content||d.output_text||"No answer returned."});
  } catch(e){console.error(e);return json(500,{error:e.message||"AI request failed."});}
};
function json(statusCode,body){return {statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)}}

exports.handler = async (event) => {
  if(event.httpMethod!=="POST") return json(405,{error:"Method not allowed"});
  try {
    const {image=""}=JSON.parse(event.body||"{}");
    if(!image.startsWith("data:image/")) return json(400,{error:"A valid image is required."});
    const url=process.env.AI_VISION_API_URL||process.env.AI_API_URL,key=process.env.AI_API_KEY,model=process.env.AI_VISION_MODEL||process.env.AI_MODEL;
    if(!url||!key||!model) throw new Error("AI vision is not configured. Add AI_VISION_API_URL/AI_VISION_MODEL or compatible AI settings in Netlify.");
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"system",content:"Analyze interview questions or code screenshots. Give the answer and a concise explanation. Return readable HTML using h3,p,ul,ol,li,pre,code,strong,br."},{role:"user",content:[{type:"text",text:"Analyze this interview question or code screenshot and answer it."},{type:"image_url",image_url:{url:image}}]}],temperature:.2})});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error?.message||d.error||`AI provider returned ${r.status}`);
    return json(200,{answer:d.choices?.[0]?.message?.content||d.output_text||"No answer returned."});
  } catch(e){console.error(e);return json(500,{error:e.message||"Image analysis failed."});}
};
function json(statusCode,body){return {statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)}}

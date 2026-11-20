/**
 * Optional Discord user lookup server.
 * Keeps the bot token PRIVATE and allows any user ID, not just Lanyard users.
 * Start with: npm install && DISCORD_BOT_TOKEN=your_token npm start
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app=express();
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||3000);
const token=process.env.DISCORD_BOT_TOKEN||'';
const cache=new Map();

app.disable('x-powered-by');
app.get('/api/discord/:id',async(req,res)=>{
  const id=req.params.id;
  if(!/^\d{17,22}$/.test(id)) return res.status(400).json({error:'Invalid Discord user ID'});
  if(!token) return res.status(503).json({error:'Discord backend not configured; browser will use Lanyard'});
  const hit=cache.get(id);
  if(hit&&hit.expires>Date.now()) return res.json(hit.value);
  try {
    const upstream=await fetch(`https://discord.com/api/v10/users/${id}`,{
      headers:{Authorization:`Bot ${token}`},signal:AbortSignal.timeout(7000)
    });
    if(!upstream.ok) return res.status(upstream.status===404?404:502).json({error:'Discord user lookup failed'});
    const data=await upstream.json();
    const value={id:data.id,username:data.username,global_name:data.global_name,avatar:data.avatar};
    cache.set(id,{expires:Date.now()+10*60*1000,value});
    if(cache.size>200)cache.delete(cache.keys().next().value);
    return res.json(value);
  }catch(err){return res.status(502).json({error:'Discord is unavailable'});}
});
app.use(express.static(root,{extensions:['html'],index:['index.html']}));
app.listen(port,()=>console.log(`REJECT'S WORLD at http://localhost:${port}`));

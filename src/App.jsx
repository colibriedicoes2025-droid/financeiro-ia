import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#07080f", surface:"#0e1120", card:"#131626", border:"rgba(255,255,255,0.07)",
  text:"#f0f2ff", muted:"#8892b0", faint:"#2a2f4a",
  green:"#00d68f", red:"#ff4757", yellow:"#ffd32a", blue:"#4a9eff", purple:"#7c5cfc",
};

const CATS = {
  moradia:{l:"Moradia",ic:"🏠",c:"#5B8DEF"},alimentacao:{l:"Alimentação",ic:"🍔",c:"#FF9F43"},
  transporte:{l:"Transporte",ic:"🚗",c:"#00d68f"},saude:{l:"Saúde",ic:"💊",c:"#FF6B9D"},
  lazer:{l:"Lazer",ic:"🎮",c:"#A29BFE"},educacao:{l:"Educação",ic:"📚",c:"#74B9FF"},
  vestuario:{l:"Vestuário",ic:"👗",c:"#FD79A8"},servicos:{l:"Serviços",ic:"⚙️",c:"#636E72"},
  cartao:{l:"Cartão",ic:"💳",c:"#E17055"},outros:{l:"Outros",ic:"📦",c:"#B2BEC3"},
  salario:{l:"Salário",ic:"💰",c:"#00d68f"},freelance:{l:"Freelance",ic:"💼",c:"#55EFC4"},
  investimento:{l:"Investimento",ic:"📈",c:"#74B9FF"},bonus:{l:"Bônus",ic:"🎁",c:"#A29BFE"},
};

const MF = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const WD = ["D","S","T","Q","Q","S","S"];

const INIT = [];

const INIT_GOALS = [
  {id:1,name:"Reserva de Emergência",target:0,current:0,icon:"🛡️",c:"#7c5cfc"},
  {id:2,name:"Viagem Europa",target:0,current:0,icon:"✈️",c:"#FF9F43"},
  {id:3,name:"Novo Notebook",target:0,current:0,icon:"💻",c:"#00d68f"},
];

const fmt = v => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const fmtK = v => Math.abs(v)>=1000?`R$${(v/1000).toFixed(1)}k`:fmt(v);
const dim = (y,m) => new Date(y,m+1,0).getDate();
const fd  = (y,m) => new Date(y,m,1).getDay();

function Pill({children,color,sz=10}){
  return <span style={{background:color+"25",color,padding:`2px ${sz}px`,borderRadius:99,fontSize:10,fontWeight:700,letterSpacing:.3}}>{children}</span>;
}
function Bar({value,max,color,h=5}){
  return(
    <div style={{background:C.faint,borderRadius:99,height:h,overflow:"hidden"}}>
      <div style={{width:`${Math.min(value/max*100,100)}%`,background:color,height:"100%",borderRadius:99,transition:"width .5s ease"}}/>
    </div>
  );
}
function Ico({icon,color,size=40}){
  return(
    <div style={{width:size,height:size,borderRadius:size*.28,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.45,flexShrink:0}}>{icon}</div>
  );
}

function Sheet({open,onClose,title,children}){
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.78)",backdropFilter:"blur(8px)"}} onClick={onClose}/>
      <div style={{position:"relative",background:C.surface,borderRadius:"24px 24px 0 0",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 -20px 60px rgba(0,0,0,.7)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
          <div style={{width:36,height:4,background:C.faint,borderRadius:99}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 20px 14px"}}>
          <span style={{fontSize:17,fontWeight:800,color:C.text}}>{title}</span>
          <button onClick={onClose} style={{background:C.faint,border:"none",color:C.muted,width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"0 20px 32px"}}>{children}</div>
      </div>
    </div>
  );
}

function TxForm({onSave,onClose,def="expense"}){
  const [f,setF]=useState({type:def,name:"",value:"",date:new Date().toISOString().split("T")[0],category:def==="income"?"salario":"alimentacao",recurring:false,status:"pending"});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const iCats=["salario","freelance","investimento","bonus","outros"];
  const eCats=["moradia","alimentacao","transporte","saude","lazer","educacao","vestuario","servicos","cartao","outros"];
  const cats=f.type==="income"?iCats:eCats;
  const inp={width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",color:C.text,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,background:C.card,padding:4,borderRadius:14}}>
        {[["income","💰 Receita"],["expense","💸 Despesa"]].map(([t,l])=>(
          <button key={t} onClick={()=>s("type",t)} style={{padding:"10px",borderRadius:12,border:"none",background:f.type===t?(t==="income"?C.green+"22":C.red+"22"):"transparent",color:f.type===t?(t==="income"?C.green:C.red):C.muted,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>
      <input style={inp} placeholder="Nome da transação" value={f.name} onChange={e=>s("name",e.target.value)}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <input style={inp} type="number" placeholder="Valor R$" value={f.value} onChange={e=>s("value",e.target.value)}/>
        <input style={{...inp,colorScheme:"dark"}} type="date" value={f.date} onChange={e=>s("date",e.target.value)}/>
      </div>
      <div>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>Categoria</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>s("category",c)} style={{padding:"7px 12px",borderRadius:99,border:`1.5px solid ${f.category===c?CATS[c].c:C.border}`,background:f.category===c?CATS[c].c+"22":"transparent",color:f.category===c?CATS[c].c:C.muted,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
              {CATS[c].ic} {CATS[c].l}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:C.card,borderRadius:12}}>
        <span style={{fontSize:14,color:C.muted}}>Recorrente</span>
        <div onClick={()=>s("recurring",!f.recurring)} style={{width:44,height:24,borderRadius:12,background:f.recurring?C.purple:C.faint,cursor:"pointer",position:"relative",transition:"background .2s"}}>
          <div style={{width:18,height:18,background:"#fff",borderRadius:"50%",position:"absolute",top:3,left:f.recurring?23:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {["pending","paid"].map(st=>(
          <button key={st} onClick={()=>s("status",st)} style={{padding:"10px",borderRadius:12,border:`1.5px solid ${f.status===st?(st==="paid"?C.green:C.yellow):C.border}`,background:f.status===st?(st==="paid"?C.green+"22":C.yellow+"22"):"transparent",color:f.status===st?(st==="paid"?C.green:C.yellow):C.muted,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>
            {st==="paid"?"✓ Pago":"⏳ Pendente"}
          </button>
        ))}
      </div>
      <button onClick={()=>{if(!f.name||!f.value)return;onSave({...f,value:parseFloat(f.value),id:Date.now()});onClose();}} style={{padding:"15px",background:`linear-gradient(135deg,${C.purple},#a78bfa)`,border:"none",borderRadius:14,color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 20px ${C.purple}44`}}>
        Salvar Transação
      </button>
    </div>
  );
}

function AIChat({txs}){
  const ti=txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.value,0);
  const te=txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.value,0);
  const b=ti-te;
  const sr=ti>0?((b/ti)*100).toFixed(1):0;
  const ctx=`Dados Abril 2025: Receita=${fmt(ti)}, Despesas=${fmt(te)}, Saldo=${fmt(b)}, Poupança=${sr}%. Transações: ${JSON.stringify(txs.map(t=>({tipo:t.type==="income"?"receita":"despesa",nome:t.name,valor:t.value,cat:CATS[t.category]?.l,status:t.status})))}`;
  const [msgs,setMsgs]=useState([{r:"a",t:"Olá! 👋 Sou sua IA financeira. Analiso seus gastos, faço previsões e sugiro melhorias. O que deseja saber?"}]);
  const [inp,setInp]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);
  const quick=["Analise meus gastos","Como economizar?","Previsão do mês","Onde gastar menos?"];
  const send=async()=>{
    if(!inp.trim()||loading)return;
    const q=inp.trim();setInp("");
    setMsgs(p=>[...p,{r:"u",t:q}]);setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{
          "Content-Type":"application/json",
          "x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-dangerous-direct-browser-access":"true"
        },
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,
          system:`Consultor financeiro pessoal inteligente. Responda em português, conciso (máx 3 parágrafos), prático e encorajador. Use emojis com moderação. Dados: ${ctx}`,
          messages:[{role:"user",content:q}]})
      });
      const d=await res.json();
      setMsgs(p=>[...p,{r:"a",t:d.content?.[0]?.text||"Erro ao processar."}]);
    }catch{setMsgs(p=>[...p,{r:"a",t:"Erro de conexão."}]);}
    setLoading(false);
  };
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  return(
    <div style={{display:"flex",flexDirection:"column",height:"58vh"}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.r==="u"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.r==="u"?`linear-gradient(135deg,${C.purple},#a78bfa)`:C.card,color:C.text,fontSize:14,lineHeight:1.55,whiteSpace:"pre-wrap"}}>
              {m.r==="a"&&<span style={{marginRight:5}}>🤖</span>}{m.t}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:5,padding:"10px 14px",background:C.card,borderRadius:"16px 16px 16px 4px",width:"fit-content"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,background:C.purple,borderRadius:"50%",animation:"bounce 1.2s infinite",animationDelay:`${i*.2}s`}}/>)}</div>}
        <div ref={endRef}/>
      </div>
      {msgs.length===1&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{quick.map(q=><button key={q} onClick={()=>setInp(q)} style={{padding:"7px 12px",background:C.purple+"18",border:`1px solid ${C.purple}44`,borderRadius:99,color:"#a78bfa",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>)}</div>}
      <div style={{display:"flex",gap:8}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Pergunte sobre suas finanças…" style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"}}/>
        <button onClick={send} disabled={loading} style={{width:44,height:44,background:`linear-gradient(135deg,${C.purple},#a78bfa)`,border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>➤</button>
      </div>
    </div>
  );
}

function CalView({txs,year,month}){
  const [sel,setSel]=useState(null);
  const days=dim(year,month);
  const first=fd(year,month);
  const byDay={};
  txs.forEach(t=>{
    const [y,m,d]=t.date.split("-").map(Number);
    if(m-1===month&&y===year){if(!byDay[d])byDay[d]=[];byDay[d].push(t);}
  });
  const today=new Date();
  const isT=d=>d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
  const cells=[];
  for(let i=0;i<first;i++)cells.push(null);
  for(let d=1;d<=days;d++)cells.push(d);
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6}}>
        {WD.map((w,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:C.muted,fontWeight:700,padding:"4px 0",letterSpacing:.8}}>{w}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d)return<div key={i}/>;
          const dTx=byDay[d]||[];
          const isSel=sel===d;
          return(
            <div key={i} onClick={()=>setSel(isSel?null:d)} style={{borderRadius:10,background:isSel?C.purple+"33":isT(d)?C.purple+"15":C.card,border:`1px solid ${isSel?C.purple:isT(d)?C.purple+"55":C.border}`,padding:"6px 2px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",minHeight:50,transition:"all .15s"}}>
              <span style={{fontSize:12,fontWeight:isT(d)?800:500,color:isT(d)?C.purple:C.text}}>{d}</span>
              <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>
                {dTx.some(t=>t.type==="income")&&<div style={{width:5,height:5,background:C.green,borderRadius:"50%"}}/>}
                {dTx.some(t=>t.type==="expense")&&<div style={{width:5,height:5,background:C.red,borderRadius:"50%"}}/>}
                {dTx.some(t=>t.status==="pending")&&<div style={{width:5,height:5,background:C.yellow,borderRadius:"50%"}}/>}
              </div>
            </div>
          );
        })}
      </div>
      {sel&&byDay[sel]&&(
        <div style={{marginTop:14,background:C.surface,borderRadius:16,padding:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,color:C.muted,fontWeight:700,marginBottom:10,letterSpacing:.5}}>{sel} DE {MF[month].toUpperCase()}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {byDay[sel].map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.card,borderRadius:12,border:`1px solid ${C.border}`}}>
                <Ico icon={CATS[t.category]?.ic} color={CATS[t.category]?.c} size={36}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{CATS[t.category]?.l}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:14,fontWeight:800,color:t.type==="income"?C.green:C.red}}>{t.type==="income"?"+":"-"}{fmtK(t.value)}</div>
                  <Pill color={t.status==="paid"?C.green:C.yellow}>{t.status==="paid"?"Pago":"Pend."}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [tab,setTab]=useState("home");
  const [txs,setTxs]=useState(INIT);
  const [calM,setCalM]=useState(3);
  const [calY,setCalY]=useState(2025);
  const [showAdd,setShowAdd]=useState(false);
  const [showAI,setShowAI]=useState(false);
  const [showDetail,setShowDetail]=useState(null);
  const [txF,setTxF]=useState("all");
  const [goals,setGoals]=useState(INIT_GOALS);
  const [editGoal,setEditGoal]=useState(null);
  const [showClear,setShowClear]=useState(false);

  const month=calM,year=calY;
  const mTxs=txs.filter(t=>{const d=new Date(t.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const pI=mTxs.filter(t=>t.type==="income"&&t.status==="paid").reduce((s,t)=>s+t.value,0);
  const pE=mTxs.filter(t=>t.type==="expense"&&t.status==="paid").reduce((s,t)=>s+t.value,0);
  const nI=mTxs.filter(t=>t.type==="income"&&t.status==="pending").reduce((s,t)=>s+t.value,0);
  const nE=mTxs.filter(t=>t.type==="expense"&&t.status==="pending").reduce((s,t)=>s+t.value,0);
  const tI=pI+nI,tE=pE+nE,bal=pI-pE,proj=tI-tE;
  const sr=tI>0?((bal/tI)*100).toFixed(0):0;
  const eCat={};mTxs.filter(t=>t.type==="expense").forEach(t=>{eCat[t.category]=(eCat[t.category]||0)+t.value;});
  const pend=mTxs.filter(t=>t.status==="pending"&&t.type==="expense").sort((a,b)=>new Date(a.date)-new Date(b.date));
  const filt=mTxs.filter(t=>{
    if(txF==="income")return t.type==="income";
    if(txF==="expense")return t.type==="expense";
    if(txF==="pending")return t.status==="pending";
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const toggle=id=>setTxs(p=>p.map(t=>t.id===id?{...t,status:t.status==="paid"?"pending":"paid"}:t));
  const saveGoal=(id,current,target)=>setGoals(p=>p.map(g=>g.id===id?{...g,current:parseFloat(current)||0,target:parseFloat(target)||0}:g));
  const clearAll=()=>{setTxs([]);setShowClear(false);};
  const del=id=>{setTxs(p=>p.filter(t=>t.id!==id));setShowDetail(null);};
  const add=t=>setTxs(p=>[...p,t]);
  const prev=()=>{const d=new Date(calY,calM-1);setCalM(d.getMonth());setCalY(d.getFullYear());};
  const next=()=>{const d=new Date(calY,calM+1);setCalM(d.getMonth());setCalY(d.getFullYear());};

  const ins=[];
  if(sr<10)ins.push({ic:"⚠️",t:`Taxa de poupança em ${sr}%. O ideal é acima de 20%.`,c:C.red});
  else if(sr>=20)ins.push({ic:"🎯",t:`Ótimo! Você está poupando ${sr}% da renda este mês.`,c:C.green});
  if(pend.length>0)ins.push({ic:"🔔",t:`${pend.length} conta(s) pendente(s): ${fmt(nE)}`,c:C.yellow});
  const tc=Object.entries(eCat).sort((a,b)=>b[1]-a[1])[0];
  if(tc)ins.push({ic:"📊",t:`Maior gasto: ${CATS[tc[0]]?.l} (${fmt(tc[1])})`,c:C.blue});

  const TABS=[{id:"home",ic:"⚡",l:"Início"},{id:"cal",ic:"📅",l:"Calendário"},{id:"txs",ic:"💸",l:"Transações"},{id:"goals",ic:"🎯",l:"Metas"},{id:"reports",ic:"📊",l:"Relatórios"}];

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",color:C.text,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:0;height:0;}
        input::placeholder{color:#3a3f5c;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.4);}
        select{appearance:none;}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>

      {/* HEADER */}
      <div style={{background:C.surface,padding:"14px 18px 12px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:`linear-gradient(135deg,${C.purple},#a78bfa)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,boxShadow:`0 4px 12px ${C.purple}55`}}>₿</div>
            <div>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:-.5}}>FinanceAI</div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:1.8,textTransform:"uppercase"}}>Gestão Financeira</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setShowAI(true)} style={{padding:"7px 12px",background:C.purple+"20",border:`1px solid ${C.purple}44`,borderRadius:99,color:"#c4b5fd",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
              🤖 IA <div style={{width:5,height:5,background:C.green,borderRadius:"50%",animation:"pulse 2s infinite"}}/>
            </button>
            <button onClick={()=>setShowClear(true)} style={{width:36,height:36,background:C.red+"20",border:`1px solid ${C.red}44`,borderRadius:10,color:C.red,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
            <button onClick={()=>setShowAdd(true)} style={{width:36,height:36,background:`linear-gradient(135deg,${C.purple},#a78bfa)`,border:"none",borderRadius:10,color:"#fff",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 14px ${C.purple}44`,fontWeight:300}}>+</button>
          </div>
        </div>
      </div>

      {/* SCROLL AREA */}
      <div style={{flex:1,overflowY:"auto"}}>

        {/* ── HOME ── */}
        {tab==="home"&&(
          <div style={{animation:"fadeUp .3s ease",paddingBottom:16}}>
            {/* Hero card */}
            <div style={{margin:"14px 14px 0",background:"linear-gradient(135deg,#160f3a,#0f0a28)",borderRadius:22,padding:"22px 20px",border:`1px solid ${C.purple}33`,position:"relative",overflow:"hidden",boxShadow:`0 12px 40px rgba(124,92,252,.18)`}}>
              <div style={{position:"absolute",top:-50,right:-50,width:160,height:160,background:`radial-gradient(circle,${C.purple}28,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",bottom:-30,left:-20,width:120,height:120,background:`radial-gradient(circle,${C.blue}18,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{fontSize:11,color:"#9b8fc8",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Saldo Disponível</div>
              <div style={{fontSize:40,fontWeight:800,color:bal>=0?C.green:C.red,letterSpacing:-2,marginBottom:3,lineHeight:1}}>{fmtK(bal)}</div>
              <div style={{fontSize:12,color:"#6b5fa8",marginBottom:16}}>{MF[calM]} {calY}</div>
              {/* month nav inline */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <button onClick={prev} style={{width:28,height:28,background:"rgba(255,255,255,.08)",border:"none",borderRadius:7,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>‹</button>
                <span style={{fontSize:12,fontWeight:700,color:C.muted,flex:1,textAlign:"center"}}>{MS.map((m,i)=><span key={m} style={{marginRight:8,color:i===calM?"#c4b5fd":C.faint,fontWeight:i===calM?800:400,cursor:"pointer",fontSize:i===calM?13:11,transition:"all .2s"}} onClick={e=>{e.stopPropagation();setCalM(i);}}>{m}</span>)}</span>
                <button onClick={next} style={{width:28,height:28,background:"rgba(255,255,255,.08)",border:"none",borderRadius:7,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>›</button>
              </div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,background:"rgba(0,214,143,.1)",border:"1px solid rgba(0,214,143,.2)",borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:.8,marginBottom:2}}>RECEITAS</div>
                  <div style={{fontSize:15,fontWeight:800,color:C.green}}>{fmtK(tI)}</div>
                </div>
                <div style={{flex:1,background:"rgba(255,71,87,.1)",border:"1px solid rgba(255,71,87,.2)",borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:.8,marginBottom:2}}>DESPESAS</div>
                  <div style={{fontSize:15,fontWeight:800,color:C.red}}>{fmtK(tE)}</div>
                </div>
                <div style={{flex:1,background:`${C.purple}18`,border:`1px solid ${C.purple}33`,borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:"#c4b5fd",fontWeight:700,letterSpacing:.8,marginBottom:2}}>POUPANÇA</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#c4b5fd"}}>{sr}%</div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"10px 14px 0"}}>
              {[{l:"Projeção",v:proj,c:proj>=0?C.green:C.red,ic:"🔮"},{l:"Pendente",v:nE,c:C.yellow,ic:"⏳"},{l:"A receber",v:nI,c:C.blue,ic:"💫"}].map(s=>(
                <div key={s.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 10px",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{s.ic}</div>
                  <div style={{fontSize:13,fontWeight:800,color:s.c,letterSpacing:-.2}}>{fmtK(s.v)}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2,fontWeight:600,letterSpacing:.4}}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Weekly bars */}
            <div style={{margin:"10px 14px 0",background:C.card,borderRadius:18,padding:"14px 14px 10px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.6,marginBottom:12,textTransform:"uppercase"}}>Fluxo Semanal</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:56}}>
                {["D","S","T","Q","Q","S","S"].map((d,i)=>{
                  const iv=[3200,4100,2800,5200,3900,4600,3100];
                  const ev=[2100,3200,1900,3800,2700,3400,2200];
                  const mx=5500;
                  return(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{display:"flex",gap:2,alignItems:"flex-end",height:52}}>
                        <div style={{width:"45%",height:(iv[i]/mx)*50,background:`${C.green}aa`,borderRadius:"3px 3px 0 0"}}/>
                        <div style={{width:"45%",height:(ev[i]/mx)*50,background:`${C.red}aa`,borderRadius:"3px 3px 0 0"}}/>
                      </div>
                      <span style={{fontSize:9,color:C.muted}}>{d}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:14,marginTop:6}}>
                {[[C.green,"Receitas"],[C.red,"Despesas"]].map(([c,l])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,background:c,borderRadius:2}}/><span style={{fontSize:10,color:C.muted}}>{l}</span></div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            {Object.keys(eCat).length>0&&(
              <div style={{margin:"10px 14px 0",background:C.card,borderRadius:18,padding:"14px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.6,marginBottom:12,textTransform:"uppercase"}}>Por Categoria</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {Object.entries(eCat).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([cat,val])=>(
                    <div key={cat}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>{CATS[cat]?.ic}</span><span style={{fontSize:13,color:C.text,fontWeight:600}}>{CATS[cat]?.l}</span></div>
                        <span style={{fontSize:13,color:C.text,fontWeight:700}}>{fmt(val)}</span>
                      </div>
                      <Bar value={val} max={tE} color={CATS[cat]?.c||C.muted}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {ins.length>0&&(
              <div style={{margin:"10px 14px 0"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.6,marginBottom:10,textTransform:"uppercase"}}>Insights da IA</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {ins.map((x,i)=>(
                    <div key={i} style={{display:"flex",gap:12,padding:"13px 14px",background:x.c+"0e",border:`1px solid ${x.c}25`,borderRadius:14}}>
                      <span style={{fontSize:20,flexShrink:0}}>{x.ic}</span>
                      <div style={{flex:1}}>
                        <p style={{margin:0,fontSize:13,color:C.text,lineHeight:1.45}}>{x.t}</p>
                        <button onClick={()=>setShowAI(true)} style={{background:"none",border:"none",color:C.purple,fontSize:12,cursor:"pointer",padding:"4px 0 0",fontFamily:"inherit",fontWeight:700}}>Ver análise completa →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending */}
            {pend.length>0&&(
              <div style={{margin:"10px 14px 0"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.6,marginBottom:10,textTransform:"uppercase"}}>Próximos Vencimentos</div>
                <div style={{background:C.card,borderRadius:18,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                  {pend.slice(0,4).map((t,i)=>{
                    const dl=Math.ceil((new Date(t.date)-new Date())/(864e5));
                    return(
                      <div key={t.id} onClick={()=>setShowDetail(t)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:i<Math.min(pend.length,4)-1?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
                        <Ico icon={CATS[t.category]?.ic} color={CATS[t.category]?.c} size={38}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                          <div style={{fontSize:11,color:C.muted}}>{t.date.split("-").reverse().join("/")}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                          <div style={{fontSize:14,fontWeight:800,color:C.red}}>{fmt(t.value)}</div>
                          <Pill color={dl<=3?C.red:C.yellow}>{dl<=0?"Vencido":`${dl}d`}</Pill>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent */}
            <div style={{margin:"10px 14px 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.6,textTransform:"uppercase"}}>Recentes</div>
                <button onClick={()=>setTab("txs")} style={{background:"none",border:"none",color:C.purple,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Ver tudo →</button>
              </div>
              <div style={{background:C.card,borderRadius:18,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                {mTxs.slice(-5).reverse().map((t,i)=>(
                  <div key={t.id} onClick={()=>setShowDetail(t)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderBottom:i<4?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
                    <Ico icon={CATS[t.category]?.ic} color={CATS[t.category]?.c} size={40}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>{t.date.split("-").reverse().join("/")} · {CATS[t.category]?.l}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:15,fontWeight:800,color:t.type==="income"?C.green:C.red}}>{t.type==="income"?"+":"-"}{fmtK(t.value)}</div>
                      <Pill color={t.status==="paid"?C.green:C.yellow}>{t.status==="paid"?"✓":"⏳"}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CALENDAR ── */}
        {tab==="cal"&&(
          <div style={{animation:"fadeUp .3s ease",padding:"14px 14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <button onClick={prev} style={{width:38,height:38,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <span style={{fontSize:17,fontWeight:800}}>{MF[calM]} {calY}</span>
              <button onClick={next} style={{width:38,height:38,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
              {[{l:"Receitas",v:tI,c:C.green},{l:"Despesas",v:tE,c:C.red},{l:"Saldo",v:bal,c:C.purple},{l:"Pendente",v:nE,c:C.yellow}].map(s=>(
                <div key={s.l} style={{background:s.c+"15",border:`1px solid ${s.c}30`,borderRadius:12,padding:"8px 14px",flexShrink:0}}>
                  <div style={{fontSize:9,color:s.c,fontWeight:700,letterSpacing:.5}}>{s.l}</div>
                  <div style={{fontSize:14,fontWeight:800,color:s.c,marginTop:1}}>{fmtK(s.v)}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.card,borderRadius:20,padding:"14px",border:`1px solid ${C.border}`}}>
              <CalView txs={txs} year={calY} month={calM}/>
            </div>
            <div style={{display:"flex",gap:14,marginTop:12,padding:"0 2px"}}>
              {[[C.green,"Receita"],[C.red,"Despesa"],[C.yellow,"Pendente"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,background:c,borderRadius:"50%"}}/><span style={{fontSize:11,color:C.muted}}>{l}</span></div>
              ))}
            </div>
            {pend.length>0&&(
              <div style={{marginTop:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:10}}>🔔 Vencimentos</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {pend.map(t=>{
                    const dl=Math.ceil((new Date(t.date)-new Date())/(864e5));
                    return(
                      <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:C.card,borderRadius:14,border:`1px solid ${dl<=3?C.red+"33":C.border}`}}>
                        <Ico icon={CATS[t.category]?.ic} color={CATS[t.category]?.c} size={38}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{t.name}</div>
                          <div style={{fontSize:11,color:C.muted}}>{t.date.split("-").reverse().join("/")}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                          <div style={{fontSize:14,fontWeight:800,color:C.red}}>{fmt(t.value)}</div>
                          <Pill color={dl<=3?C.red:C.yellow}>{dl<=0?"Vencido":`${dl}d`}</Pill>
                        </div>
                        <button onClick={()=>toggle(t.id)} style={{padding:"8px 11px",background:C.green+"22",border:`1px solid ${C.green}44`,borderRadius:10,color:C.green,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,flexShrink:0}}>Pagar</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab==="txs"&&(
          <div style={{animation:"fadeUp .3s ease",padding:"14px 14px 16px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:C.green+"15",border:`1px solid ${C.green}30`,borderRadius:16,padding:"14px"}}>
                <div style={{fontSize:9,color:C.green,fontWeight:700,letterSpacing:.6}}>RECEITAS</div>
                <div style={{fontSize:22,fontWeight:800,color:C.green,marginTop:4,letterSpacing:-.5}}>{fmtK(tI)}</div>
              </div>
              <div style={{background:C.red+"15",border:`1px solid ${C.red}30`,borderRadius:16,padding:"14px"}}>
                <div style={{fontSize:9,color:C.red,fontWeight:700,letterSpacing:.6}}>DESPESAS</div>
                <div style={{fontSize:22,fontWeight:800,color:C.red,marginTop:4,letterSpacing:-.5}}>{fmtK(tE)}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:12}}>
              {[["all","Todas"],["income","Receitas"],["expense","Despesas"],["pending","Pendentes"]].map(([k,l])=>(
                <button key={k} onClick={()=>setTxF(k)} style={{padding:"8px 16px",borderRadius:99,border:`1.5px solid ${txF===k?C.purple:C.border}`,background:txF===k?C.purple+"25":"transparent",color:txF===k?"#c4b5fd":C.muted,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",flexShrink:0}}>{l}</button>
              ))}
            </div>
            <div style={{background:C.card,borderRadius:20,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              {filt.length===0&&<div style={{textAlign:"center",padding:"32px 20px",color:C.muted,fontSize:14}}>Nenhuma transação</div>}
              {filt.map((t,i)=>(
                <div key={t.id} onClick={()=>setShowDetail(t)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:i<filt.length-1?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
                  <Ico icon={CATS[t.category]?.ic} color={CATS[t.category]?.c} size={42}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:130}}>{t.name}</span>
                      {t.recurring&&<span style={{fontSize:8,background:C.purple+"33",color:"#a78bfa",padding:"2px 5px",borderRadius:4,fontWeight:800,letterSpacing:.3,flexShrink:0}}>REC</span>}
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:1}}>{t.date.split("-").reverse().join("/")} · {CATS[t.category]?.l}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:t.type==="income"?C.green:C.red}}>{t.type==="income"?"+":"-"}{fmtK(t.value)}</div>
                    <Pill color={t.status==="paid"?C.green:C.yellow}>{t.status==="paid"?"✓ Pago":"⏳"}</Pill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GOALS ── */}
        {tab==="goals"&&(
          <div style={{animation:"fadeUp .3s ease",padding:"14px 14px 16px"}}>
            <div style={{fontSize:20,fontWeight:800,letterSpacing:-.5,marginBottom:14}}>Metas Financeiras</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
              {goals.map(g=>{
                const pct=Math.min(g.current/g.target*100,100);
                return(
                  <div key={g.id} style={{background:C.card,border:`1px solid ${g.c}25`,borderRadius:20,padding:"18px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:28}}>{g.icon}</span>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,color:C.text}}>{g.name}</div>
                          <div style={{fontSize:12,color:C.muted,marginTop:2}}>Meta: {fmt(g.target)}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <Pill color={g.c} sz={12}>{pct.toFixed(0)}%</Pill>
                      <button onClick={()=>setEditGoal(g)} style={{padding:"4px 10px",background:C.purple+"22",border:`1px solid ${C.purple}44`,borderRadius:99,color:"#c4b5fd",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✏️ Editar</button>
                    </div>
                    </div>
                    <Bar value={g.current} max={g.target} color={g.c} h={8}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                      <span style={{fontSize:13,fontWeight:700,color:g.c}}>{fmt(g.current)}</span>
                      <span style={{fontSize:12,color:C.muted}}>Faltam {fmt(g.target-g.current)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"16px",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:800,marginBottom:14}}>💡 Simulador "E se...?"</div>
              {[{l:"Poupar R$ 500/mês (2 anos)",v:500*24,ic:"📦",c:C.purple},{l:"Reduzir 10% gastos variáveis",v:tE*0.1*12,ic:"✂️",c:C.green},{l:"Investir R$ 1.000/mês (5 anos)",v:1000*60*1.12,ic:"📈",c:C.yellow}].map(s=>(
                <div key={s.l} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:s.c+"0f",border:`1px solid ${s.c}22`,borderRadius:14,marginBottom:8}}>
                  <span style={{fontSize:24,flexShrink:0}}>{s.ic}</span>
                  <div style={{flex:1}}><div style={{fontSize:12,color:C.muted,lineHeight:1.3}}>{s.l}</div></div>
                  <div style={{fontSize:16,fontWeight:800,color:s.c,flexShrink:0}}>{fmtK(s.v)}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"16px"}}>
              <div style={{fontSize:14,fontWeight:800,marginBottom:14}}>🏦 Dívidas</div>
              {[{n:"Financiamento Carro",total:45000,paid:18000,monthly:1200,c:C.red},{n:"Cartão de Crédito",total:3200,paid:0,monthly:3200,c:C.yellow}].map(d=>(
                <div key={d.n} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:700}}>{d.n}</span>
                    <span style={{fontSize:14,fontWeight:800,color:d.c}}>{fmt(d.total-d.paid)}</span>
                  </div>
                  <Bar value={d.paid} max={d.total} color={d.c} h={7}/>
                  <div style={{fontSize:11,color:C.muted,marginTop:5}}>Parcela: {fmt(d.monthly)}/mês</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab==="reports"&&(
          <div style={{animation:"fadeUp .3s ease",padding:"14px 14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:-.5}}>Relatórios</div>
              <div style={{display:"flex",gap:6}}>
                <button style={{padding:"7px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:99,color:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600}}>PDF</button>
                <button style={{padding:"7px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:99,color:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600}}>Excel</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[{l:"Total Receitas",v:tI,c:C.green},{l:"Total Despesas",v:tE,c:C.red},{l:"Saldo do Mês",v:bal,c:bal>=0?C.purple:C.red},{l:"Taxa Poupança",v:`${sr}%`,c:C.blue,txt:true}].map(s=>(
                <div key={s.l} style={{background:s.c+"12",border:`1px solid ${s.c}28`,borderRadius:16,padding:"13px"}}>
                  <div style={{fontSize:9,color:s.c,fontWeight:700,letterSpacing:.5,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.txt?s.v:fmtK(s.v)}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"14px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>Visão Anual 2025</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:3,height:72}}>
                {MS.map((m,i)=>{
                  const iv=[7200,7500,8100,8500,0,0,0,0,0,0,0,0];
                  const ev=[5800,6100,5900,6050,0,0,0,0,0,0,0,0];
                  const mx=9000;
                  const hd=iv[i]>0;
                  return(
                    <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <div style={{display:"flex",gap:1,alignItems:"flex-end",height:64}}>
                        <div style={{width:"45%",height:Math.max((iv[i]/mx)*62,2),background:hd?`${C.green}cc`:`${C.green}22`,borderRadius:"2px 2px 0 0"}}/>
                        <div style={{width:"45%",height:Math.max((ev[i]/mx)*62,2),background:hd?`${C.red}cc`:`${C.red}22`,borderRadius:"2px 2px 0 0"}}/>
                      </div>
                      <span style={{fontSize:7,color:i===calM?C.purple:C.muted,fontWeight:i===calM?800:400}}>{m}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"14px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>Comparativo Mensal</div>
              {[{m:"Fevereiro",i:7500,e:6100},{m:"Março",i:8100,e:5900},{m:"Abril",i:tI,e:tE}].map(row=>(
                <div key={row.m} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:13,fontWeight:600}}>{row.m}</span>
                    <span style={{fontSize:13,fontWeight:800,color:row.i-row.e>=0?C.green:C.red}}>{fmtK(row.i-row.e)}</span>
                  </div>
                  <div style={{display:"flex",gap:3,height:6}}>
                    <div style={{width:`${(row.i/10000)*100}%`,background:C.green,borderRadius:3}}/>
                    <div style={{width:`${(row.e/10000)*100}%`,background:C.red,borderRadius:3}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"14px"}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>Ranking de Gastos</div>
              {Object.entries(eCat).sort((a,b)=>b[1]-a[1]).map(([cat,val],i)=>(
                <div key={cat} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:11,color:C.muted,fontWeight:700,width:16,textAlign:"center"}}>{i+1}</span>
                  <span style={{fontSize:18}}>{CATS[cat]?.ic}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:600}}>{CATS[cat]?.l}</span>
                      <span style={{fontSize:13,fontWeight:700,color:CATS[cat]?.c}}>{fmt(val)}</span>
                    </div>
                    <Bar value={val} max={tE} color={CATS[cat]?.c||C.muted} h={5}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        {TABS.map(t=>{
          const a=tab===t.id;
          return(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"10px 4px 8px",background:"none",border:"none",cursor:"pointer",position:"relative"}}>
              {a&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:28,height:2.5,background:C.purple,borderRadius:"0 0 3px 3px"}}/>}
              <span style={{fontSize:19,filter:a?"none":"grayscale(1) opacity(.45)",transition:"all .2s"}}>{t.ic}</span>
              <span style={{fontSize:9.5,fontWeight:a?800:500,color:a?C.purple:C.muted,letterSpacing:.3,transition:"all .2s"}}>{t.l}</span>
            </button>
          );
        })}
      </div>

      {/* SHEETS */}
      <Sheet open={showClear} onClose={()=>setShowClear(false)} title="🗑 Zerar Tudo">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{margin:0,fontSize:14,color:C.muted,textAlign:"center",lineHeight:1.6}}>Tem certeza que quer apagar todas as transações? Essa ação não pode ser desfeita.</p>
          <button onClick={clearAll} style={{padding:"15px",background:C.red,border:"none",borderRadius:14,color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>Sim, zerar tudo</button>
          <button onClick={()=>setShowClear(false)} style={{padding:"15px",background:C.card,border:`1px solid ${C.border}`,borderRadius:14,color:C.muted,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
        </div>
      </Sheet>
      <Sheet open={!!editGoal} onClose={()=>setEditGoal(null)} title="✏️ Editar Meta">
        {editGoal&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:20,textAlign:"center"}}>{editGoal.icon} <span style={{fontWeight:700}}>{editGoal.name}</span></div>
            <div>
              <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:6,letterSpacing:.8}}>VALOR ATUAL (R$)</div>
              <input type="number" defaultValue={editGoal.current} id="gc" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",color:C.text,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:6,letterSpacing:.8}}>META TOTAL (R$)</div>
              <input type="number" defaultValue={editGoal.target} id="gt" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",color:C.text,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <button onClick={()=>{saveGoal(editGoal.id,document.getElementById("gc").value,document.getElementById("gt").value);setEditGoal(null);}} style={{padding:"15px",background:`linear-gradient(135deg,${C.purple},#a78bfa)`,border:"none",borderRadius:14,color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 20px ${C.purple}44`}}>
              Salvar Meta
            </button>
          </div>
        )}
      </Sheet>
      <Sheet open={showAdd} onClose={()=>setShowAdd(false)} title="Nova Transação">
        <TxForm onSave={add} onClose={()=>setShowAdd(false)}/>
      </Sheet>
      <Sheet open={showAI} onClose={()=>setShowAI(false)} title="🤖 Assistente IA Financeiro">
        <AIChat txs={txs}/>
      </Sheet>
      <Sheet open={!!showDetail} onClose={()=>setShowDetail(null)} title="Detalhes">
        {showDetail&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:14,padding:"4px 0 18px"}}>
              <Ico icon={CATS[showDetail.category]?.ic} color={CATS[showDetail.category]?.c} size={52}/>
              <div>
                <div style={{fontSize:19,fontWeight:800,color:C.text}}>{showDetail.name}</div>
                <div style={{display:"flex",gap:6,marginTop:5}}>
                  <Pill color={CATS[showDetail.category]?.c}>{CATS[showDetail.category]?.l}</Pill>
                  <Pill color={showDetail.status==="paid"?C.green:C.yellow}>{showDetail.status==="paid"?"Pago":"Pendente"}</Pill>
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[{l:"Valor",v:(showDetail.type==="income"?"+":"-")+fmt(showDetail.value),c:showDetail.type==="income"?C.green:C.red},{l:"Data",v:showDetail.date.split("-").reverse().join("/")},{l:"Tipo",v:showDetail.type==="income"?"Receita":"Despesa"},{l:"Recorrente",v:showDetail.recurring?"Sim ♻️":"Não"}].map(f=>(
                <div key={f.l} style={{background:C.card,borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:.6,textTransform:"uppercase",marginBottom:4}}>{f.l}</div>
                  <div style={{fontSize:15,fontWeight:700,color:f.c||C.text}}>{f.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{toggle(showDetail.id);setShowDetail(p=>({...p,status:p.status==="paid"?"pending":"paid"}));}} style={{flex:1,padding:"14px",background:showDetail.status==="paid"?C.yellow+"20":C.green+"20",border:`1px solid ${showDetail.status==="paid"?C.yellow:C.green}44`,borderRadius:14,color:showDetail.status==="paid"?C.yellow:C.green,cursor:"pointer",fontWeight:800,fontSize:14,fontFamily:"inherit"}}>
                {showDetail.status==="paid"?"↩ Desfazer":"✓ Marcar como Pago"}
              </button>
              <button onClick={()=>del(showDetail.id)} style={{width:48,height:48,background:C.red+"15",border:`1px solid ${C.red}33`,borderRadius:14,color:C.red,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>🗑</button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

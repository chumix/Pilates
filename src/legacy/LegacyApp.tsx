// @ts-nocheck

import React, {useState,useEffect,useMemo,useRef,useCallback,useContext,createContext} from "react";
import htm from "htm";
const html=htm.bind(React.createElement);
import { APP_INFO, DEFAULT_BRANDING, VERSION_HISTORY } from "../appInfo";

/* ---------- utilidades ---------- */
const KEY="pilates-angela-v1";
const uid=()=>Math.random().toString(36).slice(2,9);
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const monday=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
const dayIdx=d=>(d.getDay()+6)%7;
const DAYS=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const DAYS_LONG=["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
const fmtLong=d=>new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"}).format(d);
const fmtShort=d=>new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short"}).format(d);
const parseISO=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const isoWeek=d=>{const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil((((x-y)/86400000)+1)/7)};
const fmtMin=m=>m>=60?(Math.floor(m/60)+" h"+(m%60?" "+pad(m%60)+" min":"")):(m+" min");
const toggle=(arr,v)=>arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");

const LEVELS=["Principiante","Intermedio","Avanzado"];
const TYPES=["Mat","Reformer","Cadillac","Silla","Barril"];
const TYPE_LABEL={Mat:"Suelo (Mat)",Reformer:"Reformer",Cadillac:"Cadillac",Silla:"Silla",Barril:"Barril"};
const FOCI=["Core","Movilidad","Fuerza","Flexibilidad"];
const PAT={
  lumbar:["Hernia lumbar","hernia lumbar"],
  cervical:["Patología cervical","patologías cervicales"],
  escoliosis:["Escoliosis","escoliosis"],
  embarazo:["Embarazo","embarazo"],
  osteoporosis:["Osteoporosis","osteoporosis"],
  rodilla:["Lesión de rodilla","lesión de rodilla"],
  hombro:["Lesión de hombro","lesión de hombro"],
  hipertension:["Hipertensión","hipertensión"]
};
const patLabel=k=>PAT[k]?PAT[k][0]:k;
const patTxt=k=>PAT[k]?PAT[k][1]:k;
const initials=n=>n.trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
const avIdx=n=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%6;return h};

/* ---------- datos de ejemplo ---------- */
function seed(){
  const ex=(id,name,type,level,focus,min,contra,desc)=>({id,name,type,level,focus,min,contra,desc,custom:false});
  const exercises=[
    ex("e1","Respiración costal","Mat","Principiante","Movilidad",3,[],"Inhalación lateral hacia las costillas con las manos sobre la caja torácica. Activa el diafragma y prepara el core."),
    ex("e2","Gato-vaca","Mat","Principiante","Movilidad",3,[],"En cuadrupedia, alterna flexión y extensión de columna coordinando con la respiración. Suelta tensión lumbar y dorsal."),
    ex("e3","Puente pélvico","Mat","Principiante","Movilidad",4,[],"Boca arriba, despega la columna vértebra a vértebra hasta la línea hombros-rodillas y desciende con control."),
    ex("e4","The Hundred","Mat","Intermedio","Core",3,["cervical","embarazo"],"Con piernas elevadas y cabeza flexionada, bombea los brazos mientras inhalas y exhalas en series de cinco tiempos."),
    ex("e5","Roll Up","Mat","Intermedio","Core",4,["lumbar","osteoporosis","embarazo"],"Desde tumbada, enrolla la columna hasta sentarte y regresa vértebra a vértebra. Exige control abdominal y flexibilidad de isquiotibiales."),
    ex("e6","Single Leg Stretch","Mat","Intermedio","Core",4,["cervical","embarazo"],"Con la cabeza elevada, alterna rodillas al pecho manteniendo la pelvis estable y el abdomen activo."),
    ex("e7","Side Kick","Mat","Principiante","Fuerza",5,[],"En decúbito lateral, trabaja abducción y flexo-extensión de cadera con el tronco estable. Fortalece glúteo medio y estabilizadores."),
    ex("e8","Swan","Mat","Avanzado","Flexibilidad",3,["lumbar","embarazo"],"Boca abajo, extiende la columna apoyando las manos y alargando el cuello. Trabaja la movilidad torácica."),
    ex("e9","Mermaid","Mat","Principiante","Flexibilidad",3,[],"Sentada, inclinación lateral en arco con el brazo sobre la cabeza. Abre el costado y trabaja la respiración lateral."),
    ex("e10","Spine Stretch Forward","Mat","Principiante","Flexibilidad",3,["osteoporosis"],"Sentada con piernas separadas, flexiona la columna hacia delante en forma de C y vuelve a la posición erguida."),
    ex("e11","Footwork","Reformer","Principiante","Fuerza",5,[],"Con los pies en la barra, extiende y flexiona piernas en varias posiciones. Base de la sesión de Reformer."),
    ex("e12","Hip Work","Reformer","Intermedio","Movilidad",4,[],"Con los pies en las correas, dibuja círculos con las caderas manteniendo pelvis y lumbares quietas."),
    ex("e13","Elephant","Reformer","Intermedio","Core",4,["hombro"],"En V invertida sobre el carro, empuja el carro con las piernas mientras mantienes la columna redondeada."),
    ex("e14","Short Spine Massage","Reformer","Avanzado","Movilidad",4,["cervical","hipertension","embarazo","osteoporosis"],"Eleva la pelvis sobre los hombros y rueda la columna hacia abajo con el carro. Requiere cuello sano y buen control."),
    ex("e15","Long Stretch","Reformer","Avanzado","Fuerza",4,["hombro","embarazo"],"En plancha sobre el carro, desplázalo hacia atrás y adelante con los hombros estables."),
    ex("e16","Leg Springs","Cadillac","Intermedio","Fuerza",5,[],"Boca arriba con los muelles en los pies, realiza círculos y aperturas de pierna con la pelvis estable."),
    ex("e17","Roll Down Bar","Cadillac","Intermedio","Core",4,["osteoporosis","lumbar"],"Sentada, sostén la barra y desciende en C controlada contra la resistencia del muelle."),
    ex("e18","Footwork en silla","Silla","Intermedio","Fuerza",4,["rodilla"],"De pie frente al pedal, empuja y controla la subida para trabajar cuádriceps, glúteos y equilibrio."),
    ex("e19","Pull-up en silla","Silla","Avanzado","Fuerza",4,["hombro"],"Con el pedal elevado, empuja con los brazos mientras estabilizas escápulas y centro."),
    ex("e20","Side Stretch en barril","Barril","Intermedio","Flexibilidad",4,[],"Sobre el arco del barril, elonga el costado con los brazos en arco. Abre caja torácica y columna lateral."),
    ex("e21","Ladder Barrel","Barril","Avanzado","Flexibilidad",4,["hipertension","osteoporosis"],"Extensión completa de columna sobre el barril con apoyo en la escalera. Mucha amplitud, poco tiempo de permanencia.")
  ];
  const it=(ex,min)=>({id:uid(),ex,min});
  const blocks=(a,b,c)=>[
    {id:uid(),title:"Calentamiento / Movilidad",target:10,items:a},
    {id:uid(),title:"Bloque principal",target:35,items:b},
    {id:uid(),title:"Enfriamiento y respiración",target:15,items:c}];
  const templates=[
    {id:"t1",name:"Core y movilidad suave",blocks:blocks([it("e1",3),it("e2",3),it("e3",4)],[it("e4",6),it("e6",7),it("e5",6),it("e7",8),it("e8",4),it("e9",4)],[it("e10",5),it("e1",5),it("e2",5)])},
    {id:"t2",name:"Reformer fuerza y control",blocks:blocks([it("e1",4),it("e12",6)],[it("e11",10),it("e13",8),it("e15",8),it("e14",9)],[it("e9",6),it("e10",5),it("e1",4)])},
    {id:"t3",name:"Mat suave y respiración",blocks:blocks([it("e1",5),it("e2",5)],[it("e3",10),it("e7",10),it("e9",8),it("e2",7)],[it("e9",8),it("e1",7)])}
  ];
  const st=(id,name,level,pat,phone,email,birth,since,contra,clin,notes)=>({id,name,level,pat,phone,email,birth,since,contra,clin,active:true,notes});
  const today=iso(new Date());
  const students=[
    st("s1","Marta Ruiz","Intermedio",["embarazo"],"612 345 018","marta.ruiz@ejemplo.es","1991-04-12","2025-02-03","Evitar flexión de tronco con la cabeza elevada y decúbito supino prolongado.","Embarazo de 22 semanas. Sin complicaciones; ginecóloga autoriza ejercicio moderado.",[{id:uid(),date:"2026-10-28",text:"Buena tolerancia. Adaptamos la respiración y quitamos ejercicios en supino."}]),
    st("s2","Carmen Soler","Principiante",["lumbar"],"623 482 771","carmen.soler@ejemplo.es","1978-09-30","2026-01-12","Sin flexión lumbar con carga. Evitar Roll Up y similares.","Hernia L4-L5 diagnosticada en 2024. Dolor ocasional al final del día.",[{id:uid(),date:"2026-10-20",text:"Mejora la estabilidad del core. Progresamos a puente con una pierna."},{id:uid(),date:"2026-11-03",text:"Molestia lumbar tras jornada larga. Sesión centrada en movilidad."}]),
    st("s3","Lucía Vidal","Intermedio",["escoliosis"],"634 220 954","lucia.vidal@ejemplo.es","1999-01-18","2025-09-08","Trabajo asimétrico: prioriza el lado cóncavo.","Escoliosis lumbar en S leve. Revisión con fisio cada seis meses.",[{id:uid(),date:"2026-10-27",text:"Más conciencia del lado derecho. Trabajamos elongación axial."}]),
    st("s4","Paula Gómez","Avanzado",[],"645 118 302","paula.gomez@ejemplo.es","1986-06-05","2024-03-18","","Sin patologías. Objetivo: fuerza y control para correr media maratón.",[]),
    st("s5","Jordi Ferrer","Intermedio",["cervical"],"655 903 427","jordi.ferrer@ejemplo.es","1983-11-22","2025-05-19","Evitar flexión cervical mantenida y posiciones con cabeza invertida.","Cervicalgia crónica por trabajo de oficina. Rigidez en trapecio superior.",[{id:uid(),date:"2026-11-04",text:"Menos tensión cervical. Mantiene la cabeza apoyada en los ejercicios de abdomen."}]),
    st("s6","Elena Navarro","Principiante",["osteoporosis"],"666 710 245","elena.navarro@ejemplo.es","1962-03-09","2026-02-02","Evitar flexión de columna con carga y rotaciones forzadas.","Osteopenia lumbar en densitometría. Prioriza extensión y equilibrio.",[]),
    st("s7","Núria Casals","Avanzado",["rodilla"],"677 305 118","nuria.casals@ejemplo.es","1990-08-14","2024-09-30","Evitar flexión profunda de rodilla bajo carga.","Postoperatorio de menisco hace 8 meses. Alta de fisioterapia.",[{id:uid(),date:"2026-10-30",text:"Buena respuesta en Reformer. Aumentamos resistencia en el Footwork."}]),
    st("s8","Rosa Medina","Principiante",["hipertension","hombro"],"688 442 096","rosa.medina@ejemplo.es","1958-12-02","2026-04-06","Evitar cabeza por debajo del corazón. Controlar apnea.","Hipertensión controlada con medicación. Tendinopatía de manguito derecho.",[])
  ];
  const slots=[
    {id:"sl1",day:0,time:"09:30",type:"Mat",templateId:"t1",capacity:6,students:["s2","s3","s4","s7"]},
    {id:"sl2",day:0,time:"18:00",type:"Reformer",templateId:"t2",capacity:4,students:["s4","s5","s7"]},
    {id:"sl3",day:1,time:"19:00",type:"Mat",templateId:"t3",capacity:8,students:["s1","s2","s6","s8"]},
    {id:"sl4",day:2,time:"10:00",type:"Mat",templateId:"t1",capacity:6,students:["s1","s3","s5","s6"]},
    {id:"sl5",day:2,time:"18:00",type:"Reformer",templateId:"t2",capacity:4,students:["s3","s4","s5","s7"]},
    {id:"sl6",day:3,time:"18:00",type:"Mat",templateId:"t3",capacity:8,students:["s1","s6","s8"]},
    {id:"sl7",day:4,time:"09:30",type:"Mat",templateId:"t1",capacity:6,students:["s2","s3","s4"]},
    {id:"sl8",day:5,time:"10:30",type:"Reformer",templateId:"t2",capacity:4,students:["s4","s7"]},
    {id:"sl9",day:6,time:"11:00",type:"Mat",templateId:"t3",capacity:8,students:["s1","s2","s6","s8"]}
  ];
  const lm=monday(new Date());const w=n=>iso(addDays(lm,n));
  const attendance={};
  attendance["sl9|"+today]=["s1","s2"];
  attendance["sl1|"+w(-7)]=["s2","s3","s4"];
  attendance["sl2|"+w(-7)]=["s4","s5","s7"];
  attendance["sl3|"+w(-6)]=["s1","s2","s6"];
  attendance["sl4|"+w(-5)]=["s1","s3","s5","s6"];
  attendance["sl6|"+w(-4)]=["s1","s6","s8"];
  attendance["sl1|"+w(0)]=["s2","s3","s4","s7"];
  attendance["sl3|"+w(1)]=["s1","s2","s6","s8"];
  return {v:2,students,exercises,templates,slots:slots.map(x=>({...x,recurrence:"weekly",date:""})),attendance,feedback:{},rooms:[{id:"r1",name:"Sala principal",location:"",capacity:8,notes:""}],inventory:[{id:"m1",name:"Esterillas",category:"Esterillas",total:10,outOfService:0,roomId:"r1",notes:""}],settings:{branding:{...DEFAULT_BRANDING},contractedHours:20,status:"local",lastSync:null}};
}
function normalizeDb(d){
  const base=seed();
  return {...base,...d,v:2,feedback:d.feedback||{},rooms:d.rooms?.length?d.rooms:base.rooms,inventory:d.inventory?.length?d.inventory:base.inventory,
    slots:(d.slots||[]).map(x=>({...x,recurrence:x.recurrence||"weekly",date:x.date||"",roomId:x.roomId||"",equipment:x.equipment||[]})),
    settings:{...base.settings,...(d.settings||{}),contractedHours:Number(d.settings?.contractedHours||20),branding:{...DEFAULT_BRANDING,...(d.settings?.branding||{})}}};
}
function load(){
  try{const r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);if(d)return normalizeDb(d);}}catch(e){}
  return seed();
}

/* ---------- iconos (trazo, estilo Lucide) ---------- */
const P={
  home:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  activity:"M22 12h-4l-3 9L9 3l-3 9H2",
  clip:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6v4H9z M9 12h6 M9 16h6",
  cal:"M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  sliders:"M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  search:"M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
  plus:"M12 5v14 M5 12h14",
  x:"M18 6L6 18 M6 6l12 12",
  l:"M15 18l-6-6 6-6", r:"M9 18l6-6-6-6",
  check:"M20 6L9 17l-5-5",
  alert:"M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01",
  phone:"M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  mail:"M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6",
  trash:"M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  pencil:"M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z",
  clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  up:"M18 15l-6-6-6 6", down:"M6 9l6 6 6-6",
  cloud:"M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  user:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  copy:"M9 9h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
};
function Icon({n,size=20,sw=2}){
  return html`<svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth=${sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${P[n].split(" M").map((d,i)=>html`<path key=${i} d=${(i?"M":"")+d}/>`)}</svg>`;
}

/* ---------- contexto y piezas comunes ---------- */
const Ctx=createContext(null);
const useC=()=>useContext(Ctx);

function Avatar({name,size=44}){
  return html`<span className="av" style=${{width:size,height:size,fontSize:size*0.36,background:"var(--a"+avIdx(name)+")"}}>${initials(name)}</span>`;
}
function Header({title,sub,right}){
  const {open,runtime}=useC();
  const sync=runtime.sync;
  const syncLabel=sync==="saving"?"Guardando…":sync==="error"?"Error de sincronización":"Drive conectado";
  return html`<header className="hd">
    <div className="hd-main"><h1>${title}</h1>${sub&&html`<p className="sub">${sub}</p>`}</div>
    <div className="hd-right">
      ${right}
      <button className="icon-btn" onClick=${()=>open({k:"settings"})} aria-label="Ajustes"><${Icon} n="sliders"/></button>
    </div>
  </header>`;
}
function Sheet({title,onClose,children,footer,className=""}){
  useEffect(()=>{const f=e=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f)},[onClose]);
  return html`<div className="ov" onMouseDown=${e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className=${"sheet "+className} role="dialog" aria-modal="true" aria-label=${title}>
      <div className="sheet-h"><h2>${title}</h2><button className="icon-btn" onClick=${onClose} aria-label="Cerrar"><${Icon} n="x"/></button></div>
      <div className="sheet-b">${children}</div>
      ${footer&&html`<div className="sheet-f">${footer}</div>`}
    </div></div>`;
}
function Field({label,id,children}){
  return html`<div className="field"><label htmlFor=${id}>${label}</label>${children}</div>`;
}
function Stepper({value,onChange,min=0,max=999,step=1,unit="",label}){
  return html`<span className="stepper" role="group" aria-label=${label}>
    <button type="button" onClick=${()=>onChange(Math.max(min,value-step))} aria-label="Menos">−</button>
    <output>${value}${unit}</output>
    <button type="button" onClick=${()=>onChange(Math.min(max,value+step))} aria-label="Más">+</button></span>`;
}
function ConfirmBtn({label,onYes,cls="btn-danger",icon="trash"}){
  const [arm,setArm]=useState(false);
  useEffect(()=>{if(!arm)return;const t=setTimeout(()=>setArm(false),3500);return()=>clearTimeout(t)},[arm]);
  return html`<button type="button" className=${cls} onClick=${()=>arm?onYes():setArm(true)}><${Icon} n=${icon} size=${18}/>${arm?"Pulsa de nuevo para confirmar":label}</button>`;
}
function Empty({title,text}){return html`<div className="empty card"><b>${title}</b>${text}</div>`;}
function Alert({children}){return html`<div className="alert" role="note"><${Icon} n="alert" size=${18}/><div>${children}</div></div>`;}

/* ---------- lógica de contraindicaciones ---------- */
function exConflicts(ex,student){return ex.contra.filter(k=>student.pat.includes(k));}
function slotName(db,s){const t=db.templates.find(x=>x.id===s.templateId);return t?t.name:"Clase sin plantilla";}
function presentIds(db,slot,date){const a=db.attendance[slot.id+"|"+date]||[];return a.filter(id=>slot.students.includes(id));}

/* ---------- INICIO ---------- */
function Home(){
  const {db,go,open,openSheet,runtime}=useC();
  const now=new Date();const today=iso(now);
  const h=now.getHours();
  const greet=h<13?"Buenos días":h<21?"Buenas tardes":"Buenas noches";
  const branding={...DEFAULT_BRANDING,...(db.settings?.branding||{})};
  const googleName=(runtime.user?.name||"").split(" ")[0];
  const instructor=branding.instructorName||googleName||"Instructor/a";
  const slots=db.slots.filter(s=>(s.recurrence!=="once"&&s.day===dayIdx(now))||(s.recurrence==="once"&&s.date===today)).sort((a,b)=>a.time.localeCompare(b.time));
  const nowT=pad(h)+":"+pad(now.getMinutes());
  const nextId=(slots.find(s=>s.time>=nowT)||{}).id;
  const activos=db.students.filter(s=>s.active).length;
  const presentes=slots.reduce((n,s)=>n+presentIds(db,s,today).length,0);
  const ws=monday(now),we=addDays(ws,6),weekSlots=db.slots.filter(s=>s.recurrence!=="once"||(s.date>=iso(ws)&&s.date<=iso(we)));
  const programmedMin=weekSlots.reduce((n,s)=>{const t=db.templates.find(x=>x.id===s.templateId);return n+(t?tplTotal(t):60)},0);
  const contracted=Number(db.settings?.contractedHours||20),programmed=programmedMin/60,remaining=Math.max(0,contracted-programmed);
  return html`<section className="screen">
    <${Header} title=${greet+", "+instructor} sub=${fmtLong(now)}/>
    <div className="stats">
      <div className="stat hero"><b>${slots.length}</b><span>${slots.length===1?"clase hoy":"clases hoy"}</span></div>
      <div className="stat"><b>${activos}</b><span>alumnos activos</span></div>
      <div className="stat"><b>${presentes}</b><span>asistencias hoy</span></div>
    </div>
    <div className="sect"><h2>Resumen semanal</h2><span className="small muted">Semana ${isoWeek(now)}</span></div>
    <div className="card weekly-summary">
      <div><b>${programmed.toLocaleString("es-ES",{maximumFractionDigits:1})} h</b><span>programadas</span></div>
      <div><b>${contracted.toLocaleString("es-ES",{maximumFractionDigits:1})} h</b><span>contratadas</span></div>
      <div><b>${remaining.toLocaleString("es-ES",{maximumFractionDigits:1})} h</b><span>disponibles</span></div>
      <div className="weekly-progress"><i style=${{width:Math.min(100,contracted?programmed/contracted*100:0)+"%"}}></i></div>
    </div>
    <div className="sect"><h2>Accesos directos</h2></div>
    <div className="quick">
      <button className="qa" onClick=${()=>openSheet({k:"student"})}><i><${Icon} n="user"/></i>Nuevo alumno</button>
      <button className="qa" onClick=${()=>openSheet({k:"exForm"})}><i><${Icon} n="activity"/></i>Nuevo ejercicio</button>
      <button className="qa" onClick=${()=>{go("plan");}}><i><${Icon} n="clip"/></i>Planificar clase</button>
      <button className="qa" onClick=${()=>go("cal")}><i><${Icon} n="cal"/></i>Ver semana</button>
    </div>
    <div className="sect"><h2>Agenda de hoy</h2><button className="small" style=${{color:"var(--link)",fontWeight:700}} onClick=${()=>go("cal")}>Calendario</button></div>
    ${slots.length===0?html`<${Empty} title="Hoy no hay clases" text="Añade una desde el calendario para que aparezca aquí."/>`:
      html`<div className="list">${slots.map(s=>{
        const pr=presentIds(db,s,today).length;const n=s.students.length;
        return html`<button key=${s.id} className=${"item"+(s.id===nextId?" next":"")+(s.time<nowT&&s.id!==nextId?" past":"")} onClick=${()=>openSheet({k:"slot",id:s.id,date:today})}>
          <span className="time">${s.time}</span>
          <span className="grow">
            <h3>${slotName(db,s)}</h3>
            <span className="row wrap" style=${{gap:6,marginTop:4}}>
              <span className=${"chip sm "+(s.type==="Mat"?"mat":"ref")}>${s.type}</span>
              ${s.id===nextId&&html`<span className="chip sm ok">Siguiente</span>`}
              ${pr>0&&html`<span className="small muted">${pr} presentes</span>`}
            </span>
            <div className="bar" aria-hidden="true"><i style=${{width:Math.min(100,n/s.capacity*100)+"%"}}></i></div>
          </span>
          <span className="count">${n}/${s.capacity}<br/><span className="small muted" style=${{fontWeight:500}}>alumnos</span></span>
        </button>`})}</div>`}
  </section>`;
}

/* ---------- ALUMNOS ---------- */
function Students(){
  const {db,open,openSheet}=useC();
  const [q,setQ]=useState("");const [lv,setLv]=useState("Todos");
  const list=useMemo(()=>db.students.filter(s=>{
    if(lv!=="Todos"&&s.level!==lv)return false;
    const hay=norm(s.name+" "+s.phone+" "+s.pat.map(patLabel).join(" "));
    return hay.includes(norm(q));
  }).sort((a,b)=>a.name.localeCompare(b.name,"es")),[db.students,q,lv]);
  return html`<section className="screen">
    <${Header} title="Alumnos" sub=${db.students.length+" en total"} right=${html`<button className="icon-btn" style=${{background:"var(--btn)",color:"var(--on-btn)"}} onClick=${()=>openSheet({k:"student"})} aria-label="Añadir alumno"><${Icon} n="plus"/></button>`}/>
    <label className="search"><${Icon} n="search" size=${18}/><input type="search" id="q-alumnos" placeholder="Buscar por nombre, teléfono o patología" value=${q} onInput=${e=>setQ(e.target.value)} aria-label="Buscar alumnos"/></label>
    <div className="scroller" style=${{marginTop:10}}>
      ${["Todos",...LEVELS].map(l=>html`<button key=${l} className=${"chip btn"+(lv===l?" on":"")} onClick=${()=>setLv(l)}>${l}</button>`)}
    </div>
    <div className="list" style=${{marginTop:8}}>
      ${list.length===0?html`<${Empty} title="Sin resultados" text="Prueba con otro nombre o cambia el filtro de nivel."/>`:
      list.map(s=>html`<button key=${s.id} className="item" onClick=${()=>open({k:"student",id:s.id})}>
        <${Avatar} name=${s.name}/>
        <span className="grow">
          <h3 style=${{opacity:s.active?1:.55}}>${s.name}</h3>
          <p>${s.level}${s.active?"":" · Baja"}</p>
          ${s.pat.length>0&&html`<span className="tags" style=${{marginTop:6}}>
            ${s.pat.slice(0,2).map(k=>html`<span key=${k} className="chip sm med">${patLabel(k)}</span>`)}
            ${s.pat.length>2&&html`<span className="chip sm">+${s.pat.length-2}</span>`}</span>`}
        </span>
        <${Icon} n="r" size=${18}/>
      </button>`)}
    </div>
  </section>`;
}

function StudentDetail({id}){
  const {db,up,back,openSheet,say}=useC();
  const s=db.students.find(x=>x.id===id);
  const [tab,setTab]=useState("datos");
  const [note,setNote]=useState("");const [nd,setNd]=useState(iso(new Date()));
  const att=useMemo(()=>{
    const out=[];
    for(const k in db.attendance){
      if(!db.attendance[k].includes(id))continue;
      const [sid,date]=k.split("|");const sl=db.slots.find(x=>x.id===sid);
      if(sl)out.push({date,slot:sl});
    }
    return out.sort((a,b)=>b.date.localeCompare(a.date));
  },[db.attendance,db.slots,id]);
  if(!s)return null;
  const avoid=db.exercises.filter(e=>exConflicts(e,s).length>0);
  const addNote=()=>{
    if(!note.trim())return;
    up(d=>{d.students.find(x=>x.id===id).notes.push({id:uid(),date:nd,text:note.trim()})});
    setNote("");say("Nota guardada");
  };
  const rowK=(k,v)=>html`<div className="kv"><div className="k">${k}</div><div className="v">${v||html`<span className="muted">Sin datos</span>`}</div></div>`;
  return html`<section className="screen">
    <button className="back" onClick=${back}><${Icon} n="l" size=${18}/>Alumnos</button>
    <div className="card row" style=${{alignItems:"flex-start"}}>
      <${Avatar} name=${s.name} size=${64}/>
      <div className="grow">
        <h1 style=${{fontFamily:"var(--f-display)",fontSize:24,fontWeight:600,lineHeight:1.15}}>${s.name}</h1>
        <div className="tags" style=${{marginTop:8}}>
          <span className="chip sm">${s.level}</span>
          ${!s.active&&html`<span className="chip sm">Baja</span>`}
          ${s.pat.map(k=>html`<span key=${k} className="chip sm med">${patLabel(k)}</span>`)}
        </div>
      </div>
      <button className="icon-btn" onClick=${()=>openSheet({k:"student",id:s.id})} aria-label="Editar alumno"><${Icon} n="pencil" size=${18}/></button>
    </div>
    <div className="tabs" role="tablist">
      ${[["datos","Datos"],["clinico","Cuadro clínico"],["historico","Histórico"]].map(([k,l])=>html`<button key=${k} role="tab" aria-selected=${tab===k} className=${tab===k?"on":""} onClick=${()=>setTab(k)}>${l}</button>`)}
    </div>
    ${tab==="datos"&&html`<div className="card">
      ${rowK("Teléfono",s.phone)}${rowK("Correo",s.email)}
      ${rowK("Nacimiento",s.birth?new Intl.DateTimeFormat("es-ES",{dateStyle:"long"}).format(parseISO(s.birth)):"")}
      ${rowK("Alumna desde",s.since?new Intl.DateTimeFormat("es-ES",{month:"long",year:"numeric"}).format(parseISO(s.since)):"")}
      ${rowK("Nivel",s.level)}${rowK("Estado",s.active?"Activa":"De baja")}
      ${rowK("Clases fijas",db.slots.filter(x=>x.students.includes(s.id)).map(x=>DAYS[x.day]+" "+x.time).join(" · "))}
    </div>`}
    ${tab==="clinico"&&html`<div className="stack">
      <div className="card"><div className="label" style=${{marginBottom:8}}>Patologías</div>
        ${s.pat.length?html`<div className="tags">${s.pat.map(k=>html`<span key=${k} className="chip med">${patLabel(k)}</span>`)}</div>`:html`<p className="muted">Sin patologías registradas.</p>`}</div>
      <div className="card"><div className="label" style=${{marginBottom:8}}>Contraindicaciones</div><p style=${{whiteSpace:"pre-wrap"}}>${s.contra||html`<span className="muted">Sin contraindicaciones anotadas.</span>`}</p></div>
      <div className="card"><div className="label" style=${{marginBottom:8}}>Observaciones fisioterapéuticas</div><p style=${{whiteSpace:"pre-wrap"}}>${s.clin||html`<span className="muted">Sin observaciones.</span>`}</p></div>
      ${avoid.length>0&&html`<${Alert}><b>Ejercicios de la biblioteca a evitar (${avoid.length})</b><div style=${{marginTop:4}}>${avoid.map(e=>e.name).join(", ")}</div><//>`}
    </div>`}
    ${tab==="historico"&&html`<div className="stack">
      <div className="card stack">
        <div className="label">Nueva nota de evolución</div>
        <div className="field"><label htmlFor="nota-fecha">Fecha de la sesión</label><input id="nota-fecha" className="in" type="date" value=${nd} onChange=${e=>setNd(e.target.value)}/></div>
        <div className="field"><label htmlFor="nota-txt">Evolución</label><textarea id="nota-txt" className="ta" placeholder="Cómo ha respondido, qué se ha trabajado, qué ajustar la próxima vez" value=${note} onInput=${e=>setNote(e.target.value)}></textarea></div>
        <button className="btn-primary" onClick=${addNote} disabled=${!note.trim()}>Guardar nota</button>
      </div>
      <div className="sect" style=${{margin:"8px 2px 0"}}><h2>Evolución</h2><span className="small muted">${s.notes.length} notas</span></div>
      ${s.notes.length===0?html`<${Empty} title="Aún no hay notas" text="Las notas de cada sesión aparecerán aquí, de más reciente a más antigua."/>`:
        [...s.notes].sort((a,b)=>b.date.localeCompare(a.date)).map(n=>html`<div key=${n.id} className="card">
          <div className="row" style=${{marginBottom:4}}><span className="label grow">${new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"long",year:"numeric"}).format(parseISO(n.date))}</span>
            <button className="mini" aria-label="Borrar nota" onClick=${()=>up(d=>{const st=d.students.find(x=>x.id===id);st.notes=st.notes.filter(x=>x.id!==n.id)})}><${Icon} n="trash" size=${16}/></button></div>
          <p style=${{whiteSpace:"pre-wrap"}}>${n.text}</p></div>`)}
      <div className="sect" style=${{margin:"14px 2px 0"}}><h2>Asistencias</h2><span className="small muted">${att.length} registradas</span></div>
      ${att.length===0?html`<${Empty} title="Sin asistencias" text="Se registran al marcar presente en el calendario."/>`:
        html`<div className="card" style=${{padding:"4px 16px"}}>${att.slice(0,20).map((a,i)=>html`<div key=${i} className="kv" style=${{alignItems:"center"}}>
          <div className="k" style=${{width:78,fontVariantNumeric:"tabular-nums"}}>${fmtShort(parseISO(a.date))}</div>
          <div className="v">${slotName(db,a.slot)}<div className="small muted">${DAYS_LONG[a.slot.day]} · ${a.slot.time} · ${a.slot.type}</div></div></div>`)}</div>`}
    </div>`}
  </section>`;
}

function StudentForm({id,onClose}){
  const {db,up,say,back,screen}=useC();
  const cur=db.students.find(x=>x.id===id);
  const [f,setF]=useState(cur?{...cur}:{name:"",level:"Principiante",pat:[],phone:"",email:"",birth:"",since:iso(new Date()),contra:"",clin:"",active:true});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.name.trim())return;
    up(d=>{
      if(cur){Object.assign(d.students.find(x=>x.id===id),{...f,name:f.name.trim()});}
      else d.students.push({...f,name:f.name.trim(),id:uid(),notes:[]});
    });
    say(cur?"Alumno actualizado":"Alumno añadido");onClose();
  };
  const remove=()=>{
    up(d=>{d.students=d.students.filter(x=>x.id!==id);d.slots.forEach(s=>{s.students=s.students.filter(x=>x!==id)});
      for(const k in d.attendance)d.attendance[k]=d.attendance[k].filter(x=>x!==id);});
    say("Alumno eliminado");onClose();if(screen&&screen.k==="student")back();
  };
  return html`<${Sheet} title=${cur?"Editar alumno":"Nuevo alumno"} onClose=${onClose} footer=${html`<button className="btn-soft" onClick=${onClose}>Cancelar</button><button className="btn-primary" onClick=${save} disabled=${!f.name.trim()}>Guardar</button>`}>
    <${Field} label="Nombre completo" id="f-nombre"><input id="f-nombre" className="in" value=${f.name} onInput=${e=>set("name",e.target.value)} placeholder="Nombre y apellidos" autoComplete="off"/><//>
    <div className="two">
      <${Field} label="Teléfono" id="f-tel"><input id="f-tel" className="in" type="tel" value=${f.phone} onInput=${e=>set("phone",e.target.value)}/><//>
      <${Field} label="Correo" id="f-mail"><input id="f-mail" className="in" type="email" value=${f.email} onInput=${e=>set("email",e.target.value)}/><//>
    </div>
    <div className="two">
      <${Field} label="Fecha de nacimiento" id="f-nac"><input id="f-nac" className="in" type="date" value=${f.birth} onChange=${e=>set("birth",e.target.value)}/><//>
      <${Field} label="Alumna desde" id="f-alta"><input id="f-alta" className="in" type="date" value=${f.since} onChange=${e=>set("since",e.target.value)}/><//>
    </div>
    <div className="field"><span className="lab">Nivel</span><div className="tags">${LEVELS.map(l=>html`<button key=${l} type="button" className=${"chip btn"+(f.level===l?" on":"")} onClick=${()=>set("level",l)}>${l}</button>`)}</div></div>
    <div className="field"><span className="lab">Patologías</span><div className="tags">${Object.keys(PAT).map(k=>html`<button key=${k} type="button" className=${"chip btn"+(f.pat.includes(k)?" on":"")} onClick=${()=>set("pat",toggle(f.pat,k))}>${patLabel(k)}</button>`)}</div></div>
    <${Field} label="Contraindicaciones" id="f-contra"><textarea id="f-contra" className="ta" value=${f.contra} onInput=${e=>set("contra",e.target.value)} placeholder="Movimientos o posiciones a evitar"></textarea><//>
    <${Field} label="Observaciones fisioterapéuticas" id="f-clin"><textarea id="f-clin" className="ta" value=${f.clin} onInput=${e=>set("clin",e.target.value)} placeholder="Diagnóstico, pautas del fisio, evolución"></textarea><//>
    <button type="button" className=${"att"+(f.active?" on":"")} onClick=${()=>set("active",!f.active)} style=${{padding:"6px 0",border:0}}><span className="tick"><${Icon} n="check" size=${16} sw=${3}/></span><span>Alumno activo</span></button>
    ${cur&&html`<${ConfirmBtn} label="Eliminar alumno" onYes=${remove}/>`}
  <//>`;
}

/* ---------- EJERCICIOS ---------- */
function Exercises(){
  const {db,openSheet}=useC();
  const [q,setQ]=useState("");const [ty,setTy]=useState("Todos");const [lv,setLv]=useState("Todos");const [fo,setFo]=useState("Todos");
  const list=db.exercises.filter(e=>(ty==="Todos"||e.type===ty)&&(lv==="Todos"||e.level===lv)&&(fo==="Todos"||e.focus===fo)&&norm(e.name+" "+e.desc).includes(norm(q)));
  const chips=(opts,val,set,labels)=>html`<div className="scroller">${["Todos",...opts].map(o=>html`<button key=${o} className=${"chip btn"+(val===o?" on":"")} onClick=${()=>set(o)}>${labels&&labels[o]||o}</button>`)}</div>`;
  return html`<section className="screen">
    <${Header} title="Ejercicios" sub=${db.exercises.length+" en la biblioteca"} right=${html`<button className="icon-btn" style=${{background:"var(--btn)",color:"var(--on-btn)"}} onClick=${()=>openSheet({k:"exForm"})} aria-label="Crear ejercicio"><${Icon} n="plus"/></button>`}/>
    <label className="search"><${Icon} n="search" size=${18}/><input type="search" id="q-ej" placeholder="Buscar ejercicio" value=${q} onInput=${e=>setQ(e.target.value)} aria-label="Buscar ejercicios"/></label>
    <div style=${{marginTop:10}}>${chips(TYPES,ty,setTy,TYPE_LABEL)}${chips(LEVELS,lv,setLv)}${chips(FOCI,fo,setFo)}</div>
    <div className="list" style=${{marginTop:6}}>
      ${list.length===0?html`<${Empty} title="Ningún ejercicio coincide" text="Quita algún filtro o crea un ejercicio propio."/>`:
      list.map(e=>html`<button key=${e.id} className="item" onClick=${()=>openSheet({k:"exercise",id:e.id})}>
        <span className="grow">
          <h3>${e.name}</h3>
          <span className="tags" style=${{marginTop:6}}>
            <span className=${"chip sm "+(e.type==="Mat"?"mat":"ref")}>${e.type}</span>
            <span className="chip sm">${e.level}</span><span className="chip sm">${e.focus}</span>
            ${e.custom&&html`<span className="chip sm ok">Propio</span>`}
          </span>
        </span>
        <span style=${{textAlign:"right"}}>
          <span className="count">${e.min} min</span>
          ${e.contra.length>0&&html`<span style=${{display:"block",color:"var(--warn)",marginTop:4}} aria-label="Con contraindicaciones"><${Icon} n="alert" size=${18}/></span>`}
        </span>
      </button>`)}
    </div>
  </section>`;
}
function ExerciseSheet({id,onClose}){
  const {db,openSheet}=useC();
  const e=db.exercises.find(x=>x.id===id);if(!e)return null;
  const users=db.templates.filter(t=>t.blocks.some(b=>b.items.some(i=>i.ex===e.id)));
  return html`<${Sheet} title=${e.name} onClose=${onClose} footer=${html`<button className="btn-soft" onClick=${()=>openSheet({k:"exForm",id:e.id})}><${Icon} n="pencil" size=${18}/>Editar</button><button className="btn-primary" onClick=${onClose}>Cerrar</button>`}>
    <div className="tags"><span className=${"chip "+(e.type==="Mat"?"mat":"ref")}>${TYPE_LABEL[e.type]}</span><span className="chip">${e.level}</span><span className="chip">${e.focus}</span><span className="chip"><${Icon} n="clock" size=${14}/>${e.min} min sugeridos</span></div>
    <p>${e.desc||html`<span className="muted">Sin descripción.</span>`}</p>
    ${e.contra.length>0?html`<${Alert}><b>Contraindicaciones</b><div>Evitar en ${e.contra.map(patTxt).join(", ")}.</div><//>`:
      html`<div className="note"><${Icon} n="shield" size=${18}/><div>Sin contraindicaciones registradas. Adapta siempre a cada cuadro clínico.</div></div>`}
    ${users.length>0&&html`<div><div className="label" style=${{marginBottom:6}}>Usado en plantillas</div><div className="tags">${users.map(t=>html`<span key=${t.id} className="chip sm">${t.name}</span>`)}</div></div>`}
  <//>`;
}
function ExerciseForm({id,onClose}){
  const {db,up,say}=useC();
  const cur=db.exercises.find(x=>x.id===id);
  const [f,setF]=useState(cur?{...cur}:{name:"",type:"Mat",level:"Principiante",focus:"Core",min:4,contra:[],desc:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.name.trim())return;
    up(d=>{if(cur)Object.assign(d.exercises.find(x=>x.id===id),{...f,name:f.name.trim()});else d.exercises.push({...f,name:f.name.trim(),id:uid(),custom:true});});
    say(cur?"Ejercicio actualizado":"Ejercicio creado");onClose();
  };
  const remove=()=>{
    up(d=>{d.exercises=d.exercises.filter(x=>x.id!==id);d.templates.forEach(t=>t.blocks.forEach(b=>{b.items=b.items.filter(i=>i.ex!==id)}))});
    say("Ejercicio eliminado");onClose();
  };
  const opt=(arr,k,labels)=>html`<div className="tags">${arr.map(o=>html`<button key=${o} type="button" className=${"chip btn"+(f[k]===o?" on":"")} onClick=${()=>set(k,o)}>${labels&&labels[o]||o}</button>`)}</div>`;
  return html`<${Sheet} title=${cur?"Editar ejercicio":"Nuevo ejercicio"} onClose=${onClose} footer=${html`<button className="btn-soft" onClick=${onClose}>Cancelar</button><button className="btn-primary" onClick=${save} disabled=${!f.name.trim()}>Guardar</button>`}>
    <${Field} label="Nombre" id="x-nombre"><input id="x-nombre" className="in" value=${f.name} onInput=${e=>set("name",e.target.value)} placeholder="Por ejemplo: Teaser"/><//>
    <div className="field"><span className="lab">Aparato</span>${opt(TYPES,"type",TYPE_LABEL)}</div>
    <div className="field"><span className="lab">Nivel</span>${opt(LEVELS,"level")}</div>
    <div className="field"><span className="lab">Enfoque</span>${opt(FOCI,"focus")}</div>
    <div className="field"><span className="lab">Duración sugerida</span><div><${Stepper} value=${f.min} min=${1} max=${30} unit=" min" onChange=${v=>set("min",v)} label="Duración"/></div></div>
    <${Field} label="Descripción" id="x-desc"><textarea id="x-desc" className="ta" value=${f.desc} onInput=${e=>set("desc",e.target.value)} placeholder="Posición inicial, movimiento y puntos clave"></textarea><//>
    <div className="field"><span className="lab">Evitar en</span><div className="tags">${Object.keys(PAT).map(k=>html`<button key=${k} type="button" className=${"chip btn"+(f.contra.includes(k)?" on":"")} onClick=${()=>set("contra",toggle(f.contra,k))}>${patLabel(k)}</button>`)}</div></div>
    ${cur&&html`<${ConfirmBtn} label="Eliminar ejercicio" onYes=${remove}/>`}
  <//>`;
}

/* ---------- CLASES (planificador) ---------- */
const blockTotal=b=>b.items.reduce((n,i)=>n+i.min,0);
const tplTotal=t=>t.blocks.reduce((n,b)=>n+blockTotal(b),0);

function Planner(){
  const {db,up,open,say}=useC();
  const create=()=>{
    const id=uid();
    up(d=>d.templates.push({id,name:"Nueva clase",blocks:[
      {id:uid(),title:"Calentamiento / Movilidad",target:10,items:[]},
      {id:uid(),title:"Bloque principal",target:35,items:[]},
      {id:uid(),title:"Enfriamiento y respiración",target:15,items:[]}]}));
    open({k:"template",id});
  };
  return html`<section className="screen">
    <${Header} title="Clases" sub="Plantillas de sesión" right=${html`<button className="icon-btn" style=${{background:"var(--btn)",color:"var(--on-btn)"}} onClick=${create} aria-label="Nueva plantilla"><${Icon} n="plus"/></button>`}/>
    ${db.templates.length===0?html`<${Empty} title="Aún no tienes plantillas" text="Crea una con calentamiento, bloque principal y enfriamiento."/>`:
    html`<div className="list">${db.templates.map(t=>{
      const tot=tplTotal(t);const nEx=t.blocks.reduce((n,b)=>n+b.items.length,0);
      const used=db.slots.filter(s=>s.templateId===t.id).length;
      return html`<button key=${t.id} className="item" onClick=${()=>open({k:"template",id:t.id})}>
        <span className="grow">
          <h3>${t.name}</h3>
          <p>${nEx} ejercicios · ${used} ${used===1?"clase semanal":"clases semanales"}</p>
          <span className="row" style=${{gap:4,marginTop:8}} aria-hidden="true">${t.blocks.map(b=>html`<span key=${b.id} style=${{flex:Math.max(b.target,1),height:6,borderRadius:99,background:blockTotal(b)>0?"var(--sage)":"var(--surface2)"}}></span>`)}</span>
        </span>
        <span className="count">${fmtMin(tot)}</span><${Icon} n="r" size=${18}/>
      </button>`})}</div>`}
  </section>`;
}

function TemplateEditor({id}){
  const {db,up,back,say,openSheet}=useC();
  const t=db.templates.find(x=>x.id===id);
  const [pick,setPick]=useState(null);
  if(!t)return null;
  const exMap=Object.fromEntries(db.exercises.map(e=>[e.id,e]));
  const mut=fn=>up(d=>fn(d.templates.find(x=>x.id===id)));
  const total=tplTotal(t);
  const move=(b,i,dir)=>mut(tt=>{const bl=tt.blocks.find(x=>x.id===b.id);const j=i+dir;if(j<0||j>=bl.items.length)return;[bl.items[i],bl.items[j]]=[bl.items[j],bl.items[i]]});
  const remove=()=>{up(d=>{d.templates=d.templates.filter(x=>x.id!==id);d.slots.forEach(s=>{if(s.templateId===id)s.templateId=null})});say("Plantilla eliminada");back();};
  const dup=()=>{const nid=uid();up(d=>{const c=structuredClone(d.templates.find(x=>x.id===id));c.id=nid;c.name=c.name+" (copia)";c.blocks.forEach(b=>{b.id=uid();b.items.forEach(i=>{i.id=uid()})});d.templates.push(c)});say("Plantilla duplicada");};
  return html`<section className="screen">
    <button className="back" onClick=${back}><${Icon} n="l" size=${18}/>Clases</button>
    <div className="card stack">
      <${Field} label="Nombre de la clase" id="t-nombre"><input id="t-nombre" className="in" value=${t.name} onInput=${e=>mut(tt=>{tt.name=e.target.value})}/><//>
      <div className="row"><div className="grow"><div className="label">Duración total</div>
        <div style=${{fontFamily:"var(--f-display)",fontSize:26,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>${fmtMin(total)}</div></div>
        <span className="small muted">Objetivo ${fmtMin(t.blocks.reduce((n,b)=>n+b.target,0))}</span></div>
    </div>
    <div className="stack" style=${{marginTop:12}}>
      ${t.blocks.map((b,bi)=>{
        const tot=blockTotal(b);const diff=tot-b.target;
        return html`<div key=${b.id} className="card">
          <div className="blk-h"><span className="chip sm">${bi+1}</span>
            <input value=${b.title} aria-label="Nombre del bloque" onInput=${e=>mut(tt=>{tt.blocks.find(x=>x.id===b.id).title=e.target.value})}/></div>
          <div className="row" style=${{marginBottom:4}}>
            <span className="small muted grow">Objetivo del bloque</span>
            <${Stepper} value=${b.target} min=${0} max=${90} step=${5} unit=" min" label="Objetivo del bloque" onChange=${v=>mut(tt=>{tt.blocks.find(x=>x.id===b.id).target=v})}/>
          </div>
          <div className="row small" style=${{marginBottom:2}}>
            <b style=${{fontVariantNumeric:"tabular-nums"}}>${tot} min</b>
            <span className=${diff===0?"ok":diff>0?"muted":"muted"} style=${{color:diff===0?"var(--ok)":diff>0?"var(--warn)":"var(--muted)"}}>${diff===0?"Ajustado al objetivo":diff>0?"+"+diff+" min sobre el objetivo":"Faltan "+(-diff)+" min"}</span></div>
          <div className="bar"><i style=${{width:Math.min(100,b.target?tot/b.target*100:0)+"%",background:diff>0?"var(--warn)":"var(--sage)"}}></i></div>
          <div style=${{marginTop:10}}>
            ${b.items.length===0&&html`<p className="muted small" style=${{padding:"8px 0"}}>Este bloque está vacío. Añade ejercicios de la biblioteca.</p>`}
            ${b.items.map((it,i)=>{const e=exMap[it.ex];if(!e)return null;
              return html`<div key=${it.id} className="ex-row">
                <div className="grow"><div style=${{fontWeight:600,lineHeight:1.25}}>${e.name}</div>
                  <div className="small muted">${e.type} · ${e.focus}${e.contra.length>0?" · ":""}${e.contra.length>0&&html`<span style=${{color:"var(--warn)"}}>${e.contra.length} contraindic.</span>`}</div></div>
                <${Stepper} value=${it.min} min=${1} max=${30} unit="'" label="Minutos" onChange=${v=>mut(tt=>{tt.blocks.find(x=>x.id===b.id).items[i].min=v})}/>
                <span className="row" style=${{gap:0}}>
                  <button className="mini" onClick=${()=>move(b,i,-1)} aria-label="Subir" disabled=${i===0}><${Icon} n="up" size=${16}/></button>
                  <button className="mini" onClick=${()=>move(b,i,1)} aria-label="Bajar" disabled=${i===b.items.length-1}><${Icon} n="down" size=${16}/></button>
                  <button className="mini" onClick=${()=>mut(tt=>{const bl=tt.blocks.find(x=>x.id===b.id);bl.items.splice(i,1)})} aria-label="Quitar"><${Icon} n="x" size=${16}/></button>
                </span></div>`})}
          </div>
          <button className="btn-soft btn-sm" style=${{marginTop:8,width:"100%"}} onClick=${()=>setPick(b.id)}><${Icon} n="plus" size=${16}/>Añadir ejercicio</button>
        </div>`})}
      <div className="row"><button className="btn-soft grow" onClick=${dup}><${Icon} n="copy" size=${18}/>Duplicar</button>
        <${ConfirmBtn} label="Eliminar" onYes=${remove}/></div>
    </div>
    ${pick&&html`<${ExercisePicker} blockId=${pick} tplId=${id} onClose=${()=>setPick(null)}/>`}
  </section>`;
}
function ExercisePicker({blockId,tplId,onClose}){
  const {db,up,say}=useC();
  const [q,setQ]=useState("");const [ty,setTy]=useState("Todos");const [added,setAdded]=useState(0);
  const list=db.exercises.filter(e=>(ty==="Todos"||e.type===ty)&&norm(e.name+" "+e.focus).includes(norm(q)));
  const add=e=>{up(d=>{const t=d.templates.find(x=>x.id===tplId);t.blocks.find(b=>b.id===blockId).items.push({id:uid(),ex:e.id,min:e.min})});setAdded(n=>n+1);say(e.name+" añadido");};
  return html`<${Sheet} title="Añadir ejercicios" onClose=${onClose} footer=${html`<button className="btn-primary" onClick=${onClose}>${added>0?"Listo ("+added+" añadidos)":"Cerrar"}</button>`}>
    <label className="search"><${Icon} n="search" size=${18}/><input type="search" id="q-picker" placeholder="Buscar en la biblioteca" value=${q} onInput=${e=>setQ(e.target.value)} aria-label="Buscar ejercicio"/></label>
    <div className="scroller">${["Todos",...TYPES].map(o=>html`<button key=${o} className=${"chip btn"+(ty===o?" on":"")} onClick=${()=>setTy(o)}>${TYPE_LABEL[o]||o}</button>`)}</div>
    <div className="list">${list.length===0?html`<${Empty} title="Sin resultados" text="Prueba con otra búsqueda."/>`:list.map(e=>html`<button key=${e.id} className="item" onClick=${()=>add(e)}>
      <span className="grow"><h3>${e.name}</h3><p>${e.type} · ${e.level} · ${e.focus}</p>
        ${e.contra.length>0&&html`<p style=${{color:"var(--warn)",marginTop:2}}>Evitar en ${e.contra.map(patTxt).join(", ")}</p>`}</span>
      <span className="count">${e.min}'</span><span style=${{color:"var(--link)"}}><${Icon} n="plus" size=${20}/></span></button>`)}</div>
  <//>`;
}


/* ---------- CENTRO: SALAS Y MATERIAL ---------- */
const MAT_CATS=["Esterillas","Pelotas","Palos","Rodillos","Aros","Bandas elásticas","Bloques","Otro"];
function CenterManagement(){
 const {db,up,back,say}=useC();
 const [kind,setKind]=useState("material"),[edit,setEdit]=useState(null);
 const remove=(type,id)=>up(d=>{d[type]=d[type].filter(x=>x.id!==id);if(type==="rooms"){d.inventory.forEach(m=>{if(m.roomId===id)m.roomId=""});d.slots.forEach(s=>{if(s.roomId===id)s.roomId=""})}});
 return html`<section className="screen">${back&&html`<button className="back" onClick=${back}><${Icon} n="l" size=${18}/>Volver</button>`}<${Header} title="Centro" sub="Salas y material"/>
 <div className="tabs"><button className=${kind==="material"?"on":""} onClick=${()=>setKind("material")}>Material</button><button className=${kind==="rooms"?"on":""} onClick=${()=>setKind("rooms")}>Salas</button></div>
 <button className="btn-primary" onClick=${()=>setEdit({type:kind})}><${Icon} n="plus" size=${17}/>Añadir ${kind==="material"?"material":"sala"}</button>
 <div className="list" style=${{marginTop:12}}>${kind==="material"?db.inventory.map(m=>{const room=db.rooms.find(r=>r.id===m.roomId);const available=Math.max(0,m.total-m.outOfService);return html`<button className="item" key=${m.id} onClick=${()=>setEdit({type:"material",id:m.id})}><span className="grow"><h3>${m.name}</h3><p>${room?room.name:"Sin ubicación asignada"}</p></span><span className="count">${available}/${m.total}<br/><span className="small muted">disponibles</span></span></button>`}):db.rooms.map(r=>html`<button className="item" key=${r.id} onClick=${()=>setEdit({type:"rooms",id:r.id})}><span className="grow"><h3>${r.name}</h3><p>${r.location||"Sin ubicación"}</p></span><span className="count">${r.capacity}<br/><span className="small muted">personas</span></span></button>`)}</div>
 ${edit&&html`<${CenterForm} spec=${edit} onClose=${()=>setEdit(null)} onRemove=${remove}/>`}</section>`;
}
function CenterForm({spec,onClose,onRemove}){
 const {db,up,say}=useC();const isMat=spec.type==="material";const src=(isMat?db.inventory:db.rooms).find(x=>x.id===spec.id);
 const collection=isMat?"inventory":"rooms";
 const [f,setF]=useState(src?{...src}:isMat?{name:"",total:1,outOfService:0,roomId:"",notes:""}:{name:"",location:"",capacity:6,notes:""});const set=(k,v)=>setF(x=>({...x,[k]:v}));
 const save=()=>{if(!f.name.trim())return;up(d=>{const arr=d[collection];if(src)Object.assign(arr.find(x=>x.id===src.id),f);else arr.push({...f,id:uid()})});say("Guardado");onClose()};
 return html`<${Sheet} className="center-form-sheet" title=${src?"Editar":"Añadir"} onClose=${onClose} footer=${html`<button className="btn-soft" onClick=${onClose}>Cancelar</button><button className="btn-primary" onClick=${save}>Guardar</button>`}>
 <${Field} label="Nombre" id="c-name"><input className="in" value=${f.name} onInput=${e=>set("name",e.target.value)}/><//>
 ${isMat?html`<div className="two"><${Field} label="Cantidad total" id="c-total"><input className="in" type="number" min="0" value=${f.total} onInput=${e=>set("total",Number(e.target.value))}/><//><${Field} label="Fuera de servicio" id="c-out"><input className="in" type="number" min="0" value=${f.outOfService} onInput=${e=>set("outOfService",Number(e.target.value))}/><//></div><${Field} label="Sala / ubicación" id="c-room"><select className="sel" value=${f.roomId} onChange=${e=>set("roomId",e.target.value)}><option value="">Sin asignar</option>${db.rooms.map(r=>html`<option value=${r.id}>${r.name}</option>`)}</select><//>`:html`<${Field} label="Ubicación" id="c-loc"><input className="in" value=${f.location} onInput=${e=>set("location",e.target.value)}/><//><${Field} label="Capacidad" id="c-cap"><input className="in" type="number" min="1" value=${f.capacity} onInput=${e=>set("capacity",Number(e.target.value))}/><//>`}
 <${Field} label="Observaciones" id="c-notes"><textarea className="ta" value=${f.notes} onInput=${e=>set("notes",e.target.value)}></textarea><//>${src&&html`<${ConfirmBtn} label="Eliminar" onYes=${()=>{onRemove(collection,src.id);onClose()}}/>`}<//>`;
}

/* ---------- CALENDARIO ---------- */
const HOURS=[8,9,10,11,12,13,14,15,16,17,18,19,20,21];
function Calendar(){
  const {db,openSheet}=useC();
  const [off,setOff]=useState(0);
  const start=addDays(monday(new Date()),off*7);const end=addDays(start,6);
  const todayIso=iso(new Date());
  const days=[...Array(7)].map((_,i)=>addDays(start,i));
  const label="Semana "+isoWeek(start)+" · "+fmtShort(start)+" – "+fmtShort(end);
  const slotsAt=(d,h)=>db.slots.filter(s=>((s.recurrence!=="once"&&s.day===d)||(s.recurrence==="once"&&s.date===iso(days[d])))&&Number(s.time.slice(0,2))===h).sort((a,b)=>a.time.localeCompare(b.time));
  return html`<section className="screen">
    <${Header} title="Calendario" sub="Semana tipo con asistencia" right=${html`<button className="icon-btn" style=${{background:"var(--btn)",color:"var(--on-btn)"}} onClick=${()=>openSheet({k:"slotForm",day:dayIdx(new Date()),time:"10:00"})} aria-label="Nueva clase"><${Icon} n="plus"/></button>`}/>
    <div className="weeknav">
      <button className="icon-btn" onClick=${()=>setOff(o=>o-1)} aria-label="Semana anterior"><${Icon} n="l"/></button>
      <div className="lbl">${label}</div>
      ${off!==0&&html`<button className="btn-soft btn-sm" onClick=${()=>setOff(0)}>Hoy</button>`}
      <button className="icon-btn" onClick=${()=>setOff(o=>o+1)} aria-label="Semana siguiente"><${Icon} n="r"/></button>
    </div>
    <div className="grid-wrap" tabIndex="0" aria-label="Calendario semanal">
      <div className="cal">
        <div className="h"></div>
        ${days.map((d,i)=>html`<div key=${i} className=${"h"+(iso(d)===todayIso?" today":"")}>${DAYS[i]}<b>${d.getDate()}</b></div>`)}
        ${HOURS.map(h=>html`<${React.Fragment} key=${h}>
          <div className="hr">${pad(h)}:00</div>
          ${days.map((d,i)=>{
            const ss=slotsAt(i,h);
            return html`<div key=${i} className=${"cell"+(iso(d)===todayIso?" today":"")} role="button" tabIndex="0"
              aria-label=${"Añadir clase el "+DAYS_LONG[i]+" a las "+pad(h)+":00"}
              onClick=${()=>openSheet({k:"slotForm",day:i,time:pad(h)+":00"})}
              onKeyDown=${e=>{if(e.key==="Enter"&&e.target===e.currentTarget)openSheet({k:"slotForm",day:i,time:pad(h)+":00"})}}>
              ${ss.map(s=>{const pr=presentIds(db,s,iso(d)).length;
                return html`<button key=${s.id} className=${"slotchip"+(s.type==="Mat"?"":" ref")} onClick=${e=>{e.stopPropagation();openSheet({k:"slot",id:s.id,date:iso(d)})}}>
                  <b>${s.time}</b><span>${slotName(db,s)}</span><em>${s.students.length}/${s.capacity}${pr>0?" · ✓"+pr:""}</em></button>`})}
            </div>`})}
        <//>`)}
      </div>
    </div>
    <p className="hint">Toca una franja vacía para crear una clase o una clase para pasar lista. Las clases pueden ser puntuales o repetirse cada semana; la asistencia se guarda por fecha.</p>
  </section>`;
}

function SlotSheet({id,date,onClose}){
  const {db,up,say,openSheet}=useC();
  const s=db.slots.find(x=>x.id===id);
  const [adding,setAdding]=useState(false);
  if(!s)return null;
  const d=parseISO(date);
  const pres=db.attendance[id+"|"+date]||[];
  const enrolled=s.students.map(x=>db.students.find(y=>y.id===x)).filter(Boolean);
  const free=db.students.filter(x=>x.active&&!s.students.includes(x.id));
  const tpl=db.templates.find(x=>x.id===s.templateId);
  const exIds=tpl?tpl.blocks.flatMap(b=>b.items.map(i=>i.ex)):[];
  const warns=enrolled.map(st=>({st,names:[...new Set(exIds)].map(e=>db.exercises.find(x=>x.id===e)).filter(e=>e&&exConflicts(e,st).length>0).map(e=>e.name)})).filter(w=>w.names.length>0);
  const tp=sid=>up(d=>{const k=id+"|"+date;const a=d.attendance[k]||[];d.attendance[k]=a.includes(sid)?a.filter(x=>x!==sid):[...a,sid]});
  const enroll=sid=>{if(s.students.length>=s.capacity){say("La clase está completa");return}up(d=>{d.slots.find(x=>x.id===id).students.push(sid)})};
  const unenroll=sid=>up(d=>{const sl=d.slots.find(x=>x.id===id);sl.students=sl.students.filter(x=>x!==sid)});
  const nPres=enrolled.filter(st=>pres.includes(st.id)).length;
  const equipmentWarnings=(s.equipment||[]).map(req=>{const mat=db.inventory.find(m=>m.id===req.id);if(!mat)return null;const needed=req.perStudent?req.qty*enrolled.length:req.qty;const available=Math.max(0,mat.total-mat.outOfService);return {name:mat.name,needed,available,short:Math.max(0,needed-available)}}).filter(x=>x&&x.short>0);
  return html`<${Sheet} title=${slotName(db,s)} onClose=${onClose} footer=${html`<button className="btn-soft" onClick=${()=>openSheet({k:"slotForm",id:s.id})}><${Icon} n="pencil" size=${18}/>Editar clase</button><button className="btn-primary" onClick=${onClose}>Listo</button>`}>
    <div className="row wrap" style=${{gap:8}}>
      <span className="chip"><${Icon} n="cal" size=${14}/>${fmtLong(d)}</span><span className="chip"><${Icon} n="clock" size=${14}/>${s.time}</span>
      <span className=${"chip "+(s.type==="Mat"?"mat":"ref")}>${s.type}</span>
      ${tpl&&html`<span className="chip">${fmtMin(tplTotal(tpl))}</span>`}
    </div>
    ${s.students.length>s.capacity&&html`<${Alert}><b>Aforo superado</b><div>Hay ${s.students.length} alumnos inscritos para un aforo de ${s.capacity}. La clase permanece guardada, pero conviene ajustar el aforo o las inscripciones.</div><//>`}
    ${(()=>{const room=db.rooms.find(r=>r.id===s.roomId);return room&&s.capacity>room.capacity?html`<${Alert}><b>Capacidad de sala superada</b><div>${room.name} admite ${room.capacity} personas y la clase tiene aforo ${s.capacity}.</div><//>`:null})()}
    <div className="card">
      <div className="row" style=${{marginBottom:6}}>
        <div className="grow"><div className="label">Asistencia</div><div style=${{fontFamily:"var(--f-display)",fontSize:22,fontWeight:600}}>${nPres} de ${enrolled.length} presentes</div></div>
        <div style=${{textAlign:"right"}}><div className="label">Aforo</div><b style=${{fontVariantNumeric:"tabular-nums",fontSize:18}}>${s.students.length}/${s.capacity}</b></div>
      </div>
      ${enrolled.length===0?html`<p className="muted" style=${{padding:"10px 0"}}>Nadie inscrito todavía. Añade alumnos a esta clase.</p>`:
      enrolled.map(st=>{const on=pres.includes(st.id);return html`<div key=${st.id} className="row" style=${{borderBottom:"1px solid var(--line)"}}>
        <button className=${"att grow"+(on?" on":"")} style=${{borderBottom:0}} onClick=${()=>tp(st.id)} aria-pressed=${on}>
          <span className="tick"><${Icon} n="check" size=${16} sw=${3}/></span><${Avatar} name=${st.name} size=${36}/>
          <span className="grow"><b style=${{fontWeight:600}}>${st.name}</b>${st.pat.length>0&&html`<span className="small muted" style=${{display:"block"}}>${st.pat.map(patLabel).join(", ")}</span>`}</span></button>
        <button className="mini" onClick=${()=>unenroll(st.id)} aria-label=${"Quitar a "+st.name+" de la clase"}><${Icon} n="x" size=${16}/></button></div>`})}
    </div>
    <div className="card stack"><div className="label">Evaluación de la clase</div><div className="mood-picker">${[["good","🙂","Buena"],["neutral","😐","Normal"],["improvable","🙁","Mejorable"]].map(([k,face,label])=>html`<button type="button" className=${db.feedback[id+"|"+date]?.rating===k?"on":""} onClick=${()=>up(d=>{const key=id+"|"+date;d.feedback[key]={...(d.feedback[key]||{}),rating:k,completedAt:new Date().toISOString()}})}><span>${face}</span>${label}</button>`)}</div><textarea className="ta" placeholder="Comentario general: evolución del grupo, ajustes para la próxima clase…" value=${db.feedback[id+"|"+date]?.comment||""} onInput=${e=>up(d=>{const key=id+"|"+date;d.feedback[key]={...(d.feedback[key]||{}),comment:e.target.value,completedAt:new Date().toISOString()}})}></textarea></div>
    ${equipmentWarnings.length>0&&html`<${Alert}><b>Material insuficiente</b>${equipmentWarnings.map(x=>html`<div key=${x.name}>${x.name}: faltan ${x.short} (${x.available} disponibles, ${x.needed} necesarios)</div>`)}<//>`}
    ${warns.length>0&&html`<${Alert}><b>Revisa la plantilla con estas alumnas</b>${warns.map(w=>html`<div key=${w.st.id} style=${{marginTop:4}}>${w.st.name.split(" ")[0]}: ${w.names.join(", ")}</div>`)}<//>`}
    ${!adding?html`<button className="btn-soft" onClick=${()=>setAdding(true)} disabled=${s.students.length>=s.capacity}><${Icon} n="plus" size=${18}/>${s.students.length>=s.capacity?"Clase completa":"Inscribir alumno"}</button>`:
      html`<div className="card"><div className="row" style=${{marginBottom:6}}><div className="label grow">Alumnos disponibles</div><button className="mini" onClick=${()=>setAdding(false)} aria-label="Cerrar lista"><${Icon} n="x" size=${16}/></button></div>
        ${free.length===0?html`<p className="muted">Todos los alumnos activos ya están inscritos.</p>`:free.map(st=>html`<button key=${st.id} className="att" onClick=${()=>enroll(st.id)}>
          <${Avatar} name=${st.name} size=${34}/><span className="grow">${st.name}</span><span style=${{color:"var(--link)"}}><${Icon} n="plus" size=${18}/></span></button>`)}</div>`}
  <//>`;
}

function SlotForm({id,day,time,onClose}){
  const {db,up,say}=useC();
  const cur=db.slots.find(x=>x.id===id);
  const [f,setF]=useState(cur?{day:cur.day,time:cur.time,type:cur.type,templateId:cur.templateId||"",capacity:cur.capacity,recurrence:cur.recurrence||"weekly",date:cur.date||"",roomId:cur.roomId||"",equipment:cur.equipment||[]}:{day:day??0,time:time||"10:00",type:"Mat",templateId:db.templates[0]?db.templates[0].id:"",capacity:6,recurrence:"weekly",date:"",roomId:"",equipment:[]});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const enrolledCount=cur?.students?.length||0;
  const selectedRoom=db.rooms.find(r=>r.id===f.roomId);
  const capacityWarnings=[];
  if(enrolledCount>f.capacity)capacityWarnings.push(`Hay ${enrolledCount} alumnos inscritos y el aforo indicado es ${f.capacity}`);
  if(selectedRoom&&f.capacity>selectedRoom.capacity)capacityWarnings.push(`El aforo de la clase (${f.capacity}) supera la capacidad de ${selectedRoom.name} (${selectedRoom.capacity})`);
  const save=()=>{
    up(d=>{
      if(cur)Object.assign(d.slots.find(x=>x.id===id),{...f,templateId:f.templateId||null});
      else d.slots.push({id:uid(),...f,templateId:f.templateId||null,students:[]});
    });
    say(capacityWarnings.length?"Clase guardada con aviso de aforo":cur?"Clase actualizada":"Clase creada");onClose();
  };
  const remove=()=>{up(d=>{d.slots=d.slots.filter(x=>x.id!==id);for(const k in d.attendance)if(k.startsWith(id+"|"))delete d.attendance[k]});say("Clase eliminada");onClose();};
  return html`<${Sheet} title=${cur?"Editar clase":"Nueva clase"} onClose=${onClose} footer=${html`<button className="btn-soft" onClick=${onClose}>Cancelar</button><button className="btn-primary" onClick=${save} disabled=${!f.time}>Guardar</button>`}>
    <div className="field"><span className="lab">Repetición</span><div className="tags"><button type="button" className=${"chip btn"+(f.recurrence==="once"?" on":"")} onClick=${()=>set("recurrence","once")}>Clase puntual</button><button type="button" className=${"chip btn"+(f.recurrence==="weekly"?" on":"")} onClick=${()=>set("recurrence","weekly")}>Todas las semanas</button></div></div>
    ${f.recurrence==="once"&&html`<${Field} label="Fecha" id="sl-date"><input id="sl-date" className="in" type="date" value=${f.date} onChange=${e=>{set("date",e.target.value);if(e.target.value)set("day",dayIdx(parseISO(e.target.value)))}}/><//>`}
    <div className="field"><span className="lab">Día</span><div className="tags">${DAYS.map((l,i)=>html`<button key=${l} type="button" className=${"chip btn"+(f.day===i?" on":"")} onClick=${()=>set("day",i)}>${l}</button>`)}</div></div>
    <div className="two">
      <${Field} label="Hora de inicio" id="sl-hora"><input id="sl-hora" className="in" type="time" value=${f.time} onChange=${e=>set("time",e.target.value)}/><//>
      <div className="field"><span className="lab">Aforo máximo</span><div><${Stepper} value=${f.capacity} min=${1} max=${20} label="Aforo máximo" onChange=${v=>set("capacity",v)}/></div></div>
    </div>
    ${cur&&f.capacity<cur.students.length&&html`<p className="err">Hay ${cur.students.length} alumnos inscritos. Quita alguno antes de reducir el aforo.</p>`}
    <div className="field"><span className="lab">Aparato</span><div className="tags">${["Mat","Reformer"].map(o=>html`<button key=${o} type="button" className=${"chip btn"+(f.type===o?" on":"")} onClick=${()=>set("type",o)}>${o}</button>`)}</div></div>
    <${Field} label="Sala" id="sl-room"><select id="sl-room" className="sel" value=${f.roomId} onChange=${e=>set("roomId",e.target.value)}><option value="">Sin sala</option>${db.rooms.map(r=>html`<option value=${r.id}>${r.name} · capacidad ${r.capacity}</option>`)}</select><//>
    <div className="field"><span className="lab">Material necesario</span><div className="equipment-list">${db.inventory.map(m=>{const req=f.equipment.find(x=>x.id===m.id);const available=Math.max(0,m.total-m.outOfService);return html`<div className="equipment-row"><label><input type="checkbox" checked=${!!req} onChange=${e=>set("equipment",e.target.checked?[...f.equipment,{id:m.id,qty:1,perStudent:false}]:f.equipment.filter(x=>x.id!==m.id))}/>${m.name}<span className="small muted">${available} disp.</span></label>${req&&html`<input className="in mini-number" type="number" min="1" value=${req.qty} onInput=${e=>set("equipment",f.equipment.map(x=>x.id===m.id?{...x,qty:Number(e.target.value)}:x))}/><button className=${"chip btn"+(req.perStudent?" on":"")} onClick=${()=>set("equipment",f.equipment.map(x=>x.id===m.id?{...x,perStudent:!x.perStudent}:x))}>por alumno</button>`}</div>`})}</div></div>
    <${Field} label="Plantilla de clase" id="sl-tpl"><select id="sl-tpl" className="sel" value=${f.templateId} onChange=${e=>set("templateId",e.target.value)}>
      <option value="">Sin plantilla</option>${db.templates.map(t=>html`<option key=${t.id} value=${t.id}>${t.name} · ${fmtMin(tplTotal(t))}</option>`)}</select><//>
    ${capacityWarnings.length>0&&html`<${Alert}><b>Revisa el aforo</b>${capacityWarnings.map(x=>html`<div key=${x}>${x}. Puedes guardar igualmente.</div>`)}<//>`}
    ${cur&&html`<${ConfirmBtn} label="Eliminar clase" onYes=${remove}/>`}
  <//>`;
}


async function resizeLogo(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const canvas=document.createElement("canvas");canvas.width=160;canvas.height=160;const ctx=canvas.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,160,160);const scale=Math.min(160/image.width,160/image.height);const w=image.width*scale,h=image.height*scale;ctx.drawImage(image,(160-w)/2,(160-h)/2,w,h);resolve(canvas.toDataURL("image/jpeg",.72))};image.onerror=reject;image.src=reader.result};reader.onerror=reject;reader.readAsDataURL(file)})}

/* ---------- AJUSTES ---------- */
function Settings(){
  const {db,up,back,reset,runtime,say,open}=useC();
  const branding={...DEFAULT_BRANDING,...(db.settings?.branding||{})};
  const syncLabels={idle:"Sin conexión",loading:"Cargando datos",synced:"Sincronizado",saving:"Guardando cambios",error:"Error de sincronización"};
  const syncLabel=syncLabels[runtime.sync]||"Estado desconocido";
  const lastSync=runtime.lastSyncedAt?new Intl.DateTimeFormat("es-ES",{dateStyle:"medium",timeStyle:"short"}).format(new Date(runtime.lastSyncedAt)):"Todavía no disponible";
  const setBrand=(patch)=>up(d=>{d.settings={...d.settings,branding:{...DEFAULT_BRANDING,...(d.settings?.branding||{}),...patch}}});
  const uploadLogo=async(e)=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){say("El archivo supera 5 MB");return}try{setBrand({logoDataUrl:await resizeLogo(file)});say("Logotipo actualizado")}catch{say("No se pudo procesar el logotipo")}};
  const syncNow=async()=>{try{await window.pilatesCloud?.syncNow(db);say("Datos sincronizados")}catch{say("No se pudo sincronizar")}};
  const style={"--sage":branding.primaryColor,"--sage-soft":branding.accentColor};
  return html`<section className="screen" style=${style}>
    <button className="back" onClick=${back}><${Icon} n="l" size=${18}/>Volver</button>
    <header className="hd"><div className="hd-main"><h1>Ajustes</h1><p className="sub" style=${{textTransform:"none"}}>Personalización, conexión y versión de Pilario</p></div></header>

    <div className="sect"><h2>Tu espacio</h2></div>
    <div className="card stack">
      <div className="brand-preview">${branding.logoDataUrl?html`<img src=${branding.logoDataUrl} alt="Logotipo personalizado"/>`:html`<img src="./pilario-logo.png" alt="Logotipo Pilario"/>`}<div><strong>${branding.studioName||APP_INFO.name}</strong><span>${branding.instructorName||runtime.user?.name||"Instructor/a"}</span></div></div>
      <label>Nombre del instructor/a<input value=${branding.instructorName} placeholder=${runtime.user?.name||"Ej. Ángela"} onInput=${e=>setBrand({instructorName:e.target.value})}/></label>
      <label>Nombre del estudio<input value=${branding.studioName} placeholder="Ej. Espacio Ángela Pilates" onInput=${e=>setBrand({studioName:e.target.value})}/></label>
      <div className="color-grid"><label>Color principal<input type="color" value=${branding.primaryColor} onInput=${e=>setBrand({primaryColor:e.target.value})}/></label><label>Color suave<input type="color" value=${branding.accentColor} onInput=${e=>setBrand({accentColor:e.target.value})}/></label></div>
      <label className="file-label">Logotipo personalizado<input type="file" accept="image/png,image/jpeg,image/webp" onChange=${uploadLogo}/><span>Elegir imagen</span></label>
      ${branding.logoDataUrl&&html`<button className="btn-secondary" onClick=${()=>setBrand({logoDataUrl:""})}>Usar logotipo de Pilario</button>`}
      <p className="small muted">La personalización se guarda en la pestaña Config del archivo de datos.</p>
    </div>

    <div className="sect"><h2>Planificación laboral</h2></div><div className="card stack"><label>Horas contratadas por semana<input className="in" type="number" min="0" step="0.5" value=${db.settings.contractedHours||20} onInput=${e=>up(d=>{d.settings.contractedHours=Number(e.target.value)})}/></label><p className="small muted">Se comparan con las horas programadas en el resumen semanal.</p></div><div className="sect"><h2>Google Drive</h2></div>
    <div className="card stack">
      <div className="connection-title"><span className=${"connection-dot "+(runtime.sync==="error"?"error":runtime.sync==="saving"||runtime.sync==="loading"?"busy":"ok")}></span><div><strong>Google Drive conectado</strong><p className="small muted">${APP_INFO.dataFileName}</p></div></div>
      <div className="kv"><span className="k">Estado</span><span className="v">${syncLabel}</span></div>
      <div className="kv"><span className="k">Cuenta</span><span className="v">${runtime.user?.email||"Cuenta conectada"}</span></div>
      <div className="kv"><span className="k">Último guardado</span><span className="v">${lastSync}</span></div>
      <div className="settings-actions"><button className="btn-primary" onClick=${syncNow}><${Icon} n="cloud" size=${17}/>Sincronizar ahora</button>${window.pilatesCloud?.sheetUrl&&html`<a className="btn-secondary" href=${window.pilatesCloud.sheetUrl} target="_blank" rel="noreferrer">Abrir hoja de datos</a>`}<button className="btn-danger" onClick=${()=>window.pilatesCloud?.disconnect()}>Desconectar</button></div>
    </div>

    <div className="sect"><h2>Versión de la aplicación</h2></div>
    <div className="card stack"><div className="version-hero"><div><span className="version-number">v${APP_INFO.version}</span><strong>${APP_INFO.name}</strong></div><span className="small muted">${APP_INFO.releaseDate}</span></div><div className="kv"><span className="k">Desarrollador</span><span className="v">${APP_INFO.developer.name}</span></div><div className="kv"><span className="k">Contacto</span><span className="v"><a className="settings-link" href=${"mailto:"+APP_INFO.developer.email}>${APP_INFO.developer.email}</a></span></div></div>

    <div className="sect"><h2>Histórico de cambios</h2></div><div className="version-list">${VERSION_HISTORY.map((release,index)=>html`<article className=${"card version-card "+(index===0?"current":"")} key=${release.version}><div className="version-head"><div><span className="version-number">v${release.version}</span><strong>${release.title}</strong></div><span className="small muted">${release.date}</span></div><ul className="change-list">${release.changes.map(change=>html`<li key=${change}>${change}</li>`)}</ul></article>`)}</div>

    <div className="sect"><h2>Datos de ejemplo</h2></div><div className="card stack"><p className="small muted">Esta acción reemplaza los datos actuales por el conjunto de demostración.</p><${ConfirmBtn} label="Restablecer datos de ejemplo" icon="activity" onYes=${reset}/></div>
  </section>`;
}

/* ---------- APP ---------- */
const NAV=[["home","Inicio","home"],["alumnos","Alumnos","users"],["ej","Ejercicios","activity"],["plan","Clases","clip"],["center","Centro","sliders"],["cal","Calendario","cal"]];
function App({runtime}){
  const [db,setDb]=useState(()=>{const loaded=load();return {...loaded,settings:{...loaded.settings,branding:{...DEFAULT_BRANDING,...(loaded.settings?.branding||{})}}}});
  const [tab,setTab]=useState("home");
  const [stack,setStack]=useState([]);
  const [sheets,setSheets]=useState([]);
  const [toast,setToast]=useState("");
  const tRef=useRef(0);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(db)); window.pilatesCloud?.save(db)}catch(e){}},[db]);
  const up=useCallback(fn=>setDb(d=>{const n=structuredClone(d);fn(n);return n}),[]);
  const say=useCallback(m=>{setToast(m);clearTimeout(tRef.current);tRef.current=setTimeout(()=>setToast(""),2200)},[]);
  const screen=stack[stack.length-1]||null;
  const ctx=useMemo(()=>({db,up,say,screen,runtime,
    go:k=>{setStack([]);setSheets([]);setTab(k);window.scrollTo(0,0)},
    open:s=>{setStack(a=>[...a,s]);window.scrollTo(0,0)},
    back:()=>{setStack(a=>a.slice(0,-1));window.scrollTo(0,0)},
    openSheet:s=>setSheets(a=>[...a,s]),
    reset:()=>{const n=seed();setDb(n);setStack([]);setSheets([]);say("Datos de ejemplo restablecidos")}
  }),[db,up,say,screen,runtime]);
  const closeSheet=()=>setSheets(a=>a.slice(0,-1));
  const sheet=sheets[sheets.length-1];
  let view;
  if(screen){
    if(screen.k==="student")view=html`<${StudentDetail} key=${screen.id} id=${screen.id}/>`;
    else if(screen.k==="template")view=html`<${TemplateEditor} key=${screen.id} id=${screen.id}/>`;
    else if(screen.k==="center")view=html`<${CenterManagement}/>`; else view=html`<${Settings}/>`;
  }else{
    view={home:html`<${Home}/>`,alumnos:html`<${Students}/>`,ej:html`<${Exercises}/>`,plan:html`<${Planner}/>`,center:html`<${CenterManagement}/>` ,cal:html`<${Calendar}/>`}[tab];
  }
  let sv=null;
  if(sheet){
    const key=sheets.length+sheet.k+(sheet.id||"");
    if(sheet.k==="slot")sv=html`<${SlotSheet} key=${key} id=${sheet.id} date=${sheet.date} onClose=${closeSheet}/>`;
    else if(sheet.k==="slotForm")sv=html`<${SlotForm} key=${key} id=${sheet.id} day=${sheet.day} time=${sheet.time} onClose=${closeSheet}/>`;
    else if(sheet.k==="student")sv=html`<${StudentForm} key=${key} id=${sheet.id} onClose=${closeSheet}/>`;
    else if(sheet.k==="exercise")sv=html`<${ExerciseSheet} key=${key} id=${sheet.id} onClose=${closeSheet}/>`;
    else if(sheet.k==="exForm")sv=html`<${ExerciseForm} key=${key} id=${sheet.id} onClose=${closeSheet}/>`;
  }
  return html`<${Ctx.Provider} value=${ctx}>
    <main className="app" style=${{"--sage":db.settings.branding.primaryColor,"--sage-soft":db.settings.branding.accentColor}} key=${(screen?screen.k+(screen.id||""):tab)}>${view}</main>
    <nav className="nav" aria-label="Navegación principal"><div className="nav-in">
      ${NAV.map(([k,l,ic])=>html`<button key=${k} className=${!screen&&tab===k?"on":""} onClick=${()=>ctx.go(k)} aria-current=${!screen&&tab===k?"page":undefined}><i><${Icon} n=${ic} size=${21}/></i>${l}</button>`)}
    </div></nav>
    ${sv}
    ${toast&&html`<div className="toast" role="status">${toast}</div>`}
  <//>`;
}
export function LegacyApp(runtime){ return html`<${App} runtime=${runtime}/>`; }


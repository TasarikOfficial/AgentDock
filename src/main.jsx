import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, Bot, Boxes, Check, ChevronDown, Code2, Command, Cpu, LayoutDashboard, Play, Plus, Search, Settings, Sparkles, Terminal, Zap } from 'lucide-react';
import './styles.css';

const agents = [
  { name: 'Codex', model: 'GPT-5', color: '#84f1bf', status: 'Ready', latency: '1.2s' },
  { name: 'Claude Code', model: 'Sonnet', color: '#e8aa79', status: 'Ready', latency: '1.8s' },
  { name: 'Gemini CLI', model: '2.5 Pro', color: '#8ab4f8', status: 'Ready', latency: '1.5s' },
  { name: 'Ollama', model: 'Qwen 3', color: '#d5d8df', status: 'Local', latency: '0.4s' },
];

const initialRuns = [
  { title: 'Refactor authentication flow', agent: 'Codex', time: '2m ago', state: 'Completed', tokens: '18.2k' },
  { title: 'Review checkout edge cases', agent: 'Claude Code', time: '14m ago', state: 'Completed', tokens: '9.7k' },
  { title: 'Generate API documentation', agent: 'Gemini CLI', time: '31m ago', state: 'Completed', tokens: '12.4k' },
];

function Logo() { return <div className="logo"><div className="logoMark"><Command size={17}/></div><span>AgentDock</span><b>alpha</b></div> }

function App() {
  const [active, setActive] = useState('Dashboard');
  const [selected, setSelected] = useState(agents[0]);
  const [prompt, setPrompt] = useState('');
  const [runs, setRuns] = useState(() => JSON.parse(localStorage.getItem('agentdock-runs') || 'null') || initialRuns);
  const [running, setRunning] = useState(false);
  const [palette, setPalette] = useState(false);
  const totalTokens = useMemo(() => runs.reduce((n, r) => n + parseFloat(r.tokens), 0).toFixed(1), [runs]);

  useEffect(() => localStorage.setItem('agentdock-runs', JSON.stringify(runs)), [runs]);
  useEffect(() => {
    const handler = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPalette(v => !v); } };
    addEventListener('keydown', handler); return () => removeEventListener('keydown', handler);
  }, []);

  function runTask() {
    if (!prompt.trim() || running) return;
    setRunning(true);
    const task = { title: prompt.trim(), agent: selected.name, time: 'now', state: 'Running', tokens: '0.0k' };
    setRuns(r => [task, ...r]); setPrompt('');
    setTimeout(() => { setRuns(r => r.map((item, i) => i === 0 ? {...item, state: 'Completed', tokens: '4.8k'} : item)); setRunning(false); }, 1800);
  }

  return <div className="shell">
    <aside>
      <Logo />
      <nav>
        <Nav icon={LayoutDashboard} name="Dashboard" active={active} setActive={setActive}/>
        <Nav icon={Bot} name="Agents" active={active} setActive={setActive} badge="4"/>
        <Nav icon={Terminal} name="Runs" active={active} setActive={setActive}/>
        <Nav icon={Boxes} name="MCP Servers" active={active} setActive={setActive} badge="6"/>
      </nav>
      <div className="spacer" />
      <div className="usage"><span>Monthly usage</span><strong>34%</strong><div><i /></div><small>{totalTokens}k tokens used</small></div>
      <nav><Nav icon={Settings} name="Settings" active={active} setActive={setActive}/></nav>
      <div className="profile"><div className="avatar">T</div><div><strong>Tasarik</strong><small>Local workspace</small></div><ChevronDown size={15}/></div>
    </aside>

    <main>
      <header><div><span className="eyebrow">WORKSPACE / {active.toUpperCase()}</span><h1>{active}</h1></div><button className="search" onClick={()=>setPalette(true)}><Search size={15}/> Search or run a command <kbd>⌘ K</kbd></button><a className="iconBtn" href="https://github.com/TasarikOfficial/AgentDock" aria-label="GitHub"><Code2 size={19}/></a></header>
      <section className="hero">
        <div><span className="live"><i/> ALL SYSTEMS OPERATIONAL</span><h2>Ship with every<br/><em>agent at your side.</em></h2><p>One command center for Codex, Claude Code, Gemini CLI, and your local models.</p></div>
        <div className="orb"><div className="orbit o1"><i/></div><div className="orbit o2"><i/></div><div className="core"><Command size={27}/></div></div>
      </section>

      <section className="composer">
        <div className="selectAgent"><span className="agentDot" style={{background:selected.color}}/><select value={selected.name} onChange={e=>setSelected(agents.find(a=>a.name===e.target.value))}>{agents.map(a=><option key={a.name}>{a.name}</option>)}</select><span className="model">{selected.model}</span></div>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')runTask()}} placeholder="What should your agent build?" />
        <div className="composeBottom"><button className="ghost"><Plus size={16}/> Add context</button><span>Your files stay on your machine</span><button className="run" onClick={runTask} disabled={!prompt.trim()||running}>{running ? <Activity className="spin" size={16}/> : <Play size={15} fill="currentColor"/>}{running?'Running…':'Run task'} <kbd>⌘↵</kbd></button></div>
      </section>

      <div className="sectionHead"><div><h3>Your agents</h3><span>4 connected</span></div><button>Manage agents <span>→</span></button></div>
      <section className="agentGrid">{agents.map(a=><article className={selected.name===a.name?'selected':''} onClick={()=>setSelected(a)} key={a.name}><div className="agentIcon" style={{'--agent':a.color}}><Bot size={20}/></div><div><h4>{a.name}</h4><p>{a.model}</p></div><span className="status"><i/>{a.status}</span><dl><div><dt>Latency</dt><dd>{a.latency}</dd></div><div><dt>Runs today</dt><dd>{Math.floor(3+a.name.length)}</dd></div></dl></article>)}</section>

      <div className="sectionHead"><div><h3>Recent runs</h3><span>Synced locally</span></div><button onClick={()=>setRuns(initialRuns)}>Reset demo</button></div>
      <section className="runs">{runs.slice(0,5).map((r,i)=><div className="runRow" key={r.title+i}><div className="runGlyph">{r.state==='Completed'?<Check size={16}/>:<Activity className="spin" size={16}/>}</div><div className="runTitle"><strong>{r.title}</strong><span>{r.agent} · {r.time}</span></div><span className={`pill ${r.state.toLowerCase()}`}>{r.state}</span><span className="tokens">{r.tokens}</span><button>•••</button></div>)}</section>
    </main>

    {palette && <div className="overlay" onMouseDown={()=>setPalette(false)}><div className="palette" onMouseDown={e=>e.stopPropagation()}><div><Search size={18}/><input autoFocus placeholder="Search runs, agents, or commands…"/></div><span>QUICK ACTIONS</span>{['Create a new run','Connect an agent','Add MCP server','Open settings'].map((x,i)=><button key={x} onClick={()=>setPalette(false)}>{[Sparkles,Cpu,Zap,Settings].map((I,j)=>j===i&&<I key={j} size={17}/>)}{x}<kbd>↵</kbd></button>)}</div></div>}
  </div>
}

function Nav({icon:Icon,name,active,setActive,badge}) { return <button onClick={()=>setActive(name)} className={active===name?'active':''}><Icon size={17}/><span>{name}</span>{badge&&<b>{badge}</b>}</button> }

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);

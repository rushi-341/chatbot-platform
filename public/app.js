const api = async (path, opts={}) => {
  const res = await fetch(path, opts);
  if (!res.ok) {
    let msg = 'Request failed';
    try { const data = await res.json(); msg = data.error || JSON.stringify(data); } catch {}
    throw new Error(msg);
  }
  return res.json();
};
const setToken = (t) => { localStorage.setItem('token', t || ''); renderToken(); };
const getToken = () => localStorage.getItem('token') || '';
const authHeaders = () => ({ 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' });

function toast(message, type=''){
  const t = document.getElementById('toast');
  t.className = 'toast ' + (type || '');
  t.textContent = message;
  t.style.display = 'block';
  setTimeout(()=>{ t.style.display='none'; }, 2200);
}

function setBusy(id, busy){ const el = document.getElementById(id); if(!el) return; el.disabled = !!busy; el.style.opacity = busy ? .7 : 1; }
function renderToken(){
  const t = getToken();
  document.getElementById('token').textContent = t ? (t.slice(0,16) + '...') : '(not signed in)';
}

async function register(){
  try {
    setBusy('btnRegister', true);
    const email = document.getElementById('regEmail').value.trim();
    const name = document.getElementById('regName').value.trim();
    const password = document.getElementById('regPassword').value;
    await api('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, name, password })});
    toast('Account created', 'success');
  } catch(e){ toast(e.message, 'error'); } finally { setBusy('btnRegister', false); }
}

async function login(){
  try {
    setBusy('btnLogin', true);
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const res = await api('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
    setToken(res.token);
    await loadProjects();
    toast('Signed in', 'success');
  } catch(e){ toast(e.message, 'error'); } finally { setBusy('btnLogin', false); }
}

function setSelectedProjectLabel(){
  const sel = document.getElementById('projectSelect');
  const label = document.getElementById('selectedProject');
  label.textContent = sel.value ? (sel.options[sel.selectedIndex]?.text || sel.value) : '(none)';
}

async function loadProjects(){
  try {
    const res = await api('/api/projects', { headers: authHeaders() });
    const sel = document.getElementById('projectSelect');
    const list = document.getElementById('projectsList');
    sel.innerHTML = '';
    list.innerHTML = '';
    (res||[]).forEach(p => {
      const o = document.createElement('option'); o.value=p._id; o.textContent=p.name; sel.appendChild(o);
      const li = document.createElement('div'); li.className='list-item'; li.innerHTML = `<span>${p.name}</span><small>${new Date(p.createdAt).toLocaleDateString()}</small>`; list.appendChild(li);
    });
    setSelectedProjectLabel();
    await loadPrompts();
  } catch(e){ toast(e.message, 'error'); }
}

async function createProject(){
  try {
    setBusy('btnCreateProject', true);
    const name = document.getElementById('projectName').value.trim();
    const model = (document.getElementById('projectModel').value || '').trim() || undefined;
    await api('/api/projects', { method:'POST', headers: authHeaders(), body: JSON.stringify({ name, model }) });
    document.getElementById('projectName').value = '';
    await loadProjects();
    toast('Project created', 'success');
  } catch(e){ toast(e.message, 'error'); } finally { setBusy('btnCreateProject', false); }
}

async function loadPrompts(){
  const projectId = document.getElementById('projectSelect').value;
  const list = document.getElementById('promptsList');
  list.innerHTML = '';
  if(!projectId) return;
  try {
    const res = await api(`/api/projects/${projectId}/prompts`, { headers: authHeaders() });
    (res||[]).forEach(pr => {
      const li = document.createElement('div');
      li.className='list-item';
      li.innerHTML = `<span>${pr.title}</span><small>${new Date(pr.createdAt).toLocaleDateString()}</small>`;
      list.appendChild(li);
    });
  } catch(e){ toast(e.message, 'error'); }
}

async function addPrompt(){
  try {
    setBusy('btnAddPrompt', true);
    const projectId = document.getElementById('projectSelect').value;
    if(!projectId) return toast('Select a project', 'error');
    const title = document.getElementById('promptTitle').value.trim();
    const content = document.getElementById('promptContent').value.trim();
    await api(`/api/projects/${projectId}/prompts`, { method:'POST', headers: authHeaders(), body: JSON.stringify({ title, content }) });
    document.getElementById('promptTitle').value = '';
    document.getElementById('promptContent').value = '';
    await loadPrompts();
    toast('Prompt added', 'success');
  } catch(e){ toast(e.message, 'error'); } finally { setBusy('btnAddPrompt', false); }
}

function appendBubble(role, text){
  const log = document.getElementById('log');
  const el = document.createElement('div');
  el.className = 'bubble ' + role;
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

async function sendMessage(){
  const projectId = document.getElementById('projectSelect').value;
  const content = document.getElementById('chatInput').value.trim();
  if(!projectId) return toast('Select a project', 'error');
  if(!content) return;
  document.getElementById('chatInput').value = '';
  const btn = document.getElementById('btnSend');
  btn.disabled = true;
  appendBubble('user', content);
  try {
    const res = await api(`/api/chat/${projectId}`, { method:'POST', headers: authHeaders(), body: JSON.stringify({ message: content }) });
    appendBubble('assistant', res.reply || '(no reply)');
  } catch(e){ appendBubble('assistant', 'Error: ' + e.message); }
  finally { btn.disabled = false; }
}

// init
document.getElementById('projectSelect').addEventListener('change', ()=>{ setSelectedProjectLabel(); loadPrompts(); });
renderToken();



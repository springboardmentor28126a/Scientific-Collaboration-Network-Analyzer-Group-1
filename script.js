/* ---------------------------------------------------------------
   In-memory only. Nothing here talks to a server or persists
   beyond this browser tab, by design (frontend preview).
----------------------------------------------------------------*/

let currentUser = null;
let profile = { name:'', dept:'', inst:'', orcid:'', interests:[], skills:[], bio:'' };

function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  window.scrollTo({top:0, behavior:'instant'});
}

function initials(name){
  if(!name) return '--';
  return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('');
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- validation helpers ---------------- */
function setInvalid(fieldId, invalid){
  const el = document.getElementById(fieldId);
  if(invalid) el.classList.add('invalid'); else el.classList.remove('invalid');
}
function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

/* ---------------- login ---------------- */
document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  let ok = true;
  if(!isEmail(email)){ setInvalid('loginEmailField', true); ok = false; } else setInvalid('loginEmailField', false);
  if(pass.length < 6){ setInvalid('loginPasswordField', true); ok = false; } else setInvalid('loginPasswordField', false);
  if(!ok) return;

  currentUser = { name: email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c => c.toUpperCase()), email, role:'Researcher' };
  profile.name = currentUser.name;
  enterApp();
});

function mockOAuth(provider){
  currentUser = { name:'Guest Researcher', email:'guest@nexus.app', role:'Researcher' };
  profile.name = currentUser.name;
  showToast(provider + ' connection simulated for this preview.');
  setTimeout(enterApp, 500);
}

/* ---------------- register ---------------- */
document.getElementById('registerForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const role = document.getElementById('regRole').value;
  const email = document.getElementById('regEmail').value.trim();
  const inst = document.getElementById('regInst').value.trim();
  const dept = document.getElementById('regDept').value.trim();
  const pass = document.getElementById('regPassword').value;

  let ok = true;
  if(!name){ setInvalid('regNameField', true); ok = false; } else setInvalid('regNameField', false);
  if(!role){ setInvalid('regRoleField', true); ok = false; } else setInvalid('regRoleField', false);
  if(!isEmail(email)){ setInvalid('regEmailField', true); ok = false; } else setInvalid('regEmailField', false);
  if(!inst){ setInvalid('regInstField', true); ok = false; } else setInvalid('regInstField', false);
  if(!dept){ setInvalid('regDeptField', true); ok = false; } else setInvalid('regDeptField', false);
  if(pass.length < 6){ setInvalid('regPasswordField', true); ok = false; } else setInvalid('regPasswordField', false);
  if(!ok) return;

  currentUser = { name, email, role };
  profile = { name, dept, inst, orcid:'', interests:[], skills:[], bio:'' };
  enterApp();
});

/* ---------------- app shell ---------------- */
function enterApp(){
  document.getElementById('sideAvatar').textContent = initials(currentUser.name);
  document.getElementById('sideName').textContent = currentUser.name;
  document.getElementById('sideRole').textContent = currentUser.role;
  document.getElementById('welcomeName').textContent = 'Welcome, ' + currentUser.name.split(' ')[0];
  syncProfileToUI();
  showPage('app');
  showApp('overview');
}

function showApp(view){
  document.getElementById('app-overview').style.display = view === 'overview' ? 'block' : 'none';
  document.getElementById('app-profile').style.display = view === 'profile' ? 'block' : 'none';
  document.querySelectorAll('.side-nav-item').forEach(i => i.classList.remove('active'));
  const idx = view === 'overview' ? 0 : 1;
  document.querySelectorAll('.side-nav-item')[idx].classList.add('active');
  if(view === 'profile') syncProfileToForm();
  window.scrollTo({top:0, behavior:'instant'});
}

function signOut(){
  currentUser = null;
  profile = { name:'', dept:'', inst:'', orcid:'', interests:[], skills:[], bio:'' };
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
  showPage('landing');
}

/* ---------------- profile: tag inputs ---------------- */
function setupTagInput(wrapperId, fieldId, arrayKey){
  const wrapper = document.getElementById(wrapperId);
  const input = document.getElementById(fieldId);
  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && input.value.trim()){
      e.preventDefault();
      profile[arrayKey].push(input.value.trim());
      input.value = '';
      renderTags(wrapperId, fieldId, arrayKey);
    }
  });
}
function renderTags(wrapperId, fieldId, arrayKey){
  const wrapper = document.getElementById(wrapperId);
  const input = document.getElementById(fieldId);
  wrapper.querySelectorAll('.tag-chip').forEach(c => c.remove());
  profile[arrayKey].forEach((tag, i) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = tag + ' <button type="button" aria-label="Remove">&times;</button>';
    chip.querySelector('button').onclick = () => { profile[arrayKey].splice(i,1); renderTags(wrapperId, fieldId, arrayKey); };
    wrapper.insertBefore(chip, input);
  });
}
setupTagInput('interestsInput','interestsField','interests');
setupTagInput('skillsInput','skillsField','skills');

function syncProfileToForm(){
  document.getElementById('pName').value = profile.name || '';
  document.getElementById('pDept').value = profile.dept || '';
  document.getElementById('pInst').value = profile.inst || '';
  document.getElementById('pOrcid').value = profile.orcid || '';
  document.getElementById('pBio').value = profile.bio || '';
  document.getElementById('profileAvatar').textContent = initials(profile.name);
  document.getElementById('profileHeadName').textContent = profile.name || 'Unnamed researcher';
  document.getElementById('profileHeadMeta').textContent = [profile.dept, profile.inst].filter(Boolean).join(' \u00b7 ') || 'Add your department and institution';
  renderTags('interestsInput','interestsField','interests');
  renderTags('skillsInput','skillsField','skills');
}

function saveProfile(){
  profile.name = document.getElementById('pName').value.trim() || profile.name;
  profile.dept = document.getElementById('pDept').value.trim();
  profile.inst = document.getElementById('pInst').value.trim();
  profile.orcid = document.getElementById('pOrcid').value.trim();
  profile.bio = document.getElementById('pBio').value.trim();
  syncProfileToUI();
  showToast('Profile saved');
  showApp('overview');
}

function syncProfileToUI(){
  document.getElementById('overviewAvatar').textContent = initials(profile.name);
  document.getElementById('overviewName').textContent = profile.name || 'Unnamed researcher';
  document.getElementById('overviewMeta').textContent = [profile.dept, profile.inst].filter(Boolean).join(' \u00b7 ') || 'Department and institution not set';
  document.getElementById('sideName').textContent = profile.name || currentUser?.name || '\u2014';

  const skillsWrap = document.getElementById('overviewSkills');
  skillsWrap.innerHTML = '';
  profile.skills.slice(0,6).forEach(s => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.style.background = 'var(--amber-dim)';
    chip.style.color = 'var(--amber)';
    chip.textContent = s;
    skillsWrap.appendChild(chip);
  });
  if(profile.skills.length === 0){
    skillsWrap.innerHTML = '<span style="font-size:12.5px; color:var(--text-faint);">No skills added yet &mdash; head to My profile to add some.</span>';
  }

  const complete = profile.dept && profile.inst && profile.skills.length > 0;
  document.getElementById('statProfile').textContent = complete ? 'Complete' : 'Incomplete';
  document.getElementById('statProfile').style.color = complete ? 'var(--teal)' : 'var(--text)';
}

/* ---------------- hero network graph ---------------- */
(function drawGraph(){
  const svg = document.getElementById('heroGraph');
  const nodes = [
    {x:70,y:70,r:9,c:'#59D6C6'},{x:210,y:40,r:6,c:'#8C97B2'},{x:340,y:90,r:10,c:'#F2B84B'},
    {x:150,y:150,r:13,c:'#59D6C6'},{x:300,y:180,r:7,c:'#8C97B2'},{x:60,y:220,r:8,c:'#8C97B2'},
    {x:220,y:260,r:9,c:'#F2B84B'},{x:360,y:270,r:6,c:'#59D6C6'},{x:130,y:330,r:7,c:'#8C97B2'},
    {x:270,y:340,r:10,c:'#59D6C6'}
  ];
  const edges = [[0,3],[1,3],[2,3],[3,4],[3,5],[4,7],[5,6],[6,7],[6,8],[7,9],[6,9],[1,4]];
  let svgMarkup = '';
  edges.forEach(([a,b],i) => {
    const n1=nodes[a], n2=nodes[b];
    svgMarkup += `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="#2A3450" stroke-width="1.2">
      <animate attributeName="stroke" values="#2A3450;#3F6F6B;#2A3450" dur="${4+i%3}s" repeatCount="indefinite" begin="${i*0.3}s"/>
    </line>`;
  });
  nodes.forEach((n,i) => {
    svgMarkup += `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.c}" opacity="0.9">
      <animate attributeName="r" values="${n.r};${n.r+2};${n.r}" dur="${3+i%4}s" repeatCount="indefinite" begin="${i*0.2}s"/>
    </circle>`;
  });
  svg.innerHTML = svgMarkup;
})();

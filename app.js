const sizes = [60,80,100,120,140,160,180,190];
const shadeEl = document.getElementById('shade'); // Shade (first in final code)
const sizeEl = document.getElementById('size');   // Power
const drinkEl = document.getElementById('drink'); // Drink (third in final code)
const glassEl = document.getElementById('glass');
const slotsEl = document.getElementById('slots');
const numbersEl = document.getElementById('numbers');
const codeEl = document.getElementById('code');
const graphicalEl = document.getElementById('graphical');
const copyBtn = document.getElementById('copy');

const booleans = ['ice','coffie','milk','sugar','coco','cream','foam'];
const boolEls = {};
booleans.forEach(id=>boolEls[id]=document.getElementById(id));

// populate sizes (power)
sizes.forEach(s=>{
  const o = document.createElement('option'); o.textContent = s; o.value = s; sizeEl.appendChild(o);
});
// populate glass types 1-12 with names
const glassNames = {
  1:'Pint',2:'Lowball',3:'Highball',4:'Shot',5:'Snifter',6:'Flute',
  7:'Margarita',8:'Hurricane',9:'Mug',10:'Stein',11:'Martini',12:'Cocktail'
};
for(let i=1;i<=12;i++){
  const o = document.createElement('option'); o.value = i; o.textContent = `${i} — ${glassNames[i]}`; glassEl.appendChild(o);
}

// fixed 4 colors (no duplicates), each value 0-5
const colors = ['Red','Green','Blue','White'];
const colorHex = { Red:'#ff5b5b', Green:'#53d17a', Blue:'#63b3ff', White:'#f5f5f5' };

// slot state will be fixed order: Red, Green, Blue, White
const slotState = colors.map((c,i)=>({ color: c, value: 0 }));

// build UI slots: one per color (no color picker), value 0-5
slotsEl.innerHTML = '';
slotState.forEach((s, idx)=>{
  const div = document.createElement('div'); div.className='slot';
  const dot = document.createElement('div'); dot.className='color'; dot.style.background = colorHex[s.color];
  const label = document.createElement('div'); label.textContent = s.color; label.style.color = '#bbb'; label.style.fontSize='13px'; label.style.width='64px';
  const selNum = document.createElement('select');
  for(let v=0; v<=5; v++){ const o=document.createElement('option'); o.value = v; o.text = v; selNum.appendChild(o); }
  selNum.value = s.value;
  div.appendChild(dot);
  div.appendChild(label);
  div.appendChild(selNum);
  slotsEl.appendChild(div);

  selNum.addEventListener('change', e=>{
    s.value = parseInt(e.target.value,10);
    render();
  });
});

// render number tiles for color preview: digits 0-5
function renderNumbers(){
  numbersEl.innerHTML='';
  for(let n=0;n<=5;n++){
    const el = document.createElement('div'); el.className='num';
    el.dataset.value = n;
    el.textContent = n;
    const dot = document.createElement('div'); dot.className='dot'; dot.style.display='none';
    el.appendChild(dot);
    numbersEl.appendChild(el);
  }
}

// update dots: place colored dot behind the digit corresponding to each color value
function renderDots(){
  const nums = Array.from(numbersEl.querySelectorAll('.num'));
  nums.forEach(el=>{
    const d = el.querySelector('.dot');
    d.style.display='none';
    d.textContent='';
  });
  // slotState order is Red,Green,Blue,White
  slotState.forEach((s)=>{
    const el = nums.find(x=>parseInt(x.dataset.value,10) === s.value);
    if(!el) return;
    const d = el.querySelector('.dot');
    d.style.background = colorHex[s.color];
    d.style.display='block';
  });
}

// build color segment as 4 digits (R G B W) like "5034"
function buildColorSegment(){
  return slotState.map(s=>String(s.value)).join('');
}

// build binary 7-digit section for the add-ons in the given order: Ice,Coffie,Milk,Sugar,Coco,Cream,Foam
function buildBinarySection(){
  return booleans.map(id=> boolEls[id].checked ? '1' : '0').join('');
}

 // Final code structure: Shade-Power-Drink-Colors-addon(binary)-GlassType
 function buildCode(){
   const part1 = shadeEl.value;    // Shade (first)
   const part2 = sizeEl.value;     // Power
   const part3 = drinkEl.value;    // Drink (third)
   const colorSeg = buildColorSegment();
   const bin = buildBinarySection();
   const glass = glassEl.value;
   return `${part1}-${part2}-${part3}-${colorSeg}-${bin}-${glass}`;
 }

 // apply preset: expecting Shade-Power-Drink-Colors(4 digits)-binary-glass
 function applyPreset(code){
   if(!code) return;
   const parts = code.split('-');
   if(parts.length < 6) return;
   // parts: shade - power - drink - colorDigits - bin - glass
   shadeEl.value = parts[0] || shadeEl.value;
   sizeEl.value = parts[1] || sizeEl.value;
   drinkEl.value = parts[2] || drinkEl.value;
   const colorDigits = parts[3] || '';
   const bin = parts[4] || '';
   const glass = parts[5] || '';

  // parse color digits: must be exactly 4 digits 0-5; map in order Red,Green,Blue,White
  if(/^[0-5]{4}$/.test(colorDigits)){
    for(let i=0;i<4;i++){
      slotState[i].value = parseInt(colorDigits[i],10);
      // update corresponding select in DOM
      const sel = slotsEl.querySelectorAll('select')[i];
      if(sel) sel.value = slotState[i].value;
    }
  }

  // binary bits
  if(bin.length >= booleans.length){
    booleans.forEach((id,i)=>{ boolEls[id].checked = bin[i] === '1'; });
  }
  if(glass) glassEl.value = glass;
  render();
}

function renderGraphical(){
  // build graphical representation of the fourth segment (colors) in order Red,Green,Blue,White
  const colorSeg = buildColorSegment(); // e.g. "5034"
  graphicalEl.innerHTML = '';
  const map = slotState.map(s=>s.color); // ["Red","Green","Blue","White"]
  for(let i=0;i<colorSeg.length;i++){
    const ch = colorSeg[i] || '0';
    const span = document.createElement('div');
    span.className = 'g-digit';
    span.textContent = ch;
    // map to colorHex by slot order
    const col = colorHex[ map[i] ] || '#222';
    span.style.background = col;
    // ensure contrast for white
    if(map[i] === 'White') span.style.color = '#111';
    graphicalEl.appendChild(span);
  }
}

function buildSVGMarkup(){
  // Build an SVG that renders the full code as text (for preview).
  const fullCode = buildCode(); // e.g. RL-120-Se-5034-0000001-7
  const parts = fullCode.split('-');
  const shade = parts[0] || '';
  const power = parts[1] || '';
  const drink = parts[2] || '';
  const colorSeg = parts[3] || '';
  const bin = parts[4] || '';
  const glass = parts[5] || '';

  // layout params
  const padding = 12;
  const fontSize = 18;
  const charWidth = 12; // approx monospace width

  // build left and right text segments
  const leftText = `${shade}-${power}-${drink}-`;
  const rightText = `-${bin}-${glass}`;

  // compute widths
  const leftWidth = leftText.length * charWidth;
  const colorDigitsWidth = colorSeg.length * (charWidth + 6);
  const rightWidth = rightText.length * charWidth;
  const width = padding*2 + leftWidth + colorDigitsWidth + rightWidth;
  const height = padding*2 + fontSize + 6;

  const y = padding + fontSize;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<style> .mono { font: ${fontSize}px monospace; fill:#e6e6e6; } .muted { fill:#9a9a9a } </style>`;

  // left text (uncolored)
  svg += `<text class="mono" x="${padding}" y="${y}">${escapeXml(leftText)}</text>`;

  // draw each color-digit as colored text in its slot color (centered in an approximate box)
  let cx = padding + leftWidth;
  for(let i=0;i<colorSeg.length;i++){
    const ch = colorSeg[i] || '0';
    const slot = slotState[i];
    const hex = colorHex[ slot.color ] || '#222';
    const rectW = charWidth + 6;
    const rectX = cx + 2;
    const tx = rectX + rectW/2;
    const textFill = hex;
    const stroke = (slot.color === 'White') ? '#111' : 'none';
    const strokeWidth = (slot.color === 'White') ? 0.5 : 0;

    svg += `<text x="${tx}" y="${y}" font-family="monospace" font-size="${fontSize}" text-anchor="middle" font-weight="700" fill="${textFill}"${stroke !== 'none' ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : ''}>${escapeXml(String(ch))}</text>`;

    cx += rectW;
  }

  // right text (uncolored)
  const rightX = cx + 6;
  svg += `<text class="mono" x="${rightX}" y="${y}">${escapeXml(rightText)}</text>`;

  svg += `</svg>`;
  return svg;
}

// Build a Krita-friendly <text> fragment that uses nested <tspan> with color styles for the color-segment digits.
// Example output:
// <text style="fill:#ffffff; font-family:Noto Sans; font-size:24; font-weight:700"><tspan x="0">RL-120-Se-<tspan style="fill:#ff0000">5</tspan><tspan style="fill:#00ff00">0</tspan><tspan style="fill:#0000ff">3</tspan><tspan style="fill:#f5f5f5">4</tspan>-0000001-7</tspan></text>
function buildKritaText(){
  const fullCode = buildCode();
  const parts = fullCode.split('-');
  const shade = parts[0] || '';
  const power = parts[1] || '';
  const drink = parts[2] || '';
  const colorSeg = parts[3] || '';
  const bin = parts[4] || '';
  const glass = parts[5] || '';

  // Base text style (you can adjust font-family/size to taste)
  const baseStyle = 'fill:#ffffff; font-family:Noto Sans; font-size:24; font-weight:700';

  const leftText = `${shade}-${power}-${drink}-`;
  const rightText = `-${bin}-${glass}`;

  // Build colored tspans for each color-digit in order Red, Green, Blue, White
  let colorTspans = '';
  for(let i=0;i<colorSeg.length;i++){
    const ch = escapeXml(String(colorSeg[i] || '0'));
    const slot = slotState[i];
    const hex = colorHex[ slot.color ] || '#222';
    // ensure the white color uses the same hex as defined (colorHex.White)
    colorTspans += `<tspan style="fill:${hex}">${ch}</tspan>`;
  }

  // Wrap to match the user's requested structure: a parent <text> containing a <tspan x="0"> with leftText + nested colored tspans + rightText
  const kritaText = `<text style="${baseStyle}"><tspan x="0">${escapeXml(leftText)}${colorTspans}${escapeXml(rightText)}</tspan></text>`;
  return kritaText;
}

function escapeXml(unsafe){
  return unsafe.replace(/[&<>"']/g, function(c){
    switch(c){
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&apos;';
    }
  });
}

function render(){
  renderNumbers();
  renderDots();
  codeEl.textContent = buildCode();
  renderGraphical();

  // SVG preview & markup
  const svg = buildSVGMarkup();
  const svgPreview = document.getElementById('svgPreview');
  const svgText = document.getElementById('svgText');
  if(svgPreview) svgPreview.innerHTML = svg;
  if(svgText) svgText.value = buildKritaText();
}

// wire up events
[shadeEl,sizeEl,drinkEl,glassEl].forEach(el=>el.addEventListener('change', render));
Object.values(boolEls).forEach(el=>el.addEventListener('change', render));

// preset input & apply
const presetEl = document.getElementById('preset');
const applyBtn = document.getElementById('applyPreset');
if(applyBtn){
  applyBtn.addEventListener('click', ()=> applyPreset(presetEl.value.trim()));
  presetEl.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') applyPreset(presetEl.value.trim()); });
}

copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(codeEl.textContent || '');
    copyBtn.textContent='Copied';
    setTimeout(()=>copyBtn.textContent='Copy',900);
  }catch(e){}
});

// SVG copy button
const copySvgBtn = document.getElementById('copySvg');
if(copySvgBtn){
  copySvgBtn.addEventListener('click', async ()=>{
    const svgText = document.getElementById('svgText');
    if(!svgText) return;
    try{
      await navigator.clipboard.writeText(svgText.value || '');
      copySvgBtn.textContent = 'Copied';
      setTimeout(()=>copySvgBtn.textContent='Copy SVG',900);
    }catch(e){}
  });
}

render();
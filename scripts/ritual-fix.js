/** CrisisCore: ritual engine hardener */
const fs=require('fs');
const targets=[
  'assets/trauma-visualizer.js',
  'assets/js/ritual-engine/core/trauma-assessment.js',
  'assets/js/ritual-engine/vectors/narrative-assessment.js'
];
for(const f of targets){
  if(!fs.existsSync(f)) continue;
  let s=fs.readFileSync(f,'utf8');
  // Damping + clamp
  if(/coherence\s*=/.test(s) && !/Math\.pow\(coherence,0\.85\)/.test(s)){
    s=s.replace(/(coherence\s*=\s*[^;]+;)/, `$1
  // CrisisCore: damping + clamp
  coherence=Math.pow(coherence,0.85);
  coherence=Math.max(0.30,Math.min(0.95,coherence));`);
  }
  // Observer compensation
  if(!/observer compensation/.test(s) && /(options\?.(visualized|isObserving)|visualized)/.test(s)){
    s=s.replace(/(coherence\s*=\s*[^;]+;)/, `$1
  // CrisisCore: observer compensation
  if(options?.visualized||options?.isObserving){
    coherence = coherence + (1 - coherence) * 0.15;
    coherence = Math.min(0.95, coherence);
  }`);
  }
  // Freeze outward returns
  if(/return\s*\{/.test(s) && !/Object\.freeze\(/.test(s)){
    s=s.replace(/return\s*\{([\s\S]*?)\}/g,'return Object.freeze({$1})');
  }
  fs.writeFileSync(f,s);
}
console.log("Ritual engine hardened (existing files).");

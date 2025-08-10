/** CrisisCore: collapse-vector scanner (grep-based) */
const { execSync } = require('node:child_process');
const run = (cmd) => { try { return execSync(cmd,{stdio:['ignore','pipe','ignore']}).toString(); } catch { return ''; } };
const g = (pat, dir='.') => run(`grep -REn --exclude-dir=node_modules --binary-files=without-match '${pat}' ${dir}`);

let bad = false;
// 1) Randomness in control flow
const rand = g(String.raw`\bif\s*\([^)]*Math\.random\(|Math\.random\(\)\s*[<>]=?`, 'assets js src');
if (rand){ console.log('CRITICAL: Math.random() in control path:\n'+rand); bad = true; }
// 2) Mutable state getters
const mutGet = g(String.raw`get\w*\s*\(\)[\s\S]{0,200}\{\s*return\s+(this\.|STATE)`, 'assets js src');
if (mutGet){ console.log('CRITICAL: Getter returns mutable state:\n'+mutGet); bad = true; }
// 3) Potential publish→publish cascade
const cascade = g(String.raw`NeuralBus\.publish\(.*\n{0,10}.*NeuralBus\.publish`, 'assets/js');
if (cascade){ console.log('CRITICAL: Possible event cascade:\n'+cascade); bad = true; }

process.exit(bad ? 1 : 0);

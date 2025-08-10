/** CrisisCore ESM scanner (grep-based) */
import { execSync } from 'node:child_process';
const run = (cmd) => { try { return execSync(cmd, {stdio:['ignore','pipe','ignore']}).toString(); } catch { return ''; } };
const g = (pat, dirs=['assets','js','src']) => run(`grep -REn --exclude-dir=node_modules --binary-files=without-match '${pat}' ${dirs.join(' ')}`);

let bad = false;
// 1) Randomness in control flow
const rand = g(String.raw`\bif\s*\([^)]*Math\.random\(|Math\.random\(\)\s*[<>]=?`);
if (rand) { console.log('CRITICAL: Math.random() in control path:\n'+rand); bad = true; }
// 2) Mutable state getters
const mut = g(String.raw`get\w*\s*\(\)[\s\S]{0,200}\{\s*return\s+(this\.|STATE)`);
if (mut) { console.log('CRITICAL: Getter returns mutable state:\n'+mut); bad = true; }
// 3) Potential publish→publish cascade
const cas = g(String.raw`NeuralBus\.publish\(.*\n{0,10}.*NeuralBus\.publish`, ['assets/js']);
if (cas) { console.log('CRITICAL: Possible event cascade:\n'+cas); bad = true; }

process.exit(bad ? 1 : 0);

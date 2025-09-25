function l(t){if(!t||t.length===0)return"";const o=Object.keys(t[0]),r=o.join(","),c=t.map(e=>o.map(a=>{const n=e[a];return n==null?"":typeof n=="object"?'"'+JSON.stringify(n).replace(/"/g,'""')+'"':'"'+String(n).replace(/"/g,'""')+'"'}).join(","));return[r,...c].join(`
`)}function s(t,o){const r=new Blob([o],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(r),e=document.createElement("a");e.href=c,e.download=t,document.body.appendChild(e),e.click(),e.remove(),URL.revokeObjectURL(c)}export{s as downloadCsv,l as entriesToCsv};
//# sourceMappingURL=exportCsv-Dmvr2UaE.js.map

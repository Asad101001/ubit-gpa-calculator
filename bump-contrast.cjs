const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Bump text contrast
app = app.replace(/text-slate-500/g, 'text-slate-600');
app = app.replace(/text-slate-400/g, 'text-slate-500');
app = app.replace(/text-slate-300/g, 'text-slate-400');
app = app.replace(/text-slate-200/g, 'text-slate-300');

// Bump border contrast
app = app.replace(/border-slate-200/g, 'border-slate-300');
app = app.replace(/border-slate-300\/60/g, 'border-slate-300');

// Bump background opacities for glass elements so they stand out more against slate-50
app = app.replace(/bg-white\/40/g, 'bg-white/70');
app = app.replace(/bg-white\/50/g, 'bg-white/80');
app = app.replace(/bg-white\/60/g, 'bg-white/90');
app = app.replace(/bg-white\/30/g, 'bg-white/60');

fs.writeFileSync('src/App.tsx', app);

let index = fs.readFileSync('src/index.css', 'utf8');
index = index.replace(/bg-white\/40/g, 'bg-white/70');
index = index.replace(/bg-white\/60/g, 'bg-white/80');
index = index.replace(/bg-white\/50/g, 'bg-white/80');
index = index.replace(/border-slate-200/g, 'border-slate-300');
index = index.replace(/border-slate-300/g, 'border-slate-400');
index = index.replace(/shadow-\[0_8px_32px_0_rgba\(0,0,0,0\.3\)\]/g, 'shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]');
fs.writeFileSync('src/index.css', index);

console.log("Bumped contrast!");

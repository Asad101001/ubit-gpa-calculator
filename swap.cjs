const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Colors and Text
app = app.replace(/text-white\/90/g, 'text-slate-800');
app = app.replace(/text-white\/80/g, 'text-slate-700');
app = app.replace(/text-white\/70/g, 'text-slate-600');
app = app.replace(/text-white\/60/g, 'text-slate-500');
app = app.replace(/text-white\/50/g, 'text-slate-500');
app = app.replace(/text-white\/40/g, 'text-slate-400');
app = app.replace(/text-white\/30/g, 'text-slate-400');
app = app.replace(/text-white\/20/g, 'text-slate-300');
app = app.replace(/text-white/g, 'text-slate-900');

// Borders
app = app.replace(/border-white\/20/g, 'border-slate-300');
app = app.replace(/border-white\/10/g, 'border-slate-200');
app = app.replace(/border-white\/5/g, 'border-slate-200\/60');
app = app.replace(/border-white\/\[0\.05\]/g, 'border-slate-200\/50');
app = app.replace(/border-white\/\[0\.08\]/g, 'border-slate-200\/80');

// Backgrounds
app = app.replace(/bg-white\/20/g, 'bg-white\/80');
app = app.replace(/bg-white\/10/g, 'bg-white\/60');
app = app.replace(/bg-white\/5/g, 'bg-white\/40');
app = app.replace(/bg-white\/\[0\.03\]/g, 'bg-white\/30');
app = app.replace(/bg-white\/\[0\.08\]/g, 'bg-white\/50');

// Specific Overrides
app = app.replace(/bg-\[#1c120c\]/g, 'bg-slate-50');
app = app.replace(/bg-black\/40/g, 'bg-white\/60');
app = app.replace(/bg-black\/80/g, 'bg-slate-800'); // Tooltips
app = app.replace(/bg-black\/20/g, 'bg-white\/50'); // Inputs
app = app.replace(/bg-black\/10/g, 'bg-slate-100\/50');

// Blobs and Gradients
app = app.replace(/bg-brand-600\/10/g, 'bg-emerald-400\/20');
app = app.replace(/bg-amber-700\/10/g, 'bg-teal-400\/20');
app = app.replace(/bg-orange-600\/10/g, 'bg-emerald-300\/20'); 
app = app.replace(/from-brand-900\/30/g, 'from-emerald-50');
app = app.replace(/to-amber-900\/30/g, 'to-teal-50');
app = app.replace(/via-\[#1c120c\]/g, 'via-slate-50');
app = app.replace(/from-\[#1c120c\]/g, 'from-slate-50');
app = app.replace(/to-\[#1c120c\]/g, 'to-slate-50');

// Remove Wood Image
app = app.replace(/<img[^>]*https:\/\/images\.unsplash\.com\/photo-1551269901-5c5e14c25df7[^>]*>/g, '');
// Also remove the global overlay
app = app.replace(/<div\s+className="absolute inset-0 opacity-\[0\.25\] mix-blend-luminosity"[^>]*><\/div>/g, '');
// Regex above might not match exactly due to nested elements or line breaks. 
// A simpler way:
app = app.replace(/style={{ backgroundImage: "url\('https:\/\/images\.unsplash\.com\/photo-1551269901-5c5e14c25df7\?ixlib=rb-4\.0\.3&auto=format&fit=crop&w=1920&q=80'\)", backgroundSize: 'cover', backgroundPosition: 'center' }}/g, '');
app = app.replace(/src="https:\/\/images\.unsplash\.com\/photo-1551269901-5c5e14c25df7\?ixlib=rb-4\.0\.3&auto=format&fit=crop&w=1920&q=80"/g, '');

fs.writeFileSync('src/App.tsx', app);

let index = fs.readFileSync('src/index.css', 'utf8');
index = index.replace(/bg-white\/\[0\.03\]/g, 'bg-white\/40');
index = index.replace(/border-white\/\[0\.05\]/g, 'border-slate-200');
index = index.replace(/bg-surface\/50/g, 'bg-white\/60');
index = index.replace(/border-white\/\[0\.08\]/g, 'border-slate-200');
index = index.replace(/bg-black\/20/g, 'bg-white\/50');
index = index.replace(/border-white\/\[0\.1\]/g, 'border-slate-300');
index = index.replace(/bg-white\/10/g, 'bg-slate-300'); // Scrollbar
index = index.replace(/text-white/g, 'text-slate-900');
fs.writeFileSync('src/index.css', index);

console.log("Replaced!");

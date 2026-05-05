const fs = require('fs');
const path = 'src/pages/DashboardPremium.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace main backgrounds
content = content.replace(/bg-\[#020617\]/g, 'bg-[#F8FAFC] dark:bg-[#020617]');

// Replace card backgrounds (which are currently bg-[#111a2f] or bg-[#0f172a])
content = content.replace(/bg-\[#111a2f\]/g, 'bg-white dark:bg-[#0F172A]');
content = content.replace(/bg-\[#0f172a\]/g, 'bg-white dark:bg-[#0f172a]');
content = content.replace(/bg-gradient-to-br from-\[#0f172a\] to-blue-950/g, 'bg-gradient-to-br from-white to-slate-50 dark:from-[#0f172a] dark:to-blue-950');

// Sidebar and Header specific
content = content.replace(/dark:bg-\[#050810\]/g, 'dark:bg-[#050810]'); // It already has dark:bg. Need to replace the bg-[#0f172a] which is done above.
// Header is bg-[#020617]/80 backdrop-blur-md -> bg-[#F8FAFC]/80 dark:bg-[#020617]/80
content = content.replace(/bg-\[#020617\]\/80/g, 'bg-[#F8FAFC]/80 dark:bg-[#020617]/80');
content = content.replace(/bg-\[#111a2f\]\/80/g, 'bg-white/80 dark:bg-[#111a2f]/80');
content = content.replace(/bg-\[#111a2f\]\/50/g, 'bg-white/50 dark:bg-[#111a2f]/50');

// Text main (white to slate-900)
// Warning: "text-white" might be used inside dark mode buttons. So replace text-white with text-slate-900 dark:text-white
content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');

// Text secondary
content = content.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/text-slate-300/g, 'text-slate-600 dark:text-slate-300');
content = content.replace(/text-slate-200/g, 'text-slate-700 dark:text-slate-200');
content = content.replace(/text-gray-400/g, 'text-slate-500 dark:text-gray-400');
content = content.replace(/text-gray-300/g, 'text-slate-600 dark:text-gray-300');
content = content.replace(/text-gray-200/g, 'text-slate-700 dark:text-gray-200');

// Borders
content = content.replace(/border-\[#1e293b\]/g, 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)]');
content = content.replace(/border-\[rgba\(255,255,255,0\.05\)\]/g, 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)]');
content = content.replace(/border-\[rgba\(255,255,255,0\.06\)\]/g, 'border-[rgba(15,23,42,0.08)] dark:border-[rgba(255,255,255,0.06)]');
content = content.replace(/border-white\/10/g, 'border-slate-900/10 dark:border-white/10');
content = content.replace(/border-t-\[rgba\(255,255,255,0\.06\)\]/g, 'border-t-[rgba(15,23,42,0.08)] dark:border-t-[rgba(255,255,255,0.06)]');

// SVG stroke and lines
content = content.replace(/text-\[#FFD700\]/g, 'text-[#D4AF37] dark:text-[#FFD700]');
content = content.replace(/text-\[#F4E7C5\]/g, 'text-[#D4AF37] dark:text-[#FFD700]');
content = content.replace(/text-\[#C9A227\]/g, 'text-[#D4AF37] dark:text-[#FFD700]');
content = content.replace(/text-\[#eab308\]/g, 'text-[#D4AF37] dark:text-[#eab308]');

// Fix dynamic classes that might have been messed up
content = content.replace(/dark:dark:/g, 'dark:');

// Special case for 'bg-[#0b1120]' (used in table header and some stats)
content = content.replace(/bg-\[#0b1120\]/g, 'bg-slate-50 dark:bg-[#0b1120]');
content = content.replace(/bg-\[#0b1120\]\/50/g, 'bg-slate-50/50 dark:bg-[#0b1120]/50');

// Special case for stats dynamic colors, like bg-[#0b1120] border-red-800/60
// They are defined in JS objects, so the regex above will catch them.

// Fix tooltips and small elements bg
content = content.replace(/bg-white dark:bg-\[#111a2f\]/g, 'bg-white dark:bg-[#111a2f]'); // Keep as is if already there
// Wait, we replaced bg-[#111a2f] -> bg-white dark:bg-[#0F172A].
// The code had `bg-white dark:bg-[#111a2f]`. This would become `bg-white dark:bg-white dark:bg-[#0F172A]`.
content = content.replace(/dark:bg-white dark:bg-\[#0F172A\]/g, 'dark:bg-[#0F172A]');
content = content.replace(/dark:text-slate-900 dark:text-white/g, 'dark:text-white');
content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');
content = content.replace(/text-slate-500 dark:text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/text-slate-600 dark:text-slate-600 dark:text-slate-300/g, 'text-slate-600 dark:text-slate-300');
content = content.replace(/text-slate-700 dark:text-slate-700 dark:text-slate-200/g, 'text-slate-700 dark:text-slate-200');

fs.writeFileSync(path, content);

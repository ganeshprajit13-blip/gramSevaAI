const fs = require('fs');
const path = require('path');

const targetFile = path.join(process.cwd(), 'app', 'admin', 'dashboard', 'page.tsx');

let code = fs.readFileSync(targetFile, 'utf8');

// 1. Add store imports
if (!code.includes('getStoredAnnouncements')) {
  code = code.replace(
    "import { getStoredResidents, computeCentralMetrics } from '@/lib/resident-store'",
    "import { getStoredResidents, computeCentralMetrics } from '@/lib/resident-store'\nimport { getStoredAnnouncements, saveAnnouncement, deleteAnnouncement, type AnnouncementRecord } from '@/lib/announcement-store'\nimport { getStoredComplaints, updateComplaintStatus, type ComplaintRecord } from '@/lib/complaint-store'"
  );
}

// 2. Remove Certificates button from tab navigation
code = code.replace(
  `<button onClick={() => navigateToTab('certificates')} className={\`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer \${activeTab === 'certificates' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}\`}>Certificates</button>`,
  ''
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Updated app/admin/dashboard/page.tsx imports and tabs.');

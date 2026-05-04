const fs   = require('fs');
const path = require('path');

const IS_VERCEL = !!process.env.VERCEL;
const DB_PATH   = IS_VERCEL
  ? '/tmp/school-data.json'
  : path.join(__dirname, 'school-data.json');

const SEED = {
  faculty: [
    { id:1, name:'Mrs. Lakshmi Devi',  subject:'Mathematics',    qualification:'M.Sc, B.Ed',            experience_years:18, photo_placeholder:'LD' },
    { id:2, name:'Mr. Ravi Shankar',   subject:'Physics',        qualification:'M.Sc Physics, B.Ed',    experience_years:14, photo_placeholder:'RS' },
    { id:3, name:'Mrs. Anitha Kumari', subject:'English',        qualification:'MA English, B.Ed',      experience_years:20, photo_placeholder:'AK' },
    { id:4, name:'Mr. Suresh Babu',    subject:'Chemistry',      qualification:'M.Sc Chemistry, B.Ed',  experience_years:11, photo_placeholder:'SB' },
    { id:5, name:'Mrs. Priya Nair',    subject:'Biology',        qualification:'M.Sc Botany, B.Ed',     experience_years:9,  photo_placeholder:'PN' },
    { id:6, name:'Mr. Venkat Rao',     subject:'Social Studies', qualification:'MA History, B.Ed',      experience_years:16, photo_placeholder:'VR' },
  ],
  notices: [
    { id:1, title:'Annual Day Celebrations',   content:'Annual Day will be held on 15th January 2025. All students are requested to participate in cultural programs. Parents are cordially invited to attend the grand celebration.',       category:'Event',   created_at:new Date(Date.now()-1*86400000).toISOString() },
    { id:2, title:'Winter Vacation Schedule',  content:'School will remain closed from 25th December to 2nd January for Winter Vacations. Classes resume on 3rd January 2025.',                                                            category:'Holiday', created_at:new Date(Date.now()-2*86400000).toISOString() },
    { id:3, title:'Class X Pre-Board Exams',   content:'Pre-board examinations for Class X begin from 10th January 2025. Students are advised to collect their admit cards from the office. Timetable is on the notice board.',            category:'Exam',    created_at:new Date(Date.now()-3*86400000).toISOString() },
    { id:4, title:'New Library Books Arrival', content:'Over 500 new books have been added to the school library across Science, Literature and General Knowledge. Students can borrow from Monday onwards.',                              category:'General', created_at:new Date(Date.now()-4*86400000).toISOString() },
  ],
  enquiries:  [],
  contacts:   [],
  _counters:  { faculty:6, notices:4, enquiries:0, contacts:0 },
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch(e) {
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED, null, 2));
    return JSON.parse(JSON.stringify(SEED));
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const db = {
  all(table)        { return [...(load()[table] || [])].reverse(); },
  insert(table, row) {
    const data = load();
    data._counters[table] = (data._counters[table] || 0) + 1;
    const newRow = { id: data._counters[table], created_at: new Date().toISOString(), ...row };
    data[table].push(newRow);
    save(data);
    return newRow;
  },
  delete(table, id) {
    const data = load();
    const before = data[table].length;
    data[table] = data[table].filter(r => r.id !== id);
    save(data);
    return data[table].length < before;
  },
  count(table) { return (load()[table] || []).length; },
};

module.exports = db;

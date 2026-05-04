const express = require('express');
const path    = require('path');
const db      = require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/notices', (req, res) => {
  try { res.json({ success:true, data: db.all('notices') }); }
  catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.get('/api/faculty', (req, res) => {
  try { res.json({ success:true, data: db.all('faculty').reverse() }); }
  catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.post('/api/enquiries', (req, res) => {
  try {
    const { parent_name, student_name, class_applying, phone, email, message } = req.body;
    if (!parent_name || !student_name || !class_applying || !phone)
      return res.status(400).json({ success:false, message:'Please fill all required fields.' });
    db.insert('enquiries', { parent_name, student_name, class_applying, phone, email:email||'', message:message||'' });
    res.json({ success:true, message:'Thank you! We will contact you within 24 hours.' });
  } catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ success:false, message:'Please fill all required fields.' });
    db.insert('contacts', { name, email, phone:phone||'', subject, message });
    res.json({ success:true, message:'Message sent! We will get back to you shortly.' });
  } catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.get('/api/admin/stats', (req, res) => {
  try {
    res.json({ success:true, data:{
      enquiries: db.count('enquiries'),
      contacts:  db.count('contacts'),
      notices:   db.count('notices'),
      faculty:   db.count('faculty'),
    }});
  } catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.get('/api/admin/enquiries', (req, res) => {
  try { res.json({ success:true, data: db.all('enquiries') }); }
  catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.get('/api/admin/contacts', (req, res) => {
  try { res.json({ success:true, data: db.all('contacts') }); }
  catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.post('/api/notices', (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content || !category)
      return res.status(400).json({ success:false, message:'All fields required.' });
    const notice = db.insert('notices', { title, content, category });
    res.json({ success:true, data:notice, message:'Notice added successfully.' });
  } catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.delete('/api/notices/:id', (req, res) => {
  try {
    const deleted = db.delete('notices', parseInt(req.params.id, 10));
    if (!deleted) return res.status(404).json({ success:false, message:'Not found.' });
    res.json({ success:true, message:'Notice deleted successfully.' });
  } catch(e) { res.status(500).json({ success:false, message:'Failed.' }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🏫  Server → http://localhost:${PORT}\n`);
  });
}

module.exports = app;

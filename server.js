const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/calls', async (req, res) => {
    const { data, error } = await supabase.from('calls').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/calls/result', async (req, res) => {
    const { callId, currentStage, notes } = req.body;
    const { data, error } = await supabase
        .from('calls')
        .upsert({ id: callId, current_stage: currentStage, transcript_notes: notes });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Result updated successfully', data });
});

app.post('/api/calls/close', async (req, res) => {
    const { callId, status } = req.body;
    const { data, error } = await supabase
        .from('calls')
        .update({ call_status: status })
        .eq('id', callId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Call closed successfully', data });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import { exec } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

// 1. System Stats API (CPU, RAM, Battery)
app.get('/api/stats', async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const battery = await si.battery();
    
    res.json({
      cpu: Math.round(cpu.currentLoad),
      ram: Math.round((mem.active / mem.total) * 100),
      battery: battery.hasBattery ? battery.percent : 100,
      isCharging: battery.isCharging
    });
  } catch (error) {
    res.status(500).json({ error: "Stats fetch failed" });
  }
});

// 2. Quick Tools API (Shutdown, Lock, etc)
app.post('/api/action', (req, res) => {
  const { action } = req.body;
  
  if (action === 'shutdown') {
    exec('shutdown /s /t 0'); // Windows shutdown
  } else if (action === 'lock') {
    exec('rundll32.exe user32.dll,LockWorkStation'); // Windows lock
  } else if (action === 'screenshot') {
    // Screenshot ka code thoda lamba hai, baad mein add karenge
    return res.json({ message: "Screenshot feature coming soon!" });
  }

  res.json({ message: `${action} command executed successfully!` });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`MYRA Backend running on port ${PORT}`));

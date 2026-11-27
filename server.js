import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import { exec } from 'child_process';
import screenshot from 'screenshot-desktop';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// 1. System Stats
app.get('/api/stats', async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const battery = await si.battery();
    res.json({ cpu: Math.round(cpu.currentLoad), ram: Math.round((mem.active / mem.total) * 100), battery: battery.hasBattery ? battery.percent : 100 });
  } catch (error) { res.status(500).json({ error: "Stats failed" }); }
});

// 2. Action Commands (50 Features)
app.post('/api/action', async (req, res) => {
  const { action } = req.body;
  let command = '';
  let responseMsg = `${action} executed!`;

  switch (action) {
    case 'lock': command = 'rundll32.exe user32.dll,LockWorkStation'; break;
    case 'shutdown': command = 'shutdown /s /t 0'; break;
    case 'restart': command = 'shutdown /r /t 0'; break;
    case 'sleep': command = 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0'; break;
    case 'open_chrome': command = 'start chrome'; break;
    case 'open_vscode': command = 'code'; break;
    case 'open_notepad': command = 'start notepad'; break;
    case 'open_calc': command = 'start calc'; break;
    case 'open_cmd': command = 'start cmd'; break;
    case 'task_manager': command = 'start taskmgr'; break;
    case 'empty_bin': command = 'PowerShell.exe -NoProfile -Command "Clear-RecycleBin -Force"'; break;
    case 'volume_up': command = 'nircmd changesysvolume 5000'; break; // Requires nircmd.exe
    case 'volume_down': command = 'nircmd changesysvolume -5000'; break;
    case 'mute': command = 'nircmd mutesysvolume 2'; break;
    
    // Screenshot Logic
    case 'screenshot':
      try {
        const imgPath = './public/assets/screenshot.png';
        await screenshot({ filename: imgPath });
        return res.json({ message: 'Screenshot saved!', image: '/assets/screenshot.png' });
      } catch (err) { return res.status(500).json({ error: 'Screenshot failed' }); }

    default:
      return res.status(400).json({ error: 'Unknown action' });
  }

  exec(command, (error) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: responseMsg });
  });
});

// 3. Smart AI Web Search (Google)
app.post('/api/search', (req, res) => {
  const { query } = req.body;
  exec(`start https://www.google.com/search?q=${encodeURIComponent(query)}`);
  res.json({ message: `Searching Google for ${query}` });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`MYRA Backend running on port ${PORT}`));

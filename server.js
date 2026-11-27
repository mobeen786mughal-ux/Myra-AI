import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import { exec } from 'child_process';
import screenshot from 'screenshot-desktop';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Real-Time System Stats
app.get('/api/stats', async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const battery = await si.battery();
    const cpuTemp = await si.cpuTemperature();
    const disk = await si.fsSize();
    
    res.json({
      cpu: Math.round(cpu.currentLoad),
      ram: Math.round((mem.active / mem.total) * 100),
      battery: battery.hasBattery ? battery.percent : 100,
      cpuTemp: cpuTemp.main || 0,
      diskUsage: disk[0] ? Math.round(disk[0].use) : 0,
      uptime: Math.round(si.time().uptime / 3600) // Hours
    });
  } catch (error) {
    res.status(500).json({ error: "Stats failed" });
  }
});

// 2. 50 Features Action API
app.post('/api/action', async (req, res) => {
  const { action } = req.body;
  let command = '';
  let responseMsg = `Executed ${action}`;

  // Windows PowerShell aur CMD commands ka istemal
  switch (action) {
    // --- SYSTEM & PC CONTROL ---
    case 'lock': command = 'rundll32.exe user32.dll,LockWorkStation'; break;
    case 'shutdown': command = 'shutdown /s /t 0'; break;
    case 'restart': command = 'shutdown /r /t 0'; break;
    case 'sleep': command = 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0'; break;
    case 'empty_bin': command = 'PowerShell.exe -NoProfile -Command "Clear-RecycleBin -Force"'; break;
    case 'task_manager': command = 'start taskmgr'; break;
    case 'volume_up': command = 'powershell -c "(new-object -com wscript.shell).SendKeys([char]175)"'; break;
    case 'volume_down': command = 'powershell -c "(new-object -com wscript.shell).SendKeys([char]174)"'; break;
    case 'mute': command = 'powershell -c "(new-object -com wscript.shell).SendKeys([char]173)"'; break;
    case 'brightness_up': command = 'powershell (Add-Type "[DllImport(\\"user32.dll\\")]^public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);" -Name a -Pas)::SendMessage(-1,0x319,0,0x2700)'; break;
    
    // --- APP & WEB AUTOMATION ---
    case 'open_chrome': command = 'start chrome'; break;
    case 'open_vscode': command = 'code'; break;
    case 'open_notepad': command = 'start notepad'; break;
    case 'open_calc': command = 'start calc'; break;
    case 'open_cmd': command = 'start cmd'; break;
    case 'open_explorer': command = 'start explorer'; break;
    case 'open_downloads': command = 'start %USERPROFILE%\\Downloads'; break;
    case 'open_whatsapp': command = 'start whatsapp:'; break;

    // --- MEDIA CONTROL ---
    case 'play_pause': command = 'powershell -c "(new-object -com wscript.shell).SendKeys([char]179)"'; break;
    case 'next_track': command = 'powershell -c "(new-object -com wscript.shell).SendKeys([char]176)"'; break;
    case 'prev_track': command = 'powershell -c "(new-object -com wscript.shell).SendKeys([char]177)"'; break;
    case 'system_beep': command = 'powershell [console]::beep(1000,500)'; break;

    // --- SCREENSHOT ---
    case 'screenshot':
      try {
        const imgPath = './public/assets/screenshot.png';
        await screenshot({ filename: imgPath });
        return res.json({ message: 'Screenshot saved in assets!', image: '/assets/screenshot.png' });
      } catch (err) { return res.status(500).json({ error: 'Screenshot failed' }); }

    default:
      return res.status(400).json({ error: 'Action not mapped in backend' });
  }

  exec(command, (error) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: responseMsg });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`MYRA Backend running on port ${PORT}`));

const Jimp = require('jimp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function convertIcon() {
  try {
    const inputPath = path.join(__dirname, 'public', 'assets', 'App_icon.jpg');
    const outputPath = path.join(__dirname, 'public', 'assets', 'App_icon.ico');

    if (!fs.existsSync(inputPath)) {
      console.log('App_icon.jpg nahi mili, default icon use hoga.');
      return;
    }

    console.log('Converting App_icon.jpg to App_icon.ico automatically...');
    
    // Image read karo aur 256x256 size mein resize karo
    const image = await Jimp.read(inputPath);
    image.resize(256, 256); 
    
    // JPG ko PNG buffer mein convert karo
    const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    
    // PNG buffer ko ICO mein convert karo
    const icoBuffer = await pngToIco(pngBuffer);
    
    // ICO file save karo
    fs.writeFileSync(outputPath, icoBuffer);
    console.log('✅ Icon successfully converted to App_icon.ico!');
  } catch (error) {
    console.error('❌ Icon conversion failed:', error);
  }
}

convertIcon();

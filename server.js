const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/download', (req, res) => {
    const { url, type } = req.body;

    if (!url || !type) return res.status(400).json({ error: 'URL ou tipo ausente' });

    const fileName = `download_${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    const outputPath = path.join(__dirname, fileName);

    const cmd = type === 'audio'
        ? `python -m yt_dlp --cookies cookies.txt -x --audio-format mp3 -o "${outputPath}" "${url}"`
        : `python -m yt_dlp --cookies cookies.txt -f best -o "${outputPath}" "${url}"`;

    exec(cmd, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao baixar vídeo' });
        }

        // Envia o arquivo pro navegador
        res.download(outputPath, fileName, (err) => {
            if (err) console.error('Erro ao enviar:', err);
        });

        // Apaga o arquivo após 10 minutos (600 mil milissegundos)
        setTimeout(() => {
            fs.unlink(outputPath, (err) => {
                if (err) {
                    console.error('Erro ao apagar arquivo:', err);
                } else {
                    console.log(`🔥 Arquivo ${fileName} apagado após 10 minutos`);
                }
            });
        }, 10 * 60 * 1000);
    });
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
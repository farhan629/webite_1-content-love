const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3001; // Use 3001 to avoid conflicts with 'serve'

const server = http.createServer((req, res) => {
    // API Endpoints
    if (req.method === 'POST' && req.url === '/sync') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const configContent = `window.CONFIG = ${JSON.stringify(data, null, 4)};`;
                
                // Update local config.js
                const configPath = path.join(__dirname, 'js', 'config.js');
                fs.writeFileSync(configPath, configContent);
                console.log('✅ Local config.js updated!');

                // Clear Git Lock
                const lockPath = path.join(__dirname, '.git', 'index.lock');
                if (fs.existsSync(lockPath)) {
                    fs.unlinkSync(lockPath);
                    console.log('🔓 Git lock removed.');
                }

                // Push to GitHub
                exec('git add . && git commit -m "Auto-update from Admin Panel" && git push origin main --force', (err, stdout, stderr) => {
                    if (err) {
                        console.error('❌ Git Error:', err.message);
                        res.writeHead(500);
                        res.end('Git Sync Failed: ' + err.message);
                        return;
                    }
                    console.log('✨ Successfully synced to GitHub!');
                    res.writeHead(200);
                    res.end('Synced Successfully!');
                });
            } catch (e) {
                console.error('❌ Sync Error:', e.message);
                res.writeHead(500);
                res.end('Server Error: ' + e.message);
            }
        });
        return;
    }

    // Health check for Admin UI
    if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200);
        res.end('Connected');
        return;
    }

    // Static File Server Fallback
    let url = req.url.split('?')[0];
    let filePath = path.join(__dirname, url === '/' ? 'index.html' : url);
    const extname = path.extname(filePath);
    
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4'
    };

    const contentType = contentTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end('Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n💖 Romantic Sync Server is LIVE!`);
    console.log(`🔗 Access locally at: http://localhost:${PORT}/admin.html\n`);
});

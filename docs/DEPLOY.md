# Panduan Deployment (DEPLOY.md)

Dokumen ini menjelaskan prosedur deployment aplikasi Commit Confessional untuk dua jalur infrastruktur yang didukung: server self-hosted milik rekan tim dan Vercel (opsi cadangan).

---

## Jalur 1: Server Self-Hosted Milik Rekan Tim

Infrastruktur berbasis Linux (Ubuntu LTS atau Debian) dengan runtime Node.js LTS, reverse proxy ber-HTTPS, dan process manager.

### 1. Prasyarat Server
- **Runtime:** Node.js LTS (v20.x atau v22.x) dan npm.
- **Git & Kredensial Akses:** Deploy key (SSH read-only) yang ditambahkan ke repositori GitHub privat (`Teaquilla/Commit-Confessional`).
- **Jaringan & Port:** Port 80 (HTTP) dan 443 (HTTPS) terbuka ke internet publik.

### 2. Langkah Instalasi & Build
```bash
# Clone repositori menggunakan SSH deploy key
git clone git@github.com:Teaquilla/Commit-Confessional.git /var/www/commit-confessional
cd /var/www/commit-confessional

# Pasang dependensi tepat sesuai lockfile
npm ci

# Siapkan environment variables di server (jangan commit berkas ini)
cat << 'EOF' > .env.local
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL_NAME=gemini-3.5-flash-lite
NODE_ENV=production
EOF

# Jalankan build produksi
npm run build
```

### 3. Process Manager (Pilih pm2 atau systemd)

#### Opsi A: pm2
```bash
# Instal pm2 global jika belum ada
npm install -g pm2

# Jalankan aplikasi dengan nama unik
pm2 start npm --name "commit-confessional" -- start

# Simpan konfigurasi agar otomatis berjalan saat reboot
pm2 save
pm2 startup
```

*Perintah Restart:*
```bash
pm2 restart commit-confessional
```

#### Opsi B: systemd
Buat berkas service di `/etc/systemd/system/commit-confessional.service`:
```ini
[Unit]
Description=Commit Confessional Next.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/commit-confessional
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

*Aktivasi dan Restart:*
```bash
sudo systemctl daemon-reload
sudo systemctl enable commit-confessional
sudo systemctl start commit-confessional
# Perintah restart:
sudo systemctl restart commit-confessional
```

### 4. Konfigurasi Reverse Proxy (Pilih Nginx atau Caddy)

#### Opsi A: Nginx
Konfigurasi Nginx di `/etc/nginx/sites-available/commit-confessional`:
```nginx
# Rate limiting zone per IP untuk melindungi endpoint dari banjir trafik
limit_req_zone $binary_remote_addr zone=confess_limit:10m rate=10r/m;

server {
    server_name your-domain.com;

    # Format log akses standar (TIDAK merekam body request)
    access_log /var/log/nginx/confess.access.log combined;
    error_log /var/log/nginx/confess.error.log warn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout baca proxy disetel 35 detik (di atas batas 28 detik Next.js)
        proxy_read_timeout 35s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 35s;
    }

    # Pembatasan laju khusus untuk rute inferensi AI
    location /api/confess {
        limit_req zone=confess_limit burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 35s;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

#### Opsi B: Caddy
Berkas `Caddyfile`:
```caddy
your-domain.com {
    # Otomatis menangani sertifikat HTTPS via Let's Encrypt / ZeroSSL

    # Logging akses tanpa body
    log {
        output file /var/log/caddy/access.log
        format console
    }

    # Proxy ke aplikasi lokal dengan transport timeout
    reverse_proxy 127.0.0.1:3000 {
        transport http {
            read_timeout 35s
        }
    }
}
```

---

## Jalur 2: Vercel (Cadangan / Fallback)

Deployment langsung menggunakan platform cloud Vercel:

1. **Impor Repositori:**
   - Masuk ke dashboard Vercel (`https://vercel.com`).
   - Hubungkan akun GitHub dan pilih repositori privat `Teaquilla/Commit-Confessional`.
   - Framework preset otomatis terdeteksi sebagai `Next.js`.
2. **Environment Variables:**
   - Buka bagian *Environment Variables* di pengaturan proyek Vercel:
     - `GEMINI_API_KEY`: Kunci API Google AI Studio yang valid.
     - `AI_MODEL_NAME`: `gemini-3.5-flash-lite`.
3. **Catatan Durasi Eksekusi (`maxDuration`):**
   - Rute `/api/confess` telah menetapkan `export const maxDuration = 30;` di `src/app/api/confess/route.ts`.
   - Pada Vercel Free (Hobby) Plan, durasi Serverless Function default adalah 10–15 detik, sedangkan total request timeout aplikasi adalah 28 detik. Jika menggunakan akun Vercel Pro, `maxDuration` hingga 60 detik berlaku penuh. Jika pada Hobby Plan terjadi timeout, prioritaskan Jalur 1 (Server Self-Hosted).

---

## Checklist Deployment dari Spesifikasi Teknis (devpost/spec.md Bagian 4)

- [ ] Project-specific Gemini API key created with a hard spending quota configured at the provider before deployment; verify and record the evidence.
- [ ] Ports 80 and 443 open with valid SSL/TLS certificate.
- [ ] Reverse proxy read timeout set to 35 seconds (`proxy_read_timeout 35s;`).
- [ ] Per-IP rate limiting configured (e.g. in reverse proxy or middleware) to protect the API endpoint.
- [ ] Access logging configured so that request bodies are never stored in log files.
- [ ] Service restart command verified (`pm2 restart commit-confessional` atau `systemctl restart commit-confessional`).
- [ ] Verification that the public URL is reachable from an external network.

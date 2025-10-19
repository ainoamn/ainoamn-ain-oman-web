#!/bin/bash
# setup-vps.sh - إعداد VPS لاستضافة Ain Oman Web
# شغّل هذا السكريبت على السيرفر مرة واحدة

echo "🔧 إعداد VPS لـ Ain Oman Web..."

# 1. تحديث النظام
echo "📦 تحديث النظام..."
sudo apt update
sudo apt upgrade -y

# 2. تثبيت Node.js 18
echo "📦 تثبيت Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. تثبيت PM2
echo "📦 تثبيت PM2..."
sudo npm install -g pm2

# 4. تثبيت Nginx
echo "📦 تثبيت Nginx..."
sudo apt install -y nginx

# 5. إعداد Firewall
echo "🔒 إعداد Firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# 6. إنشاء مجلد التطبيق
echo "📁 إنشاء مجلد التطبيق..."
sudo mkdir -p /var/www/ain-oman-web
sudo chown -R $USER:$USER /var/www/ain-oman-web

# 7. إعداد Nginx
echo "⚙️  إعداد Nginx..."
sudo tee /etc/nginx/sites-available/ain-oman-web > /dev/null <<'EOF'
server {
    listen 80;
    server_name byfpro.com www.byfpro.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 8. تفعيل الموقع
sudo ln -sf /etc/nginx/sites-available/ain-oman-web /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 9. تثبيت SSL (اختياري - يتطلب دومين مربوط)
echo "🔒 هل تريد تثبيت SSL مجاني من Let's Encrypt؟ (y/n)"
read -r install_ssl
if [ "$install_ssl" = "y" ]; then
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d byfpro.com -d www.byfpro.com
fi

echo ""
echo "✅ تم إعداد VPS بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. ارفع ملف ain-oman-web.tar.gz إلى /var/www/ain-oman-web"
echo "2. فك الضغط: cd /var/www/ain-oman-web && tar -xzf ain-oman-web.tar.gz"
echo "3. شغّل التطبيق: pm2 start npm --name ain-oman-web -- start"
echo "4. احفظ إعدادات PM2: pm2 save && pm2 startup"
echo ""
echo "🌐 الموقع سيكون متاح على: http://byfpro.com"


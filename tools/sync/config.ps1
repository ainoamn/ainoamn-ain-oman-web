# tools/sync/config.ps1
# ========= إعدادات عامة =========

# 1) مسار مشروعك المحلي (مكان العمل)
$LocalPath = "C:\dev\ain-oman-web"

# 2) Google Drive — قاعدتك كما ذكرت: G:\My Drive\dev
$DriveBase = "G:\My Drive\dev"
$DriveProjectRelative = "ain-oman-web"
$DriveFullPath = Join-Path $DriveBase $DriveProjectRelative

# 3) GitHub (استبدل USERNAME باسم حسابك)
$GitRemote = "https://github.com/USERNAME/ain-oman-web.git"
$GitBranch = "main"

# 4) استثناءات أثناء مزامنة Drive
$ExcludeDirs  = @("node_modules", ".next", "dist", "out", "coverage", ".git", ".vscode")
$ExcludeFiles = @(".env", ".env.local", "prisma\dev.db", "*.log", "Thumbs.db", ".DS_Store")

# 5) مجلد السجلات
$LogDir = Join-Path $LocalPath "tools\sync\logs"
New-Item -ItemType Directory -Force $LogDir | Out-Null

# ========= أدوات مساعدة =========
function Test-Git() { return [bool](Get-Command git -ErrorAction SilentlyContinue) }
function Ensure-Dir($p) { if (-not (Test-Path $p)) { New-Item -ItemType Directory -Force $p | Out-Null } }

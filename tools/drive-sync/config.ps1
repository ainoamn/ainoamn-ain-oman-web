# tools/drive-sync/config.ps1
# ========= إعدادات عامة =========
# عدّل هذه القيم لتناسب بيئتك مرة واحدة فقط

# مسار مشروعك المحلي (مكان العمل)
$LocalPath = "C:\dev\ain-oman-web"

# حرف قرص Google Drive (غالبًا G: افتراضيًا في Google Drive for desktop)
$DriveLetter = "G:"

# المسار داخل Google Drive حيث تضع نسخة المصدر
# ملاحظة: افتح Google Drive في المستكشف لتعرف إن كان اسم "My Drive" أو "ملفاتي"
$DriveProjectPath = "My Drive\dev\ain-oman-web"

# مجلد حفظ سجلات العمليات (Logs)
$LogDir = Join-Path $LocalPath "tools\drive-sync\logs"

# المجلدات التي لا نريد مزامنتها للسحابة
$ExcludeDirs = @(
  "node_modules",
  ".next",
  "dist",
  "out",
  "coverage",
  ".git",
  ".vscode"
)

# الملفات التي لا نريد مزامنتها (أسرار وملفات نظام)
$ExcludeFiles = @(
  ".env",
  ".env.local",
  "prisma\dev.db",
  "*.log",
  "Thumbs.db",
  ".DS_Store"
)

# ========= لا تعدّل عادة أسفل هذا السطر =========
# إنشاء مجلد السجلات إن لم يكن موجودًا
New-Item -ItemType Directory -Force $LogDir | Out-Null

# تركيب المسار الكامل على Google Drive
$DriveFullPath = Join-Path "$DriveLetter\" $DriveProjectPath

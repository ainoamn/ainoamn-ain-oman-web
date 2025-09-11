param([string]$Message = "Auto commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")

$ErrorActionPreference = "Stop"
$Repo    = "https://github.com/ainoamn/ainoamn-ain-oman-web.git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git غير مثبت" }

Set-Location "C:\dev\ain-oman-web"

if (-not (Test-Path ".git")) { git init | Out-Null }

$origin = git remote
if ($origin -notcontains "origin") {
  git remote add origin $Repo
} else {
  git remote set-url origin $Repo
}

git add -A
# إن لم توجد تغييرات لن يفشل الأمر التالي
try { git commit -m $Message } catch { Write-Host "لا تغييرات للالتزام" }

# ضمان الفرع main
try { git branch -M main } catch { }

git push -u origin main
Write-Host "تم الدفع إلى GitHub."

$ErrorActionPreference = "Stop"
$Repo = "https://github.com/ainoamn/ainoamn-ain-oman-ain-oman-web.git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git غير مثبت" }

Set-Location "C:\dev\ain-oman-web"

if (-not (Test-Path ".git")) {
  # إذا المجلد فارغ تقريبًا وتريد استنساخ أول مرة:
  Set-Location "C:\dev"
  if (Test-Path "C:\dev\ain-oman-web") { Remove-Item -Recurse -Force "C:\dev\ain-oman-web" }
  git clone https://github.com/ainoamn/ainoamn-ain-oman-web.git "C:\dev\ain-oman-web"
  Write-Host "تم الاستنساخ."
  exit 0
}

git remote set-url origin https://github.com/ainoamn/ainoamn-ain-oman-web.git
git fetch --all --prune
git checkout main 2>$null
git pull origin main
Write-Host "تم السحب من GitHub."

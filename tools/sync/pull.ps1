# tools/sync/pull.ps1
param(
  [switch]$GitOnly,
  [switch]$DriveOnly,
  [switch]$SkipGit,
  [switch]$SkipDrive
)

. "$PSScriptRoot\config.ps1"

Write-Host "🔽 بدء السحب (Pull)..." -ForegroundColor Cyan
Write-Host "📂 Local : $LocalPath"
Write-Host "☁️  Drive : $DriveFullPath"
Write-Host "🐙 GitHub: $GitRemote ($GitBranch)"

if ($GitOnly)   { $SkipDrive = $true;  $SkipGit = $false }
if ($DriveOnly) { $SkipGit   = $true;  $SkipDrive = $false }

# ----- GitHub -----
if (-not $SkipGit) {
  if (-not (Test-Git)) {
    Write-Host "⚠️ Git غير متاح. تخطّي GitHub." -ForegroundColor DarkYellow
  } elseif ([string]::IsNullOrWhiteSpace($GitRemote)) {
    Write-Host "⚠️ GitRemote غير مضبوط في config.ps1. تخطّي GitHub." -ForegroundColor DarkYellow
  } else {
    if (-not (Test-Path $LocalPath)) {
      Ensure-Dir (Split-Path $LocalPath -Parent)
      Write-Host "🧩 git clone أول مرة..." -ForegroundColor Yellow
      git clone $GitRemote $LocalPath
    } elseif (Test-Path (Join-Path $LocalPath ".git")) {
      Push-Location $LocalPath
      try {
        Write-Host "⬇️ git pull origin $GitBranch ..."
        git pull origin $GitBranch
      } finally { Pop-Location }
    } else {
      Write-Host "ℹ️ المجلد موجود لكن ليس مستودع Git — تم تخطّي Git." -ForegroundColor Gray
    }
  }
}

# ----- Google Drive -----
if (-not $SkipDrive) {
  if (-not (Test-Path $DriveBase)) {
    Write-Host "⚠️ لم يتم العثور على قاعدة Google Drive: $DriveBase" -ForegroundColor DarkYellow
    Write-Host "   تأكد أن تطبيق Google Drive يعمل وأن المسار صحيح." -ForegroundColor DarkYellow
  } elseif (-not (Test-Path $DriveFullPath)) {
    Write-Host "ℹ️ مجلد المشروع غير موجود في Drive بعد: $DriveFullPath" -ForegroundColor Gray
  } else {
    Ensure-Dir $LocalPath

    $xd = @(); foreach ($d in $ExcludeDirs)  { $xd += "/XD"; $xd += (Join-Path $LocalPath $d) }
    $xf = @(); foreach ($f in $ExcludeFiles) { $xf += "/XF"; $xf += (Join-Path $LocalPath $f) }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $logPull = Join-Path $LogDir "pull-drive-$timestamp.log"

    $rcArgs = @(
      $DriveFullPath,
      $LocalPath,
      "/MIR",
      "/COPY:DAT",
      "/DCOPY:T",
      "/FFT",
      "/J",
      "/R:2",
      "/W:2",
      "/NFL",
      "/NDL",
      "/NP",
      "/LOG:$logPull"
    ) + $xd + $xf

    Write-Host "⬅️  مزامنة من Drive إلى المحلي..."
    & robocopy @rcArgs
    $rc = $LASTEXITCODE
    if ($rc -le 7) {
      Write-Host "✅ تم السحب من Drive (robocopy=$rc). السجل: $logPull" -ForegroundColor Green
    } else {
      Write-Host "❌ فشل السحب من Drive (robocopy=$rc). السجل: $logPull" -ForegroundColor Red
      Write-Host "🧩 افتح السجل لمعرفة السبب." -ForegroundColor Yellow
    }
  }
}

Write-Host ""
Write-Host "📌 بعد أول سحب على جهاز جديد:" -ForegroundColor Yellow
Write-Host "    cd $LocalPath"
Write-Host "    copy .env.example .env"
Write-Host "    copy .env.example .env.local"
Write-Host "    npm install"
Write-Host "    npx prisma generate"
Write-Host "    npx prisma migrate dev --name init"
Write-Host "    npm run dev"
Write-Host ""
Write-Host "🎉 اكتمل السحب." -ForegroundColor Cyan

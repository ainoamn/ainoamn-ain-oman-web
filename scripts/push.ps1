param(
  [string]$Message = "Auto commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
  [switch]$DryRun,
  [string]$Repo = "https://github.com/ainoamn/ainoamn-ain-oman-web.git",
  [switch]$ForceRenameMain,
  [switch]$UsePAT
)

$ErrorActionPreference = "Stop"

function Write-Log($msg) { Write-Host "[push.ps1] $msg" }

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git غير مثبت" }

Set-Location "C:\dev\ain-oman-web"

if (-not (Test-Path ".git")) {
  Write-Log " initializing a new git repository..."
  if (-not $DryRun) { git init | Out-Null }
}

# Ensure origin exists (do not overwrite existing origin URL unless Repo differs)
$existingOrigin = $null
try { $existingOrigin = git remote get-url origin 2>$null } catch { }
if (-not $existingOrigin) {
  Write-Log "adding remote origin -> $Repo"
  if (-not $DryRun) { git remote add origin $Repo }
} elseif ($existingOrigin -ne $Repo) {
  Write-Log "origin remote URL differs. Updating origin to provided Repo"
  if (-not $DryRun) { git remote set-url origin $Repo }
} else {
  Write-Log "origin remote already set"
}

# Stage all changes
Write-Log "staging changes (git add -A)"
if (-not $DryRun) { git add -A }

# Check if there are staged changes
$staged = ""
try { $staged = git diff --cached --name-only } catch { $staged = "" }
if (-not $staged) {
  Write-Log "لا تغييرات للالتزام (no staged changes). Exiting."
  exit 0
}

# Commit
Write-Log "committing with message: $Message"
if (-not $DryRun) {
  try {
    git commit -m $Message | Out-Null
  } catch {
    Write-Log "commit failed (possibly no changes) - $_"
  }
}

# Determine current branch
$branch = "main"
try { $branch = (git rev-parse --abbrev-ref HEAD).Trim() } catch { $branch = "main" }
Write-Log "current branch: $branch"

# Optionally rename to main only when forced
if ($ForceRenameMain) {
  Write-Log "renaming current branch to 'main' (force)"
  if (-not $DryRun) { try { git branch -M main } catch { Write-Log "branch rename failed: $_" } }
  $branch = "main"
}

# Prepare push
Write-Log "about to push branch '$branch' to origin"
if ($DryRun) { Write-Log "DRY RUN - no push performed"; exit 0 }

# If requested and PAT is available, temporarily set origin with token for push
$originalOrigin = $null
if ($UsePAT -and $env:GIT_PAT) {
  try { $originalOrigin = git remote get-url origin } catch { $originalOrigin = $null }
  if ($originalOrigin -and $originalOrigin.StartsWith('https://')) {
    $masked = $originalOrigin -replace 'https://','https://[token]@'
    Write-Log "using PAT from environment for push (origin masked: $masked)"
    $tokenUrl = $originalOrigin -replace 'https://','https://'+$env:GIT_PAT+'@'
    try { git remote set-url origin $tokenUrl } catch { Write-Log "failed to set token remote: $_" }
  } else {
    Write-Log "origin not https or not found; skipping PAT mode"
  }
}

# Push and handle errors
try {
  git push -u origin $branch
  Write-Log "تم الدفع إلى GitHub."
} catch {
  Write-Log "git push failed: $_"
  Write-Log "محاولة إعطاء إرشاد: تأكد من إعداد المصادقة (GIT_PAT env or credential manager), أو قم بسحب التغييرات من origin (git pull) وحاول مرة أخرى."
  # restore origin if modified
  if ($originalOrigin) {
    try { git remote set-url origin $originalOrigin } catch { }
  }
  throw $_
} finally {
  # restore origin if modified
  if ($originalOrigin) {
    try { git remote set-url origin $originalOrigin } catch { }
  }
}

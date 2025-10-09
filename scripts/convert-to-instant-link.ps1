# Script to convert all next/link imports to InstantLink
# Ain Oman Web - Performance Optimization

Write-Host "🚀 بدء تحويل جميع الروابط إلى InstantLink..." -ForegroundColor Green
Write-Host ""

$filesUpdated = 0
$totalReplacements = 0

# Get all TypeScript/JavaScript files in src/
$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts,*.jsx,*.js | Where-Object { $_.FullName -notmatch 'node_modules' }

Write-Host "📁 عدد الملفات المراد فحصها: $($files.Count)" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if (-not $content) {
        continue
    }
    
    $originalContent = $content
    $fileChanged = $false
    
    # Pattern 1: import Link from 'next/link'
    if ($content -match "import\s+Link\s+from\s+['""]next/link['""]") {
        $content = $content -replace "import\s+Link\s+from\s+['""]next/link['""]", "import InstantLink from '@/components/InstantLink'"
        $fileChanged = $true
        $totalReplacements++
    }
    
    # Pattern 2: import { Link } from 'next/link'
    if ($content -match "import\s+\{\s*Link\s*\}\s+from\s+['""]next/link['""]") {
        $content = $content -replace "import\s+\{\s*Link\s*\}\s+from\s+['""]next/link['""]", "import InstantLink from '@/components/InstantLink'"
        $fileChanged = $true
        $totalReplacements++
    }
    
    # Pattern 3: Replace <Link> with <InstantLink>
    if ($content -match "<Link\s") {
        $content = $content -replace "<Link\s", "<InstantLink "
        $content = $content -replace "</Link>", "</InstantLink>"
        $fileChanged = $true
    }
    
    # Save if changed
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesUpdated++
        Write-Host "✅ تم تحديث: $($file.FullName.Replace((Get-Location).Path, ''))" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "✅ تم الانتهاء!" -ForegroundColor Green
Write-Host "📊 الملفات المُحدّثة: $filesUpdated" -ForegroundColor Cyan
Write-Host "🔄 الاستبدالات: $totalReplacements" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow


# Script to fix duplicate InstantLink imports
# Ain Oman Web - Fix Duplicates

Write-Host "🔧 بدء إصلاح الاستيرادات المكررة..." -ForegroundColor Green
Write-Host ""

$filesFixed = 0

# Get all files that might have duplicates
$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts,*.jsx,*.js | Where-Object { $_.FullName -notmatch 'node_modules' }

Write-Host "📁 عدد الملفات المراد فحصها: $($files.Count)" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    try {
        $lines = Get-Content $file.FullName
        $newLines = @()
        $seenImports = @{}
        $changed = $false
        
        foreach ($line in $lines) {
            # Check for InstantLink import
            if ($line -match "import\s+InstantLink\s+from\s+['""]@/components/InstantLink['""]") {
                $key = "InstantLink"
                if ($seenImports.ContainsKey($key)) {
                    # Skip this duplicate import
                    $changed = $true
                    Write-Host "  🔄 حذف استيراد مكرر في: $($file.Name)" -ForegroundColor Yellow
                    continue
                }
                $seenImports[$key] = $true
            }
            
            # Check for InstantImage import
            if ($line -match "import\s+InstantImage\s+from\s+['""]@/components/InstantImage['""]") {
                $key = "InstantImage"
                if ($seenImports.ContainsKey($key)) {
                    # Skip this duplicate import
                    $changed = $true
                    Write-Host "  🔄 حذف استيراد مكرر في: $($file.Name)" -ForegroundColor Yellow
                    continue
                }
                $seenImports[$key] = $true
            }
            
            $newLines += $line
        }
        
        if ($changed) {
            Set-Content -Path $file.FullName -Value $newLines
            $filesFixed++
            Write-Host "✅ تم إصلاح: $($file.FullName.Replace((Get-Location).Path, ''))" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  خطأ في: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "✅ تم الانتهاء!" -ForegroundColor Green
Write-Host "📊 الملفات المُصلحة: $filesFixed" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow


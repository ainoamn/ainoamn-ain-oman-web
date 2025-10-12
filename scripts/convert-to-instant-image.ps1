# Script to convert all <img> tags to InstantImage
# Ain Oman Web - Performance Optimization - Images

Write-Host "🖼️  بدء تحويل جميع الصور إلى InstantImage..." -ForegroundColor Green
Write-Host ""

$filesUpdated = 0
$totalReplacements = 0

# Get all TypeScript/JavaScript files in src/
$files = Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts,*.jsx,*.js | Where-Object { $_.FullName -notmatch 'node_modules' }

Write-Host "📁 عدد الملفات المراد فحصها: $($files.Count)" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName | Out-String
        
        if (-not $content) {
            continue
        }
        
        $originalContent = $content
        $fileChanged = $false
        
        # Check if file contains <img> tags
        if ($content -match "<img\s") {
            
            # Add InstantImage import if not exists and Next Image is not imported
            if ($content -notmatch "import\s+.*InstantImage" -and $content -notmatch "import\s+.*from\s+['""]next/image['""]") {
                # Find the last import statement
                if ($content -match "import\s+.*from\s+['""](react|next|@/).*['""];?\s*\n") {
                    $lastImport = $Matches[0]
                    $importStatement = "import InstantImage from '@/components/InstantImage';`n"
                    $content = $content -replace [regex]::Escape($lastImport), "$lastImport$importStatement"
                    $fileChanged = $true
                }
            }
            
            # Pattern 1: <img src="..." alt="..." /> (self-closing)
            $pattern1 = '<img\s+([^>]*?)\/>'
            if ($content -match $pattern1) {
                $content = $content -replace $pattern1, '<InstantImage $1/>'
                $fileChanged = $true
                $totalReplacements++
            }
            
            # Pattern 2: <img src="..." alt="..."> (without self-closing)
            $pattern2 = '<img\s+([^>]*?)>'
            if ($content -match $pattern2) {
                $content = $content -replace $pattern2, '<InstantImage $1/>'
                $fileChanged = $true
                $totalReplacements++
            }
            
            # Add loading="lazy" if not exists
            $content = $content -replace '(<InstantImage\s+(?![^>]*loading=)[^>]*?)(/>)', '$1 loading="lazy"$2'
        }
        
        # Save if changed
        if ($fileChanged) {
            Set-Content -Path $file.FullName -Value $content
            $filesUpdated++
            Write-Host "✅ تم تحديث: $($file.FullName.Replace((Get-Location).Path, ''))" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  خطأ في: $($file.FullName) - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "✅ تم الانتهاء!" -ForegroundColor Green
Write-Host "📊 الملفات المُحدّثة: $filesUpdated" -ForegroundColor Cyan
Write-Host "🔄 الاستبدالات: $totalReplacements" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow


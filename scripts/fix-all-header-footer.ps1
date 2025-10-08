# scripts/fix-all-header-footer.ps1
# إزالة جميع استخدامات <Header /> و <Footer /> من جميع الصفحات

Write-Host "`n🔧 إصلاح شامل لجميع استخدامات Header/Footer...`n" -ForegroundColor Cyan

$allFiles = Get-ChildItem -Path src\pages -Filter *.tsx -Recurse

$fixedCount = 0
$totalReplacements = 0

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # إزالة <Header />
    $before = $content
    $content = $content -replace '\s*<Header\s*/>\s*', "`n      {/* Header handled by MainLayout */}`n"
    if ($content -ne $before) {
        $count = ([regex]::Matches($before, '<Header\s*/>')).Count
        $totalReplacements += $count
        Write-Host "  ✅ $($file.Name) - أزال $count استخدام Header" -ForegroundColor Green
    }
    
    # إزالة <Footer />
    $before = $content
    $content = $content -replace '\s*<Footer\s*/>\s*', "`n      {/* Footer handled by MainLayout */}`n"
    if ($content -ne $before) {
        $count = ([regex]::Matches($before, '<Footer\s*/>')).Count
        $totalReplacements += $count
        Write-Host "  ✅ $($file.Name) - أزال $count استخدام Footer" -ForegroundColor Green
    }
    
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -NoNewline
        $fixedCount++
    }
}

Write-Host "`n" -NoNewline
Write-Host "═" * 80 -ForegroundColor Cyan
Write-Host "`n📊 النتائج:`n" -ForegroundColor Cyan
Write-Host "✅ أصلح $fixedCount ملف" -ForegroundColor Green
Write-Host "✅ أزال $totalReplacements استخدام لـ Header/Footer" -ForegroundColor Green
Write-Host "`n✨ جميع الصفحات الآن نظيفة!`n" -ForegroundColor Green


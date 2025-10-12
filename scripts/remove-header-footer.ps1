# scripts/remove-header-footer.ps1
# إزالة جميع استخدامات Header و Footer من الصفحات

$filesToFix = @(
    "src\pages\admin\accounting\review\[id].tsx",
    "src\pages\admin\bookings\[id].tsx",
    "src\pages\admin\buildings\edit\[id].tsx",
    "src\pages\admin\contracts\[id].tsx",
    "src\pages\admin\customers\[name].tsx",
    "src\pages\admin\rent\[buildingId]\[unitId].tsx",
    "src\pages\admin\properties\[id].tsx",
    "src\pages\contracts\sign\[id].tsx"
)

Write-Host "`n🔧 إصلاح استخدامات Header/Footer...`n" -ForegroundColor Cyan

$fixedCount = 0

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "معالجة: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # إزالة import Header
        $content = $content -replace 'import\s+Header\s+from\s+[''"]@/components/layout/Header[''"];\s*\r?\n?', ''
        
        # إزالة import Footer  
        $content = $content -replace 'import\s+Footer\s+from\s+[''"]@/components/layout/Footer[''"];\s*\r?\n?', ''
        
        # استبدال <Header />
        $content = $content -replace '\s*<Header\s*/>\s*', "`n        {/* Header handled by MainLayout */}`n"
        
        # استبدال <Footer />
        $content = $content -replace '\s*<Footer\s*/>\s*', "`n        {/* Footer handled by MainLayout */}`n"
        
        if ($content -ne $originalContent) {
            Set-Content $file -Value $content -NoNewline
            Write-Host "  ✅ تم الإصلاح" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "  ⏭ لا يحتاج تحديث" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️ الملف غير موجود: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ تم! أصلح $fixedCount ملف" -ForegroundColor Green
Write-Host "✨ جميع الصفحات الآن تستخدم MainLayout بشكل صحيح!`n" -ForegroundColor Cyan


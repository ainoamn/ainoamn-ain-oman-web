# scripts/fix-header-footer-imports.ps1
# إصلاح جميع استيرادات Header و Footer في الصفحات

$files = @(
    "src\pages\admin\contracts\[id].tsx",
    "src\pages\admin\bookings\[id].tsx",
    "src\pages\admin\accounting\review\[id].tsx",
    "src\pages\admin\buildings\edit\[id].tsx",
    "src\pages\admin\customers\[name].tsx",
    "src\pages\admin\settings.tsx",
    "src\pages\admin\rent\[buildingId]\[unitId].tsx",
    "src\pages\admin\properties\[id].tsx"
)

$fixedCount = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "معالجة: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $modified = $false
        
        # إزالة استيراد Header
        if ($content -match 'import Header from') {
            $content = $content -replace 'import Header from [''"]@/components/layout/Header[''"];?\r?\n', ''
            $modified = $true
        }
        
        # إزالة استيراد Footer
        if ($content -match 'import Footer from') {
            $content = $content -replace 'import Footer from [''"]@/components/layout/Footer[''"];?\r?\n', ''
            $modified = $true
        }
        
        # إضافة تعليق إذا لم يكن موجود
        if ($content -notmatch '// Header and Footer handled by MainLayout') {
            $content = $content -replace '(import Head from [''"]next/head[''"];)', "`$1`r`n// Header and Footer handled by MainLayout in _app.tsx"
            $modified = $true
        }
        
        # إضافة استيراد InstantLink
        if ($content -notmatch 'import InstantLink') {
            $content = $content -replace '(import Link from [''"]next/link[''"];)', "import Link from 'next/link';`r`nimport InstantLink from '@/components/InstantLink';"
            $modified = $true
        }
        
        if ($modified) {
            Set-Content $file -Value $content -NoNewline
            Write-Host "  ✅ تم التحديث" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "  ⏭ لا يحتاج تحديث" -ForegroundColor Gray
        }
    }
}

Write-Host "`n✅ تم! عدل $fixedCount ملف" -ForegroundColor Green


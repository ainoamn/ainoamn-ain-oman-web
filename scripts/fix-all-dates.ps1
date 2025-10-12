# تحويل جميع التواريخ من الهجري إلى الميلادي
# PowerShell Script - محسّن وشامل

Write-Host "🔍 البحث عن ملفات التواريخ..." -ForegroundColor Cyan

# البحث عن جميع ملفات TypeScript/JavaScript
$files = Get-ChildItem -Path src -Include *.ts,*.tsx,*.js,*.jsx -Recurse | Where-Object { $_.FullName -notmatch 'node_modules' }

$updated = 0
$total = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # استبدال 1: toLocaleDateString('ar-SA' → 'ar' مع gregory
    $pattern1 = "toLocaleDateString\s*\(\s*['\`""]ar-SA['\`""]\s*,\s*\{"
    $replacement1 = "toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
    $content = $content -replace $pattern1, $replacement1
    
    # استبدال 2: toLocaleDateString('ar-OM' → 'ar' مع gregory
    $pattern2 = "toLocaleDateString\s*\(\s*['\`""]ar-OM['\`""]\s*,\s*\{"
    $replacement2 = "toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
    $content = $content -replace $pattern2, $replacement2
    
    # استبدال 3: toLocaleString('ar-SA' → 'ar' مع gregory
    $pattern3 = "toLocaleString\s*\(\s*['\`""]ar-SA['\`""]\s*,\s*\{"
    $replacement3 = "toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
    $content = $content -replace $pattern3, $replacement3
    
    # استبدال 4: toLocaleString('ar-OM' → 'ar' مع gregory
    $pattern4 = "toLocaleString\s*\(\s*['\`""]ar-OM['\`""]\s*,\s*\{"
    $replacement4 = "toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
    $content = $content -replace $pattern4, $replacement4
    
    # استبدال 5: toLocaleTimeString('ar-SA' → 'ar' مع latn
    $pattern5 = "toLocaleTimeString\s*\(\s*['\`""]ar-SA['\`""]\s*,\s*\{"
    $replacement5 = "toLocaleTimeString('ar', { numberingSystem: 'latn', "
    $content = $content -replace $pattern5, $replacement5
    
    # استبدال 6: toLocaleTimeString('ar-OM' → 'ar' مع latn  
    $pattern6 = "toLocaleTimeString\s*\(\s*['\`""]ar-OM['\`""]\s*,\s*\{"
    $replacement6 = "toLocaleTimeString('ar', { numberingSystem: 'latn', "
    $content = $content -replace $pattern6, $replacement6
    
    # استبدال 7: locale: 'ar-SA' → 'ar' في getMonthName
    $pattern7 = "locale:\s*['\`""]ar-SA['\`""]"
    $replacement7 = "locale: 'ar'"
    $content = $content -replace $pattern7, $replacement7
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $updated++
        Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
    }
    
    $total++
}

Write-Host "`n" -NoNewline
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 النتيجة:" -ForegroundColor White
Write-Host "   الملفات الكلية: $total" -ForegroundColor Yellow
Write-Host "   الملفات المُحدّثة: $updated" -ForegroundColor Green
Write-Host "   نسبة التحديث: $([Math]::Round($updated/$total*100, 1))%" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n✅ تم تحويل جميع التواريخ إلى التقويم الميلادي!" -ForegroundColor Green
Write-Host "📅 الأرقام: لاتينية (1,2,3)" -ForegroundColor Yellow
Write-Host "📆 التقويم: ميلادي (Gregorian)" -ForegroundColor Yellow


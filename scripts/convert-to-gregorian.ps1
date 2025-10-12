# Convert all dates from Hijri (ar-SA) to Gregorian calendar
# PowerShell script to update all date formatting in the codebase

$files = @(
    "src\pages\admin\bookings\[id].tsx",
    "src\pages\dashboard\owner.tsx",
    "src\pages\bookings\index.tsx",
    "src\pages\properties\[id].tsx",
    "src\pages\admin\rent\[buildingId]\[unitId].tsx",
    "src\pages\admin\customers\[name].tsx",
    "src\pages\admin\contracts\[id].tsx",
    "src\pages\admin\accounting\review\[id].tsx",
    "src\pages\profile\index.tsx",
    "src\pages\favorites.tsx",
    "src\components\property\LegalTab.tsx",
    "src\components\property\DocumentsTab.tsx",
    "src\components\property\FinancialTab.tsx",
    "src\components\property\TasksTab.tsx",
    "src\pages\property\[id]\admin.tsx",
    "src\pages\admin\contracts\index.tsx",
    "src\pages\profile\contracts\[id].tsx",
    "src\pages\profile\contracts\index.tsx",
    "src\pages\profile\bookings.tsx",
    "src\pages\legal\index.tsx",
    "src\pages\legal\[caseId].tsx",
    "src\components\property\ReservationsTab.tsx",
    "src\components\property\ContractsTab.tsx",
    "src\server\properties\financialStats.ts",
    "src\pages\properties\[id]\edit.tsx",
    "src\pages\properties\unified-management.tsx",
    "src\pages\properties\new.tsx",
    "src\components\booking\SmartSyncIndicator.tsx",
    "src\components\admin\AdvancedDataTable.tsx",
    "src\components\dashboard\IntegratedDashboard.tsx",
    "src\pages\calendar\index.tsx",
    "src\pages\reports.tsx",
    "src\pages\billing.tsx",
    "src\pages\admin\units\index.tsx",
    "src\pages\admin\maintenance\index.tsx",
    "src\pages\dashboard\property-owner.tsx",
    "src\pages\dashboard\customer.tsx",
    "src\pages\properties\finance.tsx",
    "src\pages\properties\[id]\bookings.tsx",
    "src\pages\admin\checks\index.tsx",
    "src\pages\properties\[id]\customer-connection.tsx",
    "src\pages\manage-properties\requests.tsx",
    "src\pages\properties\[id]\payment\success.tsx",
    "src\lib\print.ts"
)

$count = 0
$totalChanges = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalContent = $content
        
        # Replace ar-SA with ar + add calendar: 'gregory'
        # Pattern 1: toLocaleDateString('ar-SA', {...})
        $content = $content -replace "toLocaleDateString\(\s*['\`"]ar-SA['\`"]\s*,\s*\{", "toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
        
        # Pattern 2: toLocaleDateString('ar-OM', {...})
        $content = $content -replace "toLocaleDateString\(\s*['\`"]ar-OM['\`"]\s*,\s*\{", "toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
        
        # Pattern 3: toLocaleString('ar-SA', {...})
        $content = $content -replace "toLocaleString\(\s*['\`"]ar-SA['\`"]\s*,\s*\{", "toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
        
        # Pattern 4: toLocaleString('ar-OM', {...})
        $content = $content -replace "toLocaleString\(\s*['\`"]ar-OM['\`"]\s*,\s*\{", "toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn', "
        
        # Pattern 5: toLocaleTimeString('ar-SA', {...})
        $content = $content -replace "toLocaleTimeString\(\s*['\`"]ar-SA['\`"]\s*,\s*\{", "toLocaleTimeString('ar', { numberingSystem: 'latn', "
        
        # Pattern 6: toLocaleTimeString('ar-OM', {...})
        $content = $content -replace "toLocaleTimeString\(\s*['\`"]ar-OM['\`"]\s*,\s*\{", "toLocaleTimeString('ar', { numberingSystem: 'latn', "
        
        if ($content -ne $originalContent) {
            Set-Content $file -Value $content -Encoding UTF8 -NoNewline
            $count++
            $changes = ($content.Length - $originalContent.Length)
            $totalChanges += [Math]::Abs($changes)
            Write-Host "✅ Updated: $file" -ForegroundColor Green
        }
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "Files updated: $count" -ForegroundColor Yellow
Write-Host "Total changes: $totalChanges characters" -ForegroundColor Yellow
Write-Host "`n✅ All dates converted to Gregorian calendar!" -ForegroundColor Green


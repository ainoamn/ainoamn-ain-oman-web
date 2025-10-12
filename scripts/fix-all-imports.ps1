# Fix all duplicate imports in one go
Write-Host "🔧 إصلاح جميع الاستيرادات المكررة..." -ForegroundColor Green

$fixed = 0

# List of files to fix (from grep results)
$filesToFix = @(
    "src\pages\settings.tsx",
    "src\pages\favorites.tsx",
    "src\pages\properties\unified-management.tsx",
    "src\pages\properties\index.tsx",
    "src\pages\dashboard\auctions\index.tsx",
    "src\pages\booking\new.tsx",
    "src\pages\auth\verify.tsx",
    "src\pages\auctions\index.tsx",
    "src\pages\auctions\add.tsx",
    "src\pages\admin\properties\index.tsx",
    "src\components\layout\EnhancedHeader.tsx",
    "src\components\layout\EnhancedFooter.tsx",
    "src\pages\test-dashboards.tsx",
    "src\pages\index.tsx",
    "src\pages\billing.tsx",
    "src\pages\reservations\index.tsx",
    "src\pages\properties\finance.tsx",
    "src\pages\profile\bookings.tsx",
    "src\pages\profile\contracts\index.tsx",
    "src\pages\partners\index.tsx",
    "src\pages\owners-association\tracking.tsx",
    "src\pages\owners-association\notifications.tsx",
    "src\pages\owners-association\management.tsx",
    "src\pages\owners-association\home.tsx",
    "src\pages\owners-association\alerts.tsx",
    "src\pages\owners-association\buildings\index.tsx",
    "src\pages\manage-properties\requests.tsx",
    "src\pages\manage-properties\index.tsx",
    "src\pages\invest\index.tsx",
    "src\pages\development\index.tsx",
    "src\pages\dashboard\widgets.tsx",
    "src\pages\dashboard\property-owner.tsx",
    "src\pages\dashboard\index.tsx",
    "src\pages\dashboard\customer.tsx",
    "src\pages\dashboard\admin.tsx",
    "src\pages\admin\dashboard.tsx",
    "src\pages\admin\units\index.tsx",
    "src\pages\admin\properties\new.tsx",
    "src\pages\admin\maintenance\index.tsx",
    "src\pages\admin\invoices\index.tsx",
    "src\pages\admin\dashboard\widgets.tsx",
    "src\pages\admin\contracts\overrides.tsx",
    "src\pages\admin\contracts\new.tsx",
    "src\pages\admin\contracts\index.tsx",
    "src\pages\admin\checks\index.tsx",
    "src\pages\admin\billing\invoices.tsx",
    "src\components\layout\Layout.tsx",
    "src\components\layout\Footer.tsx",
    "src\components\hoa\HoaNav.tsx",
    "src\components\dashboard\UnifiedDashboard.tsx",
    "src\components\dashboard\IntegratedDashboard.tsx",
    "src\components\admin\SectionToolbar.tsx",
    "src\components\admin\ModuleCard.tsx",
    "src\components\admin\AdvancedDataTable.tsx",
    "src\components\admin\AdminSidebar.tsx",
    "src\components\admin\widgets\RecentActivity.tsx",
    "src\components\admin\widgets\QuickActions.tsx",
    "src\pages\policies\terms.tsx",
    "src\pages\policies\privacy.tsx",
    "src\pages\login.tsx",
    "src\pages\contact.tsx",
    "src\pages\auth\forgot-password.tsx",
    "src\pages\performance-demo.tsx",
    "src\pages\chat.tsx",
    "src\pages\bookings\index.tsx",
    "src\pages\booking\[id]\success.tsx",
    "src\pages\booking\[id]\payment.tsx",
    "src\pages\admin\bookings\[id].tsx",
    "src\components\properties\PropertyCard.tsx",
    "src\components\QuickNav.tsx"
)

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Encoding UTF8
            $newContent = @()
            $seenInstantLink = $false
            $seenInstantImage = $false
            $changed = $false
            
            foreach ($line in $content) {
                # Skip duplicate InstantLink imports
                if ($line -match 'import\s+InstantLink\s+from') {
                    if ($seenInstantLink) {
                        $changed = $true
                        continue
                    }
                    $seenInstantLink = $true
                }
                
                # Skip duplicate InstantImage imports
                if ($line -match 'import\s+InstantImage\s+from') {
                    if ($seenInstantImage) {
                        $changed = $true
                        continue
                    }
                    $seenInstantImage = $true
                }
                
                $newContent += $line
            }
            
            if ($changed) {
                $newContent | Set-Content $file -Encoding UTF8
                $fixed++
                Write-Host "✅ $file" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠️  $file : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "✅ تم إصلاح $fixed ملف" -ForegroundColor Cyan


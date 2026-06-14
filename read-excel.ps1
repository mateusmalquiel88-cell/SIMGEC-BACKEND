$excelPath = "07 - Cubal  - Criação e Recriação de Escolas.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false

try {
    $workbook = $excel.Workbooks.Open((Resolve-Path $excelPath).Path)
    $worksheet = $workbook.Sheets(1)
    
    # Get headers from first row
    $headers = @()
    for ($col = 1; $col -le $worksheet.UsedRange.Columns.Count; $col++) {
        $cellValue = $worksheet.Cells(1, $col).Value
        if ($cellValue) {
            $headers += $cellValue
        }
    }
    
    Write-Host "Campos do Excel:"
    Write-Host "================"
    $headers | ForEach-Object { Write-Host "- $_" }
    
    $workbook.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}

$output = @()

# Method 1: Get volume info (always works, no admin needed)
$drives = [System.IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady -eq $true }
foreach ($d in $drives) {
    $entry = @{
        Name        = $d.Name
        DriveType   = [int]$d.DriveType
        TotalSize   = $d.TotalSize
        VolumeLabel = $d.VolumeLabel
        DriveFormat = $d.DriveFormat
    }
    $output += $entry
}

# Method 2: Enrich with WMI disk model (no admin needed for basic query)
try {
    $wmiDisks = Get-WmiObject -Class Win32_LogicalDisk -ErrorAction SilentlyContinue |
        Select-Object DeviceID, Size, MediaType, Description
    foreach ($wmi in $wmiDisks) {
        $letter = $wmi.DeviceID + "\"
        $match = $output | Where-Object { $_.Name -like "$letter*" }
        if ($match) {
            $match.Description = $wmi.Description
        }
    }

    # Also try to get physical disk model
    $physDisks = Get-WmiObject -Class Win32_DiskDrive -ErrorAction SilentlyContinue |
        Select-Object Index, Model, SerialNumber, Size, InterfaceType
    $partitions = Get-WmiObject -Class Win32_DiskDriveToDiskPartition -ErrorAction SilentlyContinue
    $logicals   = Get-WmiObject -Class Win32_LogicalDiskToPartition -ErrorAction SilentlyContinue

    $enriched = @()
    foreach ($phys in $physDisks) {
        $partLinks = $partitions | Where-Object { $_.Antecedent -like "*Disk #$($phys.Index),*" }
        $driveLetters = @()
        foreach ($pl in $partLinks) {
            $logLink = $logicals | Where-Object { $_.Antecedent -eq $pl.Dependent }
            foreach ($ll in $logLink) {
                if ($ll.Dependent -match 'DeviceID="([A-Z]:)"') {
                    $driveLetters += $matches[1] + "\"
                }
            }
        }
        $enriched += @{
            Number        = $phys.Index
            FriendlyName  = $phys.Model
            SerialNumber  = $phys.SerialNumber
            Size          = $phys.Size
            InterfaceType = $phys.InterfaceType
            DriveLetters  = $driveLetters
            IsBoot        = ($driveLetters -contains "C:\")
        }
    }
    if ($enriched.Count -gt 0) {
        $enriched | ConvertTo-Json -Compress | Out-File -FilePath host_hardware.json -Encoding utf8
        Write-Host "[OK] Physical disk info captured via WMI:"
        $enriched | ForEach-Object { Write-Host "  - $($_.FriendlyName) ($([math]::Round($_.Size/1GB,0)) GB) Boot=$($_.IsBoot)" }
        exit 0
    }
} catch {
    Write-Host "[INFO] WMI physical disk query failed (non-admin?), falling back to volume info..."
}

# Fallback: just write volume info
$output | ConvertTo-Json -Compress | Out-File -FilePath host_hardware.json -Encoding utf8
Write-Host "[OK] Volume info captured (fallback mode):"
$output | ForEach-Object { Write-Host "  - $($_.Name) $([math]::Round($_.TotalSize/1GB,0)) GB [$($_.VolumeLabel)]" }

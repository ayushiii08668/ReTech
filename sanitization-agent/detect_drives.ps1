$disks = @()

# Method 1: Get physical disk info via WMI
try {
    $physDisks = Get-WmiObject -Class Win32_DiskDrive -ErrorAction SilentlyContinue |
        Select-Object Index, Model, SerialNumber, Size, InterfaceType
    $partitions = Get-WmiObject -Class Win32_DiskDriveToDiskPartition -ErrorAction SilentlyContinue
    $logicals   = Get-WmiObject -Class Win32_LogicalDiskToPartition -ErrorAction SilentlyContinue

    if ($physDisks) {
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
            $disks += @{
                Number        = $phys.Index
                FriendlyName  = $phys.Model
                SerialNumber  = $phys.SerialNumber
                Size          = $phys.Size
                InterfaceType = $phys.InterfaceType
                DriveLetters  = $driveLetters
                IsBoot        = ($driveLetters -contains "C:\") -or ($phys.Index -eq 0) -or ($physDisks.Count -eq 1)
                DeviceType    = "DISK"
            }
        }
    }
} catch {}

# Fallback to volume info + registry disk model if WMI physical disks empty
if ($disks.Count -eq 0) {
    try {
        $regModel = ""
        $regSerial = ""
        try {
            $scsi = Get-ChildItem 'HKLM:\SYSTEM\CurrentControlSet\Enum\SCSI' -Recurse -ErrorAction SilentlyContinue |
                Where-Object { $_.Property -contains 'FriendlyName' } | Select-Object -First 1
            if ($scsi) {
                $regModel = (Get-ItemProperty $scsi.PSPath).FriendlyName
                $regSerial = $scsi.PSChildName
            }
        } catch {}

        $volumes = [System.IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady -eq $true }
        $vIdx = 0
        foreach ($v in $volumes) {
            $isSys = ($v.Name -like "C*")
            $modelName = if ($isSys -and $regModel) { $regModel } else { "Windows Host Disk ($($v.Name.TrimEnd('\')) [$($v.VolumeLabel)])" }
            $serial = if ($isSys -and $regSerial) { $regSerial } else { "WIN-HOST-$("{0:D2}" -f $vIdx)" }
            $iface = if ($modelName -match "NVMe") { "NVMe" } else { "SATA" }

            $disks += @{
                Number        = $vIdx
                FriendlyName  = $modelName
                SerialNumber  = $serial
                Size          = $v.TotalSize
                TotalSize     = $v.TotalSize
                InterfaceType = $iface
                DriveLetters  = @($v.Name)
                DriveFormat   = $v.DriveFormat
                IsBoot        = $isSys
                DeviceType    = "DISK"
            }
            $vIdx++
        }
    } catch {}
}

# Method 2: Detect connected mobile smartphones (Android / iPhone via USB MTP / USB Enum)
$mobileIndex = 0

# 2a. Check Shell.Application namespace 17 ("This PC")
try {
    $shell = New-Object -ComObject Shell.Application
    $thisPc = $shell.Namespace(17)
    foreach ($item in $thisPc.Items()) {
        $path = [string]$item.Path
        $name = [string]$item.Name
        if ($path -notmatch '^[A-Z]:\\?$' -and $name -ne 'Network' -and ($path -match 'usb|wpd|volume|\\\\\?\\' -or $name -match 'realme|samsung|pixel|iphone|redmi|xiaomi|oppo|vivo|oneplus|moto|phone|android')) {
            $alreadyAdded = $disks | Where-Object { $_.FriendlyName -like "*$name*" }
            if (-not $alreadyAdded) {
                $disks += @{
                    DeviceType    = "SMARTPHONE"
                    Number        = (10 + $mobileIndex)
                    FriendlyName  = "$name (Smartphone Storage)"
                    SerialNumber  = "MOB-USB-0$($mobileIndex + 1)"
                    Size          = 137438953472
                    InterfaceType = "USB / MTP"
                    StorageType   = "UFS / NVMe Flash"
                    IsBoot        = $false
                    IsRemovable   = $true
                }
                $mobileIndex++
            }
        }
    }
} catch {}

# 2b. Check active USB Enum in registry (detects phones plugged into USB port with Port & Address assigned)
try {
    Get-ChildItem -Path 'HKLM:\SYSTEM\CurrentControlSet\Enum\USB' -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        $dev = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
        if ($dev.Address -and $dev.LocationInformation -and ($dev.Service -eq 'WUDFWpdMtp' -or ($dev.CompatibleIDs -join ';') -match 'MTP' -or $dev.Mfg -match 'realme|samsung|apple|google|xiaomi|oppo|vivo|oneplus|motorola|huawei|lenovo' -or $dev.FriendlyName -match 'phone|realme|samsung|redmi|pixel|iphone|moto')) {
            $rawName = if ($dev.FriendlyName) { $dev.FriendlyName } elseif ($dev.DeviceDesc) { $dev.DeviceDesc } else { "USB Smartphone" }
            $cleanName = if ($dev.Mfg -and -not ($rawName -like "*$($dev.Mfg)*")) { "$($dev.Mfg) $rawName" } else { $rawName }
            $serial = if ($dev.PSChildName) { $dev.PSChildName } else { "MOB-USB-0$($mobileIndex + 1)" }

            $alreadyAdded = $disks | Where-Object { $_.FriendlyName -like "*$cleanName*" -or $_.SerialNumber -eq $serial }
            if (-not $alreadyAdded) {
                $disks += @{
                    DeviceType    = "SMARTPHONE"
                    Number        = (10 + $mobileIndex)
                    FriendlyName  = "$cleanName (Smartphone Storage)"
                    SerialNumber  = $serial
                    Size          = 137438953472
                    InterfaceType = "USB / MTP"
                    StorageType   = "UFS / NVMe Flash"
                    IsBoot        = $false
                    IsRemovable   = $true
                }
                $mobileIndex++
            }
        }
    }
} catch {}

# Save combined list to host_hardware.json in script directory and current directory
$targetPath = Join-Path $PSScriptRoot "host_hardware.json"
$disks | ConvertTo-Json -Compress | Out-File -FilePath $targetPath -Encoding utf8
$disks | ConvertTo-Json -Compress | Out-File -FilePath "host_hardware.json" -Encoding utf8

Write-Host "[OK] Hardware scan complete:"
foreach ($d in $disks) {
    $label = if ($d.FriendlyName) { $d.FriendlyName } else { "$($d.Name) [$($d.VolumeLabel)]" }
    $sz = if ($d.Size) { [math]::Round($d.Size / 1GB, 0) } else { [math]::Round($d.TotalSize / 1GB, 0) }
    $boot = if ($d.IsBoot) { " [BOOT/OS]" } else { "" }
    Write-Host "  - $label ($sz GB)$boot"
}

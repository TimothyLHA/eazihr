Param(
  [string]$Host = 'db.rnhnuounnxhcdnregeft.supabase.co',
  [int]$Port = 5432,
  [string]$User = 'postgres',
  [string]$Database = 'postgres',
  [string]$OutFile = '.\easyhr.dump',
  [switch]$Compressed,
  [switch]$ListTables
)

Write-Host "Supabase export helper"

# Read password securely
$secure = Read-Host "Enter DB password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

# Set PGPASSWORD for this session only
$env:PGPASSWORD = $password

try {
  if ($ListTables) {
    Write-Host "Listing public tables on $Host..."
    & psql -h $Host -p $Port -U $User -d $Database -c "\\dt"
  }
  else {
    if ($Compressed) {
      Write-Host "Creating compressed dump to $OutFile..."
      & pg_dump -h $Host -p $Port -U $User -d $Database -F c -b -v -f $OutFile
    }
    else {
      Write-Host "Creating plain SQL dump to $OutFile..."
      & pg_dump -h $Host -p $Port -U $User -d $Database -F p -f $OutFile
    }
  }
}
finally {
  # Remove password from environment
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Operation finished."

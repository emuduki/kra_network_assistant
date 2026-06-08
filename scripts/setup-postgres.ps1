<#
PowerShell helper to apply the SQL steps you described.
Usage (run as Administrator in PowerShell):
  .\scripts\setup-postgres.ps1

Notes:
- This script DOES NOT modify pg_hba.conf. If you cannot connect as `postgres`, temporarily set local lines to `trust` in pg_hba.conf, run this script, then change pg_hba.conf back to `scram-sha-256` as you described.
- Requires `psql` in PATH (from PostgreSQL installation).
#>

param(
    [string]$RepoRoot = "C:\Users\Mugithi\Documents\kra-network-assistant",
    [string]$InitSql = "docker/postgres/init.sql",
    [string]$PostgresServiceName = "postgresql-x64-18"
)

function Exec-Command($cmd, $args) {
    Write-Host "RUN: $cmd $args"
    $commandLine = "$cmd $args"
    Invoke-Expression $commandLine
    return $LASTEXITCODE
}

# Step 0: ensure psql available
try {
    $psqlVersion = & psql --version 2>$null
} catch {
    Write-Error "psql not found in PATH. Add PostgreSQL's bin folder to PATH or run these commands manually."
    exit 1
}

# Step 1: stop Docker Compose to free port 5432 (if you intend to use local Postgres)
Write-Host "Stopping Docker Compose services (if any) to free port 5432..."
Exec-Command "docker" "compose down"

# Step 2: connect as postgres and run SQL
Write-Host "Attempting to run SQL as 'postgres' to set passwords and create user/database..."
$sqlCommands = @"
ALTER USER postgres WITH PASSWORD 'postgres123';
CREATE USER kra_user WITH PASSWORD 'secret';
CREATE DATABASE kra_network OWNER kra_user;
GRANT ALL PRIVILEGES ON DATABASE kra_network TO kra_user;
"@

# Run the SQL block using psql. If pg_hba.conf requires trust this will succeed without password.
 $tmpFile = New-TemporaryFile
 $tmpPath = $tmpFile.FullName
 Set-Content -Path $tmpPath -Value $sqlCommands
 $exit = Exec-Command "psql" "-U postgres -h 127.0.0.1 -f `"$tmpPath`""
 Remove-Item $tmpPath -ErrorAction SilentlyContinue
if ($exit -ne 0) {
    Write-Error "Could not run SQL as 'postgres'. Ensure pg_hba.conf allows temporary 'trust' for local connections or run the SQL manually as instructed."
    exit $exit
}

# Step 3: restart local postgres service (best-effort)
Write-Host "Restarting local PostgreSQL service '$PostgresServiceName' (may require Admin)..."
try {
    Restart-Service -Name $PostgresServiceName -Force -ErrorAction Stop
    Write-Host "Postgres service restarted."
} catch {
    Write-Warning "Could not restart service $PostgresServiceName automatically. Please run: Restart-Service $PostgresServiceName as Administrator."
}

# Step 4: run init SQL file into kra_network
$initPath = Join-Path $RepoRoot $InitSql
if (-Not (Test-Path $initPath)) {
    Write-Warning "init.sql not found at $initPath. Skipping import."
} else {
    Write-Host "Importing init SQL into kra_network as kra_user..."
    $exit2 = Exec-Command "psql" "-U kra_user -h 127.0.0.1 -d kra_network -f `"$initPath`""
    if ($exit2 -ne 0) { Write-Warning "init.sql import reported errors." }
}

# Step 5: list tables
Write-Host "Listing tables in kra_network (\dt):"
Exec-Command "psql" "-U kra_user -h 127.0.0.1 -d kra_network -c '\\dt'"

Write-Host "Done. If any step failed, follow the manual instructions in README or run the commands interactively." -ForegroundColor Green

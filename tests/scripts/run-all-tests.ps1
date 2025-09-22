# Script para executar todos os testes da Fase II - NoraCOND
# Autor: Sistema de Testes Automatizados
# Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

param(
    [string]$Environment = "development",
    [string]$ApiUrl = "http://localhost:5000/api",
    [string]$FrontendUrl = "http://localhost:3000",
    [switch]$SkipIntegration,
    [switch]$SkipE2E,
    [switch]$SkipLoad,
    [switch]$GenerateReport
)

# Configurações
$TestsDir = Split-Path -Parent $PSScriptRoot
$RootDir = Split-Path -Parent $TestsDir
$ReportsDir = Join-Path $TestsDir "reports"
$LogFile = Join-Path $ReportsDir "test-execution-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Cores para output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"

# Função para logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Função para verificar se um serviço está rodando
function Test-ServiceHealth {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $Response = Invoke-RestMethod -Uri "$Url/health" -Method Get -TimeoutSec 10
        Write-Log "✅ $ServiceName está rodando" -Level "SUCCESS"
        return $true
    }
    catch {
        Write-Log "❌ $ServiceName não está acessível em $Url" -Level "ERROR"
        return $false
    }
}

# Função para executar comando e capturar resultado
function Invoke-TestCommand {
    param([string]$Command, [string]$WorkingDirectory = $TestsDir)
    
    Write-Log "Executando: $Command"
    
    try {
        $Process = Start-Process -FilePath "powershell" -ArgumentList "-Command", $Command -WorkingDirectory $WorkingDirectory -Wait -PassThru -NoNewWindow -RedirectStandardOutput "$env:TEMP\test-output.txt" -RedirectStandardError "$env:TEMP\test-error.txt"
        
        $Output = Get-Content "$env:TEMP\test-output.txt" -Raw
        $Error = Get-Content "$env:TEMP\test-error.txt" -Raw
        
        if ($Process.ExitCode -eq 0) {
            Write-Log "✅ Comando executado com sucesso" -Level "SUCCESS"
            if ($Output) { Write-Log $Output }
            return $true
        }
        else {
            Write-Log "❌ Comando falhou com código $($Process.ExitCode)" -Level "ERROR"
            if ($Error) { Write-Log $Error -Level "ERROR" }
            return $false
        }
    }
    catch {
        Write-Log "❌ Erro ao executar comando: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
    finally {
        # Limpar arquivos temporários
        Remove-Item "$env:TEMP\test-output.txt" -ErrorAction SilentlyContinue
        Remove-Item "$env:TEMP\test-error.txt" -ErrorAction SilentlyContinue
    }
}

# Início do script
Write-Host "========================================" -ForegroundColor $Blue
Write-Host "EXECUÇÃO DE TESTES - FASE II NORACOND" -ForegroundColor $Blue
Write-Host "========================================" -ForegroundColor $Blue

# Criar diretório de relatórios se não existir
if (!(Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null
}

Write-Log "Iniciando execução de testes da Fase II"
Write-Log "Ambiente: $Environment"
Write-Log "API URL: $ApiUrl"
Write-Log "Frontend URL: $FrontendUrl"
Write-Log "Diretório de testes: $TestsDir"
Write-Log "Arquivo de log: $LogFile"

# Variáveis de controle
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0
$StartTime = Get-Date

# ========================================
# ETAPA 1: Verificação de Pré-requisitos
# ========================================
Write-Host "`n🔍 ETAPA 1: Verificando pré-requisitos..." -ForegroundColor $Yellow
Write-Log "Verificando pré-requisitos do ambiente"

# Verificar se Node.js está instalado
try {
    $NodeVersion = node --version
    Write-Log "✅ Node.js instalado: $NodeVersion"
}
catch {
    Write-Log "❌ Node.js não encontrado. Instale Node.js para continuar." -Level "ERROR"
    exit 1
}

# Verificar se .NET está instalado
try {
    $DotNetVersion = dotnet --version
    Write-Log "✅ .NET instalado: $DotNetVersion"
}
catch {
    Write-Log "❌ .NET não encontrado. Instale .NET para continuar." -Level "ERROR"
    exit 1
}

# Verificar se k6 está instalado (para testes de carga)
if (!$SkipLoad) {
    try {
        $K6Version = k6 version
        Write-Log "✅ k6 instalado: $K6Version"
    }
    catch {
        Write-Log "⚠️ k6 não encontrado. Testes de carga serão pulados." -Level "WARNING"
        $SkipLoad = $true
    }
}

# Verificar se as dependências estão instaladas
Write-Log "Verificando dependências do projeto de testes"
if (!(Test-Path (Join-Path $TestsDir "node_modules"))) {
    Write-Log "Instalando dependências..."
    $InstallResult = Invoke-TestCommand "npm install"
    if (!$InstallResult) {
        Write-Log "❌ Falha ao instalar dependências" -Level "ERROR"
        exit 1
    }
}

# ========================================
# ETAPA 2: Verificação de Serviços
# ========================================
Write-Host "`n🌐 ETAPA 2: Verificando serviços..." -ForegroundColor $Yellow
Write-Log "Verificando se os serviços estão rodando"

$ApiHealthy = Test-ServiceHealth -Url $ApiUrl -ServiceName "API Backend"
$FrontendHealthy = Test-ServiceHealth -Url $FrontendUrl -ServiceName "Frontend React"

if (!$ApiHealthy) {
    Write-Log "⚠️ API não está rodando. Alguns testes podem falhar." -Level "WARNING"
}

if (!$FrontendHealthy) {
    Write-Log "⚠️ Frontend não está rodando. Testes E2E podem falhar." -Level "WARNING"
}

# ========================================
# ETAPA 3: Testes de Integração
# ========================================
if (!$SkipIntegration) {
    Write-Host "`n🔗 ETAPA 3: Executando testes de integração..." -ForegroundColor $Yellow
    Write-Log "Iniciando testes de integração"
    
    $env:API_URL = $ApiUrl
    $env:NODE_ENV = $Environment
    
    $IntegrationResult = Invoke-TestCommand "npm run test:integration"
    $TotalTests++
    
    if ($IntegrationResult) {
        Write-Log "✅ Testes de integração concluídos com sucesso" -Level "SUCCESS"
        $PassedTests++
    }
    else {
        Write-Log "❌ Testes de integração falharam" -Level "ERROR"
        $FailedTests++
    }
}
else {
    Write-Log "⏭️ Testes de integração pulados conforme solicitado"
}

# ========================================
# ETAPA 4: Testes End-to-End (E2E)
# ========================================
if (!$SkipE2E) {
    Write-Host "`n🎭 ETAPA 4: Executando testes End-to-End..." -ForegroundColor $Yellow
    Write-Log "Iniciando testes E2E"
    
    $env:API_URL = $ApiUrl
    $env:FRONTEND_URL = $FrontendUrl
    $env:NODE_ENV = $Environment
    
    $E2EResult = Invoke-TestCommand "npm run test:e2e"
    $TotalTests++
    
    if ($E2EResult) {
        Write-Log "✅ Testes E2E concluídos com sucesso" -Level "SUCCESS"
        $PassedTests++
    }
    else {
        Write-Log "❌ Testes E2E falharam" -Level "ERROR"
        $FailedTests++
    }
}
else {
    Write-Log "⏭️ Testes E2E pulados conforme solicitado"
}

# ========================================
# ETAPA 5: Testes de Carga
# ========================================
if (!$SkipLoad) {
    Write-Host "`n⚡ ETAPA 5: Executando testes de carga..." -ForegroundColor $Yellow
    Write-Log "Iniciando testes de carga com k6"
    
    $env:API_URL = $ApiUrl
    $env:TEST_EMAIL = "teste@noracond.com"
    $env:TEST_PASSWORD = "senha123"
    
    # Executar teste de stress principal
    Write-Log "Executando teste de stress (50 usuários, 10 minutos)"
    $StressTestResult = Invoke-TestCommand "k6 run load-tests/stress-test.js"
    $TotalTests++
    
    if ($StressTestResult) {
        Write-Log "✅ Teste de stress concluído" -Level "SUCCESS"
        $PassedTests++
    }
    else {
        Write-Log "❌ Teste de stress falhou" -Level "ERROR"
        $FailedTests++
    }
    
    # Executar teste de performance adicional
    Write-Log "Executando teste de performance detalhado"
    $PerfTestResult = Invoke-TestCommand "k6 run load-tests/performance-test.js"
    $TotalTests++
    
    if ($PerfTestResult) {
        Write-Log "✅ Teste de performance concluído" -Level "SUCCESS"
        $PassedTests++
    }
    else {
        Write-Log "❌ Teste de performance falhou" -Level "ERROR"
        $FailedTests++
    }
}
else {
    Write-Log "⏭️ Testes de carga pulados conforme solicitado"
}

# ========================================
# ETAPA 6: Geração de Relatórios
# ========================================
if ($GenerateReport) {
    Write-Host "`n📊 ETAPA 6: Gerando relatórios..." -ForegroundColor $Yellow
    Write-Log "Gerando relatórios de teste"
    
    # Gerar relatório de cobertura
    $CoverageResult = Invoke-TestCommand "npm run test:coverage"
    
    # Gerar relatório HTML
    $ReportResult = Invoke-TestCommand "npm run test:report"
    
    if ($CoverageResult -and $ReportResult) {
        Write-Log "✅ Relatórios gerados com sucesso" -Level "SUCCESS"
        Write-Log "Relatórios disponíveis em: $ReportsDir"
    }
    else {
        Write-Log "⚠️ Alguns relatórios podem não ter sido gerados corretamente" -Level "WARNING"
    }
}

# ========================================
# ETAPA 7: Resumo Final
# ========================================
$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host "`n========================================" -ForegroundColor $Blue
Write-Host "RESUMO DA EXECUÇÃO DE TESTES" -ForegroundColor $Blue
Write-Host "========================================" -ForegroundColor $Blue

Write-Log "Execução de testes concluída"
Write-Log "Tempo total: $($Duration.ToString('hh\:mm\:ss'))"
Write-Log "Total de suítes de teste: $TotalTests"
Write-Log "Suítes aprovadas: $PassedTests"
Write-Log "Suítes falharam: $FailedTests"

if ($FailedTests -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor $Green
    Write-Log "✅ Todos os testes da Fase II foram executados com sucesso" -Level "SUCCESS"
    $ExitCode = 0
}
else {
    Write-Host "❌ ALGUNS TESTES FALHARAM" -ForegroundColor $Red
    Write-Log "❌ $FailedTests de $TotalTests suítes de teste falharam" -Level "ERROR"
    $ExitCode = 1
}

# Critérios de aceitação da Fase II
Write-Host "`n📋 CRITÉRIOS DE ACEITAÇÃO DA FASE II:" -ForegroundColor $Yellow
Write-Host "✅ 95% dos casos de teste de Integração e E2E executados com sucesso" -ForegroundColor $(if ($PassedTests/$TotalTests -ge 0.95) { $Green } else { $Red })
Write-Host "✅ Nenhum bug crítico ou de bloqueio identificado" -ForegroundColor $(if ($FailedTests -eq 0) { $Green } else { $Red })
Write-Host "✅ Teste de carga com taxa de erro < 1% e tempos < 500ms" -ForegroundColor $(if (!$SkipLoad -and $PassedTests -gt 0) { $Green } else { $Yellow })
Write-Host "✅ Relatório de bugs e resultados gerado" -ForegroundColor $(if ($GenerateReport) { $Green } else { $Yellow })

Write-Host "`nArquivo de log completo: $LogFile" -ForegroundColor $Blue

# Abrir relatórios se gerados
if ($GenerateReport -and (Test-Path $ReportsDir)) {
    Write-Host "`n📂 Abrindo diretório de relatórios..." -ForegroundColor $Blue
    Start-Process explorer.exe -ArgumentList $ReportsDir
}

Write-Host "========================================" -ForegroundColor $Blue

exit $ExitCode
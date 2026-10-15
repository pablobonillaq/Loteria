<#
  Genera los audios de la Loteria con una voz en espanol instalada en Windows.
  Los guarda en android\app\src\main\res\raw\ para que se incluyan dentro del APK.
  Asi la app se escucha en cualquier equipo (Fire TV, TVs sin voz en espanol, etc.).

  Uso:
    powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1
    powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1 -Forzar          (vuelve a generar todo)
    powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1 -Voz Sabina -Forzar  (elegir voz)
    powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1 -Listar          (ver voces)
#>
param(
  [string]$Voz = "",
  [switch]$Forzar,
  [switch]$Listar
)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$cartasTs = Join-Path $raiz 'src\data\cartas.ts'
$destino = Join-Path $raiz 'android\app\src\main\res\raw'

# ---------- Normalizador de volumen (C#, rapido) ----------
Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Text;
public static class LoteriaWav {
  // Lleva el pico al maximo y aplica una saturacion suave (tanh) para que suene mas fuerte.
  public static void Normalizar(string ruta, double k) {
    byte[] b = File.ReadAllBytes(ruta);
    if (b.Length < 44 || Encoding.ASCII.GetString(b, 0, 4) != "RIFF") return;
    int pos = 12, bits = 16, dataPos = -1, dataLen = 0;
    while (pos + 8 <= b.Length) {
      string id = Encoding.ASCII.GetString(b, pos, 4);
      int len = BitConverter.ToInt32(b, pos + 4);
      if (id == "fmt ") {
        int tag = BitConverter.ToUInt16(b, pos + 8);
        bits = BitConverter.ToInt16(b, pos + 22);
        if (tag != 1 && tag != 0xFFFE) return;
      } else if (id == "data") {
        dataPos = pos + 8;
        dataLen = (len <= 0 || len > b.Length - dataPos) ? b.Length - dataPos : len;
        break;
      }
      if (len < 0) return;
      pos += 8 + len + (len & 1);
    }
    if (dataPos < 0 || bits != 16) return;
    int n = dataLen / 2, max = 1;
    for (int i = 0; i < n; i++) {
      int s = Math.Abs((int)BitConverter.ToInt16(b, dataPos + 2 * i));
      if (s > max) max = s;
    }
    double tk = Math.Tanh(k);
    for (int i = 0; i < n; i++) {
      double x = BitConverter.ToInt16(b, dataPos + 2 * i) / (double)max;
      short o = (short)Math.Round(Math.Tanh(k * x) / tk * 32000.0);
      byte[] ob = BitConverter.GetBytes(o);
      b[dataPos + 2 * i] = ob[0];
      b[dataPos + 2 * i + 1] = ob[1];
    }
    File.WriteAllBytes(ruta, b);
  }
}
"@

# ---------- Textos a grabar ----------
$abre = [string][char]0x00A1   # signo de exclamacion de apertura
$contenido = [System.IO.File]::ReadAllText($cartasTs, [System.Text.Encoding]::UTF8)
$patron = "numero:\s*(\d+),\s*nombre:\s*'((?:[^'\\]|\\.)*)',\s*icono:\s*'(?:[^'\\]|\\.)*',\s*verso:\s*'((?:[^'\\]|\\.)*)'"
$encontradas = [regex]::Matches($contenido, $patron)
if ($encontradas.Count -ne 54) { throw "Se esperaban 54 cartas en $cartasTs y se encontraron $($encontradas.Count)" }

$audios = New-Object System.Collections.ArrayList
[void]$audios.Add(@{ Archivo = 'inicio'; Texto = "${abre}Se va y se corre!" })
[void]$audios.Add(@{ Archivo = 'fin'; Texto = "${abre}Se acabaron las cartas!" })
foreach ($m in $encontradas) {
  $num = [int]$m.Groups[1].Value
  $nombre = $m.Groups[2].Value -replace "\\'", "'"
  $verso = $m.Groups[3].Value -replace "\\'", "'"
  $nn = $num.ToString('00')
  [void]$audios.Add(@{ Archivo = "carta_$nn"; Texto = "${abre}$nombre!" })
  [void]$audios.Add(@{ Archivo = "verso_$nn"; Texto = "$verso... ${abre}$nombre!" })
}

function Elegir-Voz($voces, $obtenerIdioma, $obtenerNombre) {
  if ($Voz) { return $voces | Where-Object { (& $obtenerNombre $_) -like "*$Voz*" } | Select-Object -First 1 }
  $v = $voces | Where-Object { (& $obtenerIdioma $_) -like 'es-MX' } | Select-Object -First 1
  if (-not $v) { $v = $voces | Where-Object { (& $obtenerIdioma $_) -like 'es-*' } | Select-Object -First 1 }
  return $v
}

# ---------- Motor 1: voces de escritorio (System.Speech / SAPI) ----------
Add-Type -AssemblyName System.Speech
$sapi = New-Object System.Speech.Synthesis.SpeechSynthesizer
$vocesSapi = @($sapi.GetInstalledVoices() | Where-Object { $_.Enabled } | ForEach-Object { $_.VoiceInfo })

# ---------- Motor 2: voces modernas de Windows 10/11 (WinRT) ----------
$vocesWinRT = @()
$asTask = $null
try {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime
  [void][Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
  $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  } | Select-Object -First 1
  $vocesWinRT = @([Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices)
} catch {
  $vocesWinRT = @()
}

if ($Listar) {
  Write-Host "Voces de escritorio (SAPI):"
  $vocesSapi | ForEach-Object { Write-Host ("  {0}  [{1}]" -f $_.Name, $_.Culture.Name) }
  Write-Host "Voces de Windows 10/11:"
  $vocesWinRT | ForEach-Object { Write-Host ("  {0}  [{1}]" -f $_.DisplayName, $_.Language) }
  exit 0
}

$vozSapi = Elegir-Voz $vocesSapi { param($v) $v.Culture.Name } { param($v) $v.Name }
$vozWinRT = $null
if (-not $vozSapi) { $vozWinRT = Elegir-Voz $vocesWinRT { param($v) $v.Language } { param($v) $v.DisplayName } }

if (-not $vozSapi -and -not $vozWinRT) {
  Write-Host ""
  Write-Host "[AVISO] No hay ninguna voz en espanol instalada en Windows." -ForegroundColor Yellow
  Write-Host "  Instala una en: Configuracion > Hora e idioma > Voz > Agregar voces > Espanol (Mexico)"
  Write-Host "  y vuelve a ejecutar este script. Voces disponibles ahora:"
  $vocesSapi | ForEach-Object { Write-Host ("    {0}  [{1}]" -f $_.Name, $_.Culture.Name) }
  $vocesWinRT | ForEach-Object { Write-Host ("    {0}  [{1}]" -f $_.DisplayName, $_.Language) }
  exit 2
}

New-Item -ItemType Directory -Force -Path $destino | Out-Null

if ($vozSapi) {
  Write-Host ("Usando la voz: {0} [{1}]" -f $vozSapi.Name, $vozSapi.Culture.Name)
  $sapi.SelectVoice($vozSapi.Name)
  $sapi.Volume = 100
  $sapi.Rate = 0
  $formato = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
} else {
  Write-Host ("Usando la voz: {0} [{1}]" -f $vozWinRT.DisplayName, $vozWinRT.Language)
  $winrt = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
  $winrt.Voice = $vozWinRT
  try { $winrt.Options.AudioVolume = 1.0 } catch {}
  $metodo = $asTask.MakeGenericMethod([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
}

$hechos = 0
foreach ($a in $audios) {
  $ruta = Join-Path $destino ($a.Archivo + '.wav')
  if ((Test-Path $ruta) -and -not $Forzar) { continue }

  if ($vozSapi) {
    $sapi.SetOutputToWaveFile($ruta, $formato)
    $sapi.Speak($a.Texto)
    $sapi.SetOutputToNull()
  } else {
    $tarea = $metodo.Invoke($null, @($winrt.SynthesizeTextToStreamAsync($a.Texto)))
    [void]$tarea.Wait(-1)
    $flujo = $tarea.Result
    $entrada = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($flujo)
    $salida = [System.IO.File]::Create($ruta)
    $entrada.CopyTo($salida)
    $salida.Close()
    $entrada.Dispose()
    $flujo.Dispose()
  }
  [LoteriaWav]::Normalizar($ruta, 1.8)
  $hechos++
  Write-Host ("  {0}.wav  ->  {1}" -f $a.Archivo, $a.Texto)
}
$sapi.Dispose()

Write-Host ""
Write-Host ("Audios generados: {0} (en {1})" -f $hechos, $destino)
exit 0

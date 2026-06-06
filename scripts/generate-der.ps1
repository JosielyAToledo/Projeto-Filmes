Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\documentacao-banco-dados"
$outputPath = Join-Path $outputDir "DER-Projeto-Filmes.png"
$width = 2100
$height = 1200
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(247, 249, 252))

$titleFont = New-Object System.Drawing.Font("Arial", 30, [System.Drawing.FontStyle]::Bold)
$subtitleFont = New-Object System.Drawing.Font("Arial", 14)
$headerFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$fieldFont = New-Object System.Drawing.Font("Consolas", 11)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 36, 58))
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 45, 62))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 92, 112))
$headerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 87, 160))
$boxBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(124, 145, 177), 2)
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(65, 82, 110), 3)

$graphics.DrawString("Diagrama Entidade-Relacionamento", $titleFont, $titleBrush, 70, 35)
$graphics.DrawString("Projeto Filmes - Catalogo de filmes", $subtitleFont, $mutedBrush, 74, 83)

$entities = @(
    @{ Name = "USUARIOS"; X = 70; Y = 170; W = 430; Fields = @("PK  id : INT", "    nome : VARCHAR(120)", "UK  email : VARCHAR(160)", "    senha_hash : VARCHAR(255)", "    tipo_usuario : ENUM", "    status : ENUM", "    foto_perfil_url : VARCHAR(255)", "    created_at : TIMESTAMP", "    updated_at : TIMESTAMP") },
    @{ Name = "GENEROS"; X = 70; Y = 650; W = 430; Fields = @("PK  id : INT", "UK  nome : VARCHAR(80)", "    descricao : TEXT", "    created_at : TIMESTAMP", "    updated_at : TIMESTAMP") },
    @{ Name = "FILMES"; X = 750; Y = 170; W = 520; Fields = @("PK  id : INT", "    titulo : VARCHAR(180)", "    titulo_original : VARCHAR(180)", "    descricao : TEXT", "    ano_lancamento : INT", "FK  genero_id : INT", "FK  genero_secundario_id : INT", "    diretor : VARCHAR(140)", "    elenco : TEXT", "    duracao : VARCHAR(40)", "    classificacao : VARCHAR(30)", "    pais : VARCHAR(80)", "    capa/banner/trailer_url : VARCHAR", "    status : ENUM", "    destaque : BOOLEAN", "FK  criado_por : INT", "    created_at / updated_at : TIMESTAMP") },
    @{ Name = "AVALIACOES_FILMES"; X = 1530; Y = 170; W = 470; Fields = @("PK  id : INT", "FK  filme_id : INT", "FK  usuario_id : INT", "    nota : TINYINT (1 a 5)", "    comentario : TEXT", "    created_at : TIMESTAMP", "    updated_at : TIMESTAMP", "UK  filme_id + usuario_id") },
    @{ Name = "FAVORITO_FILMES"; X = 1530; Y = 680; W = 470; Fields = @("PK  id : INT", "FK  filme_id : INT", "FK  usuario_id : INT", "    created_at : TIMESTAMP", "UK  filme_id + usuario_id") }
)

function Get-Height($entity) { 78 + ($entity.Fields.Count * 27) }
function Get-Point($entity, $side) {
    $height = Get-Height $entity
    if ($side -eq "Left") { return [System.Drawing.PointF]::new($entity.X, $entity.Y + ($height / 2)) }
    return [System.Drawing.PointF]::new($entity.X + $entity.W, $entity.Y + ($height / 2))
}
function Draw-Relation($from, $to) {
    $a = Get-Point $from "Right"
    $b = Get-Point $to "Left"
    $graphics.DrawLine($linePen, $a, $b)
    $graphics.FillEllipse($headerBrush, $a.X - 6, $a.Y - 6, 12, 12)
    $graphics.FillEllipse($headerBrush, $b.X - 6, $b.Y - 6, 12, 12)
}

$map = @{}
foreach ($entity in $entities) { $map[$entity.Name] = $entity }
Draw-Relation $map["USUARIOS"] $map["FILMES"]
Draw-Relation $map["GENEROS"] $map["FILMES"]
Draw-Relation $map["FILMES"] $map["AVALIACOES_FILMES"]
Draw-Relation $map["FILMES"] $map["FAVORITO_FILMES"]
Draw-Relation $map["USUARIOS"] $map["AVALIACOES_FILMES"]
Draw-Relation $map["USUARIOS"] $map["FAVORITO_FILMES"]

foreach ($entity in $entities) {
    $height = Get-Height $entity
    $graphics.FillRectangle($boxBrush, $entity.X, $entity.Y, $entity.W, $height)
    $graphics.FillRectangle($headerBrush, $entity.X, $entity.Y, $entity.W, 58)
    $graphics.DrawRectangle($borderPen, $entity.X, $entity.Y, $entity.W, $height)
    $graphics.DrawString($entity.Name, $headerFont, [System.Drawing.Brushes]::White, $entity.X + 18, $entity.Y + 17)
    $y = $entity.Y + 70
    foreach ($field in $entity.Fields) {
        $brush = if ($field.StartsWith("PK")) { $headerBrush } elseif ($field.StartsWith("FK")) { [System.Drawing.Brushes]::DarkRed } else { $textBrush }
        $graphics.DrawString($field, $fieldFont, $brush, $entity.X + 15, $y)
        $y += 27
    }
}

$graphics.DrawString("Legenda: PK = chave primaria | FK = chave estrangeira | UK = chave unica", $subtitleFont, $mutedBrush, 70, 1125)
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
Write-Output "DER gerado em: $outputPath"

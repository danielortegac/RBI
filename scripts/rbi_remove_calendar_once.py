from pathlib import Path
import hashlib, re, subprocess

EXPECTED_BEFORE = {
    'cafeteria-perfecta/index.html': '2dfed786eb4ae156ecb968adb1fa0db2648b330c',
    'calendario/index.html': '14c68c4678d5a4300c81f894ed19bf0dde6936b8',
    'clientes-para-siempre/index.html': '0b752b891b3d3e439d09b45221ed2b1b1df8503a',
    'contacto/index.html': 'f4845bcc750178bea6c4fc1138f8c9e07f76594f',
    'index.html': '2f899eefab456658e7f5dc05e159bf2600dea08e',
    'mesero-5-estrellas/index.html': '672322f3496072f4ded177b8289cbe8d1669fe3a',
    'mision-posible/index.html': '034211c97ddd1e8939cf40693abaf42a1c0376e8',
    'restaurante-rentable/index.html': '5d06173f799c7cc2b34af85bc910b8c40a5a4e33',
    'sitemap.xml': '177e9c1a4ebab4c5b94824726877ccf36cfb114b',
}
EXPECTED_AFTER = {
    'cafeteria-perfecta/index.html': '3bb63fa7271ffc6ae55255c7102613b3cd0f943d',
    'calendario/index.html': '5b0a7fcd48c0cecdc24ffe109ab6751a4971ad02',
    'clientes-para-siempre/index.html': '250e38b215df68403d1e50017ba3652cf6a58f98',
    'contacto/index.html': '286387288206b9dbbdbc89e6c2c6ab0c8dd997a3',
    'index.html': '761a7112b4f894755ae04bc3ccaac5d9ed21c1b8',
    'mesero-5-estrellas/index.html': 'df3bbfb6452f69d833acbc5150d7c9f8c3beecc2',
    'mision-posible/index.html': '37d799f239c99eacc6e09515d1c8b06aa9b16707',
    'restaurante-rentable/index.html': 'a459d694e9581d24a6aa752a0c520019ae1af019',
    'sitemap.xml': '83d7b7a3483fb4d9932b8853c90ee327a763fcf4',
}
COURSES = [
    'cafeteria-perfecta/index.html',
    'clientes-para-siempre/index.html',
    'mesero-5-estrellas/index.html',
    'mision-posible/index.html',
    'restaurante-rentable/index.html',
]
WORKFLOW = Path('.github/workflows/rbi-remove-calendar-once.yml')
SCRIPT = Path('scripts/rbi_remove_calendar_once.py')

def blob_sha(data: bytes) -> str:
    return hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()

def require_replace(text: str, old: str, new: str, rel: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'ABORTADO: patrón esperado {count} veces en {rel}')
    return text.replace(old, new, 1)

def require_regex(text: str, pattern: str, rel: str, flags=0) -> str:
    text, count = re.subn(pattern, '', text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'ABORTADO: bloque esperado {count} veces en {rel}')
    return text

for rel, expected in EXPECTED_BEFORE.items():
    actual = blob_sha(Path(rel).read_bytes())
    if actual != expected:
        raise SystemExit(f'ABORTADO: {rel} cambió. Esperado {expected}; encontrado {actual}')

for rel in COURSES:
    p = Path(rel)
    text = p.read_text(encoding='utf-8')
    text = require_replace(text, '<a class="nav-link" href="../calendario/">Calendario</a>', '', rel)
    text = require_regex(text, r'<section class="section soft course-dates-section" id="fechas">\n.*?</section>\n', rel, re.S)
    text = require_replace(text, '<a href="../calendario/">Calendario académico</a>', '', rel)
    text = require_regex(text, r"^    const cal=document\.createElement\('button'\); cal\.textContent='Calendario';.*\n", rel, re.M)
    p.write_text(text, encoding='utf-8')

rel = 'contacto/index.html'
p = Path(rel)
text = p.read_text(encoding='utf-8')
text = require_replace(text, '<a class="nav-link" href="../calendario/">Calendario</a>', '', rel)
text = require_replace(text, 'cursos, calendario, capacitaciones', 'cursos, capacitaciones', rel)
text = require_replace(text, '<a href="../calendario/">Calendario académico</a>', '', rel)
text = require_regex(text, r"^    const cal=document\.createElement\('button'\); cal\.textContent='Calendario';.*\n", rel, re.M)
p.write_text(text, encoding='utf-8')

rel = 'index.html'
p = Path(rel)
text = p.read_text(encoding='utf-8')
text = require_replace(text, '<a class="nav-link" href="calendario/">Calendario</a>', '', rel)
text = require_replace(text, '<a class="btn ghost" href="calendario/">Ver calendario</a>', '', rel)
text = require_replace(text, '<a href="calendario/">Calendario académico</a>', '', rel)
text = require_regex(text, r"^    const cal=document\.createElement\('button'\); cal\.textContent='Calendario';.*\n", rel, re.M)
p.write_text(text, encoding='utf-8')

Path('calendario/index.html').write_text('''<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="0; url=../contacto/">
  <link rel="canonical" href="https://www.rbi-restaurantsbusinessinstitute.com.mx/contacto/">
  <title>RBI · Contacto</title>
  <script>location.replace('../contacto/');</script>
</head>
<body>
  <p><a href="../contacto/">Ir a contacto RBI</a></p>
</body>
</html>
''', encoding='utf-8')

rel = 'sitemap.xml'
p = Path(rel)
text = p.read_text(encoding='utf-8')
text = require_replace(text, '  <url><loc>https://www.rbi-restaurantsbusinessinstitute.com.mx/calendario/</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n', '', rel)
p.write_text(text, encoding='utf-8')

for rel, expected in EXPECTED_AFTER.items():
    actual = blob_sha(Path(rel).read_bytes())
    if actual != expected:
        raise SystemExit(f'ABORTADO: resultado inesperado en {rel}. Esperado {expected}; obtenido {actual}')

if WORKFLOW.exists():
    WORKFLOW.unlink()
if SCRIPT.exists():
    SCRIPT.unlink()
status = subprocess.check_output(['git', 'status', '--porcelain=v1'], text=True).splitlines()
changed = {line[3:] for line in status if len(line) >= 4}
expected_changed = set(EXPECTED_AFTER) | {str(WORKFLOW), str(SCRIPT)}
if changed != expected_changed:
    raise SystemExit(f'ABORTADO: archivos modificados inesperados: {sorted(changed ^ expected_changed)}')

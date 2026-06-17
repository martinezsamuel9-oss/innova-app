# INNOVA 504 — Sitio web (Ecosistema ARROW)

Sitio **informativo, estático** (HTML + CSS + JavaScript puro, sin frameworks ni build).
Funciona en **cualquier hosting**: solo son archivos. No necesita servidor Node, base de datos ni compilación.

---

## 📁 Estructura

```
innova504-site/
├── index.html              ← página principal
├── assets/
│   ├── css/styles.css      ← estilos
│   ├── js/main.js          ← animación del núcleo + selector ES/EN
│   └── img/arrow-mark.svg  ← logo / favicon
└── README.md               ← este archivo
```

> Para publicar, sube **el contenido** de la carpeta `innova504-site/` (que `index.html` quede en la raíz del sitio).

---

## 🚀 Cómo publicarlo (opciones gratuitas / muy económicas)

Cualquiera sirve. Recomendadas de más fácil a más control:

### Opción A — Cloudflare Pages (gratis, rápido, SSL incluido)
1. Crea cuenta en https://pages.cloudflare.com
2. "Create a project" → "Direct Upload".
3. Arrastra el contenido de `innova504-site/`.
4. Te da una URL `*.pages.dev`. Luego conecta tu dominio (ver más abajo).

### Opción B — Netlify (gratis)
1. https://app.netlify.com → "Add new site" → "Deploy manually".
2. Arrastra la carpeta `innova504-site/`.
3. Listo. Conecta el dominio en *Domain settings*.

### Opción C — GitHub Pages (gratis)
1. Sube esta carpeta a un repositorio de GitHub.
2. Settings → Pages → Branch `main` / carpeta raíz.
3. Sirve en `usuario.github.io/repo`. Soporta dominio propio.

### Opción D — Hosting tradicional (cPanel / Hostinger, etc.)
- Sube los archivos por FTP a `public_html/`. Nada más.

---

## 🌐 Conectar tu dominio de GoDaddy (innova504.com)

Tu dominio (DNS) está en GoDaddy y puedes apuntarlo a **donde montes el sitio**, sin migrar nada.
En GoDaddy entra a: **Mis productos → Dominio → DNS / Administrar DNS**.

### Si usas Cloudflare Pages / Netlify / GitHub Pages
Añade estos registros (los valores exactos te los da cada plataforma; estos son los típicos):

| Tipo  | Nombre (Host) | Valor                         | Notas                          |
|-------|---------------|-------------------------------|--------------------------------|
| CNAME | `www`         | `tu-sitio.pages.dev` (o el que te den) | dominio con www            |
| A / ALIAS | `@`       | el que indique la plataforma  | dominio raíz `innova504.com`   |

- **Netlify**: usa los DNS/registros que muestra en *Domain settings → Add custom domain*.
- **GitHub Pages**: registros `A` → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`, y `CNAME` de `www` a `usuario.github.io`.
- **Cloudflare Pages**: lo más simple es cambiar los *nameservers* de GoDaddy a los de Cloudflare; ellos gestionan todo y el SSL.

> Tras guardar, la propagación tarda de minutos a unas horas. El **certificado SSL (https)** lo emiten gratis las tres plataformas.

---

## 🔗 Subdominios de las apps (importante)

El sitio enlaza a:
- `arrow.innova504.com` → **Arrow** (gestión de obras)
- `budget.innova504.com` → **Arrow Budget** (presupuestos)
- `dovehawks.innova504.com` → **Arrow Dovehawks** (próximamente)

Cada subdominio se configura **aparte**, con un registro `CNAME` o `A` en GoDaddy apuntando a donde esté alojada cada app.
Si alguna URL cambia, edítala en `index.html` (busca `innova504.com`) — están todas juntas y son fáciles de localizar.

---

## ✏️ Editar contenido

- **Textos (ES/EN):** en `assets/js/main.js`, objeto `dict` (dos bloques: `es` y `en`). Cambia ambos para mantener el selector de idioma.
- **Colores corporativos:** en `assets/css/styles.css`, bloque `:root` (variables `--gold`, `--orange`, `--green`, `--blue`, `--bg`, …).
- **Apps / tarjetas:** en `index.html`, secciones con clase `node--app` (núcleo animado) y `app-card` (tarjetas del ecosistema).
- **Agregar una app nueva:** duplica un bloque `node--app` en el hero y una `article.app-card` en la sección Ecosistema. Las líneas del núcleo se dibujan solas hacia cualquier nodo nuevo.

---

## ✅ Notas

- Respeta `prefers-reduced-motion`: si el usuario desactiva animaciones, el sitio se ve estático.
- Totalmente responsive (escritorio, tablet, móvil).
- Idioma recordado en el navegador del visitante (localStorage).
- Sin dependencias externas salvo las fuentes de Google Fonts (puedes autoalojarlas si quieres 100 % offline).

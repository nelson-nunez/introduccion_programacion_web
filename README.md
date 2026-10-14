<p align="center">
  <img src="assets/readme/hero.svg" alt="Perfil Académico Interactivo: formulario con DNI y nota, tabla de asignaturas y diez estilos de color" width="100%">
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-0f2540?logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1f5aa8?logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ffb300?logo=javascript&logoColor=black">
  <img alt="Sin dependencias" src="https://img.shields.io/badge/dependencias-0-2e7d32">
</p>

> Formulario web que valida tus datos personales y asignaturas aprobadas, y genera un perfil con cálculos derivados del DNI y estadísticas académicas.

TP de **Introducción a la Programación Web** — Universidad Abierta Interamericana (UAI).

## Qué hace

1. Valida el registro en el cliente (letras, DNI de 7–8 dígitos, fecha no futura, provincia, etc.), con mensajes de error accesibles (`role="alert"`).
2. Permite cargar asignaturas (nombre, año, nota 1–10) en una tabla; exige **mínimo 5**.
3. Genera el **perfil**: código personal, iniciales, edad aproximada, y conteo de letras, vocales y consonantes.
4. Calcula **estadísticas**: promedio, nota máxima, mínima y clasificación.
5. Aplica un **estilo visual según el último dígito del DNI** (10 temas, `estilo0`–`estilo9`).
6. Guarda, carga y elimina el perfil con `localStorage`.

## Cómo funciona

| Dato | Regla |
|---|---|
| Número personal | Suma de los dígitos del DNI módulo 10 |
| Código personal | `iniciales + últimos 3 dígitos del DNI + "-" + total de letras` (ej. `jp789-9`) |
| Clasificación | promedio `< 6` a mejorar · `< 8` bueno · `< 9` muy bueno · `≥ 9` destacado |
| Tema visual | Clase `estilo{último dígito}` sobre `<body>`, que redefine variables CSS |

## Usar

No requiere instalación ni build. Abrí [index.html](index.html) en el navegador.

En VS Code, la configuración [.vscode/launch.json](.vscode/launch.json) lo abre en Chrome con F5.

## Estructura

```text
├── index.html     # Formulario, tabla y secciones de resultados
├── estilos.css    # Variables CSS y los 10 temas por dígito de DNI
├── script.js      # Validaciones, cálculos, render y persistencia
└── Guia_TP_2.docx # Consigna del trabajo práctico
```

## Autor

Nuñez Nelson — UAI, Introducción a la Programación Web.

<!-- TODO: agregar captura real del perfil generado en assets/readme/ y licencia -->

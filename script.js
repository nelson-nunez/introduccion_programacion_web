"use strict";

// #region Datos
const PROVINCIAS = [
    "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Catamarca", "Chaco", "Chubut",
    "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
    "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
    "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

const CLAVE_STORAGE = "perfil";

const DNI_MIN = 1000000;      // 7 digitos
const DNI_MAX = 99999999;     // 8 digitos
const ANIO_NACIMIENTO_MIN = 1900;

const ANIO_MIN = 2000;
const NOTA_MIN = 1;
const NOTA_MAX = 10;
const MATERIAS_MINIMAS = 5;

// Clases por ultimo digito del dni
const CLASES_ESTILO = [
    "estilo0", "estilo1", "estilo2", "estilo3", "estilo4",
    "estilo5", "estilo6", "estilo7", "estilo8", "estilo9"
];

// Materias cargadas: nombre, anio, nota
const materias = [];
// #endregion

// #region Referencias al dom
const $ = (id) => document.getElementById(id);

const form = $("formRegistro");
const txtApellido = $("txtApellido");
const txtNombre = $("txtNombre");
const txtFechaNacimiento = $("txtFechaNacimiento");
const txtDni = $("txtDni");
const txtLugarNacimiento = $("txtLugarNacimiento");
const selProvincia = $("selProvincia");
const txtPrimaria = $("txtPrimaria");
const txtSecundaria = $("txtSecundaria");
const txtCarrera = $("txtCarrera");

// Campos de la persona
const camposPersona = {
    apellido: txtApellido,
    nombre: txtNombre,
    fechaNacimiento: txtFechaNacimiento,
    dni: txtDni,
    lugarNacimiento: txtLugarNacimiento,
    provinciaNacimiento: selProvincia,
    escuelaPrimaria: txtPrimaria,
    escuelaSecundaria: txtSecundaria,
    carrera: txtCarrera
};

// Materias
const txtMateria = $("txtMateria");
const txtAnio = $("txtAnio");
const txtNota = $("txtNota");
const btnAgregarMateria = $("btnAgregarMateria");
const tbodyMaterias = $("tbodyMaterias");
const errMaterias = $("err-materias");

// Botones
const btnCalcularEstadisticas = $("btnCalcularEstadisticas");
const btnGuardar = $("btnGuardar");
const btnCargar = $("btnCargar");
const btnCambiarVisualizacion = $("btnCambiarVisualizacion");
const btnLimpiar = $("btnLimpiar");
const btnEliminar = $("btnEliminar");

// Secciones
const seccionPerfil = $("seccionPerfil");
const seccionCalculos = $("seccionCalculos");
const seccionEstadisticas = $("seccionEstadisticas");
const mensajeEstado = $("mensajeEstado");
// #endregion

// #region Mensajes
function limpiarError(input) {
    $("err-" + input.id).textContent = "";
    input.removeAttribute("aria-invalid");
}

function mostrarMensaje(texto) {
    mensajeEstado.textContent = texto;
}
// #endregion

// #region Formato

// Solo letras y espacios
function onlyLetters(valor) {
    return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$/.test(valor);
}

// Solo digitos mayores a 0
function onlyIntegerNumber(valor) {
    return /^\d+$/.test(valor) && Number(valor) > 0;
}

// Nota a numero (acepta coma)
function parsearNota(valor) {
    return Number(valor.trim().replace(",", "."));
}
// #endregion

// #region Validadores compartidos
function validarSoloLetras(valor, etiqueta) {
    const v = valor.trim();
    if (!v) return `${etiqueta} es obligatorio.`;
    if (v.length < 2) return `${etiqueta} debe tener al menos 2 caracteres.`;
    if (!onlyLetters(v)) return `${etiqueta} solo admite letras y espacios.`;
    return "";
}

// Texto libre
function validarTextoLibre(valor) {
    const v = valor.trim();
    if (!v) return "Este campo es obligatorio.";
    if (v.length < 3) return "Debe tener al menos 3 caracteres.";
    if (!/^[\p{L}\p{N}][\p{L}\p{N} .,'’°()\/-]*$/u.test(v)) {
        return "Contiene caracteres no permitidos.";
    }
    return "";
}
// #endregion

// #region Campos a validar

// Campos del registro
const campos = [
    { el: txtApellido, validar() { return validarSoloLetras(txtApellido.value, "El apellido"); } },
    { el: txtNombre, validar() { return validarSoloLetras(txtNombre.value, "El nombre"); } },
    {
        el: txtFechaNacimiento,
        validar() {
            const v = txtFechaNacimiento.value;
            if (!v) return "La fecha de nacimiento es obligatoria.";
            if (new Date(v) > new Date()) return "La fecha de nacimiento no puede ser futura.";
            if (Number(v.slice(0, 4)) < ANIO_NACIMIENTO_MIN) {
                return `El año de nacimiento debe ser ${ANIO_NACIMIENTO_MIN} o posterior.`;
            }
            return "";
        }
    },
    {
        el: txtDni,
        validar() {
            const v = txtDni.value.trim();
            if (!v) return "El DNI es obligatorio.";
            if (!onlyIntegerNumber(v)) return "El DNI solo admite números, sin puntos ni símbolos.";
            if (Number(v) < DNI_MIN || Number(v) > DNI_MAX) {
                return "El DNI debe tener 7 u 8 dígitos (entre 1.000.000 y 99.999.999).";
            }
            return "";
        }
    },
    { el: txtLugarNacimiento, validar() { return validarSoloLetras(txtLugarNacimiento.value, "El lugar de nacimiento"); } },
    { el: selProvincia, validar() { return selProvincia.value ? "" : "Seleccioná una provincia."; } },
    { el: txtPrimaria, validar() { return validarTextoLibre(txtPrimaria.value); } },
    { el: txtSecundaria, validar() { return validarTextoLibre(txtSecundaria.value); } },
    { el: txtCarrera, validar() { return validarTextoLibre(txtCarrera.value); } }
];

// Campos de materias
const camposMateria = [
    {
        el: txtMateria,
        validar() {
            const mensaje = validarTextoLibre(txtMateria.value);
            if (mensaje) return mensaje;

            const nombre = txtMateria.value.trim().toLocaleLowerCase("es");
            for (const materia of materias) {
                if (materia.nombre.toLocaleLowerCase("es") === nombre) return "Ya cargaste esa materia.";
            }
            return "";
        }
    },
    {
        el: txtAnio,
        validar() {
            const v = txtAnio.value.trim();
            if (!v) return "El año es obligatorio.";
            if (!onlyIntegerNumber(v)) return "El año solo admite números mayores a 0, sin símbolos.";
            if (v.length !== 4) return "Ingresá el año con 4 dígitos.";

            // No anterior al nacimiento
            const anioMinimo = Math.max(ANIO_MIN, Number(txtFechaNacimiento.value.slice(0, 4)));
            const anioActual = new Date().getFullYear();
            if (Number(v) < anioMinimo || Number(v) > anioActual) {
                return `El año debe estar entre ${anioMinimo} y ${anioActual}.`;
            }
            return "";
        }
    },
    {
        el: txtNota,
        validar() {
            const v = txtNota.value.trim();
            if (!v) return "La nota es obligatoria.";
            // Numero con coma o punto opcional
            if (!/^\d+(?:[.,]\d+)?$/.test(v)) return "Ingresá un número sin símbolos, por ejemplo 8 o 7,5.";

            const nota = parsearNota(v);
            if (nota < NOTA_MIN || nota > NOTA_MAX) {
                return `La nota debe estar entre ${NOTA_MIN} y ${NOTA_MAX}.`;
            }
            return "";
        }
    }
];

const todosLosCampos = [...campos, ...camposMateria];

// Valida un campo
function validarCampo(campo) {
    const mensaje = campo.validar();
    $("err-" + campo.el.id).textContent = mensaje;

    if (mensaje) {
        campo.el.setAttribute("aria-invalid", "true");
    } else {
        campo.el.removeAttribute("aria-invalid");
    }
    return mensaje === "";
}

// Valida todos los campos
function validarGrupo(lista) {
    const invalidos = [];
    for (const campo of lista) {
        if (!validarCampo(campo)) invalidos.push(campo);
    }
    return invalidos;
}

// Minimo de materias
function validarCantidadMaterias(minimo) {
    const alcanza = materias.length >= minimo;
    errMaterias.textContent = alcanza
        ? ""
        : `Cargá al menos ${minimo} ${minimo === 1 ? "asignatura aprobada" : "asignaturas aprobadas"}.`;
    return alcanza;
}

// Valida todo el formulario
function validarDatos() {
    const invalidos = validarGrupo(campos);
    const materiasOk = validarCantidadMaterias(MATERIAS_MINIMAS);

    if (invalidos.length > 0) invalidos[0].el.focus();
    return invalidos.length === 0 && materiasOk;
}
// #endregion

// #region Calculos del dni
function obtenerUltimoDigito(dni) {
    return Number(dni.slice(-1));
}

function calcularSumaDNI(dni) {
    let suma = 0;
    for (const digito of dni) suma += Number(digito);
    return suma;
}

function calcularNumeroPersonal(sumaDni) {
    return sumaDni % 10;
}
// #endregion

// #region Calculos del nombre
// Cuenta letras, sin espacios
function contarLetras(texto) {
    return (texto.match(/\p{L}/gu) ?? []).length;
}

function contarVocales(texto) {
    return (texto.match(/[aeiouáéíóúü]/gi) ?? []).length;
}

function contarConsonantes(texto) {
    return contarLetras(texto) - contarVocales(texto);
}

// Ej: jp789-9
function generarCodigoPersonal(iniciales, dni, totalLetras) {
    return `${iniciales}${dni.slice(-3)}-${totalLetras}`;
}

// Primera letra en mayuscula
function capitalizar(texto) {
    const palabras = texto.toLocaleLowerCase("es").split(" ");
    for (let i = 0; i < palabras.length; i++) {
        palabras[i] = palabras[i].charAt(0).toLocaleUpperCase("es") + palabras[i].slice(1);
    }
    return palabras.join(" ");
}
// #endregion

// #region Calculos academicos
function calcularEstadisticas(listaMaterias) {
    let suma = 0;
    let notaMaxima = NOTA_MIN;
    let notaMinima = NOTA_MAX;

    for (const materia of listaMaterias) {
        suma += materia.nota;
        notaMaxima = Math.max(notaMaxima, materia.nota);
        notaMinima = Math.min(notaMinima, materia.nota);
    }

    return {
        cantidad: listaMaterias.length,
        promedio: Math.round(suma / listaMaterias.length * 100) / 100,
        notaMaxima,
        notaMinima
    };
}

function clasificarRendimiento(promedio) {
    if (promedio < 6) return "Rendimiento académico a mejorar";
    if (promedio < 8) return "Buen rendimiento académico";
    if (promedio < 9) return "Muy buen rendimiento académico";
    return "Rendimiento académico destacado";
}

// Coma decimal
function formatearNota(nota) {
    return String(nota).replace(".", ",");
}
// #endregion

// #region Estilo por dni
function aplicarEstiloPorDNI(dni) {
    quitarEstiloPorDNI();
    document.body.classList.add(`estilo${obtenerUltimoDigito(dni)}`);
}

function quitarEstiloPorDNI() {
    document.body.classList.remove(...CLASES_ESTILO);
}
// #endregion

// #region Materias
function renderMaterias() {
    tbodyMaterias.replaceChildren();
    errMaterias.textContent = "";

    if (materias.length === 0) {
        const fila = tbodyMaterias.insertRow();
        const celda = fila.insertCell();
        celda.colSpan = 4;
        celda.textContent = "Todavía no cargaste asignaturas.";
    }

    for (const [indice, materia] of materias.entries()) {
        const fila = tbodyMaterias.insertRow();
        fila.insertCell().textContent = materia.nombre;
        fila.insertCell().textContent = materia.anio;
        fila.insertCell().textContent = formatearNota(materia.nota);

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Quitar";
        boton.setAttribute("aria-label", `Quitar ${materia.nombre}`);
        boton.addEventListener("click", () => {
            materias.splice(indice, 1);
            renderMaterias();
        });
        fila.insertCell().append(boton);
    }

    // Actualiza estadisticas visibles
    if (!seccionEstadisticas.hidden) {
        if (materias.length > 0) {
            mostrarEstadisticas();
        } else {
            seccionEstadisticas.hidden = true;
        }
    }
}

function agregarMateria() {
    const invalidos = validarGrupo(camposMateria);
    if (invalidos.length > 0) {
        invalidos[0].el.focus();
        return;
    }

    materias.push({
        nombre: txtMateria.value.trim(),
        anio: Number(txtAnio.value.trim()),
        nota: parsearNota(txtNota.value)
    });
    renderMaterias();

    for (const campo of camposMateria) {
        campo.el.value = "";
        limpiarError(campo.el);
    }
    txtMateria.focus();
}
// #endregion

// #region Mostrar resultados
// Completa los data-campo
function mostrarCampos(contenedor, valores) {
    for (const [clave, valor] of Object.entries(valores)) {
        contenedor.querySelector(`[data-campo="${clave}"]`).textContent = valor;
    }
}

function mostrarPerfil(persona) {
    const nombreCompleto = `${persona.nombre} ${persona.apellido}`;
    const iniciales = (persona.nombre[0] + persona.apellido[0]).toLocaleUpperCase("es");
    const sumaDni = calcularSumaDNI(persona.dni);
    const totalLetras = contarLetras(nombreCompleto);
    const anioNacimiento = Number(persona.fechaNacimiento.slice(0, 4));

    mostrarCampos(seccionPerfil, {
        nombreApellido: `${capitalizar(persona.nombre)} ${capitalizar(persona.apellido)}`,
        // Ultimos 3 digitos visibles
        dni: "*".repeat(persona.dni.length - 3) + persona.dni.slice(-3),
        fechaNacimiento: persona.fechaNacimiento.split("-").reverse().join("/"),
        lugarNacimiento: `${capitalizar(persona.lugarNacimiento)}, ${persona.provinciaNacimiento}`,
        escuelaPrimaria: persona.escuelaPrimaria,
        escuelaSecundaria: persona.escuelaSecundaria,
        carrera: persona.carrera,
        codigoPersonal: generarCodigoPersonal(iniciales, persona.dni, totalLetras),
        ultimoDigito: obtenerUltimoDigito(persona.dni),
        sumaDni,
        numeroPersonal: calcularNumeroPersonal(sumaDni),
        iniciales,
        totalLetras,
        vocales: contarVocales(nombreCompleto),
        consonantes: contarConsonantes(nombreCompleto),
        anioNacimiento,
        edadAproximada: new Date().getFullYear() - anioNacimiento
    });

    seccionPerfil.hidden = false;
    aplicarEstiloPorDNI(persona.dni);
    mostrarEstadisticas();
}

// Requiere una materia
function mostrarEstadisticas() {
    const estadisticas = calcularEstadisticas(materias);

    mostrarCampos(seccionEstadisticas, {
        cantidad: estadisticas.cantidad,
        promedio: formatearNota(estadisticas.promedio),
        notaMaxima: formatearNota(estadisticas.notaMaxima),
        notaMinima: formatearNota(estadisticas.notaMinima),
        clasificacion: clasificarRendimiento(estadisticas.promedio)
    });
    seccionEstadisticas.hidden = false;
}
// #endregion

// #region Persistencia
// Lee el formulario
function leerFormulario() {
    const persona = {};
    for (const [clave, el] of Object.entries(camposPersona)) {
        persona[clave] = el.value.trim();
    }
    return persona;
}

function guardarDatos() {
    if (!validarDatos()) return;

    const perfil = { persona: leerFormulario(), materias };
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(perfil));
    mostrarMensaje("Perfil guardado.");
}

// True si se cargo
function cargarDatos() {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (!guardado) return false;

    try {
        const perfil = JSON.parse(guardado);

        for (const [clave, el] of Object.entries(camposPersona)) {
            el.value = perfil.persona[clave];
        }
        materias.length = 0;
        materias.push(...perfil.materias);
        renderMaterias();
        mostrarPerfil(perfil.persona);
        return true;
    } catch {
        // Datos danados, se descartan
        localStorage.removeItem(CLAVE_STORAGE);
        return false;
    }
}

// Opcional: borra lo guardado
function limpiarDatos(borrarGuardado = false) {
    form.reset();
    for (const campo of todosLosCampos) limpiarError(campo.el);

    seccionPerfil.hidden = true;
    seccionCalculos.hidden = false;
    seccionEstadisticas.hidden = true;
    quitarEstiloPorDNI();

    materias.length = 0;
    renderMaterias();

    if (borrarGuardado) localStorage.removeItem(CLAVE_STORAGE);
    mostrarMensaje(borrarGuardado ? "Datos guardados eliminados." : "");
}
// #endregion

// #region Eventos
// Restricciones al escribir
const CARACTERES_PROHIBIDOS = {
    onlyLetters: /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]/g,
    onlyNumber: /[^\d.,]/g,
    onlyIntegerNumber: /\D/g
};

for (const [clase, prohibidos] of Object.entries(CARACTERES_PROHIBIDOS)) {
    for (const input of document.querySelectorAll(`input.${clase}`)) {
        input.addEventListener("beforeinput", (e) => {
            if (e.data && e.data.replace(prohibidos, "") !== e.data) e.preventDefault();
        });
        input.addEventListener("input", () => {
            const limpio = input.value.replace(prohibidos, "");
            if (limpio !== input.value) input.value = limpio;
        });
    }
}

// Validacion en vivo
for (const campo of todosLosCampos) {
    campo.el.addEventListener("change", () => validarCampo(campo));
    campo.el.addEventListener("input", () => {
        if (campo.el.getAttribute("aria-invalid") === "true") validarCampo(campo);
    });
}

// Enter agrega materia
btnAgregarMateria.addEventListener("click", agregarMateria);
for (const campo of camposMateria) {
    campo.el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            agregarMateria();
        }
    });
}

// Generar perfil
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validarDatos()) {
        mostrarPerfil(leerFormulario());
        mostrarMensaje("");
    }
});

btnCalcularEstadisticas.addEventListener("click", () => {
    if (validarCantidadMaterias(1)) mostrarEstadisticas();
});

btnGuardar.addEventListener("click", guardarDatos);

btnCargar.addEventListener("click", () => {
    mostrarMensaje(cargarDatos() ? "Perfil cargado." : "No hay un perfil guardado.");
});

// Muestra u oculta calculos
btnCambiarVisualizacion.addEventListener("click", () => {
    seccionCalculos.hidden = !seccionCalculos.hidden;
});

btnLimpiar.addEventListener("click", () => limpiarDatos());
btnEliminar.addEventListener("click", () => {
    if (confirm("¿Estás seguro de eliminar los datos guardados? Esta acción no se puede deshacer.")) {
        limpiarDatos(true);
    }
});
// #endregion

// #region Inicio
selProvincia.replaceChildren(new Option("Seleccioná una provincia", ""));
for (const provincia of PROVINCIAS) selProvincia.add(new Option(provincia, provincia));

renderMaterias();
cargarDatos();
// #endregion

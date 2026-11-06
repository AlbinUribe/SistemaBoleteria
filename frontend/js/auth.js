// =============================================================
// auth.js · Sesión, protección de páginas y utilidades compartidas
// =============================================================

const CLAVE_SESION = 'tq_sesion';
const CLAVE_CARRITO = 'tq_carrito';

const $ = (id) => document.getElementById(id);

// ---------- Sesión ----------
const obtenerSesion = () => JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');

function guardarSesion(u) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ id: u.id, nombreUsuario: u.nombreUsuario, rol: u.rol }));
}

function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_CARRITO);
    location.href = 'login.html';
}

// Cada página declara en <body data-rol=""> quién puede entrar
function protegerPagina() {
    const requerido = document.body.dataset.rol;
    const sesion = obtenerSesion();
    if (!requerido) return;

    if (!sesion) {
        const volver = location.pathname.split('/').pop() + location.search;
        location.replace('login.html?volver=' + encodeURIComponent(volver));
    } else if (requerido === 'ADMIN' && sesion.rol !== 'ADMIN') {
        location.replace('eventos.html');
    } else if (requerido === 'USUARIO' && sesion.rol === 'ADMIN') {
        location.replace('admin-eventos.html');
    }
}

// ---------- Formato ----------
const esc = (t) => String(t).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatoMoneda = (n) => 'RD$ ' + Number(n).toLocaleString('es-DO');

const formatoFecha = (iso) =>
    new Date(iso.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------- Avisos ----------
let temporizador;
function toast(mensaje, malo = false) {
    const t = $('toast');
    t.textContent = mensaje;
    t.className = 'toast' + (malo ? ' bad' : '');
    t.hidden = false;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { t.hidden = true; }, 3500);
}

function mostrarMensaje(id, texto, ok = false) {
    const el = $(id);
    el.textContent = texto;
    el.className = 'alert' + (ok ? ' ok' : '');
    el.hidden = false;
}

// ---------- Validación de formularios ----------
const MENSAJES_PATRON = {
    nombreUsuario: 'De 4 a 20 caracteres: letras, números o _',
    password: 'Mínimo 8 caracteres, con letras y números',
    tarjeta: 'Número de tarjeta no válido',
    vence: 'Usa el formato MM/AA',
    cvv: 'Deben ser 3 o 4 dígitos',
    codigo: 'Deben ser 6 dígitos'
};

function validarCampo(campo) {
    campo.classList.add('touched');
    const err = campo.closest('.f') && campo.closest('.f').querySelector('.err');
    const v = campo.validity;
    let texto = '';

    if (!v.valid) {
        if (v.valueMissing) texto = 'Este campo es obligatorio';
        else if (v.patternMismatch) texto = MENSAJES_PATRON[campo.id] || 'Formato no válido';
        else if (v.tooShort) texto = `Mínimo ${campo.minLength} caracteres`;
        else if (v.typeMismatch) texto = 'Formato no válido';
        else if (v.rangeUnderflow) texto = `El mínimo es ${campo.min}`;
        else texto = 'Valor no válido';
    }
    if (err) err.textContent = texto;
    return v.valid;
}

function validar(form) {
    let ok = true;
    form.querySelectorAll('input, select, textarea').forEach((c) => {
        if (!validarCampo(c)) ok = false;
    });
    return ok;
}

// Valida cada campo al salir de él y mientras se corrige
function activarValidacion(form) {
    form.querySelectorAll('input, select, textarea').forEach((c) => {
        c.addEventListener('blur', () => validarCampo(c));
        c.addEventListener('input', () => { if (c.classList.contains('touched')) validarCampo(c); });
    });
}

protegerPagina();

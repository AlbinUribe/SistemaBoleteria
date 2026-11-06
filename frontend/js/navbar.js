// navbar.js · Dibuja la MISMA barra de navegación en todas las páginas
(function () {
    const sesion = obtenerSesion();
    const pagina = document.body.dataset.page;
    const carrito = JSON.parse(sessionStorage.getItem(CLAVE_CARRITO) || 'null');
    const cantidad = carrito ? carrito.items.reduce((s, i) => s + i.cantidad, 0) : 0;

    const enlaces = [
        { href: 'eventos.html', texto: 'Eventos', paginas: ['eventos', 'evento-detalle'] }
    ];

    if (!sesion) {
        enlaces.push({ href: 'login.html', texto: 'Iniciar sesión', paginas: ['login', 'verificar-correo'] });
        enlaces.push({ href: 'registro.html', texto: 'Registrarse', paginas: ['registro'] });
    } else if (sesion.rol === 'ADMIN') {
        enlaces.push({ href: 'admin-eventos.html', texto: 'Administración', paginas: ['admin-eventos'] });
        enlaces.push({ href: 'admin-reportes.html', texto: 'Reportes', paginas: ['admin-reportes'] });
    } else {
        enlaces.push({ href: 'mis-tickets.html', texto: 'Mis tickets', paginas: ['mis-tickets', 'recibo'] });
        enlaces.push({ href: 'pago.html', texto: `🛒 Carrito (${cantidad})`, paginas: ['pago'] });
    }

    const links = enlaces
        .map((e) => `<a href="${e.href}" class="${e.paginas.includes(pagina) ? 'on' : ''}">${e.texto}</a>`)
        .join('');

    const usuario = sesion
        ? `<span class="muted" style="margin-left:22px">Hola, ${esc(sesion.nombreUsuario)}</span><a href="#" id="btnSalir">Salir</a>`
        : '';

    $('navbar').innerHTML = `
        <div class="nav">
            <a class="logo" href="eventos.html">Tiqueta<span>Do</span></a>
            <div>${links}${usuario}</div>
        </div>`;

    const salir = $('btnSalir');
    if (salir) {
        salir.addEventListener('click', (ev) => {
            ev.preventDefault();
            cerrarSesion();
        });
    }
})();

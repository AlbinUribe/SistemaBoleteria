// evento-detalle.js · Detalle del evento y selección de tickets
const id = new URLSearchParams(location.search).get('id');
let evento = null;

async function cargar() {
    try {
        evento = await API.evento(id);
    } catch (err) {
        toast(err.message, true);
        setTimeout(() => { location.href = 'eventos.html'; }, 1200);
        return;
    }

    document.title = evento.nombre + ' · TiquetaDo';
    $('titulo').textContent = evento.nombre;
    $('categoria').textContent = evento.categoria;
    $('info').textContent = `📅 ${formatoFecha(evento.fecha)} · ${evento.hora}   📍 ${evento.lugar}`;
    $('descripcion').textContent = evento.descripcion;
    if (evento.imagen) $('poster').innerHTML = `<img src="${esc(evento.imagen)}" alt="">`;

    $('tipos').innerHTML = evento.tipos.map((t) => {
        const max = Math.min(CONFIG.MAX_TICKETS, t.disponibles);
        const opciones = Array.from({ length: max + 1 }, (_, n) => `<option>${n}</option>`).join('');
        return `
            <div class="row">
                <div><b>${esc(t.nombre)}</b><br>
                    <span class="muted">${t.disponibles > 0 ? t.disponibles + ' disponibles' : 'Agotado'}</span></div>
                <div class="price">${formatoMoneda(t.precio)}</div>
                <select data-tipo="${t.id}" ${t.disponibles === 0 ? 'disabled' : ''}>${opciones}</select>
            </div>`;
    }).join('');

    document.querySelectorAll('#tipos select').forEach((s) => s.addEventListener('change', recalcular));
}

// Lee las cantidades elegidas
function seleccion() {
    return [...document.querySelectorAll('#tipos select')]
        .map((s) => {
            const tipo = evento.tipos.find((t) => t.id === Number(s.dataset.tipo));
            return { tipoId: tipo.id, nombre: tipo.nombre, precio: tipo.precio, cantidad: Number(s.value) };
        })
        .filter((i) => i.cantidad > 0);
}

function recalcular() {
    const items = seleccion();
    const cantidad = items.reduce((s, i) => s + i.cantidad, 0);
    const total = items.reduce((s, i) => s + i.cantidad * i.precio, 0);

    $('total').textContent = formatoMoneda(total);
    $('errCompra').textContent = cantidad > CONFIG.MAX_TICKETS ? `Máximo ${CONFIG.MAX_TICKETS} tickets por compra.` : '';
    $('btnComprar').disabled = cantidad < 1 || cantidad > CONFIG.MAX_TICKETS;
}

$('btnComprar').addEventListener('click', () => {
    const sesion = obtenerSesion();
    if (!sesion) {
        toast('Inicia sesión para comprar tus tickets.', true);
        setTimeout(() => { location.href = 'login.html?volver=' + encodeURIComponent('evento-detalle.html?id=' + id); }, 1000);
        return;
    }
    if (sesion.rol === 'ADMIN') {
        toast('Los administradores no pueden comprar tickets.', true);
        return;
    }
    sessionStorage.setItem(CLAVE_CARRITO, JSON.stringify({
        eventoId: evento.id, titulo: evento.nombre, fecha: evento.fecha, items: seleccion()
    }));
    location.href = 'pago.html';
});

cargar();

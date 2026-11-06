// pago.js · Pago simulado (no se procesa ni se guarda ningún dato de tarjeta)
const carrito = JSON.parse(sessionStorage.getItem(CLAVE_CARRITO) || 'null');
const form = $('formPago');

if (!carrito || !carrito.items.length) {
    toast('Tu carrito está vacío.', true);
    setTimeout(() => { location.href = 'eventos.html'; }, 1200);
} else {
    pintarResumen();
}

function pintarResumen() {
    const total = carrito.items.reduce((s, i) => s + i.cantidad * i.precio, 0);
    $('resumen').innerHTML = `
        <p><b>${esc(carrito.titulo)}</b></p>
        <p class="muted">${formatoFecha(carrito.fecha)}</p>
        ${carrito.items.map((i) => `
            <div class="row"><span>${i.cantidad} × ${esc(i.nombre)}</span><span>${formatoMoneda(i.cantidad * i.precio)}</span></div>`).join('')}`;
    $('total').textContent = formatoMoneda(total);
}

activarValidacion(form);

// Formato automático: "0000 0000 0000 0000" y "MM/AA"
$('tarjeta').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
});
$('vence').addEventListener('input', (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
});

// La tarjeta no puede estar vencida
function vencida() {
    const [mm, aa] = $('vence').value.split('/').map(Number);
    const hoy = new Date();
    return aa < hoy.getFullYear() % 100 || (aa === hoy.getFullYear() % 100 && mm < hoy.getMonth() + 1);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    $('msg').hidden = true;
    if (!validar(form)) return;
    if (vencida()) {
        mostrarMensaje('msg', 'La tarjeta está vencida.');
        return;
    }

    $('btnPagar').disabled = true;
    try {
        const orden = await API.crearOrden(carrito);
        sessionStorage.removeItem(CLAVE_CARRITO);
        location.href = 'recibo.html?id=' + orden.id;
    } catch (err) {
        mostrarMensaje('msg', err.message);
        $('btnPagar').disabled = false;
    }
});

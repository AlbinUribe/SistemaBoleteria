// recibo.js · Muestra el recibo de una orden
const id = new URLSearchParams(location.search).get('id');

async function cargar() {
    try {
        const o = await API.orden(id);
        const fecha = new Date(o.fecha).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' });

        $('meta').innerHTML = `Orden #${String(o.id).padStart(6, '0')} · ${fecha} · <span class="b ${o.estado}">${o.estado}</span>`;
        $('lineas').innerHTML = o.lineas.map((l) => `
            <tr>
                <td>${esc(o.eventoNombre)}</td>
                <td>${esc(l.tipo)}</td>
                <td class="r">${l.cantidad}</td>
                <td class="r">${formatoMoneda(l.cantidad * l.precio)}</td>
            </tr>`).join('');
        $('total').textContent = formatoMoneda(o.total);
    } catch (err) {
        toast(err.message, true);
        setTimeout(() => { location.href = 'mis-tickets.html'; }, 1200);
    }
}

$('btnImprimir').addEventListener('click', () => window.print());
cargar();

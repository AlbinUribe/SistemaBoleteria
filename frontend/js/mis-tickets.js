// mis-tickets.js · Historial de compras del usuario
async function cargar() {
    const ordenes = await API.misOrdenes();
    $('vacio').hidden = ordenes.length > 0;

    $('ordenes').innerHTML = ordenes.map((o) => `
        <tr>
            <td>#${String(o.id).padStart(6, '0')}</td>
            <td>${formatoFecha(o.fecha)}</td>
            <td>${esc(o.eventoNombre)}</td>
            <td class="r">${o.lineas.reduce((s, l) => s + l.cantidad, 0)}</td>
            <td class="r">${formatoMoneda(o.total)}</td>
            <td><span class="b ${o.estado}">${o.estado}</span></td>
            <td><a class="btn out sm" href="recibo.html?id=${o.id}">Ver recibo</a></td>
        </tr>`).join('');
}

cargar();

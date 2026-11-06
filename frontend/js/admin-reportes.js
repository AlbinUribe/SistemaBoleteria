// admin-reportes.js · Reporte de ventas por evento
async function cargar() {
    const filas = await API.reporte($('desde').value, $('hasta').value);

    $('vacio').hidden = filas.length > 0;
    $('stTickets').textContent = filas.reduce((s, f) => s + f.vendidos, 0);
    $('stIngresos').textContent = formatoMoneda(filas.reduce((s, f) => s + f.ingresos, 0));
    $('stEventos').textContent = filas.length;

    $('reporte').innerHTML = filas.map((f) => `
        <tr>
            <td>${esc(f.evento)}</td>
            <td class="r">${f.vendidos}</td>
            <td class="r">${formatoMoneda(f.ingresos)}</td>
        </tr>`).join('');
}

$('formRango').addEventListener('submit', (e) => {
    e.preventDefault();
    cargar();
});

cargar();

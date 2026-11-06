// eventos.js · Listado de eventos con búsqueda y filtros
const lista = $('listaEventos');
const plantilla = $('tplEvento');

async function cargarCategorias() {
    const categorias = await API.categorias();
    categorias.forEach((c) => $('categoria').add(new Option(c.nombre, c.id)));
}

async function cargarEventos() {
    const eventos = await API.eventos({
        buscar: $('buscar').value,
        categoriaId: $('categoria').value,
        fecha: $('fecha').value
    });

    lista.innerHTML = '';
    $('vacio').hidden = eventos.length > 0;

    eventos.forEach((ev, i) => {
        const tarjeta = plantilla.content.cloneNode(true);
        const poster = tarjeta.querySelector('.poster');

        if (ev.imagen) poster.innerHTML = `<img src="${esc(ev.imagen)}" alt="">`;
        else poster.classList.add(['', 'p2', 'p3'][i % 3]);

        tarjeta.querySelector('.tag').textContent = ev.categoria;
        tarjeta.querySelector('h3').textContent = ev.nombre;
        tarjeta.querySelector('.muted').textContent = `${formatoFecha(ev.fecha)} · ${ev.hora} — ${ev.lugar}`;
        tarjeta.querySelector('.price').textContent = 'Desde ' + formatoMoneda(ev.precioDesde);
        tarjeta.querySelector('a').href = 'evento-detalle.html?id=' + ev.id;
        lista.appendChild(tarjeta);
    });
}

$('formFiltros').addEventListener('submit', (e) => {
    e.preventDefault();
    cargarEventos();
});

cargarCategorias().then(cargarEventos);

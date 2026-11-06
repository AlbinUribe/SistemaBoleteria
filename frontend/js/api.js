// =============================================================
// api.js · Capa de datos
// MODO PRUEBA: todo se guarda en localStorage (no hay backend aún).
// Cuando exista el backend, estas funciones pasarán a usar fetch().
// =============================================================

const CLAVE_BD = 'tq_bd';
const CODIGO_PRUEBA = '123456';
const esperar = () => new Promise((r) => setTimeout(r, 120));

function error(mensaje, codigo) {
    const e = new Error(mensaje);
    e.codigo = codigo;
    return e;
}

function leerBD() {
    let bd = JSON.parse(localStorage.getItem(CLAVE_BD) || 'null');
    if (!bd) {
        bd = datosIniciales();
        escribirBD(bd);
    }
    return bd;
}

function escribirBD(bd) {
    localStorage.setItem(CLAVE_BD, JSON.stringify(bd));
}

function datosIniciales() {
    const ev = (id, nombre, categoriaId, fecha, hora, lugar, descripcion) =>
        ({ id, nombre, categoriaId, fecha, hora, lugar, descripcion, imagen: '' });
    const tk = (id, eventoId, nombre, precio, disponibles) =>
        ({ id, eventoId, nombre, precio, disponibles });

    return {
        usuarios: [
            { id: 1, nombreUsuario: 'admin', correo: 'admin@tiqueta.do', password: 'Admin123', rol: 'ADMIN', verificado: true },
            { id: 2, nombreUsuario: 'demo', correo: 'demo@tiqueta.do', password: 'Demo1234', rol: 'USUARIO', verificado: true }
        ],
        categorias: ['Música', 'Deportes', 'Teatro', 'Comedia'].map((nombre, i) => ({ id: i + 1, nombre })),
        eventos: [
            ev(1, 'Festival de Jazz', 1, '2026-11-15', '20:00', 'Teatro Nacional', 'Una noche con los mejores exponentes del jazz caribeño. Puertas abiertas desde las 7:00 PM.'),
            ev(2, 'Noche de Bachata', 1, '2026-11-22', '21:00', 'Altos de Chavón', 'Bachata en vivo bajo las estrellas con artistas invitados.'),
            ev(3, 'Clásico de Béisbol', 2, '2026-11-29', '19:30', 'Estadio Quisqueya', 'El partido más esperado de la temporada.'),
            ev(4, 'La Casa de Bernarda', 3, '2026-12-04', '18:00', 'Palacio de Bellas Artes', 'Una puesta en escena imperdible del teatro clásico.'),
            ev(5, 'Stand-up Night', 4, '2026-12-11', '20:30', 'Sala Ravelo', 'Una noche de risas con los mejores comediantes del país.'),
            ev(6, 'Concierto Sinfónico', 1, '2026-12-18', '19:00', 'Teatro Nacional', 'La Orquesta Sinfónica interpreta sus piezas más queridas.')
        ],
        tipos: [
            tk(1, 1, 'General', 1500, 120), tk(2, 1, 'VIP', 3500, 25), tk(3, 1, 'Preventa', 1200, 0),
            tk(4, 2, 'General', 1500, 200), tk(5, 2, 'VIP', 4000, 30),
            tk(6, 3, 'Gradas', 600, 300), tk(7, 3, 'Palco', 2500, 40),
            tk(8, 4, 'General', 900, 80), tk(9, 4, 'Butaca VIP', 1800, 20),
            tk(10, 5, 'General', 800, 60),
            tk(11, 6, 'General', 1000, 150), tk(12, 6, 'VIP', 2200, 30)
        ],
        ordenes: [
            { id: 101, usuarioId: 2, eventoId: 1, eventoNombre: 'Festival de Jazz', fecha: '2026-10-28T15:42:00', estado: 'PAGADA', lineas: [{ tipo: 'General', cantidad: 2, precio: 1500 }], total: 3000 },
            { id: 102, usuarioId: 2, eventoId: 2, eventoNombre: 'Noche de Bachata', fecha: '2026-11-01T10:15:00', estado: 'PAGADA', lineas: [{ tipo: 'VIP', cantidad: 1, precio: 4000 }], total: 4000 },
            { id: 103, usuarioId: 2, eventoId: 3, eventoNombre: 'Clásico de Béisbol', fecha: '2026-11-03T18:30:00', estado: 'PAGADA', lineas: [{ tipo: 'Gradas', cantidad: 4, precio: 600 }], total: 2400 }
        ]
    };
}

// Agrega al evento su categoría, sus tipos de ticket y el precio "desde"
function conDatos(bd, e) {
    const tipos = bd.tipos.filter((t) => t.eventoId === e.id);
    const disponibles = tipos.filter((t) => t.disponibles > 0);
    const precios = (disponibles.length ? disponibles : tipos).map((t) => t.precio);
    return {
        ...e,
        categoria: bd.categorias.find((c) => c.id === e.categoriaId).nombre,
        tipos,
        precioDesde: precios.length ? Math.min(...precios) : 0
    };
}

const API = {

    // ---------- Autenticación ----------
    async login(identificador, password) {
        await esperar();
        const id = identificador.trim().toLowerCase();
        const u = leerBD().usuarios.find((x) =>
            x.nombreUsuario.toLowerCase() === id || x.correo.toLowerCase() === id);
        if (!u || u.password !== password) throw error('Usuario o contraseña incorrectos.');
        if (!u.verificado) throw error('Debes verificar tu correo antes de entrar.', 'NO_VERIFICADO');
        return { id: u.id, nombreUsuario: u.nombreUsuario, correo: u.correo, rol: u.rol };
    },

    async registro({ nombreUsuario, correo, password }) {
        await esperar();
        const bd = leerBD();
        if (bd.usuarios.some((u) => u.nombreUsuario.toLowerCase() === nombreUsuario.toLowerCase()))
            throw error('Ese nombre de usuario ya está en uso.');
        if (bd.usuarios.some((u) => u.correo.toLowerCase() === correo.toLowerCase()))
            throw error('Ese correo ya está registrado.');
        bd.usuarios.push({
            id: Date.now(), nombreUsuario, correo, password, rol: 'USUARIO', verificado: false
        });
        escribirBD(bd);
        return { codigo: CODIGO_PRUEBA };
    },

    async verificar(correo, codigo) {
        await esperar();
        const bd = leerBD();
        const u = bd.usuarios.find((x) => x.correo.toLowerCase() === correo.toLowerCase());
        if (!u) throw error('No encontramos ese correo.');
        if (codigo !== CODIGO_PRUEBA) throw error('El código es incorrecto.');
        u.verificado = true;
        escribirBD(bd);
    },

    async reenviar() {
        await esperar();
        return { codigo: CODIGO_PRUEBA };
    },

    // ---------- Eventos ----------
    async categorias() {
        await esperar();
        return leerBD().categorias;
    },

    async eventos({ buscar = '', categoriaId = '', fecha = '' } = {}) {
        await esperar();
        const bd = leerBD();
        const hoy = new Date().toISOString().slice(0, 10);
        return bd.eventos
            .filter((e) => e.fecha >= hoy)
            .filter((e) => e.nombre.toLowerCase().includes(buscar.trim().toLowerCase()))
            .filter((e) => !categoriaId || e.categoriaId === Number(categoriaId))
            .filter((e) => !fecha || e.fecha === fecha)
            .map((e) => conDatos(bd, e));
    },

    async evento(id) {
        await esperar();
        const bd = leerBD();
        const e = bd.eventos.find((x) => x.id === Number(id));
        if (!e) throw error('El evento no existe.');
        return conDatos(bd, e);
    },

    // ---------- Compras ----------
    async crearOrden(carrito) {
        await esperar();
        const sesion = obtenerSesion();
        const bd = leerBD();
        const total = carrito.items.reduce((s, i) => s + i.cantidad, 0);
        if (total < 1 || total > CONFIG.MAX_TICKETS)
            throw error(`Puedes comprar entre 1 y ${CONFIG.MAX_TICKETS} tickets por compra.`);

        // Primero se valida todo; el stock se descuenta solo si todo está bien
        const lineas = carrito.items.map((i) => {
            const tipo = bd.tipos.find((t) => t.id === i.tipoId);
            if (!tipo || tipo.disponibles < i.cantidad)
                throw error(`No hay suficientes tickets de ${i.nombre}.`);
            return { tipo, cantidad: i.cantidad };
        });
        lineas.forEach((l) => { l.tipo.disponibles -= l.cantidad; });

        const orden = {
            id: Math.max(100, ...bd.ordenes.map((o) => o.id)) + 1,
            usuarioId: sesion.id,
            eventoId: carrito.eventoId,
            eventoNombre: carrito.titulo,
            fecha: new Date().toISOString(),
            estado: 'PAGADA',
            lineas: lineas.map((l) => ({ tipo: l.tipo.nombre, cantidad: l.cantidad, precio: l.tipo.precio })),
            total: lineas.reduce((s, l) => s + l.cantidad * l.tipo.precio, 0)   // el precio lo define el sistema
        };
        bd.ordenes.push(orden);
        escribirBD(bd);
        return orden;
    },

    async orden(id) {
        await esperar();
        const sesion = obtenerSesion();
        const o = leerBD().ordenes.find((x) => x.id === Number(id));
        if (!o || (sesion.rol !== 'ADMIN' && o.usuarioId !== sesion.id)) throw error('No encontramos esa orden.');
        return o;
    },

    async misOrdenes() {
        await esperar();
        const sesion = obtenerSesion();
        return leerBD().ordenes.filter((o) => o.usuarioId === sesion.id).sort((a, b) => b.id - a.id);
    },

    // ---------- Reportes (admin) ----------
    async reporte(desde = '', hasta = '') {
        await esperar();
        const porEvento = {};
        leerBD().ordenes
            .filter((o) => o.estado === 'PAGADA')
            .filter((o) => !desde || o.fecha.slice(0, 10) >= desde)
            .filter((o) => !hasta || o.fecha.slice(0, 10) <= hasta)
            .forEach((o) => {
                const fila = porEvento[o.eventoNombre] || (porEvento[o.eventoNombre] = { evento: o.eventoNombre, vendidos: 0, ingresos: 0 });
                fila.vendidos += o.lineas.reduce((s, l) => s + l.cantidad, 0);
                fila.ingresos += o.total;
            });
        return Object.values(porEvento).sort((a, b) => b.ingresos - a.ingresos);
    }
};

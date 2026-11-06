// login.js · Inicio de sesión con correo o nombre de usuario
const form = $('formLogin');
activarValidacion(form);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    $('msg').hidden = true;
    if (!validar(form)) return;

    try {
        const usuario = await API.login($('identificador').value, $('password').value);
        guardarSesion(usuario);

        // Solo se permite volver a páginas internas (.html)
        const volver = new URLSearchParams(location.search).get('volver');
        const destinoSeguro = volver && /^[\w-]+\.html(\?.*)?$/.test(volver) ? volver : null;
        location.href = usuario.rol === 'ADMIN' ? 'admin-eventos.html' : (destinoSeguro || 'eventos.html');
    } catch (err) {
        if (err.codigo === 'NO_VERIFICADO') {
            const correo = encodeURIComponent($('identificador').value);
            location.href = 'verificar-correo.html?correo=' + correo;
            return;
        }
        mostrarMensaje('msg', err.message);
    }
});

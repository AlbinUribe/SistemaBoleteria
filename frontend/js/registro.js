// registro.js · Crea la cuenta y manda a verificar el correo
const form = $('formRegistro');
activarValidacion(form);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    $('msg').hidden = true;
    if (!validar(form)) return;

    if ($('password').value !== $('confirmar').value) {
        mostrarMensaje('msg', 'Las contraseñas no coinciden.');
        return;
    }

    try {
        const r = await API.registro({
            nombreUsuario: $('nombreUsuario').value.trim(),
            correo: $('correo').value.trim(),
            password: $('password').value
        });
        toast('Cuenta creada. Código de prueba: ' + r.codigo);
        setTimeout(() => {
            location.href = 'verificar-correo.html?correo=' + encodeURIComponent($('correo').value.trim());
        }, 1200);
    } catch (err) {
        mostrarMensaje('msg', err.message);
    }
});

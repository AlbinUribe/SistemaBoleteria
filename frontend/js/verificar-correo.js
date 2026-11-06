// verificar-correo.js · Activa la cuenta con el código recibido
const correo = new URLSearchParams(location.search).get('correo') || '';
const form = $('formCodigo');
activarValidacion(form);

if (correo) $('destino').textContent = 'Te enviamos un código de verificación a ' + correo;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    $('msg').hidden = true;
    if (!validar(form)) return;

    try {
        await API.verificar(correo, $('codigo').value);
        toast('¡Cuenta verificada! Ya puedes iniciar sesión.');
        setTimeout(() => { location.href = 'login.html'; }, 1200);
    } catch (err) {
        mostrarMensaje('msg', err.message);
    }
});

$('btnReenviar').addEventListener('click', async () => {
    const r = await API.reenviar(correo);
    toast('Correo reenviado. Código de prueba: ' + r.codigo);
});

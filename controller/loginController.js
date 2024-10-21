document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevenir que el formulario se envíe por defecto

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3005/users');
        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }
        const users = await response.json();

        // Validar si el usuario existe con el username y password correctos
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            Swal.fire({
                icon: 'success',
                title: 'Bienvenido',
                text: `Bienvenido, ${user.username}!`
            }).then(() => {
                // Guardar la sesión del usuario en localStorage
                localStorage.setItem('loggedInUser', JSON.stringify(user));

                // Redirigir al catálogo de productos
                window.location.href = '/view/product.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Usuario o contraseña incorrectos'
            });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al iniciar sesión. Por favor, intenta de nuevo.'
        });
    }
});
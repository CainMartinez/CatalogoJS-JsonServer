// URL base de json-server
const apiUrl = 'http://localhost:3005/users'; // Endpoint de usuarios en json-server

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenir el envío del formulario para evitar el recargo de la página
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    if (username && password && email) {
        const newUser = await registerUser(username, password, email);
        if (newUser) {
// Este mensaje solo saldrá un segundo y no redireccionará porque como se modifica el db.json este sv se reinicia y no le da tiempo a terminar la ejecución del sweet alert.
            Swal.fire({
                icon: 'success',
                title: 'Registro exitoso',
                text: 'Usuario registrado exitosamente',
                confirmButtonText: 'OK',
            }).then((result) => {
                window.location.href = '/view/login.html';
            });
        }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, rellena todos los campos.'
        });
    }
});

async function registerUser(username, password, email) {
    try {
        const response = await fetch(`${apiUrl}?username=${username}`);
        const existingUsers = await response.json();

        if (existingUsers.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'El usuario ya existe. Elige otro nombre de usuario.'
            });
            return null;
        }

        const newUser = {
            username,
            password,
            email,
            orders: []
        };

        const postResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        if (postResponse.ok) {
            return newUser;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Error al registrar el usuario.'
            });
            return null;
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error en el registro. Por favor, intenta de nuevo.'
        });
        return null;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadHeaderAndFooter();
    displayRecentlyViewed();
});

// Función para mostrar los productos recientemente visitados
function displayRecentlyViewed() {
    const recentlyViewedContainer = document.createElement('section');
    recentlyViewedContainer.classList.add('recently-viewed');
    const mainContent = document.querySelector('.visiteds');

    // Obtener los productos recientemente visitados del localStorage
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    if (recentlyViewed.length > 0) {
        let recentlyViewedHTML = '<h2>Últimos Visitados</h2><div class="recently-viewed-items">';

        recentlyViewed.forEach(product => {
            recentlyViewedHTML += `
                <div class="recent-item">
                    <img src="${product.img}" alt="${product.titulo}">
                    <p>${product.titulo}</p>
                </div>
            `;
        });

        recentlyViewedHTML += '</div>';
        recentlyViewedContainer.innerHTML = recentlyViewedHTML;
        mainContent.appendChild(recentlyViewedContainer);
    }
}

function loadHeaderAndFooter() {
    const headerHTML = `
        <header>
            <nav>
                <ul>
                    <li><a href="/index.html">Inicio</a></li>
                    <li><a href="/view/product.html">Catálogo</a></li>
                    <li class="historial hidden"><a href="/view/order.html">Historial</a></li>
                    <li class="carrito hidden"><a href="/view/cart.html"><i class="fas fa-shopping-cart"></i>&nbspCarrito</a></li>
                </ul>
            </nav>
            <div class="logo">
                <h1>Catálogo</h1>
            </div>
            <div class="auth">
                <a href="/view/login.html" class="btn-auth login-btn">Iniciar Sesión</a>
                <a href="/view/register.html" class="btn-auth register-btn">Crear Cuenta</a>
                <a href="#" class="btn-auth logout-btn hidden">Cerrar Sesión</a>
            </div>
        </header>
    `;

    const footerHTML = `
        <footer>
            <p>&copy; 2024 Catálogo Digital - Todos los derechos reservados</p>
        </footer>
    `;

    // Insertar header y footer dinámicamente
    document.getElementById('header-placeholder').innerHTML = headerHTML;
    document.getElementById('footer-placeholder').innerHTML = footerHTML;

    // Verificar el estado de login del usuario
    checkLoginStatus();

    // Actualizar el highlight del carrito en el header
    updateCartHighlight();
}

function checkLoginStatus() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        // Oculta botones de login y registro
        document.querySelector('.login-btn').classList.add('hidden');
        document.querySelector('.register-btn').classList.add('hidden');

        // Muestra botones de carrito e historial
        document.querySelector('.carrito').classList.remove('hidden');
        document.querySelector('.historial').classList.remove('hidden');

        // Muestra el botón de logout y el nombre del usuario
        document.querySelector('.logout-btn').classList.remove('hidden');
        const authDiv = document.querySelector('.auth');
        authDiv.insertAdjacentHTML('afterbegin', `<span>Bienvenido, ${loggedInUser.username}</span>`);

        // Añadir evento de logout
        document.querySelector('.logout-btn').addEventListener('click', logoutUser);
    }
}

function logoutUser() {
    // Eliminar el usuario de localStorage
    localStorage.removeItem('loggedInUser');
    // Mostrar mensaje de logout correcto
    Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente',
        confirmButtonText: 'OK'
    }).then(() => {
        // Redirigir al usuario
        window.location.href = '/index.html';
    });
}

// Función para actualizar el highlight del carrito en el header
function updateCartHighlight() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        const userCartKey = `cart_${loggedInUser.username}`;
        const cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];
        const cartLink = document.querySelector('nav ul li a[href="/view/cart.html"]');
        if (cartItems.length > 0) {
            cartLink.classList.add('cart-highlight');
        } else {
            cartLink.classList.remove('cart-highlight');
        }
    }
}
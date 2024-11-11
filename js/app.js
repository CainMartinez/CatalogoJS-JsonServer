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
        let recentlyViewedHTML = '<h2>Últimos Visitados por nuestros clientes</h2><div class="recently-viewed-items">';

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
        <nav>
            <ul>
                <li><a href="/view/product.html">MediTejidos</a></li>
            </ul>
            <div class="auth">
                <a href="/view/login.html" class="btn-auth login-btn">Iniciar Sesión</a>
                <a href="/view/register.html" class="btn-auth register-btn">Crear Cuenta</a>
                <div class="dropdown hidden">
                    <span class="dropdown-toggle">Bienvenido, Usuario</span>
                    <ul class="dropdown-menu">
                        <li class="historial">
                            <a href="/view/order.html"><i class="fas fa-history"></i>&nbsp;Historial</a>
                        </li>
                        <li>
                            <a href="/view/cart.html"><i class="fas fa-shopping-cart"></i>&nbsp;Carrito</a>
                        </li>
                        <li>
                            <a href="#" class="btn-auth logout-btn">Cerrar Sesión</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;

    const footerHTML = `
            <p>&copy; 2024 Catálogo Digital - Todos los derechos reservados</p>
    `;

    // Insertar header y footer dinámicamente
    document.getElementById('header-placeholder').innerHTML = headerHTML;
    document.getElementById('footer-placeholder').innerHTML = footerHTML;

    // Verificar el estado de login del usuario
    checkLoginStatus();
    if(checkLoginStatus()){
        updateCartHighlight();
    }
    // Actualizar el highlight del carrito en el header
}

function checkLoginStatus() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        // Ocultar botones de login y registro
        document.querySelector('.login-btn').classList.add('hidden');
        document.querySelector('.register-btn').classList.add('hidden');

        // Mostrar el menú desplegable y actualizar el nombre del usuario
        const dropdown = document.querySelector('.dropdown');
        dropdown.classList.remove('hidden');
        dropdown.querySelector('.dropdown-toggle').textContent = `Bienvenido, ${loggedInUser.username}`;

        // Añadir evento de logout
        document.querySelector('.logout-btn').addEventListener('click', logoutUser);
    } else {
        // Mostrar solo los botones de login y registro si no hay usuario logueado
        document.querySelector('.login-btn').classList.remove('hidden');
        document.querySelector('.register-btn').classList.remove('hidden');

        // Asegurarse de ocultar el menú desplegable, carrito e historial
        document.querySelector('.dropdown').classList.add('hidden');
        document.querySelector('.carrito').classList.add('hidden');
    }
}

function logoutUser() {
    // Eliminar el usuario de localStorage
    localStorage.removeItem('loggedInUser');
    // Mostrar mensaje de logout correcto
    window.location.href = 'product.html';
    
}

// Función para actualizar el highlight del carrito en el header
function updateCartHighlight() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        const userCartKey = `cart_${loggedInUser.username}`;
        const cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];
        
        // Referencia a los elementos
        const cartCount = document.querySelector('.cart-count');
        const welcomeSpan = document.querySelector('.dropdown-toggle');

        // Si hay artículos, resaltar el span de bienvenida y mostrar el contador
        if (cartItems.length > 0) {
            welcomeSpan.classList.add('highlight');
            cartCount.classList.remove('hidden');
            cartCount.textContent = cartItems.length; // Muestra la cantidad de artículos
        } else {
            welcomeSpan.classList.remove('highlight');
            cartCount.classList.add('hidden');
        }
    }
}
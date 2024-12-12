document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay un token válido
    const token = localStorage.getItem('token');
    if (token) {
        // Verificar si el token es válido
        fetch('/check-auth', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Token inválido');
            }
        })
        .then(data => {
            console.log('Autenticación exitosa:', data);
            window.location.href = '/inicio.html';
        })
        .catch((error) => {
            console.error('Error de autenticación:', error);
            localStorage.removeItem('token');
        });
    }

    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            localStorage.setItem('token', data.token);
            window.location.href = '/inicio.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al iniciar sesión: ' + error.message);
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay un token válido
    const token = localStorage.getItem('token');
    if (token) {
        // Verificar si el token es válido
        fetch('/api/check-auth', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                localStorage.removeItem('token');
                throw new Error('Token inválido');
            }
        })
        .then(data => {
            console.log('Autenticación exitosa:', data);
            window.location.href = '/Inicio.html';
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
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }
            
            localStorage.setItem('token', data.token);
            window.location.href = '/Inicio.html';
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });
});


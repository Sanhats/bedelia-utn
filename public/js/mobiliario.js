document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    const inventoryTable = document.getElementById('inventory-table').getElementsByTagName('tbody')[0];
    const inventoryList = document.getElementById('inventory-list').getElementsByTagName('tbody')[0];
    const addTypeBtn = document.getElementById('add-type-btn');
    const addTypeForm = document.getElementById('add-type-form');

    // Get the base API URL depending on the environment
    const API_URL = window.location.origin;

    async function loadInventory() {
        try {
            const response = await fetch(`${API_URL}/mobiliario`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }
            const inventory = await response.json();
            displayInventory(inventory);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar el inventario');
        }
    }

    function displayInventory(inventory) {
        inventoryTable.innerHTML = '';
        inventoryList.innerHTML = '';
        inventory.forEach(item => {
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${item.tipo}</td>
                <td><input type="number" min="0" value="${item.cantidad}" data-type="${item.tipo}"></td>
                <td>
                    <button class="add-btn" data-type="${item.tipo}">Agregar</button>
                    <button class="remove-btn" data-type="${item.tipo}">Eliminar</button>
                </td>
            `;
            inventoryTable.appendChild(tableRow);

            const listRow = document.createElement('tr');
            listRow.innerHTML = `
                <td>${item.tipo}</td>
                <td>${item.cantidad}</td>
                <td>${item.cantidad}</td>
            `;
            inventoryList.appendChild(listRow);
        });
    }

    async function updateQuantity(tipo, cantidad) {
        try {
            const response = await fetch(`${API_URL}/mobiliario/${tipo}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cantidad })
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }

            const updatedItem = await response.json();
            
            if (updatedItem.deleted) {
                // If the item was deleted, remove it from the UI
                const tableRows = inventoryTable.querySelectorAll('tr');
                const listRows = inventoryList.querySelectorAll('tr');
                
                for (let row of tableRows) {
                    if (row.querySelector(`input[data-type="${tipo}"]`)) {
                        row.remove();
                        break;
                    }
                }
                
                for (let row of listRows) {
                    if (row.firstElementChild.textContent === tipo) {
                        row.remove();
                        break;
                    }
                }
            } else {
                // Otherwise, update the quantity in the UI
                const input = inventoryTable.querySelector(`input[data-type="${tipo}"]`);
                const listRows = inventoryList.querySelectorAll('tr');
                
                if (input) input.value = updatedItem.cantidad;
                
                for (let row of listRows) {
                    if (row.firstElementChild.textContent === tipo) {
                        row.children[1].textContent = updatedItem.cantidad;
                        row.children[2].textContent = updatedItem.cantidad;
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar la cantidad');
        }
    }

    addTypeBtn.addEventListener('click', () => {
        addTypeForm.classList.remove('hidden');
    });

    document.getElementById('confirm-add-type').addEventListener('click', async () => {
        const newType = document.getElementById('new-type-name').value;
        if (newType) {
            try {
                const response = await fetch(`${API_URL}/mobiliario`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ tipo: newType, cantidad: 0 })
                });

                if (!response.ok) {
                    throw new Error('Failed to add new type');
                }

                addTypeForm.classList.add('hidden');
                document.getElementById('new-type-name').value = '';
                loadInventory();
            } catch (error) {
                console.error('Error:', error);
                alert('Error al agregar nuevo tipo');
            }
        }
    });

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-btn') || e.target.classList.contains('remove-btn')) {
            const tipo = e.target.dataset.type;
            const input = document.querySelector(`input[data-type="${tipo}"]`);
            const cantidad = parseInt(input.value) || 0;
            
            if (e.target.classList.contains('add-btn')) {
                await updateQuantity(tipo, cantidad);
            } else {
                await updateQuantity(tipo, -cantidad);
            }
            
            input.value = '';
        }
    });

    document.getElementById('cancel-add-type').addEventListener('click', () => {
        addTypeForm.classList.add('hidden');
        document.getElementById('new-type-name').value = '';
    });

    loadInventory();
});
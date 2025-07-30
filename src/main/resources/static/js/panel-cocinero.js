const apiUrl = "http://localhost:8080/api/pedidos";
let tabActual = 'activos';
let ventasExitosas = [];

// Cambiar pestaña
function cambiarTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    const searchContainer = document.getElementById('search-container');
    searchContainer.style.display = (tab === 'buscar') ? 'block' : 'none';

    tabActual = tab;

    if (tab === 'activos') {
        cargarPedidosActivos();
    } else if (tab === 'dashboard') {
        cargarDashboard();
    }
}

// Estadísticas generales
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${apiUrl}/estadisticas`);
        const stats = await response.json();

        document.getElementById('proceso').textContent = stats.enProceso;
        document.getElementById('camino').textContent = stats.enCamino;
        document.getElementById('exitosos').textContent = stats.exitosos;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');

    text.textContent = mensaje;
    notification.className = `notification ${tipo} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatearTiempo() {
    return new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Crear tarjeta de pedido
function crearTarjetaPedido(p, contenedor) {
    const div = document.createElement("div");
    div.className = `pedido-card proceso`;
    div.innerHTML = `
        <div class="pedido-header">
            <div class="pedido-id">#${p.id}</div>
            <div class="tiempo-pedido">
                <i class="fas fa-clock"></i>
                ${formatearTiempo()}
            </div>
        </div>

        <div class="cliente-info">
            <div class="cliente-nombre">
                <i class="fas fa-user"></i>
                ${p.cliente}
            </div>
        </div>

        ${p.productos && p.productos.length > 0 ? `
        <div class="pedido-productos">
            <h4><i class="fas fa-utensils"></i> Productos:</h4>
            ${p.productos.map(prod => `
                <div class="producto-item">
                    <span class="producto-nombre">${prod.nombre}</span>
                    <span class="producto-precio">${prod.precio}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="form-group">
            <label class="form-label">
                <i class="fas fa-list"></i> Estado del pedido
            </label>
            <select class="form-select" id="estado-${p.id}">
                <option value="en proceso" ${p.estado === 'en proceso' ? 'selected' : ''}>🔥 En proceso</option>
                <option value="en camino" ${p.estado === 'en camino' ? 'selected' : ''}>🚚 En camino</option>
                <option value="entregado con éxito" ${p.estado === 'entregado con éxito' ? 'selected' : ''}>✅ Entregado con éxito</option>
            </select>
        </div>

        <div class="form-group">
            <label class="form-label">
                <i class="fas fa-comment"></i> Comentarios (requerido si no es exitoso)
            </label>
            <input type="text" class="form-input" id="comentario-${p.id}"
                   value="${p.comentario || ''}"
                   placeholder="Motivo en caso de problemas..." />
        </div>

        <button class="btn-actualizar" onclick="actualizar(${p.id})">
            <i class="fas fa-sync-alt"></i>
            Actualizar Pedido
        </button>
    `;
    contenedor.appendChild(div);
}

// Cargar pedidos pendientes
async function cargarPedidosActivos() {
    const loading = document.getElementById("loading");
    const contenedor = document.getElementById("pedidos-activos");

    loading.style.display = "block";
    contenedor.style.display = "none";

    try {
        const response = await fetch(`${apiUrl}/activos`);
        const pedidosPendientes = await response.json();

        contenedor.innerHTML = "";
        await cargarEstadisticas();

        if (pedidosPendientes.length === 0) {
            contenedor.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-check-circle"></i>
                    <h3>¡Todo al día!</h3>
                    <p>No hay pedidos pendientes en este momento</p>
                </div>
            `;
        } else {
            pedidosPendientes.forEach(p => crearTarjetaPedido(p, contenedor));
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarNotificacion('Error al cargar pedidos', 'error');
    } finally {
        loading.style.display = "none";
        contenedor.style.display = "grid";
    }
}

// Buscar pedidos
async function buscarPedidos() {
    const termino = document.getElementById('searchInput').value.trim();
    const contenedor = document.getElementById("pedidos-busqueda");
    const noResults = document.getElementById("no-results");

    if (!termino) {
        contenedor.innerHTML = "";
        noResults.style.display = "block";
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/buscar?q=${encodeURIComponent(termino)}`);
        const pedidos = await response.json();

        contenedor.innerHTML = "";
        noResults.style.display = pedidos.length === 0 ? "block" : "none";

        pedidos.forEach(p => crearTarjetaPedido(p, contenedor));
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarNotificacion('Error al buscar pedidos. Verifica la conexión.', 'error');
    }
}

// Cargar dashboard completo
async function cargarDashboard() {
    try {
        const response = await fetch(`${apiUrl}/exitosos`);
        const ventas = await response.json();

        ventasExitosas = ventas;
        const contenedor = document.getElementById("ventas-exitosas");
        const totalElement = document.getElementById("total-ventas");

        let totalVentas = 0;
        contenedor.innerHTML = "";

        ventas.forEach(venta => {
            let ventaTotal = 0;
            if (venta.productos && Array.isArray(venta.productos)) {
                ventaTotal = venta.productos.reduce((sum, prod) => sum + (prod.precio || 0), 0);
            }

            totalVentas += ventaTotal;

            const div = document.createElement("div");
            div.className = "venta-item";
            div.innerHTML = `
                <div class="venta-header">
                    <span class="venta-id">#${venta.id} - ${venta.cliente}</span>
                    <span class="venta-total">${ventaTotal.toLocaleString()}</span>
                </div>
                <div class="venta-fecha">
                    <i class="fas fa-calendar"></i>
                    ${venta.fecha ? new Date(venta.fecha).toLocaleDateString('es-ES') : 'Hoy'}
                </div>
                ${venta.productos && venta.productos.length > 0 ? `
                    <div class="venta-productos">
                        <i class="fas fa-utensils"></i>
                        ${venta.productos.map(p => p.nombre).join(', ')}
                    </div>
                ` : ''}
            `;
            contenedor.appendChild(div);
        });

        totalElement.textContent = `Total: ${totalVentas.toLocaleString()}`;
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        mostrarNotificacion('Error al cargar dashboard', 'error');
    }
}

// ✅ Nuevo: abrir dashboard filtrado por estado
async function abrirDashboard(estado) {
    cambiarTab('dashboard');
    try {
        const response = await fetch(apiUrl);
        const pedidos = await response.json();

        const filtrados = pedidos.filter(p => p.estado.toLowerCase() === estado.toLowerCase());

        const contenedor = document.getElementById("ventas-exitosas");
        const totalElement = document.getElementById("total-ventas");

        let totalVentas = 0;
        contenedor.innerHTML = "";

        filtrados.forEach(pedido => {
            let ventaTotal = pedido.productos.reduce((sum, prod) => sum + (prod.precio || 0), 0);
            totalVentas += ventaTotal;

            const div = document.createElement("div");
            div.className = "venta-item";
            div.innerHTML = `
                <div class="venta-header">
                    <span class="venta-id">#${pedido.id} - ${pedido.cliente}</span>
                    <span class="venta-total">${ventaTotal.toLocaleString()}</span>
                </div>
                <div class="venta-fecha">
                    <i class="fas fa-calendar"></i>
                    ${pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                </div>
            `;
            contenedor.appendChild(div);
        });

        totalElement.textContent = `Total: ${totalVentas.toLocaleString()}`;

        if (filtrados.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #6c757d;">
                    <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>No hay pedidos en este estado</h3>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error al cargar dashboard filtrado:", error);
        mostrarNotificacion("No se pudieron cargar los pedidos", "error");
    }
}

// Actualizar pedido
async function actualizar(id) {
    const estado = document.getElementById(`estado-${id}`).value;
    const comentario = document.getElementById(`comentario-${id}`).value;
    const boton = event.target;

    if (estado !== 'entregado con éxito' && !comentario.trim()) {
        mostrarNotificacion('Debe agregar un comentario explicando el motivo', 'error');
        return;
    }

    boton.disabled = true;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado, comentario })
        });

        if (response.ok) {
            mostrarNotificacion('Pedido actualizado exitosamente');

            if (estado === 'entregado con éxito') {
                await fetch(`${apiUrl}/${id}/marcar-exitoso`, { method: "POST" });
            }

            setTimeout(() => {
                if (tabActual === 'activos') {
                    cargarPedidosActivos();
                } else if (tabActual === 'dashboard') {
                    cargarDashboard();
                }
            }, 500);
        } else {
            throw new Error('Error en la actualización');
        }
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        mostrarNotificacion('Error al actualizar el pedido', 'error');
    } finally {
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Pedido';
    }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarPedidos();
            }
        });
    }

    cargarPedidosActivos();
    setInterval(() => {
        if (tabActual === 'activos') {
            cargarPedidosActivos();
        }
    }, 30000);
});

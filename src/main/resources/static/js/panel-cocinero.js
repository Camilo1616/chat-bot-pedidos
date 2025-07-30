// Configuración de la API
const API_URL = "http://localhost:8080/api/pedidos";
let tabActual = 'activos';
let pedidosData = [];
let ultimaActualizacion = null;

// Datos de ejemplo para demostración (eliminar cuando conectes con tu API)
const pedidosEjemplo = [
    {
        id: 1,
        cliente: "María González",
        estado: "en proceso",
        productos: [
            { nombre: "Pizza Margarita", precio: 25000 },
            { nombre: "Coca-Cola", precio: 3000 }
        ],
        comentario: "",
        fecha: new Date().toISOString(),
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    },
    {
        id: 2,
        cliente: "Carlos Rodríguez",
        estado: "en camino",
        productos: [
            { nombre: "Hamburguesa Clásica", precio: 18000 },
            { nombre: "Papas Fritas", precio: 8000 }
        ],
        comentario: "",
        fecha: new Date().toISOString(),
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    },
    {
        id: 3,
        cliente: "Ana Martínez",
        estado: "entregado con éxito",
        productos: [
            { nombre: "Ensalada César", precio: 15000 }
        ],
        comentario: "",
        fecha: new Date().toISOString(),
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    },
    {
        id: 4,
        cliente: "Pedro López",
        estado: "cancelado",
        productos: [
            { nombre: "Pizza Hawaiana", precio: 27000 },
            { nombre: "Sprite", precio: 3000 }
        ],
        comentario: "Cliente canceló por demora",
        fecha: new Date().toISOString(),
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
];

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

// Cambiar pestaña
function cambiarTab(tab, event) {
    // Actualizar clases de pestañas
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    // Mostrar contenido correspondiente
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Mostrar/ocultar barra de búsqueda
    const searchContainer = document.getElementById('search-container');
    searchContainer.style.display = (tab === 'buscar') ? 'block' : 'none';

    tabActual = tab;

    // Cargar contenido según la pestaña
    switch(tab) {
        case 'activos':
            cargarPedidosActivos();
            break;
        case 'dashboard':
            cargarDashboard();
            break;
        case 'historial':
            cargarHistorial();
            break;
    }
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');

    text.textContent = mensaje;
    notification.className = `notification ${tipo} show`;

    // Reproducir sonido de notificación
    const audio = document.getElementById('notification-sound');
    audio.play().catch(e => console.log('No se pudo reproducir el sonido'));

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ============================================
// ESTADÍSTICAS
// ============================================

// Calcular estadísticas de pedidos
function calcularEstadisticas(pedidos) {
    const stats = {
        enProceso: 0,
        enCamino: 0,
        exitosos: 0,
        cancelados: 0,
        noExitosos: 0
    };

    pedidos.forEach(pedido => {
        switch(pedido.estado) {
            case 'en proceso':
                stats.enProceso++;
                break;
            case 'en camino':
                stats.enCamino++;
                break;
            case 'entregado con éxito':
                stats.exitosos++;
                break;
            case 'cancelado':
                stats.cancelados++;
                break;
            case 'no exitoso':
                stats.noExitosos++;
                break;
        }
    });

    return stats;
}

// Actualizar estadísticas en la interfaz
function actualizarEstadisticas() {
    const stats = calcularEstadisticas(pedidosData);
    
    document.getElementById('proceso').textContent = stats.enProceso;
    document.getElementById('camino').textContent = stats.enCamino;
    document.getElementById('exitosos').textContent = stats.exitosos;
    document.getElementById('cancelados').textContent = stats.cancelados;
    document.getElementById('no-exitosos').textContent = stats.noExitosos;
}

// ============================================
// GENERACIÓN DE TARJETAS
// ============================================

// Crear tarjeta HTML para un pedido
function crearTarjetaPedido(pedido) {
    const estadoClass = pedido.estado.replace(' ', '-').replace(' con éxito', '');
    const totalPedido = pedido.productos.reduce((sum, prod) => sum + prod.precio, 0);

    return `
        <div class="pedido-card ${estadoClass}">
            <div class="pedido-header">
                <div class="pedido-id">#${pedido.id}</div>
                <div class="tiempo-pedido">
                    <i class="fas fa-clock"></i>
                    ${pedido.hora}
                </div>
            </div>

            <div class="cliente-info">
                <div class="cliente-nombre">
                    <i class="fas fa-user"></i>
                    ${pedido.cliente}
                </div>
            </div>

            <div class="pedido-productos">
                <h4><i class="fas fa-utensils"></i> Productos:</h4>
                ${pedido.productos.map(prod => `
                    <div class="producto-item">
                        <span class="producto-nombre">${prod.nombre}</span>
                        <span class="producto-precio">${prod.precio.toLocaleString()}</span>
                    </div>
                `).join('')}
                <div style="margin-top: 10px; font-weight: bold; text-align: right; color: #28a745;">
                    Total: ${totalPedido.toLocaleString()}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">
                    <i class="fas fa-list"></i> Estado del pedido
                </label>
                <select class="form-select" id="estado-${pedido.id}">
                    <option value="en proceso" ${pedido.estado === 'en proceso' ? 'selected' : ''}>🔥 En proceso</option>
                    <option value="en camino" ${pedido.estado === 'en camino' ? 'selected' : ''}>🚚 En camino</option>
                    <option value="entregado con éxito" ${pedido.estado === 'entregado con éxito' ? 'selected' : ''}>✅ Entregado con éxito</option>
                    <option value="cancelado" ${pedido.estado === 'cancelado' ? 'selected' : ''}>🚫 Cancelado</option>
                    <option value="no exitoso" ${pedido.estado === 'no exitoso' ? 'selected' : ''}>❌ No exitoso</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">
                    <i class="fas fa-comment"></i> Comentarios ${pedido.estado === 'entregado con éxito' ? '(opcional)' : '(requerido)'}
                </label>
                <input type="text" class="form-input" id="comentario-${pedido.id}"
                       value="${pedido.comentario || ''}"
                       placeholder="${pedido.estado === 'cancelado' ? 'Motivo de la cancelación...' : 'Motivo en caso de problemas...'}" />
            </div>

            <button class="btn-actualizar" onclick="actualizarPedido(${pedido.id}, event)">
                <i class="fas fa-sync-alt"></i>
                Actualizar Pedido
            </button>
        </div>
    `;
}

// ============================================
// CARGAR CONTENIDO POR PESTAÑAS
// ============================================

// Cargar pedidos activos (en proceso y en camino)
async function cargarPedidosActivos() {
    const loading = document.getElementById("loading");
    const contenedor = document.getElementById("pedidos-activos");

    loading.style.display = "block";
    contenedor.style.display = "none";

    try {
        // Para datos reales, descomenta esto:
        // const response = await fetch(`${API_URL}/activos`);
        // const pedidosActivos = await response.json();

        // Simulación con datos de ejemplo (eliminar al conectar API real)
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pedidosActivos = pedidosData.filter(p => 
            p.estado === 'en proceso' || p.estado === 'en camino'
        );

        contenedor.innerHTML = "";
        
        if (pedidosActivos.length === 0) {
            contenedor.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-check-circle"></i>
                    <h3>¡Todo al día!</h3>
                    <p>No hay pedidos pendientes en este momento</p>
                </div>
            `;
        } else {
            pedidosActivos.forEach(pedido => {
                contenedor.innerHTML += crearTarjetaPedido(pedido);
            });
        }

        actualizarEstadisticas();
    } catch (error) {
        console.error('Error al cargar pedidos activos:', error);
        mostrarNotificacion('Error al cargar pedidos activos', 'error');
    } finally {
        loading.style.display = "none";
        contenedor.style.display = "grid";
    }
}

// Buscar pedidos por término
async function buscarPedidos() {
    const termino = document.getElementById('searchInput').value.trim().toLowerCase();
    const contenedor = document.getElementById("pedidos-busqueda");

    if (!termino) {
        contenedor.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Ingresa un término de búsqueda</p>
            </div>
        `;
        return;
    }

    try {
        // Para datos reales, descomenta esto:
        // const response = await fetch(`${API_URL}/buscar?q=${encodeURIComponent(termino)}`);
        // const resultados = await response.json();

        // Simulación con datos de ejemplo
        const resultados = pedidosData.filter(pedido => 
            pedido.id.toString().includes(termino) ||
            pedido.cliente.toLowerCase().includes(termino) ||
            pedido.productos.some(prod => prod.nombre.toLowerCase().includes(termino))
        );

        contenedor.innerHTML = "";

        if (resultados.length === 0) {
            contenedor.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron resultados para "${termino}"</p>
                </div>
            `;
        } else {
            resultados.forEach(pedido => {
                contenedor.innerHTML += crearTarjetaPedido(pedido);
            });
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarNotificacion('Error al buscar pedidos', 'error');
    }
}

// Cargar dashboard de ventas exitosas
async function cargarDashboard() {
    try {
        // Para datos reales, descomenta esto:
        // const response = await fetch(`${API_URL}/exitosos`);
        // const pedidosExitosos = await response.json();

        // Simulación con datos de ejemplo
        const pedidosExitosos = pedidosData.filter(p => p.estado === 'entregado con éxito');
        const contenedor = document.getElementById("ventas-exitosas");
        const totalElement = document.getElementById("total-ventas");

        let totalVentas = 0;
        contenedor.innerHTML = "";

        pedidosExitosos.forEach(venta => {
            const ventaTotal = venta.productos.reduce((sum, prod) => sum + prod.precio, 0);
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
                    ${new Date(venta.fecha).toLocaleDateString('es-ES')}
                </div>
                <div class="venta-productos">
                    <i class="fas fa-utensils"></i>
                    ${venta.productos.map(p => p.nombre).join(', ')}
                </div>
            `;
            contenedor.appendChild(div);
        });

        totalElement.textContent = `Total: ${totalVentas.toLocaleString()}`;

        if (pedidosExitosos.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #6c757d;">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>No hay ventas exitosas aún</h3>
                    <p>Los pedidos completados aparecerán aquí</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        mostrarNotificacion('Error al cargar dashboard', 'error');
    }
}

// Cargar historial completo de pedidos
function cargarHistorial() {
    const contenedor = document.getElementById("historial-pedidos");
    contenedor.innerHTML = "";

    if (pedidosData.length === 0) {
        contenedor.innerHTML = `
            <div class="no-results">
                <i class="fas fa-history"></i>
                <h3>Sin historial</h3>
                <p>El historial de pedidos aparecerá aquí</p>
            </div>
        `;
    } else {
        // Ordenar por fecha más reciente
        const pedidosOrdenados = [...pedidosData].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        pedidosOrdenados.forEach(pedido => {
            contenedor.innerHTML += crearTarjetaPedido(pedido);
        });
    }
}

// Filtrar pedidos por estado (cuando se hace clic en estadísticas)
function filtrarPorEstado(estado) {
    // Cambiar a la pestaña historial
    const historialTab = document.querySelector('.tab:nth-child(4)');
    cambiarTab('historial', { target: historialTab });
    
    setTimeout(() => {
        const contenedor = document.getElementById("historial-pedidos");
        const pedidosFiltrados = pedidosData.filter(p => p.estado === estado);
        
        contenedor.innerHTML = "";
        
        if (pedidosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-filter"></i>
                    <h3>Sin pedidos en estado: ${estado}</h3>
                </div>
            `;
        } else {
            pedidosFiltrados.forEach(pedido => {
                contenedor.innerHTML += crearTarjetaPedido(pedido);
            });
        }
    }, 100);
}

// ============================================
// ACTUALIZAR PEDIDOS
// ============================================

// Actualizar estado de un pedido
async function actualizarPedido(id, event) {
    const estado = document.getElementById(`estado-${id}`).value;
    const comentario = document.getElementById(`comentario-${id}`).value;
    const boton = event.target;

    // Validaciones
    if ((estado === 'cancelado' || estado === 'no exitoso') && !comentario.trim()) {
        mostrarNotificacion('Debe agregar un comentario explicando el motivo', 'error');
        return;
    }

    boton.disabled = true;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';

    try {
        // Para datos reales, descomenta esto:
        // const response = await fetch(`${API_URL}/${id}`, {
        //     method: "PUT",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ estado, comentario })
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Error en la actualización');
        // }

        // Simulación de actualización (eliminar al conectar API real)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Actualizar en los datos locales
        const pedidoIndex = pedidosData.findIndex(p => p.id === id);
        if (pedidoIndex !== -1) {
            pedidosData[pedidoIndex].estado = estado;
            pedidosData[pedidoIndex].comentario = comentario;
        }

        const mensajeExito = estado === 'cancelado' ? 
            'Pedido cancelado correctamente' : 
            'Pedido actualizado exitosamente';
        
        mostrarNotificacion(mensajeExito);

        // Si es exitoso, marcar como tal en el backend
        if (estado === 'entregado con éxito') {
            // await fetch(`${API_URL}/${id}/marcar-exitoso`, { method: "POST" });
        }

        // Recargar la vista actual después de un momento
        setTimeout(() => {
            switch(tabActual) {
                case 'activos':
                    cargarPedidosActivos();
                    break;
                case 'dashboard':
                    cargarDashboard();
                    break;
                case 'historial':
                    cargarHistorial();
                    break;
            }
        }, 500);

    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        mostrarNotificacion('Error al actualizar el pedido', 'error');
    } finally {
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Pedido';
    }
}

// ============================================
// TEMA OSCURO/CLARO
// ============================================

// Alternar entre tema claro y oscuro
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (body.style.background.includes('667eea')) {
        // Cambiar a tema oscuro
        body.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        // Cambiar a tema claro
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// Inicializar tema guardado
function inicializarTema() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        toggleTheme();
    }
}

// ============================================
// SIMULACIÓN DE DATOS (ELIMINAR AL CONECTAR API)
// ============================================

// Simular llegada de nuevos pedidos
function simularNuevoPedido() {
    const nombres = ['Juan Pérez', 'Ana García', 'Carlos López', 'María Rodríguez', 'Luis Martínez'];
    const productos = [
        [{ nombre: 'Pizza Pepperoni', precio: 28000 }, { nombre: 'Bebida', precio: 4000 }],
        [{ nombre: 'Hamburguesa Especial', precio: 22000 }],
        [{ nombre: 'Ensalada Mixta', precio: 16000 }, { nombre: 'Agua', precio: 2000 }],
        [{ nombre: 'Pollo Asado', precio: 25000 }, { nombre: 'Papas', precio: 8000 }]
    ];

    const nuevoPedido = {
        id: pedidosData.length + 1,
        cliente: nombres[Math.floor(Math.random() * nombres.length)],
        estado: 'en proceso',
        productos: productos[Math.floor(Math.random() * productos.length)],
        comentario: '',
        fecha: new Date().toISOString(),
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    pedidosData.push(nuevoPedido);
    
    if (tabActual === 'activos') {
        cargarPedidosActivos();
    }
    
    mostrarNotificacion(`Nuevo pedido #${nuevoPedido.id} de ${nuevoPedido.cliente}`);
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Exportar datos a JSON
function exportarDatos() {
    const dataStr = JSON.stringify(pedidosData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// ============================================
// INICIALIZACIÓN Y EVENT LISTENERS
// ============================================

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos de ejemplo (eliminar al conectar API real)
    pedidosData = [...pedidosEjemplo];
    
    // Configurar tema
    inicializarTema();
    
    // Cargar contenido inicial
    cargarPedidosActivos();

    // Configurar búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarPedidos();
            }
        });

        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                document.getElementById('pedidos-busqueda').innerHTML = '';
            }
        });
    }

    // Actualización automática cada 30 segundos
    setInterval(() => {
        if (tabActual === 'activos') {
            actualizarEstadisticas();
        }
    }, 30000);

    // Simular nuevos pedidos cada 2 minutos (solo para demostración)
    // Eliminar esta línea al conectar con API real:
    setInterval(simularNuevoPedido, 120000);
});

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                cambiarTab('activos', { target: document.querySelector('.tab:nth-child(1)') });
                break;
            case '2':
                e.preventDefault();
                cambiarTab('buscar', { target: document.querySelector('.tab:nth-child(2)') });
                break;
            case '3':
                e.preventDefault();
                cambiarTab('dashboard', { target: document.querySelector('.tab:nth-child(3)') });
                break;
            case '4':
                e.preventDefault();
                cambiarTab('historial', { target: document.querySelector('.tab:nth-child(4)') });
                break;
        }
    }
});

// ============================================
// FUNCIONES PARA CONECTAR CON API REAL
// ============================================

/*
// Descomenta estas funciones cuando conectes con tu API real:

// Cargar estadísticas desde el servidor
async function cargarEstadisticasReales() {
    try {
        const response = await fetch(`${API_URL}/estadisticas`);
        const stats = await response.json();
        
        document.getElementById('proceso').textContent = stats.enProceso;
        document.getElementById('camino').textContent = stats.enCamino;
        document.getElementById('exitosos').textContent = stats.exitosos;
        document.getElementById('cancelados').textContent = stats.cancelados;
        document.getElementById('no-exitosos').textContent = stats.noExitosos;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        mostrarNotificacion('Error al cargar estadísticas', 'error');
    }
}

// Cargar todos los pedidos desde el servidor
async function cargarTodosPedidos() {
    try {
        const response = await fetch(API_URL);
        pedidosData = await response.json();
        actualizarEstadisticas();
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarNotificacion('Error al cargar pedidos', 'error');
    }
}
*/
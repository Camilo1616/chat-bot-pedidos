// ✅ Cargar solo pedidos EN PROCESO
async function cargarPedidosEnProceso() {
    try {
        const response = await fetch("http://localhost:8080/api/pedidos/en-proceso");
        const pedidos = await response.json();

        const tabla = document.querySelector("#tablaCocinero tbody");
        tabla.innerHTML = "";

        if (pedidos.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">
                        ⚠ No hay pedidos en proceso actualmente
                    </td>
                </tr>
            `;
            return;
        }

        pedidos.forEach(p => {
            tabla.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.cliente}</td>
                    <td><span class="estado-badge en-proceso">${p.estado}</span></td>
                    <td>
                        <select id="estado-${p.id}">
                            <option value="">Seleccionar</option>
                            <option value="en camino">En Camino</option>
                            <option value="entregado con éxito">Entregado con Éxito</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" id="comentario-${p.id}" placeholder="Motivo si cancelado">
                    </td>
                    <td>
                        <button onclick="guardarCambios(${p.id})" style="background: #28a745; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                            💾 Guardar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("❌ Error al cargar pedidos en proceso:", error);
        mostrarNotificacion("Error al cargar pedidos en proceso", "error");
    }
}

// ✅ Cargar pedidos "En Camino" y "Entregados"
async function cargarPedidosEnCaminoYEntregados() {
    try {
        const response = await fetch("http://localhost:8080/api/pedidos/en-camino-entregados");
        const pedidos = await response.json();

        const tabla = document.querySelector("#tablaCocinero tbody");
        tabla.innerHTML = "";

        if (pedidos.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">
                        ⚠ No hay pedidos en camino o entregados
                    </td>
                </tr>
            `;
            return;
        }

        pedidos.forEach(p => {
            const estadoClass = p.estado === 'entregado con éxito' ? 'entregado' : 'en-camino';
            tabla.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.cliente}</td>
                    <td><span class="estado-badge ${estadoClass}">${p.estado}</span></td>
                    <td>-</td>
                    <td>${p.comentario || '-'}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("❌ Error al cargar pedidos en camino/entregados:", error);
        mostrarNotificacion("Error al cargar pedidos", "error");
    }
}

// ✅ Cambiar estado del pedido
async function cambiarEstado(id, nuevoEstado) {
    if (!nuevoEstado) return;

    const comentario = document.getElementById(`comentario-${id}`).value;

    // Validar comentario para estados que lo requieren
    if ((nuevoEstado === 'cancelado') && !comentario.trim()) {
        mostrarNotificacion("Debes agregar un comentario para pedidos cancelados", "warning");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/pedidos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado, comentario: comentario })
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el estado");
        }

        console.log(`✔ Pedido ${id} actualizado a: ${nuevoEstado}`);
        mostrarNotificacion(`✔ Pedido ${id} actualizado a: ${nuevoEstado}`, "success");
        cargarPedidosEnProceso(); // 🔄 Refresca automáticamente
    } catch (error) {
        console.error("❌ Error al actualizar estado:", error);
        mostrarNotificacion("Error al actualizar estado", "error");
    }
}
// ✅ guardar cambios individuales
async function guardarCambios(id) {
    const selectEstado = document.getElementById(`estado-${id}`);
    const nuevoEstado = selectEstado.value;
    const comentario = document.getElementById(`comentario-${id}`).value;

    // Validar que se haya seleccionado un estado
    if (!nuevoEstado) {
        mostrarNotificacion("Debes seleccionar un estado", "warning");
        return;
    }

    // Validar comentario para cancelados
    if (nuevoEstado === 'cancelado' && !comentario.trim()) {
        mostrarNotificacion("Debes agregar un comentario para pedidos cancelados", "warning");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/pedidos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado, comentario: comentario })
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el estado");
        }

        console.log(`✔ Pedido ${id} actualizado a: ${nuevoEstado}`);
        mostrarNotificacion(`✔ Pedido ${id} actualizado a: ${nuevoEstado}`, "success");

        // Limpiar selección
        selectEstado.value = "";
        document.getElementById(`comentario-${id}`).value = "";

        cargarPedidosEnProceso(); // 🔄 Refresca automáticamente
    } catch (error) {
        console.error("❌ Error al actualizar estado:", error);
        mostrarNotificacion("Error al actualizar estado", "error");
    }
}

// ✅ Notificación simple (toast)
function mostrarNotificacion(mensaje, tipo = "info") {
    // Remover notificaciones existentes
    const notificacionExistente = document.querySelector('.toast');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }

    const notificacion = document.createElement("div");
    notificacion.className = `toast ${tipo}`;
    notificacion.textContent = mensaje;

    // Estilos para la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Colores según el tipo
    switch(tipo) {
        case 'success':
            notificacion.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notificacion.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notificacion.style.backgroundColor = '#ffc107';
            notificacion.style.color = '#333';
            break;
        default:
            notificacion.style.backgroundColor = '#007bff';
    }

    document.body.appendChild(notificacion);

    // Animación de entrada
    setTimeout(() => {
        notificacion.style.opacity = '1';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, 300);
    }, 3000);
}

// ✅ Cargar pedidos automáticamente cada 10s (era muy frecuente cada 5s)
cargarPedidosEnProceso();
setInterval(cargarPedidosEnProceso, 10000);
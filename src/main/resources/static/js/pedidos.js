// ================================
// 📌 Función para renderizar pedidos
// ================================
function renderPedidos(pedidos) {
    const tabla = document.querySelector("#tablaCocinero tbody");

    // Usar join() en vez de += para evitar múltiples reflow (más rápido)
    tabla.innerHTML = pedidos
        .filter(p => p.estado !== "entregado con éxito")
        .map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.cliente}</td>
                <td>${p.estado}</td>
                <td>
                    <select onchange="cambiarEstado(${p.id}, this.value)">
                        <option value="">Seleccionar</option>
                        <option value="en proceso">En Proceso</option>
                        <option value="en camino">En Camino</option>
                        <option value="entregado con éxito">Entregado con Éxito</option>
                        <option value="fallido">Fallido</option>
                    </select>
                </td>
                <td>
                    <input type="text" id="comentario-${p.id}" placeholder="Motivo si fallido">
                </td>
            </tr>
        `)
        .join(""); // Combina todas las filas en una sola operación
}

// ================================
// 📌 Función para cargar pedidos
// ================================
async function cargarPedidosCocinero() {
    try {
        const response = await fetch("http://localhost:8080/api/pedidos");
        if (!response.ok) throw new Error("Error al obtener pedidos");

        const pedidos = await response.json();
        renderPedidos(pedidos);

    } catch (error) {
        console.error("❌ Error:", error);
        mostrarNotificacion("Error al cargar pedidos", "error");
    }
}

// ================================
// 📌 Función para cambiar estado
// ================================
async function cambiarEstado(id, nuevoEstado) {
    const comentario = document.getElementById(`comentario-${id}`).value;

    try {
        const response = await fetch(`http://localhost:8080/api/pedidos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado, comentario })
        });

        if (!response.ok) throw new Error("No se pudo actualizar el estado");

        mostrarNotificacion("✅ Estado actualizado correctamente", "success");
        cargarPedidosCocinero();

    } catch (error) {
        console.error("❌ Error:", error);
        mostrarNotificacion("Error al actualizar estado", "error");
    }
}

// ================================
// 📌 Notificación simple (toast)
// ================================
function mostrarNotificacion(mensaje, tipo = "info") {
    const notificacion = document.createElement("div");
    notificacion.className = `toast ${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 2500);
}

// ================================
// 🔄 Auto recarga cada 5s
// ================================
cargarPedidosCocinero();
setInterval(cargarPedidosCocinero, 5000);
// ================================
// 📌 Cargar datos de ventas
// ================================
async function cargarVentas() {
    try {
        console.log("🔄 Iniciando carga de datos de ventas...");

        // Cargar total de ventas
        await cargarTotalVentas();

        // Cargar productos más vendidos (como ventas exitosas)
        await cargarVentasExitosas();

        // Cargar ventas fallidas
        await cargarVentasFallidas();

        console.log("✅ Datos de ventas cargados correctamente");

    } catch (error) {
        console.error("❌ Error al cargar ventas:", error);
        mostrarNotificacion("Error al cargar datos de ventas", "error");
    }
}

// ================================
// 📌 Cargar total de ventas
// ================================
async function cargarTotalVentas() {
    try {
        const response = await fetch("http://localhost:8080/api/ventas/total");

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const totalVentas = await response.json();
        console.log("💰 Total de ventas:", totalVentas);

        // Crear elemento para mostrar el total si no existe
        let totalElement = document.getElementById("totalVentas");
        if (!totalElement) {
            totalElement = document.createElement("div");
            totalElement.id = "totalVentas";
            totalElement.style.cssText = `
                background: #28a745;
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin: 20px 0;
            `;

            // Insertar antes de la primera sección
            const firstSection = document.querySelector("section");
            if (firstSection) {
                firstSection.parentNode.insertBefore(totalElement, firstSection);
            }
        }

        totalElement.innerHTML = `💰 Total de Ventas: $${totalVentas.toLocaleString('es-CO')} COP`;

    } catch (error) {
        console.error("❌ Error al cargar total de ventas:", error);
        mostrarNotificacion("Error al cargar total de ventas", "error");
    }
}

// ================================
// 📌 Cargar ventas exitosas (productos más vendidos)
// ================================
async function cargarVentasExitosas() {
    try {
        console.log("🔄 Cargando productos más vendidos...");
        const response = await fetch("http://localhost:8080/api/ventas/productos-top");

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const productosTop = await response.json();
        console.log("📊 Productos más vendidos:", productosTop);

        const tablaExitosas = document.querySelector("#tablaExitosas tbody");
        if (!tablaExitosas) {
            console.error("❌ No se encontró la tabla de productos exitosos");
            return;
        }

        tablaExitosas.innerHTML = "";

        if (!productosTop || productosTop.length === 0) {
            tablaExitosas.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #666;">
                        ⚠️ No hay productos vendidos registrados
                    </td>
                </tr>
            `;
            return;
        }

        productosTop.forEach((producto, index) => {
            const nombreProducto = producto[0]; // Nombre del producto
            const cantidadVendida = producto[1]; // Cantidad total vendida

            tablaExitosas.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${nombreProducto}</td>
                    <td>${cantidadVendida} unidades</td>
                </tr>
            `;
        });

        console.log("✅ Ventas exitosas cargadas");

    } catch (error) {
        console.error("❌ Error al cargar ventas exitosas:", error);

        const tablaExitosas = document.querySelector("#tablaExitosas tbody");
        if (tablaExitosas) {
            tablaExitosas.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #dc3545;">
                        ❌ Error al cargar datos de ventas exitosas
                    </td>
                </tr>
            `;
        }
    }
}

// ================================
// 📌 Cargar ventas fallidas
// ================================
async function cargarVentasFallidas() {
    try {
        console.log("🔄 Cargando pedidos fallidos...");
        const response = await fetch("http://localhost:8080/api/ventas/fallidos");

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const pedidosFallidos = await response.json();
        console.log("❌ Pedidos fallidos:", pedidosFallidos);

        const tablaFallidas = document.querySelector("#tablaFallidas tbody");
        if (!tablaFallidas) {
            console.error("❌ No se encontró la tabla de pedidos fallidos");
            return;
        }

        tablaFallidas.innerHTML = "";

        if (!pedidosFallidos || pedidosFallidos.length === 0) {
            tablaFallidas.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #666;">
                        ✅ No hay ventas fallidas (¡Excelente!)
                    </td>
                </tr>
            `;
            return;
        }

        pedidosFallidos.forEach(fallido => {
            const idPedido = fallido[0]; // ID del pedido
            const nombreCliente = fallido[1]; // Nombre del cliente
            const comentario = fallido[2] || 'Sin comentario especificado'; // Comentario del fallo

            tablaFallidas.innerHTML += `
                <tr>
                    <td>${idPedido}</td>
                    <td>${nombreCliente}</td>
                    <td>${comentario}</td>
                </tr>
            `;
        });

        console.log("✅ Ventas fallidas cargadas");

    } catch (error) {
        console.error("❌ Error al cargar ventas fallidas:", error);

        const tablaFallidas = document.querySelector("#tablaFallidas tbody");
        if (tablaFallidas) {
            tablaFallidas.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #dc3545;">
                        ❌ Error al cargar datos de ventas fallidas
                    </td>
                </tr>
            `;
        }
    }
}

// ================================
// 📌 Limpiar reporte
// ================================
function borrarReporte() {
    // Limpiar tablas
    const tablaExitosas = document.querySelector("#tablaExitosas tbody");
    const tablaFallidas = document.querySelector("#tablaFallidas tbody");

    if (tablaExitosas) tablaExitosas.innerHTML = "";
    if (tablaFallidas) tablaFallidas.innerHTML = "";

    // Limpiar total de ventas si existe
    const totalElement = document.getElementById("totalVentas");
    if (totalElement) {
        totalElement.remove();
    }

    // Limpiar resultados de fechas si existen
    const resultadoFechas = document.getElementById("resultadoFechas");
    if (resultadoFechas) {
        resultadoFechas.remove();
    }

    console.log("✅ Reporte limpiado");
    mostrarNotificacion("Reporte limpiado correctamente", "info");
}

// ================================
// 📌 Función para exportar a CSV
// ================================
function exportarExcel() {
    try {
        let csv = "Tipo,ID/Ranking,Nombre/Cliente,Cantidad/Motivo\n";

        // Productos más vendidos (ventas exitosas)
        document.querySelectorAll("#tablaExitosas tbody tr").forEach(row => {
            const cells = Array.from(row.children);
            if (cells.length === 3 && !cells[0].textContent.includes('⚠') && !cells[0].textContent.includes('❌')) {
                const ranking = cells[0].textContent.trim();
                const producto = cells[1].textContent.trim();
                const cantidad = cells[2].textContent.trim();
                csv += `Producto Exitoso,${ranking},${producto},${cantidad}\n`;
            }
        });

        // Ventas fallidas
        document.querySelectorAll("#tablaFallidas tbody tr").forEach(row => {
            const cells = Array.from(row.children);
            if (cells.length === 3 && !cells[0].textContent.includes('⚠') && !cells[0].textContent.includes('❌')) {
                const id = cells[0].textContent.trim();
                const cliente = cells[1].textContent.trim();
                const motivo = cells[2].textContent.trim();
                csv += `Pedido Fallido,${id},${cliente},${motivo}\n`;
            }
        });

        if (csv === "Tipo,ID/Ranking,Nombre/Cliente,Cantidad/Motivo\n") {
            mostrarNotificacion("No hay datos para exportar", "warning");
            return;
        }

        // Crear y descargar archivo
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("✅ Reporte exportado");
        mostrarNotificacion("Reporte exportado correctamente", "success");

    } catch (error) {
        console.error("❌ Error al exportar:", error);
        mostrarNotificacion("Error al exportar el reporte", "error");
    }
}

// ================================
// 📌 Consultar ventas por fechas
// ================================
async function consultarVentasPorFecha() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    // Validar que se hayan seleccionado las fechas
    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion("Debes seleccionar ambas fechas", "warning");
        return;
    }

    // Validar que la fecha inicio sea menor que la fecha fin
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarNotificacion("La fecha de inicio debe ser menor que la fecha de fin", "warning");
        return;
    }

    try {
        console.log("🔍 Consultando ventas por fechas:", fechaInicio, "a", fechaFin);

        // Hacer las 4 consultas en paralelo
        const [totalResponse, exitososResponse, fallidosResponse, productosResponse] = await Promise.all([
            fetch(`http://localhost:8080/api/ventas/total-por-fecha?inicio=${fechaInicio}&fin=${fechaFin}`),
            fetch(`http://localhost:8080/api/ventas/exitosos-por-fecha?inicio=${fechaInicio}&fin=${fechaFin}`),
            fetch(`http://localhost:8080/api/ventas/fallidos-por-fecha?inicio=${fechaInicio}&fin=${fechaFin}`),
            fetch(`http://localhost:8080/api/ventas/productos-top-por-fecha?inicio=${fechaInicio}&fin=${fechaFin}`)
        ]);

        if (!totalResponse.ok || !exitososResponse.ok || !fallidosResponse.ok || !productosResponse.ok) {
            throw new Error("Error en alguna de las consultas");
        }

        const [totalResult, exitososResult, fallidosResult, productosResult] = await Promise.all([
            totalResponse.json(),
            exitososResponse.json(),
            fallidosResponse.json(),
            productosResponse.json()
        ]);

        console.log("📊 Resultados:", { totalResult, exitososResult, fallidosResult, productosResult });

        // Mostrar todos los resultados
        mostrarResultadosPorFecha(totalResult, exitososResult, fallidosResult, productosResult);

    } catch (error) {
        console.error("❌ Error al consultar ventas por fechas:", error);
        mostrarNotificacion("Error al consultar ventas por fechas", "error");
    }
}

// ================================
// 📌 Mostrar resultado de consulta por fechas
// ================================
function mostrarResultadosPorFecha(totalResult, exitososResult, fallidosResult, productosResult) {
    // Limpiar resultados anteriores
    const resultadoAnterior = document.getElementById("resultadoFechas");
    if (resultadoAnterior) {
        resultadoAnterior.remove();
    }

    // Crear contenedor principal
    const contenedor = document.createElement("div");
    contenedor.id = "resultadoFechas";
    contenedor.style.cssText = `
        background: white;
        border: 2px solid #17a2b8;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    `;

    const fechaInicio = new Date(totalResult.rangoFechas.inicio).toLocaleDateString('es-CO');
    const fechaFin = new Date(totalResult.rangoFechas.fin).toLocaleDateString('es-CO');

    contenedor.innerHTML = `
        <h3 style="text-align: center; color: #17a2b8; margin-bottom: 20px;">
            📅 Resultados del ${fechaInicio} al ${fechaFin}
        </h3>

        <div style="background: #17a2b8; color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
            💰 Total Vendido: $${totalResult.totalVentas.toLocaleString('es-CO')} ${totalResult.moneda}
        </div>

        <div style="margin-bottom: 30px;">
            <h4 style="color: #ffc107; text-align: center;">🏆 Productos Más Vendidos en este Período (${productosResult.length})</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 0 auto; max-width: 600px;">
                <thead style="background: #ffc107; color: #333;">
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ddd;">Ranking</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Producto</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Cantidad Vendida</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosResult.length === 0 ?
                        '<tr><td colspan="3" style="text-align: center; padding: 15px; color: #666;">No hay productos vendidos en este rango</td></tr>' :
                        productosResult.map((producto, index) => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${producto[0]}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${producto[1]} unidades</td>
                            </tr>
                        `).join('')
                    }
                </tbody>
            </table>
        </div>

        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
                <h4 style="color: #28a745;">✅ Pedidos Exitosos (${exitososResult.length})</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead style="background: #28a745; color: white;">
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Cliente</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Fecha</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
                        </tr>
                    </thead>
                    <tbody id="tablaExitososFecha">
                        ${exitososResult.length === 0 ?
                            '<tr><td colspan="4" style="text-align: center; padding: 15px; color: #666;">No hay pedidos exitosos en este rango</td></tr>' :
                            exitososResult.map(pedido => `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${pedido[0]}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${pedido[1]}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${new Date(pedido[2]).toLocaleDateString('es-CO')}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${parseFloat(pedido[3]).toLocaleString('es-CO')}</td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>

            <div style="flex: 1; min-width: 300px;">
                <h4 style="color: #dc3545;">❌ Pedidos Fallidos (${fallidosResult.length})</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead style="background: #dc3545; color: white;">
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Cliente</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Estado</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Motivo</th>
                        </tr>
                    </thead>
                    <tbody id="tablaFallidosFecha">
                        ${fallidosResult.length === 0 ?
                            '<tr><td colspan="4" style="text-align: center; padding: 15px; color: #666;">No hay pedidos fallidos en este rango</td></tr>' :
                            fallidosResult.map(pedido => `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${pedido[0]}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${pedido[1]}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${pedido[3]}</td>
                                    <td style="padding: 8px; border: 1px solid #ddd;">${pedido[4] || 'Sin comentario'}</td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Insertar después de la sección de fechas
    const seccionFechas = document.querySelector('div[style*="background: #f8f9fa"]');
    if (seccionFechas) {
        seccionFechas.parentNode.insertBefore(contenedor, seccionFechas.nextSibling);
    }

    mostrarNotificacion("Consulta por fechas realizada correctamente", "success");
}

// ================================
// 📌 Sistema de notificaciones
// ================================
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
        max-width: 300px;
        word-wrap: break-word;
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

    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, 300);
    }, 4000);
}

// ================================
// 🚀 Inicializar cuando carga la página
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM cargado, iniciando ventas...");
    cargarVentas();
});

// También cargar inmediatamente (por si el evento ya pasó)
if (document.readyState === 'loading') {
    console.log("📄 Documento aún cargando...");
} else {
    console.log("📄 Documento ya cargado, iniciando ventas...");
    cargarVentas();
}
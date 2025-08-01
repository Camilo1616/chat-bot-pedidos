// ================================
// 📌 Cargar productos de la base de datos
// ================================
async function cargarProductos() {
    try {
        const response = await fetch("http://localhost:8080/api/productos");
        const productos = await response.json();

        console.log("Productos cargados:", productos); // Para debug

        const tabla = document.querySelector("#tablaProductos tbody");
        tabla.innerHTML = "";

        if (productos.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">
                        ⚠ No hay productos registrados
                    </td>
                </tr>
            `;
            return;
        }

        productos.forEach(p => {
            tabla.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.nombre}</td>
                    <td>$${p.precio.toLocaleString()}</td>
                    <td>${p.disponible ? '✅ Disponible' : '❌ No disponible'}</td>
                    <td>
                        <button onclick="editarProducto(${p.id})" style="background: #ffc107; padding: 5px 10px; border: none; border-radius: 3px; margin: 2px; cursor: pointer;">
                            ✏️ Editar
                        </button>
                        <button onclick="cambiarDisponibilidad(${p.id}, ${!p.disponible})" style="background: #17a2b8; color: white; padding: 5px 10px; border: none; border-radius: 3px; margin: 2px; cursor: pointer;">
                            ${p.disponible ? '🚫 Desactivar' : '✅ Activar'}
                        </button>
                        <button onclick="eliminarProducto(${p.id})" style="background: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; margin: 2px; cursor: pointer;">
                            🗑️ Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Cargar productos cuando la página cargue
cargarProductos();

// ================================
// 📌 Guardar producto (crear o actualizar)
// ================================
let productoEditando = null; // Variable para saber si estamos editando

async function guardarProducto() {
    const nombre = document.getElementById("nombre").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);

    // Validaciones
    if (!nombre) {
        alert("El nombre es obligatorio");
        return;
    }

    if (!precio || precio <= 0) {
        alert("El precio debe ser mayor que 0");
        return;
    }

    const productoData = {
        nombre: nombre,
        precio: precio,
        disponible: true // Por defecto disponible
    };

    try {
        let response;

        if (productoEditando) {
            // ACTUALIZAR producto existente
            response = await fetch(`http://localhost:8080/api/productos/${productoEditando}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productoData)
            });
        } else {
            // CREAR nuevo producto
            response = await fetch("http://localhost:8080/api/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productoData)
            });
        }

        if (response.ok) {
            const mensaje = productoEditando ? "actualizado" : "creado";
            alert(`✅ Producto ${mensaje} correctamente`);

            // Limpiar todo
            limpiarFormulario();
            cargarProductos(); // Recargar tabla
        } else {
            alert("❌ Error al guardar producto");
        }

    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error al guardar producto");
    }
}
// ================================
// 📌 Eliminar producto
// ================================
async function eliminarProducto(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/productos/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("✅ Producto eliminado correctamente");
            cargarProductos(); // Recargar tabla
        } else {
            alert("❌ Error al eliminar producto");
        }

    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error al eliminar producto");
    }
}

// ================================
// 📌 Cambiar disponibilidad
// ================================
async function cambiarDisponibilidad(id, disponible) {
    try {
        // Primero obtener el producto
        const responseGet = await fetch(`http://localhost:8080/api/productos/${id}`);
        const producto = await responseGet.json();

        // Actualizar solo la disponibilidad
        const response = await fetch(`http://localhost:8080/api/productos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: producto.nombre,
                precio: producto.precio,
                disponible: disponible
            })
        });

        if (response.ok) {
            const estado = disponible ? "activado" : "desactivado";
            alert(`✅ Producto ${estado} correctamente`);
            cargarProductos(); // Recargar tabla
        } else {
            alert("❌ Error al cambiar disponibilidad");
        }

    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error al cambiar disponibilidad");
    }
}

// ================================
// 📌 Editar producto (básico por ahora)
// ================================
async function editarProducto(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/productos/${id}`);
        const producto = await response.json();

        // Llenar formulario
        document.getElementById("nombre").value = producto.nombre;
        document.getElementById("precio").value = producto.precio;

        // Cambiar el título del formulario
        document.querySelector(".form-producto h2").textContent = "✏️ Editar Producto";
        document.querySelector(".form-producto button").textContent = "💾 Actualizar";

        // Marcar que estamos editando
        productoEditando = id;

        alert(`Producto cargado para editar. Modifica los datos y haz clic en "Actualizar".`);

    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error al cargar producto");
    }
}
// ================================
// 📌 Limpiar formulario
// ================================
function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";

    // Resetear títulos
    document.querySelector(".form-producto h2").textContent = "➕ Agregar / Editar Producto";
    document.querySelector(".form-producto button").textContent = "💾 Guardar";

    // Limpiar modo edición
    productoEditando = null;
}

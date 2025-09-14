const optionCards = document.querySelectorAll(".option-card");
const contentContainer = document.getElementById("content-container");

// Datos simulados para cada opción
const mockData = {
    propietarios: [
        { id: 1, nombre: "Juan Pérez", depto: "101" },
        { id: 2, nombre: "María López", depto: "102" }
    ],
    expensas: [
        { mes: "Enero", monto: 5000 },
        { mes: "Febrero", monto: 5200 }
    ],
    gastos: [
        { concepto: "Reparación ascensor", monto: 1200 },
        { concepto: "Limpieza general", monto: 800 }
    ],
    reportes: [
        { tipo: "Informe mensual", fecha: "2025-09-01" },
        { tipo: "Balance anual", fecha: "2025-01-01" }
    ]
};

// Función para mostrar datos en el contenedor
function showData(option) {
    contentContainer.innerHTML = ""; // Limpiar contenido previo
    const data = mockData[option];

    if (!data) return;

    data.forEach(item => {
        const div = document.createElement("div");
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid #ddd";
        div.textContent = JSON.stringify(item);
        contentContainer.appendChild(div);
    });
}

// Agregar evento a cada tarjeta
optionCards.forEach(card => {
    card.addEventListener("click", () => {
        const option = card.getAttribute("data-option");
        showData(option);
    });
});

/* NAVEGACIÓN DE LA PÁGINA DE INICIO */

function irAlTorneo(torneo) {

    if (torneo === "futbol") {

        window.location.href = "futbol.html";

    }

    if (torneo === "padel") {

        // Cuando hagamos la página, se cambia por:
        // window.location.href = "padel.html";

        alert("La sección de Pádel todavía está en construcción.");

    }

}
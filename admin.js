/* =========================================================
   PANEL DE ADMINISTRADOR
========================================================= */

const refFutbol = db.collection("torneos").doc("futbol");

let TORNEO = {
    equiposA: ["Equipo 1", "Equipo 2", "Equipo 3", "Equipo 4", "Equipo 5"],
    equiposB: ["Equipo 6", "Equipo 7", "Equipo 8", "Equipo 9", "Equipo 10"],
    resultados: {},
    final: {}
};


/* ---- LOGIN ---- */

function iniciarSesion() {

    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    auth.signInWithEmailAndPassword(email, pass)
        .catch(function (error) {
            document.getElementById('login-error').textContent =
                "No se pudo entrar: revisá el email y la contraseña.";
        });

}

function cerrarSesion() {
    auth.signOut();
}

auth.onAuthStateChanged(function (usuario) {

    if (usuario) {

        document.getElementById('bloque-login').style.display = 'none';
        document.getElementById('panel-admin').style.display = 'block';
        cargarDatos();

    } else {

        document.getElementById('bloque-login').style.display = 'block';
        document.getElementById('panel-admin').style.display = 'none';

    }

});


/* ---- CARGAR DATOS ACTUALES ---- */

function cargarDatos() {

    refFutbol.get().then(function (snap) {

        if (snap.exists) {
            TORNEO = snap.data();
            TORNEO.resultados = TORNEO.resultados || {};
            TORNEO.final = TORNEO.final || {};
        } else {
            // primera vez: creamos el documento con los valores de prueba
            refFutbol.set(TORNEO);
        }

        dibujarFormularios();

    });

}


/* ---- FORMULARIO: NOMBRES DE EQUIPOS ---- */

function dibujarFormularios() {

    let htmlEquipos = '';

    TORNEO.equiposA.forEach(function (nombre, i) {
        htmlEquipos += '<div class="fila-admin">'
            + '<label>Zona A - Equipo ' + (i + 1) + '</label>'
            + '<input type="text" id="equipoA' + i + '" value="' + nombre + '">'
            + '</div>';
    });

    TORNEO.equiposB.forEach(function (nombre, i) {
        htmlEquipos += '<div class="fila-admin">'
            + '<label>Zona B - Equipo ' + (i + 1) + '</label>'
            + '<input type="text" id="equipoB' + i + '" value="' + nombre + '">'
            + '</div>';
    });

    document.getElementById('form-equipos').innerHTML = htmlEquipos;


    ["A", "B"].forEach(function (zona) {

        let html = '';

        partidosDeZona(TORNEO, zona).forEach(function (p) {

            const gl = p.resultado ? p.resultado[0] : '';
            const gv = p.resultado ? p.resultado[1] : '';

            html += '<div class="fila-resultado">'
                + '<span>' + p.codigo + '</span>'
                + '<span>' + p.local + '</span>'
                + '<input type="number" min="0" id="gl-' + p.codigo + '" value="' + gl + '">'
                + '<input type="number" min="0" id="gv-' + p.codigo + '" value="' + gv + '">'
                + '<span>' + p.visita + '</span>'
                + '</div>';

        });

        document.getElementById('form-resultados-' + zona).innerHTML = html;

    });


    /* fase final: usamos los clasificados actuales para mostrar los nombres */

    const a1 = clasificado(TORNEO, "A", 1);
    const a2 = clasificado(TORNEO, "A", 2);
    const b1 = clasificado(TORNEO, "B", 1);
    const b2 = clasificado(TORNEO, "B", 2);

    const cruces = [
        { codigo: "SF1", titulo: "Semifinal 1", local: a1.nombre, visita: b2.nombre },
        { codigo: "SF2", titulo: "Semifinal 2", local: b1.nombre, visita: a2.nombre },
        { codigo: "TER", titulo: "Tercer puesto", local: "Perdedor SF1", visita: "Perdedor SF2" },
        { codigo: "FIN", titulo: "Final", local: "Ganador SF1", visita: "Ganador SF2" }
    ];

    let htmlFinal = '';

    cruces.forEach(function (c) {

        const res = TORNEO.final[c.codigo] || ['', ''];
        const pen = TORNEO.final[c.codigo + "_PENALES"] || ['', ''];

        htmlFinal += '<div class="fila-resultado">'
            + '<span>' + c.codigo + '</span>'
            + '<span>' + c.local + '</span>'
            + '<input type="number" min="0" id="fgl-' + c.codigo + '" value="' + res[0] + '">'
            + '<input type="number" min="0" id="fgv-' + c.codigo + '" value="' + res[1] + '">'
            + '<span>' + c.visita + '</span>'
            + '</div>'
            + '<div class="fila-admin">'
            + '<label>Penales ' + c.codigo + ' (si empató; dejar vacío si no hubo)</label>'
            + '<div style="display:flex;gap:8px;">'
            + '<input type="number" min="0" id="pgl-' + c.codigo + '" value="' + pen[0] + '" style="width:70px;">'
            + '<input type="number" min="0" id="pgv-' + c.codigo + '" value="' + pen[1] + '" style="width:70px;">'
            + '</div></div>';

    });

    document.getElementById('form-final').innerHTML = htmlFinal;

}


/* ---- GUARDAR ---- */

function guardarEquipos() {

    const equiposA = TORNEO.equiposA.map(function (_, i) {
        return document.getElementById('equipoA' + i).value;
    });

    const equiposB = TORNEO.equiposB.map(function (_, i) {
        return document.getElementById('equipoB' + i).value;
    });

    refFutbol.update({ equiposA: equiposA, equiposB: equiposB }).then(function () {
        alert("Nombres guardados.");
    });

}


function guardarResultados() {

    const cambios = {};

    ["A", "B"].forEach(function (zona) {

        partidosDeZona(TORNEO, zona).forEach(function (p) {

            const gl = document.getElementById('gl-' + p.codigo).value;
            const gv = document.getElementById('gv-' + p.codigo).value;

            if (gl !== '' && gv !== '') {
                cambios['resultados.' + p.codigo] = [Number(gl), Number(gv)];
            }

        });

    });

    refFutbol.update(cambios).then(function () {
        alert("Resultados guardados.");
        cargarDatos();
    });

}


function guardarFinal() {

    const codigos = ["SF1", "SF2", "TER", "FIN"];
    const cambios = {};

    codigos.forEach(function (codigo) {

        const gl = document.getElementById('fgl-' + codigo).value;
        const gv = document.getElementById('fgv-' + codigo).value;

        if (gl !== '' && gv !== '') {
            cambios['final.' + codigo] = [Number(gl), Number(gv)];
        }

        const pgl = document.getElementById('pgl-' + codigo).value;
        const pgv = document.getElementById('pgv-' + codigo).value;

        if (pgl !== '' && pgv !== '') {
            cambios['final.' + codigo + '_PENALES'] = [Number(pgl), Number(pgv)];
        }

    });

    refFutbol.update(cambios).then(function () {
        alert("Fase final guardada.");
        cargarDatos();
    });

}
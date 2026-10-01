/* =========================================================
   PANEL DE ADMINISTRADOR · PÁDEL
========================================================= */

const refPadel = db.collection("torneos").doc("padel");

let TORNEO = {
    equiposA: ["Pareja 1", "Pareja 2", "Pareja 3", "Pareja 4"],
    equiposB: ["Pareja 5", "Pareja 6", "Pareja 7", "Pareja 8"],
    equiposC: ["Pareja 9", "Pareja 10", "Pareja 11", "Pareja 12"],
    resultados: {},
    final: {}
};


/* ---- LOGIN ---- */

function iniciarSesion() {

    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    auth.signInWithEmailAndPassword(email, pass)
        .catch(function () {
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


/* ---- CARGAR ---- */

function cargarDatos() {

    refPadel.get().then(function (snap) {

        if (snap.exists) {
            TORNEO = snap.data();
            TORNEO.resultados = TORNEO.resultados || {};
            TORNEO.final = TORNEO.final || {};
        } else {
            refPadel.set(TORNEO);
        }

        dibujarFormularios();

    });

}


/* ---- FORMULARIOS ---- */

function dibujarFormularios() {

    let htmlEquipos = '';

    ["A", "B", "C"].forEach(function (zona) {

        TORNEO["equipos" + zona].forEach(function (nombre, i) {

            htmlEquipos += '<div class="fila-admin">'
                + '<label>Zona ' + zona + ' - Pareja ' + (i + 1) + '</label>'
                + '<input type="text" id="equipo' + zona + i + '" value="' + nombre + '">'
                + '</div>';

        });

    });

    document.getElementById('form-equipos').innerHTML = htmlEquipos;


    ["A", "B", "C"].forEach(function (zona) {

        let html = '';

        partidosDeZonaPadel(TORNEO, zona).forEach(function (p) {

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


    /* Fase final */

    const a1 = clasificadoPadel(TORNEO, "A", 1);
    const a2 = clasificadoPadel(TORNEO, "A", 2);
    const b1 = clasificadoPadel(TORNEO, "B", 1);
    const b2 = clasificadoPadel(TORNEO, "B", 2);
    const c1 = clasificadoPadel(TORNEO, "C", 1);
    const c2 = clasificadoPadel(TORNEO, "C", 2);

    const ter = mejoresTercerosPadel(TORNEO);
    const m31 = ter[0];
    const m32 = ter[1];

    const cruces = [
        { codigo: "CU1", titulo: "Cuarto 1", local: b2.nombre, visita: a1.nombre },
        { codigo: "CU2", titulo: "Cuarto 2", local: c1.nombre, visita: m31.nombre },
        { codigo: "CU3", titulo: "Cuarto 3", local: b1.nombre, visita: c2.nombre },
        { codigo: "CU4", titulo: "Cuarto 4", local: a2.nombre, visita: m32.nombre },
        { codigo: "SF1", titulo: "Semifinal 1", local: "Ganador CU1", visita: "Ganador CU2" },
        { codigo: "SF2", titulo: "Semifinal 2", local: "Ganador CU3", visita: "Ganador CU4" },
        { codigo: "FIN", titulo: "Final", local: "Ganador SF1", visita: "Ganador SF2" }
    ];

    let htmlFinal = '';

    cruces.forEach(function (c) {

        const res = TORNEO.final[c.codigo] || ['', ''];
        const tb = TORNEO.final[c.codigo + "_TB"] || ['', ''];

        htmlFinal += '<div class="fila-resultado">'
            + '<span>' + c.codigo + '</span>'
            + '<span>' + c.local + '</span>'
            + '<input type="number" min="0" id="fgl-' + c.codigo + '" value="' + res[0] + '">'
            + '<input type="number" min="0" id="fgv-' + c.codigo + '" value="' + res[1] + '">'
            + '<span>' + c.visita + '</span>'
            + '</div>'
            + '<div class="fila-admin">'
            + '<label>Desempate ' + c.codigo + ' (solo si terminó igualado)</label>'
            + '<div style="display:flex;gap:8px;">'
            + '<input type="number" min="0" id="tbl-' + c.codigo + '" value="' + tb[0] + '" style="width:70px;">'
            + '<input type="number" min="0" id="tbv-' + c.codigo + '" value="' + tb[1] + '" style="width:70px;">'
            + '</div></div>';

    });

    document.getElementById('form-final').innerHTML = htmlFinal;

}


/* ---- GUARDAR ---- */

function guardarEquipos() {

    const cambios = {};

    ["A", "B", "C"].forEach(function (zona) {

        cambios["equipos" + zona] = TORNEO["equipos" + zona].map(function (_, i) {
            return document.getElementById('equipo' + zona + i).value;
        });

    });

    refPadel.update(cambios).then(function () {
        alert("Nombres guardados.");
    });

}


function guardarResultados() {

    const cambios = {};

    ["A", "B", "C"].forEach(function (zona) {

        partidosDeZonaPadel(TORNEO, zona).forEach(function (p) {

            const gl = document.getElementById('gl-' + p.codigo).value;
            const gv = document.getElementById('gv-' + p.codigo).value;

            if (gl !== '' && gv !== '') {
                cambios['resultados.' + p.codigo] = [Number(gl), Number(gv)];
            }

        });

    });

    refPadel.update(cambios).then(function () {
        alert("Resultados guardados.");
        cargarDatos();
    });

}


function guardarFinal() {

    const codigos = ["CU1", "CU2", "CU3", "CU4", "SF1", "SF2", "FIN"];
    const cambios = {};

    codigos.forEach(function (codigo) {

        const gl = document.getElementById('fgl-' + codigo).value;
        const gv = document.getElementById('fgv-' + codigo).value;

        if (gl !== '' && gv !== '') {
            cambios['final.' + codigo] = [Number(gl), Number(gv)];
        }

        const tbl = document.getElementById('tbl-' + codigo).value;
        const tbv = document.getElementById('tbv-' + codigo).value;

        if (tbl !== '' && tbv !== '') {
            cambios['final.' + codigo + '_TB'] = [Number(tbl), Number(tbv)];
        }

    });

    refPadel.update(cambios).then(function () {
        alert("Fase final guardada.");
        cargarDatos();
    });

}
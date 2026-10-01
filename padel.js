/* =========================================================
   TAQUITO Y VOLEA — PÁDEL (página pública)
========================================================= */

let TORNEO_PADEL = {
    equiposA: ["Pareja 1", "Pareja 2", "Pareja 3", "Pareja 4"],
    equiposB: ["Pareja 5", "Pareja 6", "Pareja 7", "Pareja 8"],
    equiposC: ["Pareja 9", "Pareja 10", "Pareja 11", "Pareja 12"],
    resultados: {},
    final: {}
};

db.collection("torneos").doc("padel").onSnapshot(function (snap) {

    if (snap.exists) {
        TORNEO_PADEL = snap.data();
        TORNEO_PADEL.resultados = TORNEO_PADEL.resultados || {};
        TORNEO_PADEL.final = TORNEO_PADEL.final || {};
    }

    dibujarTodoPadel();

}, function (error) {
    console.error("No se pudo conectar con la base de datos:", error);
});


function htmlTablaPadel(zona) {

    const filas = tablaDeZonaPadel(TORNEO_PADEL, zona);

    let html = ''
        + '<div class="tabla-scroll">'
        + '<table class="posiciones">'
        + '<thead><tr>'
        + '<th></th><th>PAREJA</th><th>PJ</th><th>PG</th>'
        + '<th>PE</th><th>PP</th><th>GF</th><th>GC</th>'
        + '<th>DG</th><th>PTS</th>'
        + '</tr></thead><tbody>';

    filas.forEach(function (f, i) {

        let clase = '';
        if (i < 2) { clase = ' class="clasifica"'; }
        else if (i === 2) { clase = ' class="tercero"'; }

        html += '<tr' + clase + '>'
            + '<td><span class="puesto">' + (i + 1) + '</span></td>'
            + '<td>' + f.equipo + '</td>'
            + '<td>' + f.pj + '</td>'
            + '<td>' + f.pg + '</td>'
            + '<td>' + f.pe + '</td>'
            + '<td>' + f.pp + '</td>'
            + '<td>' + f.gf + '</td>'
            + '<td>' + f.gc + '</td>'
            + '<td>' + (f.dg > 0 ? '+' + f.dg : f.dg) + '</td>'
            + '<td><strong>' + f.pts + '</strong></td>'
            + '</tr>';

    });

    html += '</tbody></table></div>'
        + '<p class="aclaracion">'
        + 'Los dos primeros de cada zona clasifican a cuartos de final. '
        + 'También avanzan los dos mejores terceros. '
        + 'Desempate: diferencia de games y después games a favor.'
        + '</p>';

    return html;

}


function htmlPartidoPadel(p) {

    let marcador;
    let claseLocal = '';
    let claseVisita = '';

    if (p.resultado) {

        marcador = '<div class="marcador">' + p.resultado[0] + ' — ' + p.resultado[1] + '</div>';

        if (p.resultado[0] > p.resultado[1]) { claseLocal = ' gana'; }
        if (p.resultado[1] > p.resultado[0]) { claseVisita = ' gana'; }

    } else {

        marcador = '<div class="marcador pendiente">vs</div>';

    }

    let html = '<div class="partido">'
        + '<div class="codigo">' + p.codigo + '</div>'
        + '<div class="equipo-local' + claseLocal + '">' + p.local + '</div>'
        + marcador
        + '<div class="equipo-visita' + claseVisita + '">' + p.visita + '</div>';

    if (p.penales) {
        html += '<div class="penales">Desempate: ' + p.penales[0] + ' — ' + p.penales[1] + '</div>';
    }

    html += '</div>';

    return html;

}


function htmlPartidosPadel(zona) {

    return partidosDeZonaPadel(TORNEO_PADEL, zona).map(function (p) {
        return htmlPartidoPadel(p);
    }).join('');

}


function nombreConPadel(equipo) {

    if (equipo.seguro) { return equipo.nombre; }

    return equipo.nombre + ' <span class="provisorio">(' + equipo.rotulo + ', provisorio)</span>';

}


function cruceFinalPadel(codigo, titulo, local, visita, esFinal) {

    const final = TORNEO_PADEL.final || {};

    const partido = {
        codigo: codigo,
        local: local ? nombreConPadel(local) : 'A definir',
        visita: visita ? nombreConPadel(visita) : 'A definir',
        resultado: final[codigo] || null,
        penales: final[codigo + "_TB"] || null
    };

    let html = '<div class="cruce' + (esFinal ? ' final' : '') + '">'
        + '<h4>' + titulo + '</h4>'
        + htmlPartidoPadel(partido);

    if (esFinal && local && visita) {

        const campeon = ganadorDePadel(TORNEO_PADEL, codigo, local.nombre, visita.nombre);

        if (campeon) {
            html += '<div class="campeon">🏆 CAMPEÓN: ' + campeon + '</div>';
        }

    }

    html += '</div>';

    return html;

}


function htmlFaseFinalPadel() {

    const a1 = clasificadoPadel(TORNEO_PADEL, "A", 1);
    const a2 = clasificadoPadel(TORNEO_PADEL, "A", 2);
    const b1 = clasificadoPadel(TORNEO_PADEL, "B", 1);
    const b2 = clasificadoPadel(TORNEO_PADEL, "B", 2);
    const c1 = clasificadoPadel(TORNEO_PADEL, "C", 1);
    const c2 = clasificadoPadel(TORNEO_PADEL, "C", 2);

    const ter = mejoresTercerosPadel(TORNEO_PADEL);
    const m31 = ter[0];
    const m32 = ter[1];

    const ganCU1 = ganadorDePadel(TORNEO_PADEL, "CU1", b2.nombre, a1.nombre);
    const ganCU2 = ganadorDePadel(TORNEO_PADEL, "CU2", c1.nombre, m31.nombre);
    const ganCU3 = ganadorDePadel(TORNEO_PADEL, "CU3", b1.nombre, c2.nombre);
    const ganCU4 = ganadorDePadel(TORNEO_PADEL, "CU4", a2.nombre, m32.nombre);

    const ganSF1 = ganadorDePadel(TORNEO_PADEL, "SF1", ganCU1, ganCU2);
    const ganSF2 = ganadorDePadel(TORNEO_PADEL, "SF2", ganCU3, ganCU4);

    function simple(nombre) {
        return nombre ? { nombre: nombre, seguro: true, rotulo: '' } : null;
    }

    let html = '';

    html += '<div class="bloque"><h3>Cuartos de final</h3><div class="llave">'
        + cruceFinalPadel("CU1", "Cuarto 1 · 2° B vs 1° A", b2, a1, false)
        + cruceFinalPadel("CU2", "Cuarto 2 · 1° C vs Mejor 3°", c1, m31, false)
        + cruceFinalPadel("CU3", "Cuarto 3 · 1° B vs 2° C", b1, c2, false)
        + cruceFinalPadel("CU4", "Cuarto 4 · 2° A vs Mejor 3°", a2, m32, false)
        + '</div></div>';

    html += '<div class="bloque"><h3>Semifinales</h3><div class="llave">'
        + cruceFinalPadel("SF1", "Semifinal 1", simple(ganCU1), simple(ganCU2), false)
        + cruceFinalPadel("SF2", "Semifinal 2", simple(ganCU3), simple(ganCU4), false)
        + '</div></div>';

    html += '<div class="bloque"><h3>Final</h3><div class="llave">'
        + cruceFinalPadel("FIN", "Final", simple(ganSF1), simple(ganSF2), true)
        + '</div></div>';

    return html;

}


function mostrarPanel(cual, boton) {

    document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('visible'); });
    document.getElementById('panel-' + cual).classList.add('visible');

    document.querySelectorAll('.pestana').forEach(function (b) { b.classList.remove('activa'); });
    boton.classList.add('activa');

}


function dibujarTodoPadel() {

    ["A", "B", "C"].forEach(function (zona) {

        document.getElementById('panel-' + zona).innerHTML = ''
            + '<div class="bloque"><h3>Tabla de posiciones · Zona ' + zona + '</h3>'
            + htmlTablaPadel(zona) + '</div>'
            + '<div class="bloque"><h3>Partidos · Zona ' + zona + '</h3>'
            + htmlPartidosPadel(zona) + '</div>';

    });

    document.getElementById('panel-F').innerHTML = htmlFaseFinalPadel();

}
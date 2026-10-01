/* =========================================================
   TAQUITO Y VOLEA — FÚTBOL 5 (página pública)
========================================================= */

let TORNEO = {
    equiposA: ["Equipo 1", "Equipo 2", "Equipo 3", "Equipo 4", "Equipo 5"],
    equiposB: ["Equipo 6", "Equipo 7", "Equipo 8", "Equipo 9", "Equipo 10"],
    resultados: {},
    final: {}
};

db.collection("torneos").doc("futbol").onSnapshot(function (snap) {

    if (snap.exists) {
        TORNEO = snap.data();
        TORNEO.resultados = TORNEO.resultados || {};
        TORNEO.final = TORNEO.final || {};
    }

    dibujarTodo();

}, function (error) {
    console.error("No se pudo conectar con la base de datos:", error);
});


function htmlTabla(zona) {

    const filas = tablaDeZona(TORNEO, zona);

    let html = ''
        + '<div class="tabla-scroll">'
        + '<table class="posiciones">'
        + '<thead><tr>'
        + '<th></th><th>EQUIPO</th><th>PJ</th><th>PG</th>'
        + '<th>PE</th><th>PP</th><th>GF</th><th>GC</th>'
        + '<th>DG</th><th>PTS</th>'
        + '</tr></thead><tbody>';

    filas.forEach(function (f, i) {

        const clasifica = (i < 2) ? ' class="clasifica"' : '';

        html += '<tr' + clasifica + '>'
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
        + 'Los dos primeros de cada zona clasifican a semifinales. '
        + 'Desempate: diferencia de goles y después goles a favor.'
        + '</p>';

    return html;

}


function htmlPartido(p) {

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
        html += '<div class="penales">Penales: ' + p.penales[0] + ' — ' + p.penales[1] + '</div>';
    }

    html += '</div>';

    return html;

}


function htmlPartidos(zona) {

    return partidosDeZona(TORNEO, zona).map(function (p) {
        return htmlPartido(p);
    }).join('');

}


function nombreCon(equipo) {

    if (equipo.seguro) { return equipo.nombre; }

    return equipo.nombre + ' <span class="provisorio">(' + equipo.rotulo + ', provisorio)</span>';

}


function cruceFinal(codigo, titulo, local, visita, esFinal) {

    const final = TORNEO.final || {};

    const partido = {
        codigo: codigo,
        local: local ? nombreCon(local) : 'A definir',
        visita: visita ? nombreCon(visita) : 'A definir',
        resultado: final[codigo] || null,
        penales: final[codigo + "_PENALES"] || null
    };

    let html = '<div class="cruce' + (esFinal ? ' final' : '') + '">'
        + '<h4>' + titulo + '</h4>'
        + htmlPartido(partido);

    if (esFinal && local && visita) {

        const campeon = ganadorDe(TORNEO, codigo, local.nombre, visita.nombre);

        if (campeon) {
            html += '<div class="campeon">🏆 CAMPEÓN: ' + campeon + '</div>';
        }

    }

    html += '</div>';

    return html;

}


function htmlFaseFinal() {

    const a1 = clasificado(TORNEO, "A", 1);
    const a2 = clasificado(TORNEO, "A", 2);
    const b1 = clasificado(TORNEO, "B", 1);
    const b2 = clasificado(TORNEO, "B", 2);

    const ganSF1 = ganadorDe(TORNEO, "SF1", a1.nombre, b2.nombre);
    const ganSF2 = ganadorDe(TORNEO, "SF2", b1.nombre, a2.nombre);

    const perSF1 = perdedorDe(TORNEO, "SF1", a1.nombre, b2.nombre);
    const perSF2 = perdedorDe(TORNEO, "SF2", b1.nombre, a2.nombre);

    function simple(nombre) {
        return nombre ? { nombre: nombre, seguro: true, rotulo: '' } : null;
    }

    let html = '<div class="bloque"><h3>Semifinales</h3><div class="llave">'
        + cruceFinal("SF1", "Semifinal 1 · 1° Zona A vs 2° Zona B", a1, b2, false)
        + cruceFinal("SF2", "Semifinal 2 · 1° Zona B vs 2° Zona A", b1, a2, false)
        + '</div></div>';

    html += '<div class="bloque"><h3>Definición</h3><div class="llave">'
        + cruceFinal("TER", "Tercer puesto", simple(perSF1), simple(perSF2), false)
        + cruceFinal("FIN", "Final", simple(ganSF1), simple(ganSF2), true)
        + '</div></div>';

    return html;

}


function mostrarPanel(cual, boton) {

    document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('visible'); });
    document.getElementById('panel-' + cual).classList.add('visible');

    document.querySelectorAll('.pestana').forEach(function (b) { b.classList.remove('activa'); });
    boton.classList.add('activa');

}


function dibujarTodo() {

    ["A", "B"].forEach(function (zona) {

        document.getElementById('panel-' + zona).innerHTML = ''
            + '<div class="bloque"><h3>Tabla de posiciones · Zona ' + zona + '</h3>' + htmlTabla(zona) + '</div>'
            + '<div class="bloque"><h3>Partidos · Zona ' + zona + '</h3>' + htmlPartidos(zona) + '</div>';

    });

    document.getElementById('panel-F').innerHTML = htmlFaseFinal();

}
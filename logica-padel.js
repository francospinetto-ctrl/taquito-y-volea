/* =========================================================
   CÁLCULOS DEL TORNEO DE PÁDEL
   3 zonas de 4 parejas · 2 mejores terceros a cuartos
========================================================= */

const CRUCES_PADEL = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2]
];

const PUNTOS_GANADO = 3;
const PUNTOS_EMPATE = 1;


function partidosDeZonaPadel(torneo, zona) {

    const equipos = torneo["equipos" + zona];
    const resultados = torneo.resultados || {};

    return CRUCES_PADEL.map(function (cruce, i) {

        const codigo = zona + (i + 1);

        return {
            codigo: codigo,
            local: equipos[cruce[0]],
            visita: equipos[cruce[1]],
            resultado: resultados[codigo] || null
        };

    });

}


function tablaDeZonaPadel(torneo, zona) {

    const equipos = torneo["equipos" + zona];

    const filas = equipos.map(function (nombre) {
        return { equipo: nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
    });

    function buscar(nombre) {
        return filas.find(function (f) { return f.equipo === nombre; });
    }

    partidosDeZonaPadel(torneo, zona).forEach(function (p) {

        if (!p.resultado) { return; }

        const gl = p.resultado[0];
        const gv = p.resultado[1];

        const L = buscar(p.local);
        const V = buscar(p.visita);

        L.pj++; V.pj++;
        L.gf += gl; L.gc += gv;
        V.gf += gv; V.gc += gl;

        if (gl > gv) {
            L.pg++; V.pp++; L.pts += PUNTOS_GANADO;
        } else if (gl < gv) {
            V.pg++; L.pp++; V.pts += PUNTOS_GANADO;
        } else {
            L.pe++; V.pe++; L.pts += PUNTOS_EMPATE; V.pts += PUNTOS_EMPATE;
        }

    });

    filas.forEach(function (f) { f.dg = f.gf - f.gc; });

    filas.sort(function (a, b) {
        return (b.pts - a.pts) || (b.dg - a.dg) || (b.gf - a.gf) || a.equipo.localeCompare(b.equipo);
    });

    return filas;

}


function zonaTerminadaPadel(torneo, zona) {

    return partidosDeZonaPadel(torneo, zona).every(function (p) {
        return p.resultado !== null;
    });

}


function zonasTerminadasPadel(torneo) {

    return ["A", "B", "C"].every(function (z) {
        return zonaTerminadaPadel(torneo, z);
    });

}


function clasificadoPadel(torneo, zona, puesto) {

    const fila = tablaDeZonaPadel(torneo, zona)[puesto - 1];

    return {
        nombre: fila.equipo,
        seguro: zonaTerminadaPadel(torneo, zona),
        rotulo: puesto + "° Zona " + zona
    };

}


function mejoresTercerosPadel(torneo) {

    const terceros = ["A", "B", "C"].map(function (zona) {

        const fila = tablaDeZonaPadel(torneo, zona)[2];

        return {
            nombre: fila.equipo,
            zona: zona,
            pts: fila.pts,
            dg: fila.dg,
            gf: fila.gf
        };

    });

    terceros.sort(function (a, b) {
        return (b.pts - a.pts) || (b.dg - a.dg) || (b.gf - a.gf) || a.nombre.localeCompare(b.nombre);
    });

    const seguro = zonasTerminadasPadel(torneo);

    return [
        { nombre: terceros[0].nombre, seguro: seguro, rotulo: "Mejor 3°" },
        { nombre: terceros[1].nombre, seguro: seguro, rotulo: "Mejor 3°" }
    ];

}


function ganadorDePadel(torneo, codigo, local, visita) {

    const final = torneo.final || {};
    const res = final[codigo];

    if (!res) { return null; }

    if (res[0] > res[1]) { return local; }
    if (res[1] > res[0]) { return visita; }

    const tb = final[codigo + "_TB"];
    if (!tb) { return null; }

    return (tb[0] > tb[1]) ? local : visita;

}


function perdedorDePadel(torneo, codigo, local, visita) {

    const g = ganadorDePadel(torneo, codigo, local, visita);
    if (!g) { return null; }

    return (g === local) ? visita : local;

}
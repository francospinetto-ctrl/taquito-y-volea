/* =========================================================
   CÁLCULOS DEL TORNEO DE FÚTBOL 5
   No hace falta tocar nada acá.
========================================================= */

const CRUCES = [
    [0, 1], [2, 3], [0, 4], [1, 3], [2, 4],
    [0, 3], [1, 2], [3, 4], [0, 2], [1, 4]
];

const PUNTOS_GANADO = 3;
const PUNTOS_EMPATE = 1;


function partidosDeZona(torneo, zona) {

    const equipos = (zona === "A") ? torneo.equiposA : torneo.equiposB;
    const resultados = torneo.resultados || {};

    return CRUCES.map(function (cruce, i) {

        const codigo = zona + (i + 1);

        return {
            codigo: codigo,
            local: equipos[cruce[0]],
            visita: equipos[cruce[1]],
            resultado: resultados[codigo] || null
        };

    });

}


function tablaDeZona(torneo, zona) {

    const equipos = (zona === "A") ? torneo.equiposA : torneo.equiposB;

    const filas = equipos.map(function (nombre) {
        return { equipo: nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
    });

    function buscar(nombre) {
        return filas.find(function (f) { return f.equipo === nombre; });
    }

    partidosDeZona(torneo, zona).forEach(function (p) {

        if (!p.resultado) { return; }

        const golesLocal = p.resultado[0];
        const golesVisita = p.resultado[1];

        const L = buscar(p.local);
        const V = buscar(p.visita);

        L.pj++; V.pj++;
        L.gf += golesLocal; L.gc += golesVisita;
        V.gf += golesVisita; V.gc += golesLocal;

        if (golesLocal > golesVisita) {
            L.pg++; V.pp++; L.pts += PUNTOS_GANADO;
        } else if (golesLocal < golesVisita) {
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


function zonaTerminada(torneo, zona) {

    return partidosDeZona(torneo, zona).every(function (p) {
        return p.resultado !== null;
    });

}


function clasificado(torneo, zona, puesto) {

    const fila = tablaDeZona(torneo, zona)[puesto - 1];

    return {
        nombre: fila.equipo,
        seguro: zonaTerminada(torneo, zona),
        rotulo: puesto + '° Zona ' + zona
    };

}


function ganadorDe(torneo, codigo, local, visita) {

    const final = torneo.final || {};
    const res = final[codigo];

    if (!res) { return null; }

    if (res[0] > res[1]) { return local; }
    if (res[1] > res[0]) { return visita; }

    const pen = final[codigo + "_PENALES"];

    if (!pen) { return null; }

    return (pen[0] > pen[1]) ? local : visita;

}


function perdedorDe(torneo, codigo, local, visita) {

    const g = ganadorDe(torneo, codigo, local, visita);

    if (!g) { return null; }

    return (g === local) ? visita : local;

}
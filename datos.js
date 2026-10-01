/* =========================================================
   TAQUITO Y VOLEA — DATOS DEL TORNEO
   Este es el único archivo que tenés que tocar.
========================================================= */


/* ---- 1) EQUIPOS DE FÚTBOL 5 ----
   Cambiá los nombres por los reales. Tienen que ser 5 y 5. */

const EQUIPOS_FUTBOL = {

    zonaA: [
        "Equipo 1",
        "Equipo 2",
        "Equipo 3",
        "Equipo 4",
        "Equipo 5"
    ],

    zonaB: [
        "Equipo 6",
        "Equipo 7",
        "Equipo 8",
        "Equipo 9",
        "Equipo 10"
    ]

};


/* ---- 2) RESULTADOS DE LA FASE DE GRUPOS ----

   Cada partido tiene un código (A1, A2... B1, B2...) que la
   página te muestra al lado del partido.

   Para cargar un resultado:   "A1": [4, 2],
   Eso es: en el partido A1 el equipo de la izquierda hizo 4
   goles y el de la derecha hizo 2.

   Si todavía no se jugó, dejalo borrado. Cada línea lleva coma
   al final, menos la última. */

const RESULTADOS_FUTBOL = {

    "A1": [4, 2],
    "A2": [1, 1],
    "A3": [3, 0],

    "B1": [2, 5],
    "B2": [0, 0]

};


/* ---- 3) RESULTADOS DE LA FASE FINAL ----

   Códigos:  SF1 y SF2 = semifinales
             TER = tercer puesto
             FIN = final

   Si hay penales, se agrega otra línea:
        "SF1": [1, 1],
        "SF1_PENALES": [4, 3], */

const FINAL_FUTBOL = {

    // "SF1": [2, 1],
    // "SF2": [0, 0],
    // "SF2_PENALES": [5, 4],
    // "TER": [3, 2],
    // "FIN": [1, 0],

};
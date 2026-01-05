//API https://api.ctan.es/doc/#api-Lineas-ObtieneParadasLinea

let CACHE = {
    m10: null,
    m11: null
};

let paradasIDA = [];
let paradasVuetla = [];

const fchBusq = document.getElementById("dia");
const horaBusq = document.getElementById("hora");
const actualizar = document.getElementById("actualizar");

const rutaOrigen = document.getElementById("origen");
const rutaDestino = document.getElementById("destino");
const cambioRuta = document.getElementById("cambioRuta");

const checkM10 = document.getElementById("checkM10");
const checkM11 = document.getElementById("checkM11");



function descargar(){
    const fchSelect = fchBusq.value;
    const parte = fchSelect.split('-');
    const dia = parte[2];
    const mes = parte [1];

    const urlM10 = 'http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=' + dia + '&lang=ES&linea=2&mes=' + mes;
    const urlM11 = 'http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=' + dia + '&lang=ES&linea=3&mes=' + mes;

    Promise.all([
        fetch(urlM10).then(res => res.json()),
        fetch(urlM11).then(res => res.json())
    ])

    .then(datos => {
        CACHE.m10 = Array.isArray(datos[0]);
        CACHE.m11 = Array.isArray(datos[1]);
        console.log(datos[0]);
    })

    //selectParadas();
}

function selectParadas(){

}

function consultarHorarios(){
    

    

    /*fetch(urlApi)
        .then(res => res.json())
        .then(datos => {
            console.log(datos);
            const plan = datos.planificadores[0];
            const sentido = plan.horarioIda;
            const paradas = plan.bloquesIda;

            const tabla = document.getElementById("tabla-resultados");
            tabla.innerHTML="";

            let tablaHtml = "<tr>";
            paradas.forEach(viaje => {
                console.log(viaje.nombre);
                tablaHtml += "<th>" + viaje.nombre + "</th>";
                
            });
            
            
            tablaHtml += "</tr>";

            sentido.forEach(horario => {
                console.log(horario.horas);
                tablaHtml += "<tr>";
                const horas = horario.horas;
                horas.forEach(hora =>{
                    console.log(hora);
                    tablaHtml += "<td>" + hora + "</td>";
                });
                tablaHtml += "</tr>";
            });

            tabla.innerHTML = tablaHtml;
        });*/

    
}


const hoy = new Date;
const dia = String(hoy.getDate()).padStart(2, '0');
const mes = String(hoy.getMonth()+1).padStart(2, '0');
const anio = String(hoy.getFullYear());
const hora = String(hoy.getHours()).padStart(2, '0') + ":" + String(hoy.getMinutes()).padStart(2, '0');

document.getElementById("hora").value = hora;
const fch = anio + "-" + mes + "-" + dia;
document.getElementById("dia").value = fch;

document.addEventListener("DOMContentLoaded", () => {
    descargar();
});

actualizar.addEventListener('click', function(){
    consultarHorarios();
});

cambioRuta.addEventListener('click', function(){
    const aux = rutaOrigen.value;
    rutaOrigen.value = rutaDestino.value;
    rutaDestino.value = aux;
});

console.log(checkM10.checked);
console.log(checkM11.checked);



// http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=21&lang=ES&linea=2&mes=12
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

    const urlM10 = 'https://corsproxy.io/?http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=' + dia + '&lang=ES&linea=2&mes=' + mes;
    const urlM11 = 'https://corsproxy.io/?http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=' + dia + '&lang=ES&linea=3&mes=' + mes;

    Promise.all([
        fetch(urlM10).then(res => res.json()),
        fetch(urlM11).then(res => res.json())
    ])

    .then(datos => {
        CACHE.m10 = Array.isArray(datos[0]) ? datos[0][0] : datos[0];
        CACHE.m11 = Array.isArray(datos[1]) ? datos[1][0] : datos[1]; 
        console.log(CACHE.m10);

        
        consultarHorarios();
    });

}

function selectParadas(datosJson, linea, origen, destino, listaGuardada){
    const hospital = "Hospital-Segunda Ag.";
    const plan = datosJson.planificadores[0];
    let paradas;
    let horarios;

    
    if(origen==="Cádiz"){
        paradas = plan.bloquesIda;
        horarios = plan.horarioIda;
    }

    if(origen==="San Fernando"){
        paradas = plan.bloquesVuelta;
        horarios = plan.horarioVuelta;
    }

    let indexS = 0;
    let indexF = paradas.findIndex(p => p.nombre === "Frecuencia")-1;
    let indexI = paradas.findIndex(p => p.nombre === "Hospital-Segunda Ag.");

    const hFiltro = horaBusq.value;

    
    horarios.forEach(viaje => {
        const hSalida = viaje.horas[indexS];
        const hHosp = viaje.horas[indexI];
        const hLLegada = viaje.horas[indexF];
        const frecuencia = viaje.frecuencia;

        if(hSalida > hFiltro){
        
        listaGuardada.push({
            linea: linea,
            salida: hSalida,
            hospital: hHosp,
            llegada: hLLegada,
            frecuencia: frecuencia  
        });
    }
    });
}

function consultarHorarios(){
   
    const tabla = document.getElementById("tabla-resultados");
    tabla.innerHTML="";
    
    let verM10 = checkM10.checked;
    let verM11 = checkM11.checked; 
    let origen = rutaOrigen.value;
    let destino= rutaDestino.value;

    let viajesEncontrados = [];
    
    if(verM10 && CACHE.m10){
        selectParadas(CACHE.m10,"M-10", origen, destino, viajesEncontrados);
    }

    if(verM11 && CACHE.m11){
        selectParadas(CACHE.m11,"M-11", origen, destino, viajesEncontrados);
    }

    viajesEncontrados.sort((a, b) => a.salida.localeCompare(b.salida));

    let tablaHtml = "<tr><th>Linea</th><th>Salida</th><th>Hospital</th><th>Llegada</th><th>Frecuencia</th>";

    viajesEncontrados.forEach(horario => {
        tablaHtml += `<tr>
            <td>${horario.linea}</td>
            <td>${horario.salida}</td>
            <td>${horario.hospital}</td>
            <td>${horario.llegada}</td>
            <td>${horario.frecuencia}</td>
                </tr>`
            });

            tabla.innerHTML = tablaHtml;


    
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
    console.log(fchBusq.value);
    consultarHorarios();
    
});

cambioRuta.addEventListener('click', function(){
    const aux = rutaOrigen.value;
    rutaOrigen.value = rutaDestino.value;
    rutaDestino.value = aux;
});

console.log(checkM10.checked);
console.log(checkM11.checked);

fchBusq.addEventListener("change", () => {
    descargar();
});


// http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=21&lang=ES&linea=2&mes=12

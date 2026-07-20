//API https://api.ctan.es/doc/#api-Lineas-ObtieneParadasLinea

const esLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
const PROXY = esLocal ? "" : "https://corsproxy.io/?";

let CACHE = {
    m10: null,
    m11: null,
    festivos: []
};

let paradasIDA = [];
let paradasVuelta = [];

const fchBusq = document.getElementById("dia");
const horaBusq = document.getElementById("hora");
const actualizar = document.getElementById("actualizar");
const rutaOrigen = document.getElementById("origen");
const rutaDestino = document.getElementById("destino");
const cambioRuta = document.getElementById("cambioRuta");
const checkM10 = document.getElementById("checkM10");
const checkM11 = document.getElementById("checkM11");
const tabla = document.getElementById("tabla-resultados");
const error = document.getElementById("msg_error");

const incicalizarFecha = () => {
    const hoy = new Date;
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth()+1).padStart(2, '0');
    const anio = String(hoy.getFullYear());
    
    fchBusq.value = `${anio}-${mes}-${dia}`;
    horaBusq.value = String(hoy.getHours()).padStart(2, '0') + ":" + String(hoy.getMinutes()).padStart(2, '0');
}

async function cargarFestivos() {
    try{
        const res = await fetch('./festivos.json');
        if(res.ok) {
            CACHE.festivos = await res.json();
        }
    }catch(err){
        console.error("No se puedieron cargar los festivos", err);
    }
}

function comprobarFestivo(fchComprobar) {
    const esFestivo = CACHE.festivos.includes(fchComprobar);
    if (esFestivo) {
        const fchMod = new Date(fchComprobar + 'T00:00:00');
        fchMod.setDate(fchMod.getDate() - fchMod.getDay());
        return fecha.toISOString().split('T')[0];
    }
    return fchComprobar;
}

async function descargar(){
    const fchSelect = comprobarFestivo(fchBusq.value);
    const parte = fchSelect.split('-');
    const dia = parte[2];
    const mes = parte [1];
    
    error.innerHTML="";

    const urlM10 = PROXY + 'http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=' + dia + '&lang=ES&linea=2&mes=' + mes;
    const urlM11 = PROXY + 'http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=' + dia + '&lang=ES&linea=3&mes=' + mes;

    try{
        const datos = await Promise.all([
            fetch(urlM10).then(res => res.json()),
            fetch(urlM11).then(res => res.json())
        ]);
        CACHE.m10 = Array.isArray(datos[0]) ? datos[0][0] : datos[0];
        CACHE.m11 = Array.isArray(datos[1]) ? datos[1][0] : datos[1];
        consultarHorarios();
    }catch(err){
        console.error(err);
        error.innerHTML=`
            <div class="alert alert-danger text-center" role="alert">
                Error al obtener los datos del servidor.<br>
                <a href="https://siu.cmtbc.es/es/movil/horarios_lineas_tabla.php?from=1&linea=2" target="_blank" class="alert-link">
                    Linea M10
                </a>
                <br>
                <a href="https://siu.cmtbc.es/movil/horarios_lineas_tabla.php?linea=3&from=" target="_blank" class="alert-link">
                    Linea M11
                </a>
            </div>
        `;
    }
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

    let tablaHtml = "<tr><th>Linea</th><th>Salida</th><th>Hospital</th><th>Llegada</th><th>Frec</th></tr>";

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

document.addEventListener("DOMContentLoaded", async () => {
    await cargarFestivos();
    incicalizarFecha();
    descargar();
});

actualizar.addEventListener('click', function(){
    consultarHorarios();    
});

cambioRuta.addEventListener('click', function(){
    const aux = rutaOrigen.value;
    rutaOrigen.value = rutaDestino.value;
    rutaDestino.value = aux;
    consultarHorarios();
});

fchBusq.addEventListener("change", () => {
    descargar();
});

horaBusq.addEventListener("change", () => {
    consultarHorarios();
});

checkM10.addEventListener("change", () => {
    consultarHorarios();
});

checkM11.addEventListener("change", () => {
    consultarHorarios();
});

// http://api.ctan.es/v1/Consorcios/2/horarios_lineas?dia=21&lang=ES&linea=2&mes=12
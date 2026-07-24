const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const listaNoticias = [];

async function obtenerNoticias(ruta, nRuta) {
  const URL = `https://siu.cmtbc.es/es/movil/noticias.php?linea=${ruta}&from=1`;
  const { data: html } = await axios.get(URL, {
    responseType: "text",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(html);

  $("#contenidotab4 ul li").each((index, el) => {
    const $li = $(el);
    $li.find("span.novedades").remove();
    const $enlace = $li.find(".item a");

    if ($enlace.length > 0) {
      const href = $enlace.attr("href");
      const id = href.split("=")[1];
      const textoBruto = $enlace.text().trim();
      const [fecha, resumen] = textoBruto.split(/\s+(.+)/);

      if (parseInt(fecha.split("/")[2]) !== new Date().getFullYear()) {
        return;
      }

      const idExiste = listaNoticias.find((n) => n.id === id);
      if (idExiste) {
        if (!idExiste.ruta.includes(nRuta)) {
          idExiste.ruta.push(nRuta);
        }
      } else {
        listaNoticias.push({
          id: id,
          texto: resumen,
          fecha: fecha,
          url: `https://siu.cmtbc.es/es/movil/${href}`,
          ruta: [nRuta],
        });
      }
    }
  });
}

async function ejecutar() {
  try {
    await obtenerNoticias(2, "M-10");
    await obtenerNoticias(3, "M-11");

    if(listaNoticias.length === 0){
        throw new Error('No se han encontrado noticias');
    }

    const rutaSalida = path.join(__dirname, 'noticias.json');
    fs.writeFileSync(rutaSalida, JSON.stringify(listaNoticias, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error en el proceso", err);
    process.exit(1);
  }
}

ejecutar();

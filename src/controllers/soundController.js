const MongoConnection = require("../middlewares/connection.js");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb").ObjectId;
const telegramApi = require("../middlewares/alerts.js");

module.exports = (() => {
  class Sound {
    async registerSound(req, res) {
      try {
        const { correo_electronico, estado } = req.body;
    
        // Buscar información del usuario
        const usuario = await req.db.collection("alumno").aggregate([
          {
            $match: {
              correo_electronico: correo_electronico,
            },
          },
          {
            $project: {
              _id: 1,
              nombre: 1,
              apellido: 1,
              bebes: 1,
            },
          },
        ]).toArray();
    
        if (!usuario.length) {
          return res.status(404).send({
            successful: false,
            error: true,
            message: "Usuario no encontrado.",
          });
        }
    
        const timezoneOffset = -6;
        const localDate = new Date();
        localDate.setHours(localDate.getHours() + timezoneOffset);
    
        // Registrar el estado de sonido
        const add = await req.db.collection("sound").insertOne({
          baby: [
            {
              id_bebe: usuario[0].bebes[0].id_bebe,
              nombre: usuario[0].bebes[0].nombre,
              apellido: usuario[0].bebes[0].apellido,
            },
          ],
          fecha: localDate,
          estado: estado,
          userID: usuario[0]._id,
        });
    
        // Determinar si se debe enviar una alerta
        if (estado === 1 || estado === 2) {
          // Buscar los chat IDs registrados para alertas
          const broadcastUser = await req.db.collection("broadcast").findOne({
            correo_electronico: correo_electronico,
          });
    
          if (broadcastUser && broadcastUser.alertas_telegram?.length) {
            const nombreBebe = usuario[0].bebes[0].nombre;
    
            // Generar el mensaje de alerta en función del estado
            const mensaje =
              estado === 1
                ? `⚠️ Alerta: El sensor detectó sonidos fuertes y agudos durante un minuto. Es posible que ${nombreBebe} esté llorando. 🍼`
                : `⚠️ Alerta: Después de un llanto fuerte, el sensor detectó que ${nombreBebe} se ha quedado en silencio abruptamente. Por favor, verifica que todo esté bien. 👶`;
    
            // Enviar mensaje a cada chatId registrado
            const alertasEnviadas = [];
            for (const chatId of broadcastUser.alertas_telegram) {
              try {
                await telegramApi.post("/sendMessage", {
                  chat_id: chatId,
                  text: mensaje,
                });
                alertasEnviadas.push(chatId);
              } catch (error) {
                console.error(`Error al enviar alerta al chat ${chatId}:`, error.message);
              }
            }
    
            console.log(`Alertas enviadas a los chats: ${alertasEnviadas}`);
          } else {
            console.warn(
              `No hay alertas configuradas para el correo: ${correo_electronico}`
            );
          }
        }
    
        await MongoConnection.releasePool(req.db);
    
        return res.status(200).send({
          successful: true,
          message: add,
        });
      } catch (error) {
        await MongoConnection.releasePool(req.db);
        console.error(error.message);
        return res.status(401).send({
          successful: false,
          error: true,
          message: "Algo salió mal con el registro de los valores de sonido",
        });
      }
    }
    

    async historySound(req, res) {
      try {
        let { _id } = req.params;
        //let { email, password } = req.body; es lo mismo que las lineas anteriores
        let { init, end } = getTwoHourRange();
        console.log(_id);
        let sound = await req.db
          .collection("sound")
          .aggregate([
            {
              $match: {
                userID: new mongoose.Types.ObjectId(_id),
                fecha: {
                  $gte: new Date(init),
                  $lte: new Date(end),
                },
              },
            },
            {
              $sort: {
                fecha: -1, // Ordenar por fecha en orden descendente
              },
            },
          ])
          .toArray();

        //console.log("sound");
        //console.log(JSON.stringify(sound, null, 3));

        //console.log("entrando a la funcion historial de sonido");
        return res.status(200).send({
          successful: true,
          message: sound,
        });
      } catch (error) {
        console.error(error.message);
        return res.status(401).send({
          successful: false,
          error: true,
          message: "Algo salio mal con el historial de sonido",
        });
      } finally {
        //Terminamos la sesión con la BD
        await MongoConnection.releasePool(req.db);
      }
    }

    async historySoundForCaregiver(req, res) {
      try {
        let { id_bebe } = req.params;
        //let { email, password } = req.body; es lo mismo que las lineas anteriores
        let { init, end } = getTwoHourRange();
        
        let sound = await req.db
          .collection("sound")
          .aggregate([
            {
              $match: {
                userID: new mongoose.Types.ObjectId(id_bebe),
                fecha: {
                  $gte: new Date(init),
                  $lte: new Date(end),
                },
              },
            },
            {
              $sort: {
                fecha: -1, // Ordenar por fecha en orden descendente
              },
            },
          ])
          .toArray();

        //console.log("sound");
        //console.log(JSON.stringify(sound, null, 3));

        //console.log("entrando a la funcion historial de sonido");
        return res.status(200).send({
          successful: true,
          message: sound,
        });
      } catch (error) {
        console.error(error.message);
        return res.status(401).send({
          successful: false,
          error: true,
          message: "Algo salio mal con el historial de sonido",
        });
      } finally {
        //Terminamos la sesión con la BD
        await MongoConnection.releasePool(req.db);
      }
    }
  }
  return new Sound();
})();

function getTwoHourRange() {
  const timezoneOffset = -6; // Ajuste de zona horaria
  const end = new Date();
  end.setHours(end.getHours() + timezoneOffset); // Ajustamos la fecha de finalización

  const init = new Date(end); // Copiamos la fecha de finalización para calcular el inicio
  init.setHours(init.getHours() - 3); // Ajustamos 3 horas hacia atrás para obtener el rango inicial

  return { init, end };
}

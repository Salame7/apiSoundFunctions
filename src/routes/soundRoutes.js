const SoundController = require('../controllers/soundController.js');
const UseConnection = require('../middlewares/UseConnection.js');
const validations = require('../middlewares/GeneralValidations.js');
const token = require('../middlewares/authenticate.js');
const express = require("express");
const checkTypeUser = require('../middlewares/checkTypeUser.js');
const limitAccess = require('../middlewares/limitAccess.js');
const api = express.Router();
// Te explico la estructura 
//          ruta                    milddlewares               |-función/metodo que se va aplicar a la ruta -|
//                      conexion a la base      validacion 
api.post('/registerSound', [UseConnection.getPool, validations.registro_sonido],(...args) => SoundController.registerSound(...args));
api.get('/historySound/:_id',[UseConnection.getPool, token.authenticateToken],(...args) => SoundController.historySound(...args));
api.get('/historySoundForCaregiver/:_id/:id_bebe', [UseConnection.getPool, token.authenticateToken, checkTypeUser, limitAccess(2)], (req, res) => SoundController.historySoundForCaregiver(req, res));
module.exports = api
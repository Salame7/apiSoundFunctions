La API **apiSoundFunctions** gestiona el monitoreo de sonido enviado por el módulo de sensado. Sus funcionalidades incluyen el registro de datos de sonido, el envío de alertas cuando se detectan valores fuera de rango, y la visualización de datos tanto para padres como para cuidadores. Está desplegada en AWS Lambda y utiliza Amazon API Gateway para su comunicación.

## Tecnologías Utilizadas
- **AWS Lambda** para la ejecución sin servidor.
- **Amazon API Gateway** para la gestión de endpoints.
- **MongoDB** como base de datos.
- **Express.js** como framework de backend.
- **JWT (JSON Web Token)** para autenticación.
- **Axios** para llamadas HTTP a otros servicios.

## Instalación y Configuración

### Prerequisitos
1. **Node.js** instalado en el sistema.
2. **Cuenta AWS** con permisos para Lambda y API Gateway.
3. **MongoDB Atlas** o una instancia de MongoDB local.
4. **Cuenta de desarrollador en Telegram** para obtener el token del bot.
5. **Variables de entorno** en AWS Lambda:
   - `MONGO_URI`: URL de conexión a MongoDB.
   - `JWT_SECRET`: Clave secreta para la autenticación.
   - `TELEGRAM_BOT_TOKEN`: Token de autenticación del bot de Telegram.

### Instalación Local
1. Clonar el repositorio:
   ```sh
   git clone <url del repositorio>
   cd <nombre del repositorio>
   ```
2. Instalar dependencias
    ```sh
    npm install
    ```
## Despliegue en AWS Lambda
Para desplegar en AWS Lambda utilizando Serverless Framework:

1. Instalar Serverless Framework:
    ```sh
    npm install -g serverless
    ```
2. Configurar AWS Credentials:
    ```sh
    serverless config credentials --provider aws --key <AWS_ACCESS_KEY> --secret <AWS_SECRET_KEY>
    ```
3. Desplegar: 
    ```sh
    serverless deploy
    ```

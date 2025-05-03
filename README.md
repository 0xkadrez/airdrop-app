# Aplicación de Airdrop para Avalanche C-Chain

Esta aplicación web te permite realizar airdrops de tokens ERC20 en la red Avalanche C-Chain utilizando el contrato AirdropContract.

## Requisitos previos

- MetaMask u otra wallet compatible con Web3
- Token ERC20 en la red Avalanche C-Chain que desees distribuir
- El contrato AirdropContract desplegado en Avalanche C-Chain

## Cómo configurar la dirección del contrato

La dirección del contrato AirdropContract está configurada como una constante en el archivo `src/utils/blockchain.js`. Para usar tu propio contrato desplegado:

1. Abre el archivo `src/utils/blockchain.js`
2. Busca la línea con `export const AIRDROP_CONTRACT_ADDRESS = "0x123..."` 
3. Reemplaza la dirección con la de tu contrato desplegado
4. Guarda el archivo y reinicia la aplicación

## Cómo desplegar el contrato

Puedes desplegar el contrato AirdropContract en la red Avalanche C-Chain utilizando Remix:

1. Abre [Remix IDE](https://remix.ethereum.org/)
2. Crea un nuevo archivo llamado `AirdropContract.sol` y copia el código del contrato
3. Compila el contrato con la versión de solidity 0.8.24 o superior
4. En el panel de despliegue, selecciona "Injected Provider - MetaMask" como entorno
5. Asegúrate de que tu MetaMask esté conectado a la red Avalanche C-Chain
6. Despliega el contrato
7. Copia la dirección del contrato desplegado y actualízala en `src/utils/blockchain.js`

## Configuración de Avalanche C-Chain en MetaMask

Si aún no tienes configurada la red Avalanche C-Chain en MetaMask, puedes agregarla con los siguientes parámetros:

- **Nombre de la Red**: Avalanche C-Chain
- **URL RPC**: https://api.avax.network/ext/bc/C/rpc
- **ID de Cadena**: 43114
- **Símbolo**: AVAX
- **Explorador de Bloques**: https://snowtrace.io/

## Cómo usar la aplicación

1. Conecta tu wallet haciendo clic en el botón "Conectar Wallet"
2. Introduce la dirección del token ERC20 que deseas distribuir
3. Haz clic en "Cargar" para verificar el token y ver tu balance
4. En el área de texto, ingresa la lista de destinatarios y cantidades en el formato:
   ```
   dirección,cantidad
   0xdCC241C3cd84e6b872ffa9E46Eee6A7A4E6643b9,55
   0x8Aa4ae6E69d64eB02189d8D1dA178061841efa8D,89
   ```
5. Haz clic en "Aprobar Tokens" para autorizar al contrato a gastar tus tokens
6. Una vez aprobados, haz clic en "Ejecutar Airdrop" para realizar la distribución

## Desarrollo local

### Instalación

```
npm install
```

### Ejecutar en desarrollo

```
npm start
```

### Compilar para producción

```
npm run build
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

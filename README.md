# Aplicación de Airdrop para Avalanche C-Chain

Esta aplicación web te permite realizar airdrops de tokens ERC20 en la red Avalanche C-Chain utilizando el contrato AirdropContract.

## Requisitos previos

- Core u otra wallet compatible con EVM
- Token ERC20 en la red Avalanche C-Chain que desees distribuir
- El contrato AirdropContract desplegado en Avalanche C-Chain

## Cómo configurar la dirección del contrato

La dirección del contrato AirdropContract está configurada en el archivo `.env`. Para usar tu propio contrato desplegado:

1. Abre el archivo `.env`
2. Busca la línea con `REACT_APP_AIRDROP_CONTRACT_ADDRESS=0x766D5f2a716ED5a4C2b3A93D564b90c9bF873b0E` 
3. Reemplaza la dirección con la de tu contrato desplegado
4. Guarda el archivo y reinicia la aplicación

## Cómo desplegar el contrato

Puedes desplegar el contrato AirdropContract en la red Avalanche C-Chain utilizando Remix:

1. Abre [Remix IDE](https://remix.ethereum.org/)
2. Crea un nuevo archivo llamado `AirdropContract.sol` y copia el código del contrato
3. Compila el contrato con la versión de solidity 0.8.24 o superior
4. En el panel de despliegue, selecciona "Injected Provider - Core" como entorno
5. Asegúrate de que tu MetaMask esté conectado a la red Avalanche C-Chain
6. Despliega el contrato
7. Copia la dirección del contrato desplegado y actualízala en `.env`

## Configuración de Avalanche C-Chain en MetaMask

Si aún no tienes configurada la red Avalanche C-Chain en tu wallet, puedes agregarla con los siguientes parámetros:

- **Nombre de la Red**: Avalanche C-Chain
- **URL RPC**: https://api.avax.network/ext/bc/C/rpc
- **ID de Cadena**: 43114
- **Símbolo**: AVAX
- **Explorador de Bloques**: https://snowtrace.io/

## Cómo usar la aplicación

1. Conecta tu wallet haciendo clic en el botón "Conectar Wallet"
2. Introduce la dirección del token ERC20 que deseas distribuir
3. Espera que cargue para verificar el token y ver tu balance
4. En el área de texto, ingresa la lista de destinatarios y cantidades en el formato:
   ```
   dirección,cantidad
   0xdCC241C3cd84e6b872ffa9E46Eee6A7A4E6643b9,55,
   0x8Aa4ae6E69d64eB02189d8D1dA178061841efa8D,89,
   ```
5. Haz clic en "Aprobar una vez" para autorizar al contrato a gastar tus tokens de forma ilimitada
6. Tambien puedes "Enviar Airdrop" para aprobar solo la cantidad total a enviar y realizar la distribución 

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


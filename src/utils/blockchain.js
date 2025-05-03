import { ethers } from "ethers";
import Web3Modal from "web3modal";

// ABI del contrato AirdropContract (generado directamente desde el código Solidity)
const AIRDROP_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalRecipients",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      }
    ],
    "name": "AirdropProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "name": "batchAirdrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "withdrawAVAX",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// ABI simplificado para ERC20
const ERC20_ABI = [
  // Funciones de lectura
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Funciones de escritura
  {
    "constant": false,
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "recipient", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "sender", "type": "address"}, {"name": "recipient", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Configuración de Avalanche C-Chain
const AVALANCHE_MAINNET_PARAMS = {
  chainId: "0xA86A",
  chainName: "Avalanche C-Chain",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://snowtrace.io/"],
};

// Configuración de Avalanche Fuji Testnet para pruebas
const AVALANCHE_TESTNET_PARAMS = {
  chainId: "0xA869",
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

// Por defecto usamos la testnet para pruebas
export const DEFAULT_NETWORK = AVALANCHE_TESTNET_PARAMS;

// IMPORTANTE: Dirección del contrato en Fuji Testnet
export const AIRDROP_CONTRACT_ADDRESS = process.env.REACT_APP_AIRDROP_CONTRACT_ADDRESS || "0x52b3c49D90a06bd4Db1DC09893c24B2c2625A2fA"; // Dirección de respaldo

// Verificamos y registramos la dirección del contrato al cargar
console.log("Dirección del contrato de airdrop:", AIRDROP_CONTRACT_ADDRESS);
console.log("Red configurada:", DEFAULT_NETWORK.chainName);
if (!AIRDROP_CONTRACT_ADDRESS || AIRDROP_CONTRACT_ADDRESS === "undefined") {
  console.error("ADVERTENCIA: La dirección del contrato no está configurada correctamente.");
}

// Opciones para Web3Modal
const providerOptions = {};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });
}

// Función para conectar a la wallet
export async function connectWallet() {
  try {
    const provider = await web3Modal.connect();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    const network = await ethersProvider.getNetwork();

    // Lógica para asegurar que estamos en la red correcta (Fuji Testnet por defecto)
    const targetChainId = parseInt(DEFAULT_NETWORK.chainId, 16);
    const currentChainId = Number(network.chainId);
    
    console.log("Conectado a la red:", network.name, "(ChainID:", currentChainId, ")");
    console.log("Red objetivo:", DEFAULT_NETWORK.chainName, "(ChainID:", targetChainId, ")");
    
    if (currentChainId !== targetChainId) {
      console.log("Intentando cambiar a la red:", DEFAULT_NETWORK.chainName);
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [DEFAULT_NETWORK],
        });
        
        // Después de intentar cambiar, verificamos nuevamente
        const updatedNetwork = await ethersProvider.getNetwork();
        if (Number(updatedNetwork.chainId) !== targetChainId) {
          console.warn("No se pudo cambiar automáticamente a la red de prueba. Por favor, cambia manualmente a", DEFAULT_NETWORK.chainName);
        } else {
          console.log("Red cambiada exitosamente a", DEFAULT_NETWORK.chainName);
        }
      } catch (switchError) {
        console.error("Error al cambiar de red:", switchError);
      }
    } else {
      console.log("Ya conectado a", DEFAULT_NETWORK.chainName);
    }

    return {
      provider,
      ethersProvider,
      signer,
      address,
      network,
      isCorrectNetwork: Number(network.chainId) === targetChainId
    };
  } catch (error) {
    console.error("Error al conectar wallet:", error);
    return null;
  }
}

// Función para desconectar wallet
export async function disconnectWallet() {
  if (web3Modal) {
    web3Modal.clearCachedProvider();
  }
}

// Función para obtener el contrato de Airdrop
export function getAirdropContract(signer) {
  return new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AIRDROP_CONTRACT_ABI, signer);
}

// Función para obtener un contrato ERC20
export function getERC20Contract(tokenAddress, signer) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}

// Valor máximo para el tipo uint256 (2^256 - 1)
export const MAX_UINT256 = ethers.MaxUint256; // Equivalente a 2^256 - 1

// Función para aprobar el gasto de tokens (cantidad específica)
export async function approveTokens(tokenAddress, amount, signer) {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  console.log(`Aprobando ${ethers.formatUnits(amount, 18)} tokens para ser gastados por el contrato ${AIRDROP_CONTRACT_ADDRESS}`);
  
  // Aseguramos que la aprobación sea específica y clara
  const tx = await tokenContract.approve(AIRDROP_CONTRACT_ADDRESS, amount);
  console.log("Tx de aprobación enviada:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("Aprobación confirmada en bloque:", receipt.blockNumber);
  
  return receipt;
}

// Función para aprobar una cantidad ilimitada de tokens (una sola vez)
export async function approveUnlimitedTokens(tokenAddress, signer) {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  console.log(`Aprobando cantidad ILIMITADA de tokens para ser gastados por el contrato ${AIRDROP_CONTRACT_ADDRESS}`);
  
  // Usamos el valor máximo posible para uint256
  const tx = await tokenContract.approve(AIRDROP_CONTRACT_ADDRESS, MAX_UINT256);
  console.log("Tx de aprobación ilimitada enviada:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("Aprobación ilimitada confirmada en bloque:", receipt.blockNumber);
  
  return receipt;
}

// Función para obtener el balance de tokens
export async function getTokenBalance(tokenAddress, ownerAddress, signer) {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  return await tokenContract.balanceOf(ownerAddress);
}

// Función para obtener el allowance de tokens
export async function getTokenAllowance(tokenAddress, ownerAddress, signer) {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  return await tokenContract.allowance(ownerAddress, AIRDROP_CONTRACT_ADDRESS);
}

// Función para obtener información del token (símbolo, decimales)
export async function getTokenInfo(tokenAddress, signer) {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  try {
    const [symbol, decimals, name] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.name(),
    ]);
    return { symbol, decimals, name };
  } catch (error) {
    console.error("Error al obtener información del token:", error);
    return { symbol: "Unknown", decimals: 18, name: "Unknown Token" };
  }
}

// Función para procesar la entrada de destinatarios en el formato especificado
export function processRecipientsInput(input) {
  if (!input.trim()) return { recipients: [], amounts: [] };

  const lines = input.split('\n').filter(line => line.trim());
  const recipients = [];
  const amounts = [];

  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length >= 2) {
      const address = parts[0].trim();
      // Eliminar comas extras y convertir a número
      const amount = parts[1].trim().replace(/,/g, '');

      if (ethers.isAddress(address) && amount && !isNaN(amount)) {
        recipients.push(address);
        try {
          amounts.push(ethers.parseUnits(amount, 18)); // Asumimos 18 decimales por defecto
        } catch (error) {
          console.error(`Error al parsear cantidad '${amount}' para la dirección ${address}:`, error);
          // Omitimos este destinatario si hay un error con la cantidad
        }
      }
    }
  }

  return { recipients, amounts };
}

// Función para obtener la URL del explorador basada en la red actual
export function getExplorerUrl(txHash, addressOrHash, type = 'tx') {
  // Por defecto usamos el explorador de Fuji testnet
  const baseUrl = DEFAULT_NETWORK.blockExplorerUrls[0];
  
  if (type === 'tx') {
    return `${baseUrl}tx/${txHash}`;
  } else if (type === 'address') {
    return `${baseUrl}address/${addressOrHash}`;
  } else if (type === 'token') {
    return `${baseUrl}token/${addressOrHash}`;
  }
  
  return baseUrl;
}

// Función para realizar el airdrop
export async function executeBatchAirdrop(tokenAddress, recipients, amounts, signer, useUnlimitedApproval = false) {
  try {
    console.group(`=== INICIO DEL PROCESO DE AIRDROP EN ${DEFAULT_NETWORK.chainName} ===`);
    
    // 1. Verificar parámetros de entrada
    console.log("Verificando parámetros de entrada...");
    console.log("- Token address:", tokenAddress);
    console.log("- Token explorador:", getExplorerUrl(null, tokenAddress, 'token'));
    console.log("- Número de destinatarios:", recipients.length);
    if (recipients.length === 0) {
      throw new Error("No hay destinatarios válidos para el airdrop");
    }
    
    if (recipients.length !== amounts.length) {
      throw new Error(`Número de destinatarios (${recipients.length}) no coincide con número de cantidades (${amounts.length})`);
    }
    
    // 2. Obtener contratos y direcciones
    console.log("Obteniendo contratos y direcciones...");
    const userAddress = await signer.getAddress();
    console.log("- Dirección del usuario:", userAddress);
    console.log("- Dirección del contrato de airdrop:", AIRDROP_CONTRACT_ADDRESS);
    
    // Crear instancias de los contratos
    const tokenContract = getERC20Contract(tokenAddress, signer);
    const airdropContract = getAirdropContract(signer);
    
    // 3. Verificar balance y allowance
    console.log("Verificando balance y allowance...");
    let totalAmount = ethers.getBigInt(0);
    for (const amount of amounts) {
      totalAmount = totalAmount + ethers.getBigInt(amount);
    }
    console.log(`- Total a enviar: ${ethers.formatUnits(totalAmount, 18)} tokens`);
    
    const balance = await tokenContract.balanceOf(userAddress);
    console.log(`- Balance del usuario: ${ethers.formatUnits(balance, 18)} tokens`);
    
    if (balance < totalAmount) {
      throw new Error(`Balance insuficiente. Tienes ${ethers.formatUnits(balance, 18)} tokens pero necesitas ${ethers.formatUnits(totalAmount, 18)}`);
    }
    
    // 4. Verificar y realizar aprobación si es necesario
    console.log("Verificando aprobación...");
    const allowance = await tokenContract.allowance(userAddress, AIRDROP_CONTRACT_ADDRESS);
    console.log(`- Allowance actual: ${ethers.formatUnits(allowance, 18)} tokens`);
    
    if (allowance < totalAmount) {
      console.log(`- Allowance insuficiente (${ethers.formatUnits(allowance, 18)} < ${ethers.formatUnits(totalAmount, 18)})`);
      
      if (useUnlimitedApproval) {
        console.log("- Usando aprobación ILIMITADA (esto solo se necesita una vez)");
        const approveTx = await approveUnlimitedTokens(tokenAddress, signer);
        console.log("- Transacción de aprobación ilimitada enviada:", approveTx.hash);
        await approveTx.wait();
      } else {
        console.log("- Usando aprobación EXACTA para esta transacción");
        const approveTx = await tokenContract.approve(AIRDROP_CONTRACT_ADDRESS, totalAmount);
        console.log("- Transacción de aprobación enviada:", approveTx.hash);
        await approveTx.wait();
      }
      
      // Verificar nuevamente el allowance
      const newAllowance = await tokenContract.allowance(userAddress, AIRDROP_CONTRACT_ADDRESS);
      console.log(`- Nuevo allowance: ${ethers.formatUnits(newAllowance, 18)} tokens`);
      
      if (newAllowance < totalAmount) {
        throw new Error("La aprobación no se realizó correctamente");
      }
    }
    
    // 5. Verificar si hay al menos un destinatario válido
    if (recipients.length === 0) {
      throw new Error("No hay destinatarios válidos para el airdrop");
    }
    
    // 6. Mostrar detalles de la transacción
    console.log("Detalles de los destinatarios:");
    for (let i = 0; i < recipients.length; i++) {
      console.log(`- Destinatario ${i+1}: ${recipients[i]} - Cantidad: ${ethers.formatUnits(amounts[i], 18)} tokens`);
    }
    
    // 7. Ejecutar la transacción de airdrop
    console.log("Ejecutando transacción de airdrop...");
    // No agregamos opciones adicionales que puedan interferir
    const tx = await airdropContract.batchAirdrop(tokenAddress, recipients, amounts);
    console.log("- Transacción enviada:", tx.hash);
    
    // 8. Esperar la confirmación
    console.log("Esperando confirmación...");
    const receipt = await tx.wait();
    console.log("- Transacción confirmada en bloque:", receipt.blockNumber);
    
    // 9. Verificar el resultado
    console.log("Verificando el resultado...");
    // Verificar eventos emitidos
    const events = receipt.logs;
    console.log(`- Eventos emitidos: ${events.length}`);
    
    // 10. Verificar balances después de la transacción
    const newBalance = await tokenContract.balanceOf(userAddress);
    console.log(`- Balance del usuario después: ${ethers.formatUnits(newBalance, 18)} tokens`);
    console.log(`- Diferencia de balance: ${ethers.formatUnits(balance - newBalance, 18)} tokens`);
    
    // Si hay una diferencia significativa en el balance, consideramos que fue exitoso
    const isSuccessful = balance > newBalance && (balance - newBalance >= totalAmount * ethers.getBigInt(99) / ethers.getBigInt(100));
    
    if (isSuccessful) {
      console.log("✅ AIRDROP COMPLETADO EXITOSAMENTE");
    } else {
      console.warn("⚠️ AIRDROP COMPLETADO PERO POSIBLEMENTE FALLIDO - Verificar la transacción en el explorador");
    }
    
    // Al final cuando mostramos información de la transacción
    if (receipt && receipt.hash) {
      console.log(`- Transacción confirmada: ${getExplorerUrl(receipt.hash)}`);
      console.log(`- Ver en explorador: ${getExplorerUrl(receipt.hash)}`);
    }
    
    console.groupEnd();
    
    // Incluir información de la red en el resultado
    return {
      ...receipt,
      network: DEFAULT_NETWORK.chainName,
      explorerUrl: receipt.hash ? getExplorerUrl(receipt.hash) : null
    };
  } catch (error) {
    console.error(`ERROR EN AIRDROP (${DEFAULT_NETWORK.chainName}):`, error);
    console.groupEnd();
    throw error;
  }
} 
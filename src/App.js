import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  Text,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Container,
  Link,
  Divider,
  useToast,
  Tag,
  Switch,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import theme from "./theme";
import {
  connectWallet,
  disconnectWallet,
  getTokenInfo,
  getTokenBalance,
  getTokenAllowance,
  approveTokens,
  approveUnlimitedTokens,
  processRecipientsInput,
  executeBatchAirdrop,
  AIRDROP_CONTRACT_ADDRESS,
  getExplorerUrl,
  DEFAULT_NETWORK,
} from "./utils/blockchain";

function App() {
  // Estado para la conexión de wallet
  const [account, setAccount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [allowance, setAllowance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // eslint-disable-line no-unused-vars
  const [signer, setSigner] = useState(null);
  
  // Estado para los datos del airdrop
  const [recipients, setRecipients] = useState("");
  const [parsedData, setParsedData] = useState({ recipients: [], amounts: [] });
  const [showRecipientsSummary, setShowRecipientsSummary] = useState(false);
  const [useUnlimitedApproval, setUseUnlimitedApproval] = useState(false);
  
  // Estado para manejo de transacciones
  const [isApproving, setIsApproving] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  
  const toast = useToast({
    position: "top",
    isClosable: true,
    variant: "solid",
    containerStyle: {
      marginTop: "20vh",
    },
  });

  // Efecto para cargar el estado de la wallet al inicio
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        await handleConnect();
      }
    };
    
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Efecto para cargar información del token cuando se establece una dirección
  useEffect(() => {
    if (tokenAddress && isConnected && ethers.isAddress(tokenAddress)) {
      loadTokenInfo();
    } else {
      setTokenInfo(null);
      setBalance(null);
      setAllowance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, isConnected]);
  
  // Efecto para procesar la entrada de destinatarios
  useEffect(() => {
    try {
      if (recipients.trim()) {
        const { recipients: parsedRecipients, amounts: parsedAmounts } = processRecipientsInput(recipients);
        setParsedData({ recipients: parsedRecipients, amounts: parsedAmounts });
      } else {
        setParsedData({ recipients: [], amounts: [] });
      }
    } catch (error) {
      console.error("Error al procesar destinatarios:", error);
      // No actualizamos el estado si hay errores para evitar UI inconsistente
    }
  }, [recipients]);

  // Función para conectar la wallet
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const connection = await connectWallet();
      if (connection) {
        setAccount(connection.address);
        setSigner(connection.signer);
        setIsConnected(true);
        
        toast({
          title: "Wallet conectada",
          description: "Tu wallet ha sido conectada correctamente.",
          status: "success",
          duration: 5000,
          isClosable: true,
          containerStyle: {
            maxWidth: "500px",
            width: "auto"
          },
          bg: "rgba(138, 66, 211, 0.85)",
        });
      }
    } catch (error) {
      console.error("Error conectando wallet:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar a tu wallet.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para desconectar la wallet
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setAccount("");
      setSigner(null);
      setIsConnected(false);
      setTokenInfo(null);
      setBalance(null);
      setAllowance(null);
      
      toast({
        title: "Wallet desconectada",
        description: "Tu wallet ha sido desconectada correctamente.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error desconectando wallet:", error);
    }
  };
  
  // Función para cargar la información del token
  const loadTokenInfo = async () => {
    if (!signer || !ethers.isAddress(tokenAddress)) return;
    
    setIsLoading(true);
    try {
      const info = await getTokenInfo(tokenAddress, signer);
      setTokenInfo(info);
      
      const bal = await getTokenBalance(tokenAddress, account, signer);
      setBalance(bal);
      
      const allow = await getTokenAllowance(tokenAddress, account, signer);
      setAllowance(allow);
    } catch (error) {
      console.error("Error cargando información del token:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del token. Verifica la dirección.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para aprobar los tokens
  const handleApprove = async () => {
    if (!signer || !ethers.isAddress(tokenAddress)) {
      toast({
        title: "Error",
        description: "Dirección de token inválida.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Calcular la cantidad total a aprobar
    let totalAmount = ethers.getBigInt(0);
    for (const amount of parsedData.amounts) {
      totalAmount = totalAmount + ethers.getBigInt(amount);
    }
    
    if (totalAmount === ethers.getBigInt(0)) {
      toast({
        title: "Error",
        description: "La cantidad total a enviar no puede ser cero.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsApproving(true);
    try {
      if (useUnlimitedApproval) {
        // Usar aprobación ilimitada
        await approveUnlimitedTokens(tokenAddress, signer);
        
        toast({
          title: "Aprobación Exitosa",
          description: `Has aprobado una cantidad ilimitada de tokens ${tokenInfo?.symbol} para futuros airdrops. No necesitarás aprobar nuevamente.`,
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      } else {
        // Usar aprobación normal (cantidad específica)
        await approveTokens(tokenAddress, totalAmount, signer);
        
        toast({
          title: "Aprobación exitosa",
          description: `Tokens aprobados para el contrato de airdrop.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Actualizar el allowance
      const allow = await getTokenAllowance(tokenAddress, account, signer);
      setAllowance(allow);
    } catch (error) {
      console.error("Error aprobando tokens:", error);
      toast({
        title: "Error",
        description: "No se pudieron aprobar los tokens.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsApproving(false);
    }
  };
  
  // Función para ejecutar el airdrop
  const handleAirdrop = async () => {
    if (!signer || !ethers.isAddress(tokenAddress)) {
      toast({
        title: "Error",
        description: "Dirección de token inválida.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (parsedData.recipients.length === 0) {
      toast({
        title: "Error",
        description: "Debes proporcionar al menos un destinatario válido.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Mostrar mensaje de confirmación
    const totalAmount = parsedData.amounts.reduce(
      (a, b) => ethers.getBigInt(a) + ethers.getBigInt(b), 
      ethers.getBigInt(0)
    );
    
    toast({
      title: `Verificación de transacción`,
      description: `Vas a enviar ${ethers.formatUnits(totalAmount, tokenInfo.decimals)} ${tokenInfo.symbol} entre ${parsedData.recipients.length} destinatarios. Por favor confirma la transacción.`,
      status: "info",
      duration: 15000,
      isClosable: true,
      containerStyle: {
        maxWidth: "500px",
        width: "auto"
      },
      bg: "rgba(138, 66, 211, 0.85)",
    });
    
    setIsAirdropping(true);
    setTxHash("");
    setExplorerUrl("");
    
    try {
      console.group("==== EJECUCIÓN DE AIRDROP ====");
      console.log("Iniciando airdrop para", parsedData.recipients.length, "destinatarios");
      console.log("Red:", DEFAULT_NETWORK.chainName);
      console.log("Modo de aprobación:", useUnlimitedApproval ? "ILIMITADA" : "Estándar");
      
      const result = await executeBatchAirdrop(
        tokenAddress,
        parsedData.recipients,
        parsedData.amounts,
        signer,
        useUnlimitedApproval
      );
      
      // El hash puede estar en diferentes lugares según la respuesta
      const txHash = result.hash || result.transactionHash;
      setTxHash(txHash);
      
      // Usar el explorador correcto para la testnet
      const txExplorerUrl = result.explorerUrl || getExplorerUrl(txHash);
      setExplorerUrl(txExplorerUrl);
      
      // Mostrar mensaje detallado con información de la transacción
      toast({
        title: "Airdrop completado",
        description: `Se ha completado el airdrop a ${parsedData.recipients.length} destinatarios.`,
        status: "success",
        duration: 10000,
        isClosable: true,
        containerStyle: {
          maxWidth: "500px",
          width: "auto"
        },
        bg: "rgba(83, 166, 76, 0.85)",
      });
      
      console.log("Airdrop completado:", result);
      console.log("Ver en explorador:", txExplorerUrl);
      console.groupEnd();
      
      // Actualizar balance
      const bal = await getTokenBalance(tokenAddress, account, signer);
      setBalance(bal);
      
      // Actualizar allowance
      const allow = await getTokenAllowance(tokenAddress, account, signer);
      setAllowance(allow);
    } catch (error) {
      console.error("Error ejecutando airdrop:", error);
      console.groupEnd();
      
      let errorMessage = "No se pudo completar el airdrop.";
      
      if (error.message) {
        if (error.message.includes("insufficient funds") || error.message.includes("gas")) {
          errorMessage = "No tienes suficiente AVAX para pagar el gas de la transacción. Necesitas más AVAX en tu billetera.";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Has rechazado la transacción en tu billetera.";
        } else if (error.message.includes("allowance")) {
          errorMessage = "Allowance insuficiente. Debes aprobar más tokens antes de realizar el airdrop.";
        } else if (error.message.includes("balance")) {
          errorMessage = "Balance insuficiente. No tienes suficientes tokens para realizar este airdrop.";
        } else {
          // Si hay un mensaje de error pero no coincide con los casos anteriores, mostramos parte del mensaje
          errorMessage += " " + error.message.substring(0, 100) + "...";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    } finally {
      setIsAirdropping(false);
    }
  };
  
  // Función para mostrar el resumen de destinatarios
  const toggleRecipientsSummary = () => {
    setShowRecipientsSummary(!showRecipientsSummary);
  };
  
  // Formatear cantidades para mostrar
  const formatTokenAmount = (amount, decimals = 18) => {
    if (amount === null || amount === undefined) return "0";
    try {
      // Para valores muy cercanos a cero, mostrar simplemente 0
      if (ethers.getBigInt(amount) === ethers.getBigInt(0)) {
        return "0";
      }
      return parseFloat(ethers.formatUnits(amount, decimals)).toFixed(4);
    } catch (error) {
      console.error("Error formateando cantidad:", error);
      return "0";
    }
  };
  
  return (
    <ChakraProvider theme={theme}>
      <Box bgGradient="linear(to-b, gray.900, darkPurple.900)" minH="100vh" py={8}>
        <Container maxW="container.lg">
          <VStack spacing={8}>
            {/* Header */}
            <Flex w="full" justify="space-between" align="center">
              <Box>
                <Heading size="xl" bgColor="white" bgClip="text">
                  UltraVioletaDAO Airdrop
                </Heading>
                <Text fontSize="md" color="gray.400">
                  Distribuye tokens ERC20 en la red {DEFAULT_NETWORK.chainName}
                </Text>
              </Box>
              
              {isConnected ? (
                <HStack spacing={3}>
                  <Tag 
                    colorScheme="purple" 
                    size="md" 
                    borderRadius="full" 
                    bg="rgba(138, 66, 211, 0.2)"
                    color="gray.200"
                    px={3}
                    py={1}
                    fontWeight="medium"
                  >
                    {DEFAULT_NETWORK.chainName}
                  </Tag>
                  <Box
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="rgba(138, 66, 211, 0.2)"
                    color="gray.200"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </Box>
                  <Button 
                    onClick={handleDisconnect} 
                    variant="outline" 
                    size="sm"
                    borderRadius="full"
                    borderColor="ultraviolet.400"
                    color="gray.200"
                    _hover={{
                      bg: "rgba(138, 66, 211, 0.2)",
                      borderColor: "ultraviolet.300"
                    }}
                  >
                    Desconectar
                  </Button>
                </HStack>
              ) : (
                <Box>
                  {/* Botón de conectar wallet eliminado para evitar duplicación */}
                </Box>
              )}
            </Flex>
            
            {/* Main Content */}
            <VStack
              spacing={6}
              w="full"
              bg="rgba(25, 10, 40, 0.7)"
              p={6}
              borderRadius="xl"
              backdropFilter="blur(10px)"
              boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
              border="1px solid rgba(255, 255, 255, 0.05)"
            >
              {!isConnected ? (
                <VStack spacing={4} py={8}>
                  <Text fontSize="lg" color="gray.300">
                    Conecta tu wallet para comenzar
                  </Text>
                  <Button 
                    onClick={handleConnect} 
                    size="lg"
                    minW="150px"
                    w="auto"
                    display="flex"
                    justifyContent="center"
                  >
                    Conectar
                  </Button>
                </VStack>
              ) : (
                <>
            
                  
                  <FormControl>
                    <FormLabel color="gray.300">Dirección del Token ERC20</FormLabel>
                    <Input
                      placeholder="0x..."
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      onBlur={() => {
                        if (tokenAddress && ethers.isAddress(tokenAddress)) {
                          loadTokenInfo();
                        }
                      }}
                      borderColor={tokenAddress ? (ethers.isAddress(tokenAddress) ? "green.400" : "red.400") : "inherit"}
                      _hover={{ borderColor: tokenAddress ? (ethers.isAddress(tokenAddress) ? "green.300" : "red.300") : "inherit" }}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Token ERC20 que deseas distribuir
                    </Text>
                  </FormControl>
                  
                  {/* Información del token */}
                  {tokenInfo && (
                    <Box
                      w="full"
                      bg="rgba(41, 20, 66, 0.4)"
                      p={4}
                      borderRadius="md"
                      border="1px solid rgba(138, 66, 211, 0.2)"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text color="gray.300">Token:</Text>
                        <Text color="white" fontWeight="bold">{tokenInfo.name} ({tokenInfo.symbol})</Text>
                      </HStack>
                      
                      <HStack justify="space-between" mb={2}>
                        <Text color="gray.300">Balance:</Text>
                        <Text color="white" fontWeight="bold">
                          {formatTokenAmount(balance, tokenInfo.decimals)} {tokenInfo.symbol}
                        </Text>
                      </HStack>
                      
                      {allowance !== null && (
                        <HStack justify="space-between">
                          <Text color="gray.300">Aprobado:</Text>
                          <Text color="white" fontWeight="bold">
                            {formatTokenAmount(allowance, tokenInfo.decimals)} {tokenInfo.symbol}
                          </Text>
                        </HStack>
                      )}
                    </Box>
                  )}
                  
                  <Divider borderColor="rgba(255, 255, 255, 0.1)" />
                  
                  {/* Lista de destinatarios */}
                  <FormControl>
                    <FormLabel color="gray.300">Lista de Destinatarios</FormLabel>
                    <Textarea
                      placeholder="Formato: dirección,cantidad
0xdCC241C3cd84e6b872ffa9E46Eee6A7A4E6643b9,55
0x8Aa4ae6E69d64eB02189d8D1dA178061841efa8D,89"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      rows={6}
                      mb={2}
                    />
                    <Text fontSize="xs" color="gray.500" mb={3}>
                      Cada línea debe contener una dirección y una cantidad separadas por coma
                    </Text>
                    
                    {parsedData.recipients.length > 0 && (
                      <>
                        <HStack justify="space-between">
                          <Text color="gray.300">
                            {parsedData.recipients.length} destinatarios válidos
                          </Text>
                          <Button size="xs" onClick={toggleRecipientsSummary}>
                            {showRecipientsSummary ? "Ocultar" : "Ver"} detalles
                          </Button>
                        </HStack>
                        
                        {showRecipientsSummary && (
                          <Box
                            mt={2}
                            p={3}
                            bg="rgba(25, 10, 40, 0.6)"
                            borderRadius="md"
                            maxH="200px"
                            overflowY="auto"
                          >
                            {parsedData.recipients.map((recipient, index) => (
                              <HStack key={index} justify="space-between" fontSize="sm" my={1}>
                                <Text color="gray.400">
                                  {recipient.substring(0, 8)}...{recipient.substring(recipient.length - 6)}
                                </Text>
                                <Text color="white">
                                  {parsedData.amounts[index] 
                                  ? ethers.formatUnits(parsedData.amounts[index], 18)
                                  : "0"} {tokenInfo?.symbol || "tokens"}
                                </Text>
                              </HStack>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </FormControl>
                  
                  {/* Botones de acción */}
                  <VStack spacing={3} w="full" pt={2}>
                    <FormControl display="flex" alignItems="center" justifyContent="flex-start" w="full">
                      <Switch
                        id="unlimited-approval"
                        isChecked={useUnlimitedApproval}
                        onChange={(e) => setUseUnlimitedApproval(e.target.checked)}
                        colorScheme="purple"
                        size="md"
                        mr={3}
                      />
                      <FormLabel htmlFor="unlimited-approval" mb="0" fontSize="sm" color="gray.300" cursor="pointer">
                        Aprobar una vez
                      </FormLabel>
                    </FormControl>
                    
                    <HStack spacing={4} w="full">
                      <Button
                        colorScheme="purple"
                        onClick={handleApprove}
                        isLoading={isApproving}
                        loadingText="Aprobando"
                        isDisabled={!tokenAddress || parsedData.recipients.length === 0 || !useUnlimitedApproval}
                        flex={1}
                      >
                        Aprobar una vez
                      </Button>
                      
                      <Button
                        colorScheme="purple"
                        variant="solid"
                        onClick={handleAirdrop}
                        isLoading={isAirdropping}
                        loadingText="Enviando"
                        isDisabled={!tokenAddress || parsedData.recipients.length === 0 || 
                                    (allowance && parsedData.amounts.reduce((a, b) => ethers.getBigInt(a) + ethers.getBigInt(b), ethers.getBigInt(0)) > ethers.getBigInt(allowance))}
                        flex={1}
                      >
                        Enviar Airdrop
                      </Button>
                    </HStack>
                  
                    {useUnlimitedApproval && (
                      <Box
                        bg="rgba(138, 66, 211, 0.15)"
                        borderRadius="md"
                        p={3}
                        borderLeft="4px solid"
                        borderColor="ultraviolet.400"
                        w="full"
                      >
                        <HStack spacing={2} align="flex-start">
                          <Box 
                            color="ultraviolet.400" 
                            fontWeight="bold" 
                            fontSize="sm"
                            w="20px" 
                            h="20px" 
                            borderRadius="full" 
                            border="2px solid" 
                            borderColor="ultraviolet.400"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mt="1px"
                          >
                            i
                          </Box>
                          <Text color="gray.200" fontSize="sm">
                            Permite usar el contrato con cualquier cantidad de tokens sin necesidad de aprobar de nuevo. Solo debes hacerlo una vez por token.
                          </Text>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                  
                  {/* Información de transacción */}
                  {txHash && (
                    <Box
                      w="full"
                      bg="rgba(138, 66, 211, 0.15)"
                      p={4}
                      borderRadius="lg"
                      borderLeft="4px solid"
                      borderColor="ultraviolet.400"
                    >
                      <HStack spacing={3} align="flex-start">
                        <Box 
                          color="ultraviolet.400"
                          mt={1}
                        >
                          <Box 
                            color="green.400" 
                            bg="rgba(72, 187, 120, 0.2)" 
                            borderRadius="full" 
                            p={1}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            boxSize="24px"
                          >
                            ✓
                          </Box>
                        </Box>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="bold" color="gray.100">
                            ¡Airdrop completado con éxito!
                          </Text>
                          <Text fontSize="sm" color="gray.300">
                            Red: {DEFAULT_NETWORK.chainName}
                          </Text>
                          <Link 
                            href={explorerUrl} 
                            color="ultraviolet.300"
                            isExternal
                            fontSize="sm"
                            textDecoration="underline"
                          >
                            Ver transacción en el explorador
                          </Link>
                        </VStack>
                      </HStack>
                    </Box>
                  )}
                </>
              )}
            </VStack>
            
            {/* Footer */}
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Airdrop {DEFAULT_NETWORK.chainName} — Contrato: {" "}
              <Link 
                href={getExplorerUrl(null, AIRDROP_CONTRACT_ADDRESS, 'address')} 
                color="ultraviolet.300" 
                isExternal
              >
                {AIRDROP_CONTRACT_ADDRESS.substring(0, 6)}...{AIRDROP_CONTRACT_ADDRESS.substring(AIRDROP_CONTRACT_ADDRESS.length - 4)}
              </Link>
            </Text>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;

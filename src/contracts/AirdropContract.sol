// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AirdropContract
 * @dev Contrato para enviar airdrop de tokens ERC20 a múltiples direcciones en una sola transacción
 * Optimizado para Avalanche C-Chain, utiliza transferFrom para evitar la necesidad de transferir tokens al contrato
 */
contract AirdropContract is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Eventos
    event AirdropProcessed(address indexed token, address indexed sender, uint256 totalRecipients, uint256 totalAmount);
    event EmergencyWithdraw(address token, address to, uint256 amount);
    
    // Constantes
    uint256 public constant MAX_BATCH_SIZE = 200; // Límite máximo de destinatarios por transacción
    
    /**
     * @dev Constructor que establece al deployer como propietario del contrato
     */
    constructor() Ownable(msg.sender) {
        // No se requiere inicialización adicional
    }
    
    /**
     * @dev Realiza un airdrop de tokens ERC20 a múltiples direcciones en una sola transacción
     * @notice El remitente debe aprobar primero que este contrato gaste sus tokens
     * @param token La dirección del contrato del token ERC20
     * @param recipients Array con las direcciones de los destinatarios
     * @param amounts Array con las cantidades a enviar a cada destinatario
     */
    function batchAirdrop(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        // Validaciones básicas
        require(token != address(0), "Invalid token address");
        require(recipients.length == amounts.length, "Arrays must have the same length");
        require(recipients.length > 0, "Must provide at least one recipient");
        require(recipients.length <= MAX_BATCH_SIZE, "Batch size exceeds limit");
        
        // Verificar que sea un contrato
        require(token.code.length > 0, "Token address is not a contract");
        
        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = 0;
        
        // Calcular la cantidad total a enviar
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Amount must be greater than zero");
            totalAmount += amounts[i];
        }
        
        // Verificar que el remitente tiene suficientes tokens y ha dado aprobación
        require(
            tokenContract.balanceOf(msg.sender) >= totalAmount,
            "Insufficient token balance"
        );
        
        require(
            tokenContract.allowance(msg.sender, address(this)) >= totalAmount,
            "Insufficient allowance"
        );
        
        // Enviar tokens a cada destinatario directamente desde la wallet del remitente
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot send to zero address");
            
            // Usar SafeERC20 para transferencias más seguras
            tokenContract.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
        }
        
        emit AirdropProcessed(token, msg.sender, recipients.length, totalAmount);
    }
    
    /**
     * @dev Pausa el contrato
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Reanuda el contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Permite al contrato recibir AVAX (por si acaso)
     */
    receive() external payable {}
    
    /**
     * @dev Permite al propietario retirar AVAX enviados al contrato
     * @param to La dirección a la que enviar los AVAX
     */
    function withdrawAVAX(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "Cannot withdraw to zero address");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No AVAX balance to withdraw");
        
        // Usar patrón CEI (Checks-Effects-Interactions)
        (bool success, ) = to.call{value: balance}("");
        require(success, "AVAX transfer failed");
    }
    
    /**
     * @dev Permite al propietario retirar tokens ERC20 en caso de emergencia
     * @param token La dirección del token a retirar
     * @param to La dirección a la que enviar los tokens
     */
    function emergencyWithdrawTokens(address token, address to) external onlyOwner nonReentrant {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        tokenContract.safeTransfer(to, balance);
        emit EmergencyWithdraw(token, to, balance);
    }
} 
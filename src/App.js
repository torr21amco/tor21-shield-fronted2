import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

// Constantes globales
//const OWNER_ADDRESS = '0x5E2B615a1C9F4942F48984dd2e48bdc85810FEFf';
const CONTRACT_ADDRESS = '0xC34aE7425444B82758FF849C7c8144A239dd1c78'; // Nuevo contrato
const TOR21_ADDRESS = '0x850F11A4DF791B0c6378a66488059E68ceC02335';
const METADATA_URI = 'https://tor21-metadata-server.onrender.com';
const EXPECTED_CHAIN_ID = '0x89'; // Polygon Mainnet

// ABI del contrato (actualizada con eventos faltantes)
const ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "operator", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "approver", "type": "address"}
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "operator", "type": "address"}
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "receiver", "type": "address"}
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"}
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidInitialization",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotInitializing",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "approved", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "operator", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "approved", "type": "bool"}
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint64", "name": "version", "type": "uint64"}
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "comprador", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "entidad", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "paquete", "type": "uint256"}
    ],
    "name": "NFTComprado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "entidad", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "paquete", "type": "uint256"}
    ],
    "name": "NFTCreadoGratis",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "NFTDesactivado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "NFTEliminado",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "expiration", "type": "uint256"}
    ],
    "name": "NFTMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "name": "NFTStatusUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "NFTTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "entidad", "type": "string"},
      {"internalType": "uint256", "name": "paquete", "type": "uint256"}
    ],
    "name": "comprarNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "entidad", "type": "string"},
      {"internalType": "uint256", "name": "paquete", "type": "uint256"}
    ],
    "name": "crearNFTGratis",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "desactivarNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "eliminarNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "entidadPorNFT",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "name": "entidadesRegistradas",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "expiracionNFT",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "expirationPeriods",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "getApproved",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_tor21Token", "type": "address"}
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "isActive",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "operator", "type": "address"}
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "metadataURI",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "entidad", "type": "string"},
      {"internalType": "uint256", "name": "expiracion", "type": "uint256"},
      {"internalType": "uint256", "name": "paquete", "type": "uint256"}
    ],
    "name": "mintNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "nftActivo",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "ownerOf",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "precios2RT",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
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
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "bytes", "name": "data", "type": "bytes"}
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "operator", "type": "address"},
      {"internalType": "bool", "name": "approved", "type": "bool"}
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "newMetadataURI", "type": "string"}
    ],
    "name": "setMetadataURI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}
    ],
    "name": "supportsInterface",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "tipoPaquete",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenCounter",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "tokenURI",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tor21Token",
    "outputs": [
      {"internalType": "contract IERC20", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "transferNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "string", "name": "entidad", "type": "string"}
    ],
    "name": "verificarEntidad",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Conectar a MetaMask
const connectMetaMask = async (setAccount, setContract, setError, loadData) => {
  try {
    if (!window.ethereum) throw new Error('MetaMask no está instalado.');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId.toString(16) !== EXPECTED_CHAIN_ID.slice(2)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: EXPECTED_CHAIN_ID }],
        });
      } catch (switchError) {
        throw new Error('Por favor, cambia manualmente a Polygon Mainnet (chainId: 137) en MetaMask.');
      }
    }
    const signer = await provider.getSigner();
    const userAddress = accounts[0];
    setAccount(userAddress);
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setContract(contractInstance);
    await loadData(contractInstance, userAddress);
  } catch (error) {
    setError(`Error conectando a MetaMask: ${error.message}`);
  }
};

// Aprobación de tokens
const approveToken = async (tokenAddress, amount, signer, setError) => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, [
      "function approve(address spender, uint256 amount) returns (bool)",
    ], signer);
    const tx = await tokenContract.approve(CONTRACT_ADDRESS, ethers.parseUnits(amount.toString(), 18));
    await tx.wait();
    return true;
  } catch (error) {
    setError(`Error aprobando token: ${error.message}`);
    return false;
  }
};

// Validar dirección Ethereum
const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

// Validar número positivo
const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState('');
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [forms, setForms] = useState({
    buy: { site: '', package: '1' }, // Paquete por defecto: 90 días
    superUser: {
      create: { site: '', package: '1' },
      transfer: { tokenId: '', to: '' },
      withdraw: { amount: '' },
      setMetadataURI: { metadataURI: METADATA_URI },
      disableNFT: { tokenId: '' },
      deleteNFT: { tokenId: '' },
    },
  });

  useEffect(() => {
    if (window.ethereum) {
      connectMetaMask(setAccount, setContract, setError, loadNFTData);
    } else {
      setError('MetaMask no está instalado. Por favor, instala MetaMask o usa el QR para conectar desde tu móvil.');
    }
  }, []);

  useEffect(() => {
    const checkSuperUser = async () => {
      if (contract && account) {
        try {
          const owner = await contract.owner();
          setIsSuperUser(account.toLowerCase() === owner.toLowerCase());
        } catch (err) {
          setError('Error verificando propietario del contrato: ' + err.message);
        }
      }
    };
    checkSuperUser();
  }, [account, contract]);

  const loadNFTData = async (contract, account) => {
    try {
      setLoading(true);
      const totalSupply = Number(await contract.tokenCounter());
      const nftsData = [];

      // Iterar sobre todos los tokenId desde 1 hasta tokenCounter
      for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() === account.toLowerCase()) {
            const [entidad, paquete, expiration, active] = await Promise.all([
              contract.entidadPorNFT(tokenId),
              contract.tipoPaquete(tokenId),
              contract.expiracionNFT(tokenId),
              contract.isActive(tokenId),
            ]);

            let metadata = {};
            try {
              const response = await fetch(`${METADATA_URI}/${tokenId}`, { mode: 'cors' });
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              metadata = await response.json();
            } catch (fetchError) {
              metadata = {
                name: `TOR21 Shield NFT #${tokenId}`,
                description: 'Llave de activación para el plugin de seguridad TOR21.',
                image: 'https://tomato-gigantic-chimpanzee-961.mypinata.cloud/ipfs/bafkreig7wzrsevdtjmuap2guajvfhwb5bpj5sfqnppwrdq5zf4xncytqza', // Imagen por defecto
                attributes: [
                  { trait_type: 'Entidad', value: entidad || 'No asignada' },
                  { trait_type: 'Paquete', value: paquete === 1 ? '90 días' : paquete === 2 ? '180 días' : '365 días' },
                  { trait_type: 'Expiración', value: new Date(Number(expiration) * 1000).toLocaleString() },
                  { trait_type: 'Estado', value: active ? 'Activo' : 'Inactivo' },
                ],
              };
            }

            const expirationDate = Number(expiration) * 1000;
            nftsData.push({
              tokenId: tokenId.toString(),
              entidad,
              paquete: paquete.toString(),
              expiration,
              active,
              imageUrl: metadata.image,
              metadata,
              isExpired: expirationDate < Date.now(),
              isExpiringSoon: expirationDate > Date.now() && expirationDate - Date.now() < 7 * 24 * 60 * 60 * 1000,
            });
          }
        } catch (tokenError) {
          // Ignorar errores si el tokenId no existe
          console.log(`Token ${tokenId} no existe o hubo un error:`, tokenError);
        }
      }
      setNfts(nftsData);
    } catch (error) {
      setError(`Error cargando NFTs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async () => {
    if (!contract) {
      setError('Contrato no conectado.');
      return;
    }
    const { site, package: pkg } = forms.buy;
    if (pkg !== '1' && pkg !== '2' && pkg !== '3') {
      setError('Paquete inválido. Selecciona un paquete válido.');
      return;
    }
    setLoading(true);
    try {
      const signer = await contract.signer;
      const price = pkg === '1' ? '100' : pkg === '2' ? '180' : '250';
      if (!(await approveToken(TOR21_ADDRESS, price, signer, setError))) return;
      const tx = await contract.comprarNFT(site || '', pkg);
      await tx.wait();
      setError('NFT comprado con éxito.');
      await loadNFTData(contract, account);
    } catch (error) {
      let errorMessage = 'Error al comprar NFT: ';
      if (error.message.includes('insufficient funds')) {
        errorMessage += 'Fondos insuficientes en tu billetera.';
      } else if (error.message.includes('allowance')) {
        errorMessage += 'No has aprobado suficientes tokens 2RT.';
      } else {
        errorMessage += error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuperUserAction = (action) => async () => {
    if (!contract) {
      setError('Contrato no conectado.');
      return;
    }
    const form = forms.superUser[action];
    setLoading(true);
    try {
      let tx;
      switch (action) {
        case 'create':
          const { site, package: pkg } = form;
          if (pkg !== '1' && pkg !== '2' && pkg !== '3') {
            throw new Error('Paquete inválido. Selecciona un paquete válido.');
          }
          tx = await contract.crearNFTGratis(site || '', pkg);
          break;
        case 'transfer':
          if (!isPositiveNumber(form.tokenId)) {
            throw new Error('Token ID debe ser un número positivo.');
          }
          if (!isValidAddress(form.to)) {
            throw new Error('Dirección destino inválida.');
          }
          tx = await contract.transferNFT(form.tokenId, form.to);
          break;
        case 'withdraw':
          if (!isPositiveNumber(form.amount)) {
            throw new Error('Cantidad debe ser un número positivo.');
          }
          tx = await contract.withdraw(ethers.parseUnits(form.amount, 18));
          break;
        case 'setMetadataURI':
          if (!form.metadataURI) {
            throw new Error('La URI de metadatos no puede estar vacía.');
          }
          tx = await contract.setMetadataURI(form.metadataURI);
          break;
        case 'disableNFT':
          if (!isPositiveNumber(form.tokenId)) {
            throw new Error('Token ID debe ser un número positivo.');
          }
          tx = await contract.desactivarNFT(form.tokenId);
          break;
        case 'deleteNFT':
          if (!isPositiveNumber(form.tokenId)) {
            throw new Error('Token ID debe ser un número positivo.');
          }
          tx = await contract.eliminarNFT(form.tokenId);
          break;
        default:
          throw new Error('Acción no válida.');
      }
      await tx.wait();
      setError(`${action.replace(/([A-Z])/g, ' $1').trim()} ejecutado con éxito.`);
      await loadNFTData(contract, account);
    } catch (error) {
      setError(`Error en ${action}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (section, field, value) => {
    setForms(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateSuperUserForm = (action, field, value) => {
    setForms(prev => ({
      ...prev,
      superUser: { ...prev.superUser, [action]: { ...prev.superUser[action], [field]: value } },
    }));
  };

  return (
    <div className="App">
      <img src="/logo.png" alt="TOR21 Shield Logo" className="logo" />
      <h1>TOR21 Shield NFT</h1>
      {loading && <div className="loading">Procesando...</div>}
      {error && <p>{error}</p>}
      {account ? (
        <div className="container">
          <p>
            Conectado como: {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </p>
          <div className="card">
            <h3>Comprar NFT</h3>
            <input
              placeholder="Dominio/Subdominio/Servidor (opcional)"
              value={forms.buy.site}
              onChange={(e) => updateForm('buy', 'site', e.target.value)}
            />
            <select
              value={forms.buy.package}
              onChange={(e) => updateForm('buy', 'package', e.target.value)}
            >
              <option value="1">90 días - 100 2RT</option>
              <option value="2">180 días - 180 2RT</option>
              <option value="3">365 días - 250 2RT</option>
            </select>
            <button onClick={handleBuyNFT} disabled={loading}>Comprar</button>
          </div>

          {nfts.length > 0 && (
            <div className="card">
              <h3>Tus NFTs</h3>
              <div className="nft-gallery">
                {nfts.map((nft) => (
                  <div key={nft.tokenId} className="nft-card">
                    <img
                      src={nft.imageUrl}
                      alt={`NFT #${nft.tokenId}`}
                      width="100"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                        setError('Error cargando imagen, usando imagen predeterminada.');
                      }}
                    />
                    <p>ID: {nft.tokenId}</p>
                    <p>Entidad: {nft.entidad || 'No asignada'}</p>
                    <p>Paquete: {nft.paquete === '1' ? '90 días' : nft.paquete === '2' ? '180 días' : '365 días'}</p>
                    <p>Expiración: {new Date(Number(nft.expiration) * 1000).toLocaleString()}</p>
                    <p>Activo: {nft.active ? 'Sí' : 'No'}</p>
                    {nft.isExpired && <p style={{ color: '#ff4444' }}>¡Expirado!</p>}
                    {!nft.isExpired && nft.isExpiringSoon && <p style={{ color: '#ff4444' }}>¡Expira pronto! (menos de 7 días)</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSuperUser && (
            <div className="card superuser">
              <h3>Opciones de Superusuario</h3>
              <div>
                <h4>Crear NFT Gratis</h4>
                <input
                  placeholder="Dominio/Subdominio/Servidor (opcional)"
                  value={forms.superUser.create.site}
                  onChange={(e) => updateSuperUserForm('create', 'site', e.target.value)}
                />
                <select
                  value={forms.superUser.create.package}
                  onChange={(e) => updateSuperUserForm('create', 'package', e.target.value)}
                >
                  <option value="1">90 días</option>
                  <option value="2">180 días</option>
                  <option value="3">365 días</option>
                </select>
                <button onClick={handleSuperUserAction('create')} disabled={loading}>Crear</button>
              </div>
              <div>
                <h4>Transferir NFT</h4>
                <input
                  placeholder="Token ID *"
                  value={forms.superUser.transfer.tokenId}
                  onChange={(e) => updateSuperUserForm('transfer', 'tokenId', e.target.value)}
                />
                <input
                  placeholder="Dirección destino *"
                  value={forms.superUser.transfer.to}
                  onChange={(e) => updateSuperUserForm('transfer', 'to', e.target.value)}
                />
                <button onClick={handleSuperUserAction('transfer')} disabled={loading}>Transferir</button>
              </div>
              <div>
                <h4>Retirar Fondos</h4>
                <input
                  placeholder="Cantidad en 2RT *"
                  value={forms.superUser.withdraw.amount}
                  onChange={(e) => updateSuperUserForm('withdraw', 'amount', e.target.value)}
                />
                <button onClick={handleSuperUserAction('withdraw')} disabled={loading}>Retirar</button>
              </div>
              <div>
                <h4>Establecer Metadata URI</h4>
                <input
                  placeholder="URI *"
                  value={forms.superUser.setMetadataURI.metadataURI}
                  onChange={(e) => updateSuperUserForm('setMetadataURI', 'metadataURI', e.target.value)}
                />
                <button onClick={handleSuperUserAction('setMetadataURI')} disabled={loading}>Establecer</button>
              </div>
              <div>
                <h4>Desactivar NFT</h4>
                <input
                  placeholder="Token ID *"
                  value={forms.superUser.disableNFT.tokenId}
                  onChange={(e) => updateSuperUserForm('disableNFT', 'tokenId', e.target.value)}
                />
                <button onClick={handleSuperUserAction('disableNFT')} disabled={loading}>Desactivar</button>
              </div>
              <div>
                <h4>Eliminar NFT</h4>
                <input
                  placeholder="Token ID *"
                  value={forms.superUser.deleteNFT.tokenId}
                  onChange={(e) => updateSuperUserForm('deleteNFT', 'tokenId', e.target.value)}
                />
                <button onClick={handleSuperUserAction('deleteNFT')} disabled={loading}>Eliminar</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="connect-section">
          <p>Escanea el QR para conectar desde tu móvil o instala MetaMask:</p>
          <button onClick={() => connectMetaMask(setAccount, setContract, setError, loadNFTData)}>
            Conectar MetaMask
          </button>
          <QRCodeCanvas value="https://metamask.app.link/dapp/tor21shieldnft.netlify.app" size={128} />
        </div>
      )}
    </div>
  );
}

export default App;
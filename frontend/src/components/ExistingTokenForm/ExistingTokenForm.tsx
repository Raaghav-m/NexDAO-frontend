// @ts-nocheck comment
import { useState, useRef, useContext, useEffect } from "react";
import { ethers } from "ethers";
import userSideabi from "../../utils/abis/usersideabi.json";
import usersideabi from "../../utils/abis/usersideabi.json";
import {
  Progress,
  Box,
  Radio,
  RadioGroup,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  FormHelperText,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  Spinner,
  chakra,
  VisuallyHidden,
  Text,
  Stack,
  useToast,
  ring,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import userside2abi from "../../utils/abis/userside2abi.json";

const Form1 = ({ getName, getSummary }) => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const handleName = (e) => {
    getName(e);
  };

  const handleSummary = (e) => {
    getSummary(e);
  };

  return (
    <>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        DAO Registration
      </Heading>

      <FormControl mr="2%">
        <FormLabel htmlFor="name" fontWeight={"normal"}>
          DAO Name
        </FormLabel>
        <Input
          id="name"
          placeholder="Name"
          autoComplete="name"
          onChange={(e) => handleName(e.target.value)}
        />
      </FormControl>

      <FormControl mt="2%">
        <FormLabel htmlFor="email" fontWeight={"normal"}>
          Summary
        </FormLabel>
        <Textarea
          id="email"
          type="email"
          placeholder="Write a brief description about your community mission"
          autoComplete="email"
          onChange={(e) => handleSummary(e.target.value)}
        />
      </FormControl>
    </>
  );
};

const Form2 = ({ getJoiningThreshold, getProposal, getVisibility }) => {
  const toast = useToast();
  const inputRef = useRef(null);

  const handleTokens = (e) => {
    getJoiningThreshold(e);
  };

  const handleProposal = (e) => {
    getProposal(e);
  };

  const handleVisibility = (e) => {
    getVisibility(e);
  };

  return (
    <>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        Governance Details
      </Heading>
      <SimpleGrid columns={1} spacing={6}>
        <FormControl mr="5%" mt="2%">
          <FormLabel htmlFor="yoe" fontWeight={"normal"}>
            Joining Threshold
          </FormLabel>
          <NumberInput
            step={1}
            min={1}
            onChange={(value) => handleTokens(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            Enter minimum number of tokens required to join DAO
          </FormHelperText>
        </FormControl>
        <FormControl mr="5%" mt="2%">
          <FormLabel htmlFor="yoe" fontWeight={"normal"}>
            Proposal Threshold
          </FormLabel>
          <NumberInput
            step={1}
            min={1}
            onChange={(value) => handleProposal(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            Enter minimum number of tokens required to create a proposal
          </FormHelperText>
        </FormControl>
      </SimpleGrid>
    </>
  );
};

const Form3 = ({ getTokenAddress }) => {
  const toast = useToast();
  const inputRef = useRef(null);
  const [tokenDetails, setTokenDetails] = useState({ symbol: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState(0);
  const account = useAccount();

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
      }
    };

    updateChainId();
  }, [account]);

  const handleAddress = async (e) => {
    const address = e.target.value;

    if (address.trim()) {
      setLoading(true);

      try {
        // Call a function to fetch token details based on the address
        const { symbol, name } = await fetchTokenDetails(address);

        // Update state with the fetched data
        setTokenDetails({ symbol, name });
      } catch (error) {
        console.error("Error fetching token details:", error);
        toast({
          title: "Error",
          description: "Unable to fetch token details",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Error",
        description: "Token Address Not Entered correctly",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    getTokenAddress(address);
  };

  const fetchTokenDetails = async (address) => {
    try {
      console.log("fetching token details for address:", address);
      let provider;
      // flow === 545
      //polygonZkEvmCardona === 2442
      // skaleCalypsoTestnet === 974399131
      //sepolia === 11155111
      if (chainId === 545) {
        provider = new ethers.providers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL_FLOW
        );
      } else if (chainId === 2442) {
        provider = new ethers.providers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL_CARDONA
        );
      } else if (chainId === 974399131) {
        provider = new ethers.providers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL_SKALE
        );
      } else if (chainId === 11155111) {
        provider = new ethers.providers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA
        );
      }
      // Use your Ethereum provider
      const contract = new ethers.Contract(
        address,
        [
          "function symbol() view returns (string)",
          "function name() view returns (string)",
        ],
        provider
      );

      // Call the ERC-20 token contract to get the symbol and name
      const symbol = await contract.symbol();
      const name = await contract.name();

      return { symbol, name };
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Heading w="100%" textAlign="center" fontWeight="normal">
        Token Details
      </Heading>
      <SimpleGrid columns={1} spacing={6}>
        <FormControl mr="2%">
          <FormLabel htmlFor="tokenAddress" fontWeight="normal">
            Token Address
          </FormLabel>

          <Input
            id="tokenAddress"
            placeholder="Enter Token Address"
            autoComplete="off"
            onChange={(e) => handleAddress(e)}
          />
        </FormControl>
        <FormControl mr="2%">
          <FormLabel htmlFor="tokenSymbol" fontWeight="normal">
            Token Symbol
          </FormLabel>
          <InputGroup>
            <Input
              id="tokenSymbol"
              placeholder="Token Symbol"
              autoComplete="off"
              value={loading ? "Loading..." : tokenDetails.symbol}
              readOnly
            />
            {loading && (
              <InputRightElement>
                <Spinner size="sm" />
              </InputRightElement>
            )}
          </InputGroup>
        </FormControl>
        <FormControl mr="2%">
          <FormLabel htmlFor="tokenName" fontWeight="normal">
            Token Name
          </FormLabel>
          <InputGroup>
            <Input
              id="tokenName"
              placeholder="Token Name"
              autoComplete="off"
              value={loading ? "Loading..." : tokenDetails.name}
              readOnly
            />
            {loading && (
              <InputRightElement>
                <Spinner size="sm" />
              </InputRightElement>
            )}
          </InputGroup>
        </FormControl>
      </SimpleGrid>
    </>
  );
};

export default function ExistingTokenForm() {
  const toast = useToast();
  const [progress, setProgress] = useState(33.33);
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [threshholdToken, setthreshholdToken] = useState();
  const [proposalToken, setProposalToken] = useState();
  const [desc, setdesc] = useState("");
  const [tokenAddress, settokenAddress] = useState("");
  const [daovisibility, setdaoVisibility] = useState(true);
  const [chainId, setChainId] = useState(0);
  const account = useAccount();

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
      }
    };

    updateChainId();
  }, [account]);

  const createDAO = async () => {
    // repeat similar logic as mintToken

    if (account.isConnected) {
      console.log("account connected");
      console.log(`chainId is: ${chainId}`);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideContract;
      // flow === 545
      //polygonZkEvmCardona === 2442
      // skaleCalypsoTestnet === 974399131
      //sepolia === 11155111

      if (chainId === 545) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 2442) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 974399131) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 11155111) {
        // DAOMANAGER ==> Sarvesh's New Contract
        // AND userside2abi ==> Sarvesh's New abi
        // only applicable for sepolia testnet
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DAOMANAGER_SEPOLIA_ADDRESS,
          userside2abi,
          signer
        );
      }
      const accounts = await provider.listAccounts();
      let tx;
      if (chainId === 11155111) {
        tx = await userSideContract.createDao(
          name,
          desc,
          threshholdToken,
          proposalToken,
          tokenAddress,
          daovisibility,
          accounts[0],
          "123",
          {
            gasLimit: 1000000,
          }
        );
        await tx.wait(1);
      } else {
        tx = await userSideContract.createDao(
          name,
          desc,
          threshholdToken,
          proposalToken,
          tokenAddress,
          daovisibility,
          accounts[0],
          {
            gasLimit: 1000000,
          }
        );
      }

      console.log(tx);

      await tx.wait(1);

      toast({
        title: "DAO Created",
        description: `DAO created successfully. You can view it on explore page`,
        status: "success",
        duration: 10000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to mint tokens",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
  };

  const deployCrossChain = async () => {
    if (account.isConnected) {
      console.log("account connected");
      console.log(`chainId is: ${chainId}`);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let managerContractInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
        userside2abi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await managerContractInstance.bridgeDaoMessage(1, true);
      await tx.wait(1);
      toast({
        title: "Cross-chain Deployed",
        description: `Hold Tight! We are verifying merkle proof.`,
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      // flow === 545
      //polygonZkEvmCardona === 2442
      // skaleCalypsoTestnet === 974399131
      //sepolia === 11155111
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to mint tokens",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      borderWidth="1px"
      rounded="lg"
      shadow="1px 1px 3px rgba(0,0,0,0.3)"
      width="60%"
      p={6}
      m="10px auto"
      as="form"
    >
      <Progress
        hasStripe
        value={progress}
        mb="5%"
        mx="5%"
        isAnimated
      ></Progress>
      {step === 1 ? (
        <Form1 getName={(q) => setName(q)} getSummary={(q) => setdesc(q)} />
      ) : step === 2 ? (
        <Form2
          getJoiningThreshold={(q) => setthreshholdToken(q)}
          getProposal={(q) => setProposalToken(q)}
          getVisibility={(q) => setdaoVisibility(q)}
        />
      ) : (
        <Form3 getTokenAddress={(q) => settokenAddress(q)} />
      )}
      <ButtonGroup mt="5%" w="100%">
        <Flex w="100%" justifyContent="space-between">
          <Flex>
            <Button
              onClick={() => {
                setStep(step - 1);
                setProgress(progress - 33.33);
              }}
              isDisabled={step === 1}
              colorScheme="teal"
              variant="solid"
              w="7rem"
              mr="5%"
            >
              Back
            </Button>
            <Button
              w="7rem"
              isDisabled={step === 3}
              onClick={() => {
                setStep(step + 1);
                if (step === 3) {
                  setProgress(100);
                } else {
                  setProgress(progress + 33.33);
                }
              }}
              colorScheme="teal"
              variant="outline"
            >
              Next
            </Button>
          </Flex>
          {step === 3 ? (
            <>
              <Button
                w="7rem"
                colorScheme="red"
                variant="solid"
                onClick={() => {
                  createDAO();
                }}
              >
                Submit
              </Button>
              {chainId === 11155111 ? (
                <Button
                  onClick={() => {
                    deployCrossChain();
                  }}
                >
                  Deploy Cross-chain
                </Button>
              ) : null}
            </>
          ) : null}
        </Flex>
      </ButtonGroup>
    </Box>
  );
}

// @ts-nocheck comment
import { useState, useRef, useContext } from "react";
import { useEffect } from "react";
import { ethers } from "ethers";
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
import userSideabi from "../../utils/abis/usersideabi.json";
import userSide2abi from "../../utils/abis/userside2abi.json";
import creategovernanceabi from "../../utils/abis/creategovernancetokenabi.json";
import { useAccount } from "wagmi";

const Form2 = ({ getName, getSummary }) => {
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

const Form3 = ({ getJoiningThreshold, getProposal, getVisibility }) => {
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
          <FormLabel fontWeight={"normal"}>Proposal Threshold</FormLabel>
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

const Form1 = ({ getTokenSymbol, getTokenName, getTokenSupply }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSupply = (e) => {
    getTokenSupply(e);
  };

  const handleSymbol = (e) => {
    getTokenSymbol(e);
  };

  const handleTokenName = (e) => {
    getTokenName(e);
  };

  return (
    <>
      <Heading w="100%" textAlign="center" fontWeight="normal">
        Token Details
      </Heading>
      <SimpleGrid columns={1} spacing={6}>
        <FormControl mr="2%">
          <FormLabel htmlFor="tokenSymbol" fontWeight="normal">
            Token Symbol
          </FormLabel>

          <Input
            id="tokenSymbol"
            placeholder="Token Symbol"
            autoComplete="off"
            onChange={(e) => handleSymbol(e.target.value)}
          />
        </FormControl>
        <FormControl mr="2%">
          <FormLabel htmlFor="tokenName" fontWeight="normal">
            Token Name
          </FormLabel>

          <Input
            id="tokenName"
            placeholder="Token Name"
            autoComplete="off"
            onChange={(e) => handleTokenName(e.target.value)}
          />
        </FormControl>
        <FormControl mr="2%">
          <FormLabel htmlFor="tokenSymbol" fontWeight="normal">
            Token Supply
          </FormLabel>

          <Input
            id="tokenSymbol"
            placeholder="Token Supply"
            autoComplete="off"
            onChange={(e) => handleSupply(e.target.value)}
          />
        </FormControl>
      </SimpleGrid>
    </>
  );
};

export default function NewTokenForm() {
  const [progress, setProgress] = useState(33.33);
  const [step, setStep] = useState(1);
  const [mintDone, setMintDone] = useState(false);
  const [threshholdToken, setthreshholdToken] = useState();
  const [proposalToken, setProposalToken] = useState();
  const [desc, setdesc] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [tokenName, settokenName] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [tokenAddress, settokenAddress] = useState("");
  const [daovisibility, setdaoVisibility] = useState(false);
  const [chainId, setChainId] = useState();
  const toast = useToast();
  const account = useAccount();

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
      }
    };

    updateChainId();
  }, [account]);

  const mintToken = async () => {
    if (account.isConnected) {
      console.log("account connected");
      console.log(`chainId is: ${chainId}`);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideContract, createTokenContract;
      // flow === 545
      //polygonZkEvmCardona === 2442
      // skaleCalypsoTestnet === 974399131
      //sepolia === 11155111
      //amoy === 80002
      if (chainId === 545) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
          userSideabi,
          signer
        );
        createTokenContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CREATEGOVERNANCE_FLOW_ADDRESS,
          creategovernanceabi,
          signer
        );
      } else if (chainId === 2442) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
          userSideabi,
          signer
        );
        createTokenContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CREATEGOVERNANCE_CARDONA_ADDRESS,
          creategovernanceabi,
          signer
        );
      } else if (chainId === 974399131) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
          usersideabi,
          signer
        );
        createTokenContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CREATEGOVERNANCE_SKALE_ADDRESS,
          creategovernanceabi,
          signer
        );
      } else if (chainId === 11155111) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
          userSideabi,
          signer
        );
        createTokenContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CREATEGOVERNANCE_SEPOLIA_ADDRESS,
          creategovernanceabi,
          signer
        );
      } else if (chainId === 80002) {
        // Polygon Amoy Network
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_AMOY_ADDRESS,
          userSideabi,
          signer
        );
        createTokenContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CREATEGOVERNANCE_AMOY_ADDRESS,
          creategovernanceabi,
          signer
        );
        toast({
          title: "Using Polygon Amoy Network",
          description: "Your token will be minted on Polygon Amoy testnet.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Unsupported Network",
          description:
            "Please switch to a supported network (Sepolia, Amoy, Flow, Cardona, or Skale).",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        const accounts = await provider.listAccounts();
        const userId = await userSideContract.userWallettoUserId(accounts[0]);
        console.log(userId);

        console.log(tokenName);
        console.log(symbol);
        console.log(tokenSupply);

        const tx = await createTokenContract.deployToken(
          tokenName,
          symbol,
          tokenSupply,
          userId
        );
        await tx.wait();
        console.log(tx);
        const totalTokens = await createTokenContract.getTotalTokesnDeployed(
          userId
        );
        const mintedTokenAddress =
          await createTokenContract.userIdtoDeployedTokens(
            userId,
            totalTokens - 1
          );

        settokenAddress(mintedTokenAddress);
        toast({
          title: "Tokens Minted",
          description: `Token Address: ${mintedTokenAddress}`,
          status: "success",
          duration: 10000,
          isClosable: true,
        });
        setMintDone(true);
      } catch (error) {
        console.error("Token minting error:", error);
        toast({
          title: "Token Minting Failed",
          description:
            error.message || "There was an error minting your token.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to mint tokens",
        status: "error",
        duration: 10000,
        isClosable: true,
      });
      return;
    }
  };

  const createDAO = async () => {
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
      //amoy === 80002

      if (chainId === 545) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
          userSideabi,
          signer
        );
      } else if (chainId === 2442) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
          userSideabi,
          signer
        );
      } else if (chainId === 974399131) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
          userSideabi,
          signer
        );
      } else if (chainId === 11155111) {
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
          userSideabi,
          signer
        );
      } else if (chainId === 80002) {
        // Polygon Amoy Network
        userSideContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_AMOY_ADDRESS,
          userSideabi,
          signer
        );
        toast({
          title: "Using Polygon Amoy Network",
          description: "Your DAO will be created on Polygon Amoy testnet.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Unsupported Network",
          description:
            "Please switch to a supported network (Sepolia, Amoy, Flow, Cardona, or Skale).",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        const accounts = await provider.listAccounts();
        let tx = await userSideContract.createDao(
          name,
          desc,
          threshholdToken,
          proposalToken,
          tokenAddress,
          daovisibility,
          accounts[0]
        );

        console.log(tx);
        await tx.wait(1);

        toast({
          title: "DAO Created",
          description: `DAO created successfully. You can view it on explore page`,
          status: "success",
          duration: 10000,
          isClosable: true,
        });
      } catch (error) {
        console.error("DAO creation error:", error);
        toast({
          title: "DAO Creation Failed",
          description: error.message || "There was an error creating your DAO.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
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
        <Form1
          getTokenSymbol={(q) => setSymbol(q)}
          getTokenName={(q) => settokenName(q)}
          getTokenSupply={(q) => setTokenSupply(q)}
        />
      ) : step === 2 ? (
        <Form2 getName={(q) => setName(q)} getSummary={(q) => setdesc(q)} />
      ) : (
        <Form3
          getJoiningThreshold={(q) => setthreshholdToken(q)}
          getProposal={(q) => setProposalToken(q)}
          getVisibility={(q) => setdaoVisibility(q)}
        />
      )}
      <ButtonGroup mt="5%" w="100%">
        <Flex w="100%" justifyContent="space-between">
          <Flex>
            {step === 1 ? (
              <Button
                onClick={() => {
                  mintToken();
                }}
                colorScheme="teal"
                variant="solid"
                w="7rem"
                mr="5%"
              >
                Mint
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setStep(step - 1);
                  setProgress(progress - 33.33);
                }}
                colorScheme="teal"
                variant="solid"
                w="7rem"
                mr="5%"
              >
                Back
              </Button>
            )}
            <Button
              w="7rem"
              isDisabled={step === 3 || (step === 1 && !mintDone)}
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
          ) : null}
        </Flex>
      </ButtonGroup>
    </Box>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck comment
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Container,
  Text,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUser, FaEnvelope, FaFileImage } from "react-icons/fa";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import usersideabi from "../../utils/abis/usersideabi.json";
import { useAccount } from "wagmi";
import { s } from "framer-motion/client";

const RegisterForm = () => {
  const toast = useToast();
  const inputRef = useRef(null);
  const account = useAccount();
  const [chainId, setChainId] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
        if (account.chainId === 974399131) {
          await handlesFuelDistribution();
        }
      }
    };

    updateChainId();
  }, [account]);

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const uploadFile = async (file) => {
    const output = await lighthouse.upload(
      file,
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
      false,
      null,
      progressCallback
    );
    console.log("File Status:", output);

    setIpfsUrl(output.data.Hash);

    toast({
      title: "Image Uploaded to IPFS",
      description: "Your profile image has been successfully uploaded.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });

    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };

  const handlesFuelDistribution = async () => {
    if (account.isConnected) {
      if (account.chainId === 974399131) {
        const response = await fetch(
          `http://localhost:8888/balance/${account.address}`
        );
        const data = await response.json();
        console.log(data.balance);
        if (data.balance < 100000) {
          console.log("not enough fuel");
          const response = await fetch(
            `http://localhost:8888/claim/${account.address}`
          );
          const data = await response.json();
          console.log(data);
        }
      }
    } else {
      toast({
        title: "No Account Connected",
        description: "Please connect your wallet.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (account.isConnected) {
      console.log("account connected");
      console.log(`chainId is: ${chainId}`);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract;

      if (chainId === 545) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 2442) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 974399131) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
          usersideabi,
          signer
        );
        await handlesFuelDistribution();
      } else if (chainId === 11155111) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
          usersideabi,
          signer
        );
      }

      const accounts = await provider.listAccounts();
      const tx = await contract.createUser(
        name,
        email,
        bio,
        ipfsUrl,
        accounts[0]
      );
      await tx.wait();

      toast({
        title: "Registration Successful",
        description: "Welcome to our DAO platform!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      console.log("no account connected");
      toast({
        title: "No Account Connected",
        description: "Please connect your wallet to register.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setSubmitting(false);
  };

  return (
    <Container maxW="container.md" py={10}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="lg"
        p={8}
        color={textColor}
      >
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Heading as="h1" size="xl" textAlign="center">
            Join Our DAO Community
          </Heading>
          <Text textAlign="center" fontSize="lg">
            Register now to participate in governance and decision-making!
          </Text>

          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaUser} color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Enter your username"
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaEnvelope} color="gray.300" />
              </InputLeftElement>
              <Input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Bio</FormLabel>
            <Textarea
              placeholder="Tell us about yourself"
              rows={4}
              onChange={(e) => setBio(e.target.value)}
            />
          </FormControl>

          <Button
            isLoading={submitting}
            colorScheme="blue"
            size="lg"
            width="full"
            type="submit"
            onClick={handleSubmit}
          >
            Register
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default RegisterForm;

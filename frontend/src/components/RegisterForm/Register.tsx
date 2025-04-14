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
  const [networkName, setNetworkName] = useState("");

  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);

        // Update network name based on chainId
        switch (account.chainId) {
          case 545:
            setNetworkName("Flow Testnet");
            break;
          case 2442:
            setNetworkName("Polygon ZkEVM Cardona");
            break;
          case 974399131:
            setNetworkName("SKALE Calypso Testnet");
            break;
          case 11155111:
            setNetworkName("Ethereum Sepolia");
            break;
          case 80002:
            setNetworkName("Polygon Amoy");
            break;
          default:
            setNetworkName("Unknown Network");
        }

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
    try {
      // Check if file exists and is valid
      if (!file || file.length === 0) {
        toast({
          title: "No File Selected",
          description: "Please select an image file to upload.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        return;
      }

      // Use the first file from the FileList
      const singleFile = file[0] || file;

      // Create a proper formData for lighthouse
      const fileData = new FormData();
      fileData.append("file", singleFile);

      // Show uploading toast
      toast({
        title: "Uploading Image",
        description: "Your profile image is being uploaded to IPFS...",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      // Upload to lighthouse
      const output = await lighthouse.upload(
        fileData,
        process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
        false,
        null,
        progressCallback
      );

      console.log("File Upload Status:", output);

      if (output && output.data && output.data.Hash) {
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
      } else {
        throw new Error("Failed to upload image to IPFS");
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error.message || "There was an error uploading your image.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
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

  // Update the handleSubmit function to better handle RPC errors
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!name || !email || !bio) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setSubmitting(true);

    if (account.isConnected) {
      console.log("account connected");
      console.log(`chainId is: ${chainId}`);

      try {
        // First check if provider is available
        if (!window.ethereum) {
          throw new Error("MetaMask not detected. Please install MetaMask.");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Explicitly request accounts to ensure connection
        await provider.send("eth_requestAccounts", []);

        const signer = provider.getSigner();
        const accounts = await provider.listAccounts();

        if (!accounts || accounts.length === 0) {
          throw new Error(
            "No accounts found. Please check your MetaMask connection."
          );
        }

        let contract;

        // Chain selection
        switch (chainId) {
          case 545:
            contract = new ethers.Contract(
              process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
              usersideabi,
              signer
            );
            break;
          case 2442:
            contract = new ethers.Contract(
              process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
              usersideabi,
              signer
            );
            break;
          case 974399131:
            contract = new ethers.Contract(
              process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
              usersideabi,
              signer
            );
            // Ensure we have enough fuel on SKALE
            await handlesFuelDistribution();
            break;
          case 11155111:
            contract = new ethers.Contract(
              process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
              usersideabi,
              signer
            );
            break;
          case 80002:
            // Polygon Amoy Network
            contract = new ethers.Contract(
              process.env.NEXT_PUBLIC_USERSIDE_AMOY_ADDRESS,
              usersideabi,
              signer
            );
            break;
          default:
            throw new Error(
              "Unsupported network. Please switch to a supported network (Sepolia, Amoy, Flow, Cardona, or Skale)."
            );
        }

        // Display network-specific toast
        toast({
          title: `Using ${networkName}`,
          description: `Your registration will be processed on ${networkName}.`,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        // Default to empty string if ipfsUrl is not set (no image)
        const finalIpfsUrl = ipfsUrl || "";

        // Prepare transaction with more detailed gas settings
        const gasPrice = await provider.getGasPrice();
        const adjustedGasPrice = gasPrice.mul(120).div(100); // 20% more than current

        const tx = await contract.createUser(
          name,
          email,
          bio,
          finalIpfsUrl,
          accounts[0],
          {
            gasLimit: 1000000, // Higher gas limit to ensure transaction goes through
            gasPrice: adjustedGasPrice,
          }
        );

        // Show pending toast
        toast({
          title: "Transaction Pending",
          description: `Transaction hash: ${tx.hash.substring(0, 10)}...`,
          status: "info",
          duration: 10000,
          isClosable: true,
          position: "top-right",
        });

        // Wait for confirmation with a timeout
        const receipt = await Promise.race([
          tx.wait(1),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Transaction confirmation timeout")),
              60000
            )
          ),
        ]);

        toast({
          title: "Registration Successful",
          description: `Welcome to our DAO platform on ${networkName}!`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });

        // Reset form
        setName("");
        setEmail("");
        setBio("");
        setIpfsUrl("");
        setProfileImage("");

        // Reset file input
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } catch (error) {
        console.error("Registration error:", error);

        // Handle specific error cases with better user feedback
        if (error.message.includes("user already exists")) {
          toast({
            title: "User Already Registered",
            description:
              "This wallet address is already registered on this network.",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        } else if (error.message.includes("Internal JSON-RPC error")) {
          // Extract the specific error message from the RPC error if possible
          let detailedMessage = "There was an RPC error with MetaMask.";

          try {
            // Try to extract the detailed error message
            const jsonStart = error.message.indexOf("{");
            if (jsonStart > -1) {
              const errorJson = JSON.parse(error.message.slice(jsonStart));
              if (errorJson.message) {
                detailedMessage = errorJson.message;
              }
            }
          } catch (parseError) {
            console.error("Error parsing RPC error:", parseError);
          }

          toast({
            title: "Transaction Failed",
            description: `MetaMask RPC Error: ${detailedMessage}. Try refreshing the page or reconnecting your wallet.`,
            status: "error",
            duration: 8000,
            isClosable: true,
            position: "top-right",
          });
        } else if (error.message.includes("insufficient funds")) {
          toast({
            title: "Insufficient Funds",
            description: `You don't have enough funds on ${networkName} to complete this transaction.`,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        } else if (error.message.includes("user rejected transaction")) {
          toast({
            title: "Transaction Rejected",
            description: "You rejected the transaction in your wallet.",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        } else if (error.message.includes("timeout")) {
          toast({
            title: "Transaction Timeout",
            description:
              "The transaction is taking longer than expected. Check your wallet for status.",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        } else {
          toast({
            title: "Registration Failed",
            description:
              error.message ||
              "There was an error processing your registration.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }
      }
    } else {
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

          {/* Network Display */}
          {account.isConnected && (
            <Box
              p={2}
              bg={
                chainId === 80002
                  ? "purple.100"
                  : chainId === 11155111
                  ? "blue.100"
                  : "gray.100"
              }
              color={
                chainId === 80002
                  ? "purple.800"
                  : chainId === 11155111
                  ? "blue.800"
                  : "gray.800"
              }
              borderRadius="md"
              width="100%"
              textAlign="center"
            >
              <Text fontWeight="medium">Network: {networkName}</Text>
            </Box>
          )}

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

          <FormControl>
            <FormLabel>Profile Image</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaFileImage} color="gray.300" />
              </InputLeftElement>
              <Input
                type="file"
                ref={inputRef}
                onChange={(e) => setProfileImage(e.target.files)}
                accept="image/*"
                p={1}
              />
            </InputGroup>
            <Button
              mt={2}
              size="sm"
              colorScheme="teal"
              onClick={() => profileImage && uploadFile(profileImage)}
              isDisabled={!profileImage}
            >
              Upload Image
            </Button>
            {ipfsUrl && (
              <Text mt={2} fontSize="sm" color="green.500">
                Image uploaded successfully! IPFS hash:{" "}
                {ipfsUrl.substring(0, 10)}...
              </Text>
            )}
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

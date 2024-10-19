// @ts-nocheck comment
import React, { useState, useRef, use, useEffect } from "react";
import {
  Progress,
  Box,
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
  chakra,
  VisuallyHidden,
  Text,
  Stack,
  ring,
} from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import usersideabi from "../../utils/abis/usersideabi.json";
import { useAccount } from "wagmi";

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

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
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
      title: "Image Uploaded to the IPFS.",
      description: "Congratulations 🎉 ",
      status: "success",
      duration: 1000,
      isClosable: true,
      position: "top-right",
    });

    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };

  const handleSubmit = async (e) => {
    if (account.isConnected) {
      console.log("account connected");
      console.log(`chainId is: ${chainId}`);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract;
      // flow === 545
      //polygonZkEvmCardona === 2442
      // skaleCalypsoTestnet === 974399131
      //sepolia === 11155111
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
        title: "User Registered.",
        description: "Congratulations 🎉 ",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else {
      onsole.log("no account connected");
      toast({
        title: "No Account Connected",
        description: "Please connect your wallet.",
        status: "error",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const getUser = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
        usersideabi,
        signer
      );
      const tempUser = await userSideInstance.userIdtoUser(2);
      console.log(tempUser);
    } else {
      console.log("No Metamask Found");
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form"
      >
        <SimpleGrid columns={1} spacing={6}>
          <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
            Join Now!🎯
          </Heading>
          <FormControl mr="2%">
            <FormLabel htmlFor="name" fontWeight={"normal"}>
              User Name
            </FormLabel>
            <Input
              id="name"
              placeholder="Name"
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email" fontWeight={"normal"}>
              Email Address
            </FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="abc@gmail.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="bio">
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Bio
            </FormLabel>
            <Textarea
              placeholder="Write a short bio for yourself"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: "sm",
              }}
              onChange={(e) => setBio(e.target.value)}
            />
            <FormHelperText>Short Bio. URLs are hyperlinked.</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel
              fontWeight={"normal"}
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Profile Image
            </FormLabel>

            <Input onChange={(e) => uploadFile(e.target.files)} type="file" />
          </FormControl>
        </SimpleGrid>
        <Button
          display="block"
          mx="auto"
          mt={6}
          w="10rem"
          colorScheme="purple"
          variant="solid"
          onClick={handleSubmit}
        >
          Register
        </Button>
      </Box>
    </>
  );
};

export default RegisterForm;

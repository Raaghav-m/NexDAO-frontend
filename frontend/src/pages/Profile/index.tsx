// @ts-nocheck comment
import React, { useState, useEffect, use } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import usersideabi from "../../utils/abis/usersideabi.json";
import userside2abi from "../../utils/abis/userside2abi.json";
import governancetokenabi from "../../utils/abis/governancetokenabi.json";
import { Center } from "@chakra-ui/react";
import {
  Box,
  Avatar,
  Heading,
  Icon,
  Text,
  Button,
  Stack,
  Badge,
  Image,
  SimpleGrid,
  Link,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { on } from "events";

const Profile = () => {
  const account = useAccount();
  const [userDaos, setUserDaos] = useState([]);
  const [userInfo, setuserInfo] = useState([]);
  const [chainId, setChainId] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
      }
    };

    updateChainId().then(() => {
      onLoad();
    });
  }, [account]);

  const onLoad = async () => {
    // if (window.ethereum._state.accounts.length !== 0) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const signer = provider.getSigner();
    //   const userSideInstance = new ethers.Contract(
    //     process.env.NEXT_PUBLIC_USERSIDE_ADDRESS,
    //     usersideabi,
    //     signer
    //   );
    //   console.log(userSideInstance);
    //   const tempUserId = await userSideInstance.userWallettoUserId(
    //     account.address
    //   );
    //   console.log(tempUserId);
    //   const tempUserInfo = await userSideInstance.userIdtoUser(tempUserId);
    //   setuserInfo(tempUserInfo);
    //   const tempUserDaos = await userSideInstance.getAllUserDaos(tempUserId);
    //   console.log(tempUserDaos);
    //   let tempDaoInfo,
    //     tempAdminId,
    //     tempAdminInfo,
    //     tempDaoCreatorInfo,
    //     tempDaoTokenInfo,
    //     govtTokenName,
    //     govtTokenSymbol;
    //   for (let i = 0; i < tempUserDaos.length; i++) {
    //     tempDaoInfo = await userSideInstance.daoIdtoDao(tempUserDaos[i]);
    //     console.log(tempDaoInfo);
    //     tempAdminId = tempDaoInfo.creator;
    //     tempAdminInfo = await userSideInstance.userIdtoUser(tempAdminId);
    //     console.log(tempAdminInfo);
    //     // //token Info
    //     const governanceTokenInstance = new ethers.Contract(
    //       tempDaoInfo.governanceTokenAddress,
    //       governancetokenabi,
    //       signer
    //     );
    //     console.log(governanceTokenInstance);
    //     govtTokenName = await governanceTokenInstance.name();
    //     govtTokenSymbol = await governanceTokenInstance.symbol();
    //     console.log(govtTokenName);
    //     console.log(govtTokenSymbol);
    //     setUserDaos((daos) => [
    //       ...daos,
    //       {
    //         daoInfo: tempDaoInfo,
    //         creatorInfo: tempAdminInfo,
    //         tokenName: govtTokenName,
    //         tokenSymbol: govtTokenSymbol,
    //       },
    //     ]);
    //   }
    // }
    if (account.isConnected) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideInstance;

      switch (account.chainId) {
        case 545:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
            usersideabi,
            signer
          );
          break;
        case 2442:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
            usersideabi,
            signer
          );
          break;
        case 974399131:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
            usersideabi,
            signer
          );
          break;
        case 11155111:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
            userside2abi,
            signer
          );
          break;
      }
      console.log(`chainId is: ${chainId}`);
      try {
        const tempUserId = await userSideInstance.userWallettoUserId(
          account.address
        );
        console.log(tempUserId);
        const tempUserInfo = await userSideInstance.userIdtoUser(tempUserId);
        setuserInfo(tempUserInfo);
        const tempUserDaos = await userSideInstance.getAllUserDaos(tempUserId);
        console.log(tempUserDaos);
        let tempDaoInfo,
          tempAdminId,
          tempAdminInfo,
          tempDaoCreatorInfo,
          tempDaoTokenInfo,
          govtTokenName,
          govtTokenSymbol;
        for (let i = 0; i < tempUserDaos.length; i++) {
          tempDaoInfo = await userSideInstance.daoIdtoDao(tempUserDaos[i]);
          console.log(tempDaoInfo);
          tempAdminId = tempDaoInfo.creator;
          tempAdminInfo = await userSideInstance.userIdtoUser(tempAdminId);
          console.log(tempAdminInfo);
          // //token Info
          const governanceTokenInstance = new ethers.Contract(
            tempDaoInfo.governanceTokenAddress,
            governancetokenabi,
            signer
          );
          console.log(governanceTokenInstance);
          govtTokenName = await governanceTokenInstance.name();
          govtTokenSymbol = await governanceTokenInstance.symbol();
          console.log(govtTokenName);
          console.log(govtTokenSymbol);
          setUserDaos((daos) => [
            ...daos,
            {
              daoInfo: tempDaoInfo,
              creatorInfo: tempAdminInfo,
              tokenName: govtTokenName,
              tokenSymbol: govtTokenSymbol,
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading DAO information:", error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Error loading DAO information",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  console.log(userDaos);

  return (
    <Box maxW="800px" mx="auto" p={4}>
      <Stack align="center">
        <Avatar
          size="xl"
          name={userInfo[1]}
          src={`https://gateway.lighthouse.storage/ipfs/${userInfo[4]}`}
        />

        <Heading my={2}>{userInfo[1]}</Heading>
        <Text color="gray.500">{userInfo[2]}</Text>
        <Badge colorScheme="green">Online</Badge>
      </Stack>

      <Box mt={4}>
        <Heading size="md">About Me</Heading>
        <Text>{userInfo[3]}</Text>
      </Box>

      <Box mt={4}>
        {userDaos?.length !== 0 && <Heading size="md">My DAO's</Heading>}
        <SimpleGrid columns={1} spacing={4} mt={2}>
          {userDaos?.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="200px"
              w="500px"
              bg="teal.800"
              borderWidth="1px"
              borderRadius="lg"
              p={8}
              textAlign="center"
              boxShadow="md"
            >
              <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
                You do not any membership DAO's yet
              </Text>
              <Link href="/explore">
                <Button colorScheme="green">Join a DAO</Button>
              </Link>
            </Flex>
          ) : (
            userDaos.map((dao) => (
              <Box
                key={dao.daoInfo[0].toString()}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                position="relative"
              >
                <Heading size="sm">{dao.daoInfo.daoName}</Heading>
                <Text mt={2}>{dao.daoInfo.daoDescription}</Text>
                <Link
                  color="teal.500"
                  href={`https://ethsf-seven.vercel.app/dao/${dao.daoInfo[0].toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  position="absolute"
                  top="4"
                  right="4"
                  fontSize="xl"
                  _hover={{ textDecoration: "underline" }}
                >
                  <Icon as={FaExternalLinkAlt} ml={2} />
                </Link>
              </Box>
            ))
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Profile;

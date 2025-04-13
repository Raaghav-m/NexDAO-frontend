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
  Spinner,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { on } from "events";
import { useRouter } from "next/router";

const Profile = () => {
  const account = useAccount();
  const [userDaos, setUserDaos] = useState([]);
  const [userInfo, setuserInfo] = useState([]);
  const [chainId, setChainId] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();
  const [networkName, setNetworkName] = useState("");

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
        // Update network name for display
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
      }
    };

    updateChainId().then(() => {
      // Clear previous user DAOs when chain changes
      setUserDaos([]);
      onLoad();
    });
  }, [account, account?.chainId]);

  const onLoad = async () => {
    if (account.isConnected) {
      setLoading(true);
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
            usersideabi,
            signer
          );
          break;
        case 80002:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_AMOY_ADDRESS,
            usersideabi,
            signer
          );
          toast({
            title: "Polygon Amoy Network",
            description: "Viewing profile on Polygon Amoy testnet",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          break;
        default:
          toast({
            title: "Unsupported Network",
            description:
              "Please switch to a supported network (Sepolia, Amoy, Flow, Cardona, or SKALE)",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setLoading(false);
          return;
      }

      console.log(`chainId is: ${chainId}`);

      try {
        // Check if user is registered
        let tempUserId;
        try {
          tempUserId = await userSideInstance.userWallettoUserId(
            account.address
          );
          console.log("User ID:", tempUserId.toString());
        } catch (error) {
          console.error("Error getting user ID:", error);
          toast({
            title: "User Not Registered",
            description:
              "You are not registered on this network. Please register first.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }

        // Get user info
        const tempUserInfo = await userSideInstance.userIdtoUser(tempUserId);
        setuserInfo(tempUserInfo);

        // Get user DAOs
        const tempUserDaos = await userSideInstance.getAllUserDaos(tempUserId);
        console.log("User DAOs:", tempUserDaos);

        // Clear previous DAOs when loading new ones
        setUserDaos([]);

        // Process each DAO
        let tempDaoInfo,
          tempAdminId,
          tempAdminInfo,
          tempDaoCreatorInfo,
          tempDaoTokenInfo,
          govtTokenName,
          govtTokenSymbol;

        for (let i = 0; i < tempUserDaos.length; i++) {
          try {
            tempDaoInfo = await userSideInstance.daoIdtoDao(tempUserDaos[i]);
            console.log("DAO Info:", tempDaoInfo);

            tempAdminId = tempDaoInfo.creator;
            tempAdminInfo = await userSideInstance.userIdtoUser(tempAdminId);
            console.log("Admin Info:", tempAdminInfo);

            // Get token info if the governance token address exists
            if (
              tempDaoInfo.governanceTokenAddress &&
              tempDaoInfo.governanceTokenAddress !==
                "0x0000000000000000000000000000000000000000"
            ) {
              const governanceTokenInstance = new ethers.Contract(
                tempDaoInfo.governanceTokenAddress,
                governancetokenabi,
                signer
              );

              try {
                govtTokenName = await governanceTokenInstance.name();
                govtTokenSymbol = await governanceTokenInstance.symbol();
              } catch (error) {
                console.error("Error fetching token details:", error);
                govtTokenName = "Unknown";
                govtTokenSymbol = "???";
              }
            } else {
              govtTokenName = "No Token";
              govtTokenSymbol = "N/A";
            }

            setUserDaos((daos) => [
              ...daos,
              {
                daoInfo: tempDaoInfo,
                creatorInfo: tempAdminInfo,
                tokenName: govtTokenName,
                tokenSymbol: govtTokenSymbol,
              },
            ]);
          } catch (error) {
            console.error(`Error processing DAO ${tempUserDaos[i]}:`, error);
          }
        }
      } catch (error) {
        console.error("Error loading DAO information:", error);
        toast({
          title: "Error",
          description: "Error loading DAO information: " + error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to view your profile",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={4}>
      {loading ? (
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
          <Text ml={4}>Loading profile data...</Text>
        </Flex>
      ) : account.isConnected ? (
        <>
          <Stack align="center">
            <Avatar
              size="xl"
              name={userInfo[1]}
              src={
                userInfo[4]
                  ? `https://gateway.lighthouse.storage/ipfs/${userInfo[4]}`
                  : undefined
              }
            />

            <Heading my={2}>{userInfo[1] || "Unknown User"}</Heading>
            <Text color="gray.500">{userInfo[2] || "No email provided"}</Text>
            <Badge colorScheme="green">Online</Badge>
            <Badge
              colorScheme={
                chainId === 80002
                  ? "purple"
                  : chainId === 11155111
                  ? "blue"
                  : "gray"
              }
            >
              {networkName}
            </Badge>
          </Stack>

          <Box mt={4}>
            <Heading size="md">About Me</Heading>
            <Text>{userInfo[3] || "No bio provided"}</Text>
          </Box>

          <Box mt={4}>
            <Heading size="md">My DAOs</Heading>
            <SimpleGrid columns={1} spacing={4} mt={2}>
              {userDaos?.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  h="200px"
                  w="100%"
                  bg="teal.800"
                  borderWidth="1px"
                  borderRadius="lg"
                  p={8}
                  textAlign="center"
                  boxShadow="md"
                >
                  <Text fontSize="lg" mb={4} fontWeight="bold" color="white">
                    You do not have any membership DAOs yet on {networkName}
                  </Text>
                  <Link href="/explore">
                    <Button colorScheme="green">Join a DAO</Button>
                  </Link>
                </Flex>
              ) : (
                userDaos.map((dao, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    position="relative"
                    cursor="pointer"
                    onClick={() =>
                      router.push(`/dao/${dao.daoInfo[0].toString()}`)
                    }
                    _hover={{ shadow: "md", borderColor: "teal.300" }}
                  >
                    <Heading size="sm">{dao.daoInfo.daoName}</Heading>
                    <Text mt={2}>{dao.daoInfo.daoDescription}</Text>
                    <Flex mt={2}>
                      <Badge colorScheme="blue" mr={2}>
                        {dao.tokenName} ({dao.tokenSymbol})
                      </Badge>
                      <Badge colorScheme="purple">
                        {dao.daoInfo.visbility ? "Public" : "Private"}
                      </Badge>
                    </Flex>
                    <Link
                      color="teal.500"
                      href={`/dao/${dao.daoInfo[0].toString()}`}
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
        </>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="50vh"
          textAlign="center"
        >
          <Heading size="lg" mb={4}>
            Connect Your Wallet
          </Heading>
          <Text mb={6}>Please connect your wallet to view your profile</Text>
        </Flex>
      )}
    </Box>
  );
};

export default Profile;

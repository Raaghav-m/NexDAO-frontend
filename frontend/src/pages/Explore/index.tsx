// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import usersideabi from "../../utils/abis/usersideabi.json";
import userside2abi from "../../utils/abis/userside2abi.json";
import governancetokenabi from "../../utils/abis/governancetokenabi.json";
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
  Badge,
  Code,
  Center,
  Grid,
  Container,
  AbsoluteCenter,
  useToast,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import DaoCard from "@/components/IndDAOCard/DAOCard";
import { Spinner } from "@chakra-ui/react";

const Explore = () => {
  const [daos, setDaos] = useState([]);
  const [totaluserDAO, setTotaluserDAO] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const account = useAccount();
  const [chainId, setChainId] = useState(0);
  const [networkName, setNetworkName] = useState("");
  const toast = useToast();

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
      // Clear previous DAOs when chain changes
      setDaos([]);
      onLoad();
    });
  }, [account, account?.chainId]);

  const getTotalDaoUsers = async (
    daoId: number,
    userSideInstance: ethers.Contract
  ) => {
    try {
      const totalUsers = await userSideInstance.getAllDaoMembers(daoId);
      return totalUsers.length;
    } catch (error) {
      console.error(`Error getting total users for DAO ${daoId}:`, error);
      return 0;
    }
  };

  const onLoad = async () => {
    if (account.isConnected) {
      setIsLoading(true);
      console.log("account connected");

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
          toast({
            title: "Ethereum Sepolia Network",
            description: "Viewing DAOs on Ethereum Sepolia testnet",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          break;
        case 80002:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_AMOY_ADDRESS,
            usersideabi,
            signer
          );
          toast({
            title: "Polygon Amoy Network",
            description: "Viewing DAOs on Polygon Amoy testnet",
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
          setIsLoading(false);
          return;
      }

      console.log(`chainId is: ${chainId}`);
      try {
        const tempTotalDaos = Number(await userSideInstance.totalDaos());
        const newDaos = [];
        console.log("Total DAOs: " + Number(tempTotalDaos));

        for (let i = 1; i <= tempTotalDaos; i++) {
          try {
            const tempDaoInfo = await userSideInstance.daoIdtoDao(i);
            const tempCreatorId = Number(tempDaoInfo.creator);
            const tempCreatorInfo = await userSideInstance.userIdtoUser(
              tempCreatorId
            );
            const tempTokenAddress = tempDaoInfo.governanceTokenAddress;

            // Get total users for this DAO
            const totalUsers = await getTotalDaoUsers(i, userSideInstance);

            // Skip if token address is invalid
            if (
              !tempTokenAddress ||
              tempTokenAddress === "0x0000000000000000000000000000000000000000"
            ) {
              console.warn(`Skipping DAO ${i} due to invalid token address`);
              continue;
            }

            try {
              const governanceTokenInstance = new ethers.Contract(
                tempTokenAddress,
                governancetokenabi,
                signer
              );

              const [tempTokenName, tempTokenSymbol] = await Promise.all([
                governanceTokenInstance.name(),
                governanceTokenInstance.symbol(),
              ]);

              newDaos.push({
                daoInfo: tempDaoInfo,
                creatorInfo: tempCreatorInfo,
                tokenName: tempTokenName,
                tokenSymbol: tempTokenSymbol,
                totalUsers: totalUsers,
              });

              console.log({
                creatorId: tempCreatorId,
                creatorInfo: tempCreatorInfo,
                tokenAddress: tempTokenAddress,
                tokenName: tempTokenName,
                tokenSymbol: tempTokenSymbol,
              });
            } catch (tokenError) {
              console.error(
                `Error fetching token details for DAO ${i}:`,
                tokenError
              );
              // Add DAO with placeholder token info
              newDaos.push({
                daoInfo: tempDaoInfo,
                creatorInfo: tempCreatorInfo,
                tokenName: "Unknown Token",
                tokenSymbol: "???",
                totalUsers: totalUsers,
              });
            }
          } catch (daoError) {
            console.error(`Error fetching DAO ${i}:`, daoError);
          }
        }

        setDaos(newDaos);
        if (newDaos.length > 0) {
          console.log(newDaos[0]);
          try {
            const totalUsersDAO = await userSideInstance.getAllDaoMembers(
              newDaos[0].daoInfo.daoId
            );
            setTotaluserDAO(totalUsersDAO.length);
            console.log("Total users in DAO: " + totalUsersDAO.length);
          } catch (error) {
            console.error("Error getting DAO members:", error);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error in onLoad:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while loading DAOs. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to load DAOs",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* Network indicator */}
      <Flex justify="center" mt={4}>
        <Badge
          colorScheme={
            chainId === 80002
              ? "purple"
              : chainId === 11155111
              ? "blue"
              : "gray"
          }
          fontSize="lg"
          p={2}
          borderRadius="md"
        >
          {networkName}
        </Badge>
      </Flex>

      {isLoading ? (
        <>
          <AbsoluteCenter>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color={chainId === 80002 ? "purple.500" : "blue.500"}
              size="xl"
            />
          </AbsoluteCenter>
          <AbsoluteCenter style={{ marginTop: "60px", whiteSpace: "nowrap" }}>
            <h2>Loading Public DAOs on {networkName}</h2>
          </AbsoluteCenter>
        </>
      ) : (
        <Container
          maxW={"7xl"}
          p="12"
          templaterows="repeat(2, 1fr)"
          templatecolumns="repeat(4, 1fr)"
          gap={4}
        >
          {daos && daos.length > 0 ? (
            daos
              .filter((dao) => dao.daoInfo.isPrivate === false)
              .map((dao, index) => (
                <GridItem key={Number(dao.daoInfo.daoId)} rowSpan={1}>
                  <DaoCard
                    daoName={dao.daoInfo.daoName}
                    joiningThreshold={dao.daoInfo.joiningThreshold}
                    creatorName={dao.creatorInfo.userName}
                    tokenName={dao.tokenName}
                    tokenSymbol={dao.tokenSymbol}
                    totalDaoMember={dao.totalUsers}
                    daoId={dao.daoInfo.daoId}
                  />
                </GridItem>
              ))
          ) : (
            <Box textAlign="center" p={10}>
              <Heading size="md" mb={4}>
                No DAOs found on {networkName}
              </Heading>
              <Text mb={6}>
                There are no public DAOs on this network yet. You can be the
                first to create one!
              </Text>
              <Button
                colorScheme={chainId === 80002 ? "purple" : "blue"}
                onClick={() => (window.location.href = "/Create-dao")}
              >
                Create a DAO
              </Button>
            </Box>
          )}
        </Container>
      )}
    </Box>
  );
};

export default Explore;

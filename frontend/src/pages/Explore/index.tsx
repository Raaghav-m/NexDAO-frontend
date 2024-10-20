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
} from "@chakra-ui/react";
import DaoCard from "@/components/IndDAOCard/DAOCard";
import { Spinner } from "@chakra-ui/react";

const Explore = () => {
  const [daos, setDaos] = useState([]);
  const [totaluserDAO, setTotaluserDAO] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const account = useAccount();
  const [chainId, setChainId] = useState(0);
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
    if (account.isConnected) {
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
            userside2abi,
            signer
          );
          break;
      }
      console.log(`chainId is: ${chainId}`);
      try {
        const tempTotalDaos = Number(await userSideInstance.totalDaos());
        const newDaos = [];
        console.log("Total DAOs: " + Number(tempTotalDaos));

        for (let i = 1; i <= tempTotalDaos; i++) {
          const tempDaoInfo = await userSideInstance.daoIdtoDao(i);
          const tempCreatorId = Number(tempDaoInfo.creator);
          const tempCreatorInfo = await userSideInstance.userIdtoUser(
            tempCreatorId
          );
          const tempTokenAddress = tempDaoInfo.governanceTokenAddress;

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
          });

          console.log({
            creatorId: tempCreatorId,
            creatorInfo: tempCreatorInfo,
            tokenAddress: tempTokenAddress,
            tokenName: tempTokenName,
            tokenSymbol: tempTokenSymbol,
          });
        }

        setDaos(newDaos);

        const totalUsersDAO = await userSideInstance.getAllDaoMembers(
          newDaos[0].daoInfo.daoId
        );
        setTotaluserDAO(totalUsersDAO.length);
        setIsLoading(false);
        console.log("Total users in DAO: " + totalUsersDAO.length);
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
      {isLoading ? (
        <>
          <AbsoluteCenter>
            {/* <Box display="flex" flexDirection="column"> */}
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="orange.500"
              size="xl"
            />

            {/* </Box> */}
          </AbsoluteCenter>
          <AbsoluteCenter style={{ marginTop: "60px", whiteSpace: "nowrap" }}>
            <h2>Loading Public DAOs</h2>
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
          {daos &&
            daos
              .filter((dao) => dao.daoInfo.isPrivate === false)
              .map((dao) => (
                <GridItem key={dao.daoInfo.daoId} rowSpan={1}>
                  <DaoCard
                    daoName={dao.daoInfo.daoName}
                    joiningThreshold={dao.daoInfo.joiningThreshold}
                    creatorName={dao.creatorInfo.userName}
                    tokenName={dao.tokenName}
                    tokenSymbol={dao.tokenSymbol}
                    totalDaoMember={totaluserDAO}
                    daoId={dao.daoInfo.daoId}
                  />
                </GridItem>
              ))}
        </Container>
      )}
    </Box>
  );
};

export default Explore;

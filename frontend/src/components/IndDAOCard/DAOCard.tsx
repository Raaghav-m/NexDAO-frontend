// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Divider,
  HStack,
  Tag,
  Image,
  Wrap,
  WrapItem,
  SpaceProps,
  useColorModeValue,
  Container,
  VStack,
  Button,
  useToast,
  Center,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { AddIcon } from "@chakra-ui/icons";
import { RiTokenSwapFill } from "react-icons/ri";
import { MdOutlineGroups3 } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import usersideabi from "../../utils/abis/usersideabi.json";
import { useAccount } from "wagmi";

import { ethers } from "ethers";
import { useRouter } from "next/router";

interface IBlogTags {
  tags: Array<string>;
  marginTop?: SpaceProps["marginTop"];
}

interface Props {
  marginTop?: number;
  tags: any[];
}

const BlogTags = (props: Props) => {
  const { marginTop = 0, tags } = props;

  return (
    <HStack spacing={2} marginTop={marginTop}>
      {tags.map((tag) => {
        return (
          <Tag size={"md"} variant="solid" colorScheme="orange" key={tag}>
            {tag}
          </Tag>
        );
      })}
    </HStack>
  );
};

interface BlogAuthorProps {
  date: Date;
  name: string;
}

const BlogAuthor = (props: BlogAuthorProps) => {
  return (
    <HStack marginTop="2" spacing="2" display="flex" alignItems="center">
      <Image
        borderRadius="full"
        boxSize="40px"
        src="https://100k-faces.glitch.me/random-image"
        alt={`Avatar of ${props.name}`}
        width={{ base: "40px", sm: "40px", md: "40px" }}
        height={{ base: "40px", sm: "40px", md: "40px" }}
      />
      <Text fontWeight="medium">{props.name}</Text>
      <Text>—</Text>
      <Text>{props.date.toLocaleDateString()}</Text>
    </HStack>
  );
};

const DaoCard = ({
  daoName,
  tokenName,
  joiningThreshold,
  tokenSymbol,
  creatorName,
  totalDaoMember,
  daoId,
}) => {
  const toast = useToast();
  const router = useRouter();
  const account = useAccount();
  const [chainId, setChainId] = useState(0);

  const joinDao = async () => {
    if (account.isConnected) {
      console.log("Account connected");
      console.log(`Chain ID: ${chainId}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideContract;

      // Select the appropriate contract address based on the chain ID
      switch (account.chainId) {
        case 545:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
            usersideabi,
            signer
          );
          break;
        case 2442:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
            usersideabi,
            signer
          );
          break;
        case 974399131:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
            usersideabi,
            signer
          );
          break;
        case 11155111:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
            usersideabi,
            signer
          );
          break;
        case 80002:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_AMOY_ADDRESS,
            usersideabi,
            signer
          );
          toast({
            title: "Polygon Amoy Network",
            description: "Joining DAO on Polygon Amoy testnet",
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
          return;
      }

      console.log(userSideContract);
      try {
        const accounts = await provider.listAccounts();
        console.log(userSideContract);
        const tx = await userSideContract.joinDao(daoId, accounts[0]);

        console.log("Transaction sent:", tx.hash);
        await tx.wait(1);

        toast({
          title: "Congratulations!",
          description: "You have successfully joined the DAO",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error joining DAO:", error);
        toast({
          title: "Error",
          description:
            error.message ||
            "An error occurred while joining the DAO. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to join the DAO",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Center>
      <Box
        marginTop={{ base: "1", sm: "8" }}
        display="flex"
        flexDirection={{ base: "column", sm: "row" }}
        justifyContent="center"
        mb={8}
        marginLeft={{ base: "0", sm: "5%" }}
        width={{ base: "100%", sm: "65%" }}
        rounded={{ base: "none", sm: "xl" }}
        boxShadow={{ base: "lg", sm: "xxl" }}
        borderWidth="1px"
        overflow="hidden"
        // on hover raise the card

        _hover={{
          boxShadow: "xl",
          transform: "translateY(-4px)",
        }}
      >
        <Box>
          {/* <Box
            width={{ base: "100%", sm: "85%" }}
            zIndex="2"
            marginLeft={{ base: "0", sm: "5%" }}
            marginTop="5%"
          > */}
          {/* <Box textDecoration="none" _hover={{ textDecoration: "none" }}>
            <Image
              borderRadius="lg"
              src="/assets/dao.png"
              alt="Cover Image"
              //   objectFit="contain"
              _placeholder={blur}
              width={{ base: "100%", sm: "100%" }}
              rounded={{ base: "none", sm: "xl" }}
              height={{ base: "100%", sm: "100%" }}
              zIndex="2"
              alignItems={"center"}
              display={"flex"}
              alignContent={"center"}
              justifyContent={"center"}
            />
          </Box> */}
          {/* <Box zIndex="1" width="100%" position="absolute" height="100%">
            <Box
              bgGradient={useColorModeValue(
                "radial(orange.600 1px, transparent 1px)",
                "radial(orange.300 1px, transparent 1px)"
              )}
              backgroundSize="20px 20px"
              opacity="0.4"
              height="100%"
            />
          </Box> */}
        </Box>
        <Box
          display="flex"
          flex="1"
          flexDirection="column"
          justifyContent="center"
          marginTop={{ base: "3", sm: "0" }}
        >
          <Heading marginTop="1">
            <Center>
              <Text textDecoration="none" _hover={{ textDecoration: "none" }}>
                {daoName}
              </Text>
            </Center>
          </Heading>
          <Center>
            {" "}
            <Text
              as="p"
              marginTop="6"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              Minimum Tokens Required: {joiningThreshold.toString() / 1e18}{" "}
              {tokenSymbol}
            </Text>
          </Center>
          <Flex
            justifyContent={"space-between"}
            marginLeft={10}
            marginRight={10}
            marginTop={6}
            alignItems={"center"}
          >
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              {tokenName}
            </Text>
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              <RiTokenSwapFill size={35} color="teal" />
            </Text>
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              {tokenSymbol}
            </Text>
          </Flex>
          <Flex
            justifyContent={"space-between"}
            marginLeft={10}
            marginRight={10}
            marginTop={6}
          >
            {" "}
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Tooltip label="Total Members">
                <Text
                  as="p"
                  marginTop="2"
                  color={useColorModeValue("gray.700", "gray.200")}
                  fontSize="lg"
                >
                  <MdOutlineGroups3 size={30} />
                </Text>
              </Tooltip>
              <Text
                as="p"
                marginTop="2"
                color={useColorModeValue("gray.700", "gray.200")}
                fontSize="lg"
              >
                {totalDaoMember}
              </Text>
            </Flex>
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Tooltip label="Admin">
                <Text
                  as="p"
                  marginTop="2"
                  color={useColorModeValue("gray.700", "gray.200")}
                  fontSize="lg"
                >
                  <RiAdminLine size={25} />
                </Text>
              </Tooltip>
              <Text
                as="p"
                marginTop="2"
                color={useColorModeValue("gray.700", "gray.200")}
                fontSize="lg"
              >
                {creatorName}
              </Text>
            </Flex>
          </Flex>
          <Button margin={6} mb={2} onClick={joinDao}>
            <AddIcon mx="2px" /> Join DAO
          </Button>
          <Button
            marginRight={6}
            marginLeft={6}
            marginBottom={2}
            mt={2}
            onClick={() => router.push(`/dao/${daoId}`)}
          >
            View More <ExternalLinkIcon mx="2px" />
          </Button>
        </Box>
      </Box>
    </Center>
  );
};

export default DaoCard;

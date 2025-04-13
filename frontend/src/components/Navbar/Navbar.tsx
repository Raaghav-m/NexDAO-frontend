// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck comment
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Icon,
  Heading,
  Select,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { ethers } from "ethers";
import { Link } from "@chakra-ui/react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import {
  HamburgerIcon,
  CloseIcon,
  AddIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";

// Network constants
const NETWORKS = {
  SEPOLIA: {
    id: 11155111,
    name: "Ethereum Sepolia",
    icon: "🔵",
  },
  AMOY: {
    id: 80002,
    name: "Polygon Amoy",
    icon: "🟣",
  },
};

const NetworkSwitcher = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [selectedNetwork, setSelectedNetwork] = useState("");

  useEffect(() => {
    if (chainId === NETWORKS.SEPOLIA.id) {
      setSelectedNetwork("SEPOLIA");
    } else if (chainId === NETWORKS.AMOY.id) {
      setSelectedNetwork("AMOY");
    } else {
      setSelectedNetwork("");
    }
  }, [chainId]);

  const handleNetworkChange = (e) => {
    const networkKey = e.target.value;
    if (networkKey && NETWORKS[networkKey]) {
      switchChain({ chainId: NETWORKS[networkKey].id });
    }
  };

  if (!chainId) return null;

  return (
    <Box mr={4}>
      <Select
        value={selectedNetwork}
        onChange={handleNetworkChange}
        variant="filled"
        size="sm"
        borderRadius="md"
        bg={selectedNetwork === "SEPOLIA" ? "blue.100" : "purple.100"}
        _hover={{
          bg: selectedNetwork === "SEPOLIA" ? "blue.200" : "purple.200",
        }}
        placeholder="Select Network"
        width="160px"
      >
        <option value="SEPOLIA">
          {NETWORKS.SEPOLIA.icon} {NETWORKS.SEPOLIA.name}
        </option>
        <option value="AMOY">
          {NETWORKS.AMOY.icon} {NETWORKS.AMOY.name}
        </option>
      </Select>
    </Box>
  );
};

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const account = useAccount();
  const toast = useToast();
  const [chainId, setChainId] = useState(0);

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
        // check if the chain is Skale
        if (account.chainId === 974399131) {
          console.log("reached the fn call");
          await handlesFuelDistribution();
        }
      }
    };

    updateChainId();
  }, [account]);

  const handlesFuelDistribution = async () => {
    //check if the account is connceted
    console.log("function is called");
    if (account.isConnected) {
      // check if the chain is Skale

      if (account.chainId === 974399131) {
        // make a get request to the api to get the fuel distribution
        const response = await fetch(
          `http://localhost:8888/balance/${account.address}`
        );
        const data = await response.json();
        console.log(data.balance);
        // check if the user has enough fuel (should be more than 100000)
        if (data.balance < 100000) {
          console.log("not enough fuel");
          // make a post request to the api to distribute the fuel
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
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <Box bg={useColorModeValue("white", "gray.800")} px={10}>
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          mx="auto"
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack
            spacing={8}
            alignItems={"center"}
            fontSize="26px"
            fontWeight="0"
            ml="2"
            color="brand.00"
          >
            <Link href="/" mt={4}>
              NexDAO
            </Link>
          </HStack>
          <Flex alignItems={"center"}>
            <div style={{ display: "flex" }}>
              {account.isConnected && (
                <>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/Register">
                      <Button w="full" variant="ghost">
                        Register
                      </Button>
                    </Link>
                  </HStack>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/Create-dao">
                      <Button w="full" variant="ghost">
                        Create DAO
                      </Button>
                    </Link>
                  </HStack>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/Explore">
                      <Button w="full" variant="ghost">
                        Explore
                      </Button>
                    </Link>
                  </HStack>

                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/Profile">
                      <Button w="full" variant="ghost">
                        Profile
                      </Button>
                    </Link>
                  </HStack>
                </>
              )}

              <HStack>
                <ConnectButton
                  accountStatus={{
                    smallScreen: "avatar",
                    largeScreen: "full",
                  }}
                />
              </HStack>
            </div>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            {account.isConnected && (
              <>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/Register">
                    <Button w="full" variant="ghost">
                      Register
                    </Button>
                  </Link>
                </Stack>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/Create-dao">
                    <Button w="full" variant="ghost">
                      Create DAO
                    </Button>
                  </Link>
                </Stack>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/Explore">
                    <Button w="full" variant="ghost">
                      Explore
                    </Button>
                  </Link>
                </Stack>

                <Stack as={"nav"} spacing={4}>
                  <Link href="/Profile">
                    <Button w="full" variant="ghost">
                      Profile
                    </Button>
                  </Link>
                </Stack>
              </>
            )}
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default Navbar;

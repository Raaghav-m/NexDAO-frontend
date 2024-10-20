//@ts-nocheck comment
import React from "react";
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Container,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaRocket, FaCog, FaVoteYea, FaUserFriends } from "react-icons/fa";
import Link from "next/link";

const Feature = ({ title, text, icon }) => {
  return (
    <VStack>
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight="bold">{title}</Text>
      <Text textAlign="center">{text}</Text>
    </VStack>
  );
};

const index = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={20}>
        <VStack spacing={10} align="center">
          <Heading as="h1" size="2xl" textAlign="center">
            Revolutionize Your DAO Creation
          </Heading>
          <Text fontSize="xl" textAlign="center" color={textColor}>
            Create and manage DAOs in minutes, not days. No coding required.
          </Text>
          <Link href="/Register">
            <Button colorScheme="blue" size="lg">
              Get Started
            </Button>
          </Link>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} pt={10}>
            <Feature
              icon={FaRocket}
              title="Instant Setup"
              text="Fill out a form and your DAO is ready in minutes."
            />
            <Feature
              icon={FaCog}
              title="Flexible Configuration"
              text="Easily manage and change DAO settings as needed."
            />
            <Feature
              icon={FaVoteYea}
              title="Advanced Voting"
              text="Choose between normal and quadratic voting systems."
            />
            <Feature
              icon={FaUserFriends}
              title="Token Management"
              text="Create new governance tokens or import existing ones."
            />
          </SimpleGrid>

          <Box pt={10}>
            <Heading as="h2" size="xl" textAlign="center" mb={5}>
              Built with Cutting-Edge Technology
            </Heading>
            <Text fontSize="lg" textAlign="center" color={textColor}>
              Powered by Solidity, Next.js, and Chakra UI
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default index;

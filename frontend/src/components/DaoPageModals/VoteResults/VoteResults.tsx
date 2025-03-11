// @ts-nocheck comment
import {
  Modal,
  Text,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  TableContainer,
  Table,
  Tr,
  Td,
  ModalBody,
  ModalCloseButton,
  VStack,
  Divider,
  Alert,
  AlertIcon,
  Box,
} from "@chakra-ui/react";

export default function VoteResults({
  isEndOpen,
  onEndClose,
  yesVotes,
  noVotes,
  abstainVotes,
  finalVerdict,
  proposalType,
}) {
  return (
    <Modal isOpen={isEndOpen} onClose={onEndClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          Voting Results ({proposalType === 2 ? "Quadratic" : "Standard"})
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {proposalType === 2 ? (
              // Quadratic Voting Results - Simple Win/Lose Display
              <Box>
                <Alert
                  status={finalVerdict.includes("Passed") ? "success" : "error"}
                  variant="solid"
                  borderRadius="lg"
                  p={6}
                >
                  <AlertIcon boxSize="8" />
                  <Text fontSize="xl" fontWeight="bold" ml={3}>
                    {finalVerdict}
                  </Text>
                </Alert>
              </Box>
            ) : (
              // Standard Voting Results - Keep Original Display
              <>
                <Alert
                  status={finalVerdict.includes("Passed") ? "success" : "error"}
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  borderRadius="md"
                  p={4}
                >
                  <AlertIcon boxSize="6" />
                  <Text fontSize="lg" fontWeight="bold" mt={2}>
                    {finalVerdict}
                  </Text>
                </Alert>
                <Divider />
                <TableContainer>
                  <Table variant="simple">
                    <Tr>
                      <Td>Yes Votes</Td>
                      <Td isNumeric>{yesVotes.length}</Td>
                    </Tr>
                    <Tr>
                      <Td>No Votes</Td>
                      <Td isNumeric>{noVotes.length}</Td>
                    </Tr>
                    <Tr>
                      <Td>Abstain</Td>
                      <Td isNumeric>{abstainVotes.length}</Td>
                    </Tr>
                  </Table>
                </TableContainer>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalCloseButton />
      </ModalContent>
    </Modal>
  );
}

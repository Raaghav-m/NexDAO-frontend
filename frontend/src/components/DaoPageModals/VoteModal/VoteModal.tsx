// @ts-nocheck comment
import {
  Modal,
  Text,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Select,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  VStack,
} from "@chakra-ui/react";

export default function VoteModal({
  isVoteOpen,
  onVoteClose,
  proposalForVote,
  authorizeContract,
  setUserResponse,
  userResponse,
  submitSt,
  proposalType,
  tokenAmount,
  setTokenAmount,
}) {
  return (
    <Modal isOpen={isVoteOpen} onClose={onVoteClose}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>Cast Your Vote</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Your Vote</FormLabel>
              <Select
                onChange={(e) => {
                  setUserResponse(e.target.value);
                }}
                placeholder="Select option"
              >
                <option value={1}>Yes</option>
                <option value={2}>No</option>
                <option value={3}>Abstain</option>
              </Select>
            </FormControl>

            {proposalType === 2 && ( // Show token input only for quadratic voting
              <FormControl>
                <FormLabel>Number of Tokens</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="Enter number of tokens"
                  />
                </NumberInput>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <Text ml={7} mt={2}>
          Please Authorize first and wait for the transaction to end. Then press
          Submit
        </Text>
        <ModalFooter>
          <Button
            onClick={() => {
              console.log(userResponse);
              console.log(proposalForVote);
              console.log(
                proposalType === 2 ? "Quadratic Voting" : "Standard Voting"
              );
              if (proposalType === 2 && !tokenAmount) {
                alert("Please enter the number of tokens for quadratic voting");
                return;
              }
              authorizeContract();
            }}
            colorScheme="orange"
            m={2}
            isLoading={submitSt}
            loadingText={"Submitting..."}
          >
            Authorize & Vote
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

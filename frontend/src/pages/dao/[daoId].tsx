//@ts-nocheck comment
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import lighthouse from "@lighthouse-web3/sdk";
import usersideabi from "@/utils/abis/usersideabi.json";
import DaoDetails from "@/components/DaoPageModals/DaoDetails/DaoDetails";
import FileShare from "@/components/DaoPageModals/FileShare/FileShare";
import ProposalTab from "@/components/DaoPageModals/ProposalTab/ProposalTab";
import ProposalModal from "@/components/DaoPageModals/ProposalModal/ProposalModal";
import VoteModal from "@/components/DaoPageModals/VoteModal/VoteModal";
import InviteModal from "@/components/DaoPageModals/InviteModal/InviteModal";
import VoteResults from "@/components/DaoPageModals/VoteResults/VoteResults";
import {
  useDisclosure,
  useToast,
  Center,
  Flex,
  chakra,
  Grid,
  GridItem,
  VStack,
  Divider,
  Box,
  Heading,
  Text,
} from "@chakra-ui/react";
import { CheckCircleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import UserSideAbi from "@/utils/abis/usersideabi.json";
import GovernanceTokenAbi from "@/utils/abis/governancetokenabi.json";

const DaoPage = () => {
  const router = useRouter();
  const account = useAccount();
  const [isMember, setIsMember] = useState(false);
  const [size, setSize] = useState("md");
  const [propSignal, setPropSignal] = useState(false);
  const [daoInfo, setDaoInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daoProposals, setDaoProposals] = useState([]);
  const [daoMembers, setDaoMembers] = useState([]);
  const [tokenAddress, setTokenAddress] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);
  const [voteOnce, setvoteOnce] = useState(true);
  const [adminInfo, setAdminInfo] = useState();
  const [votingthreshold, setVotingThreshold] = useState();
  const [proposalArray, setProposalArray] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState();
  const [passingThreshold, setPassingThreshold] = useState();
  const { address } = useAccount();
  const [proposalType, setProposalType] = useState();
  const [proposalForVote, setProposalForVote] = useState(0);
  const [userResponse, setUserResponse] = useState(-1);
  const [yesVotes, setYesVotes] = useState([]);
  const [noVotes, setNoVotes] = useState([]);
  const [abstainVotes, setAbstainVotes] = useState([]);
  const [inviteAddress, setInviteAddress] = useState("");
  const [endTime, setEndTime] = useState();
  const [finalVerdict, setFinalVerdict] = useState("");
  const [docName, setDocName] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [submitSt, setSubmitSt] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();
  const [chainId, setChainId] = useState(0);
  const [currentProposalType, setCurrentProposalType] = useState(1); // 1 for standard, 2 for quadratic
  const [tokenAmount, setTokenAmount] = useState("");

  const changeHandler = () => {
    setProfileImage(inputRef.current?.files[0]);
  };

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

  const inviteMembertoDao = async () => {
    if (account.isConnected) {
      console.log("Account connected");
      console.log(`Chain ID: ${chainId}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideContract;

      // Select the appropriate contract address based on the chain ID
      switch (chainId) {
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
      }

      try {
        const accounts = await provider.listAccounts();
        setSubmitSt(true);
        const tx = await userSideContract.addMembertoDao(
          daoInfo.daoId,
          inviteAddress,
          accounts[0],
          { gasLimit: 500000 } // Adjust this value as needed
        );

        console.log("Transaction sent:", tx.hash);
        await tx.wait(1);
        setSubmitSt(false);

        toast({
          title: "Member Added",
          description: `${inviteAddress} is now part of the DAO.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onStartClose();
      } catch (error) {
        console.error("Error inviting member to DAO:", error);
        setSubmitSt(false);
        toast({
          title: "Error",
          description:
            "An error occurred while inviting the member. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to invite members to the DAO",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_USERSIDE_ADDRESS,
        usersideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await contract.uploadDocument(
        docName,
        docDesc,
        daoInfo.daoId,
        ipfsUrl
      );
      setSubmitSt(true);
      await tx.wait();
      setSubmitSt(false);

      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onUploadClose();
    }
  };

  const convertString = (dateString: any) => {
    const date = new Date(dateString);
    const millisecondsSinceEpoch = date.getTime() / 1000;
    return millisecondsSinceEpoch;
  };

  const convertToEpoch = (dateString: any) => {
    const epochValue = new Date(dateString + "T00:00:00Z").getTime() / 1000;
    return epochValue;
  };

  // add proposal
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  // to vote
  const {
    isOpen: isVoteOpen,
    onOpen: onVoteOpen,
    onClose: onVoteClose,
  } = useDisclosure();

  //add new member to dao
  const {
    isOpen: isStartOpen,
    onOpen: onStartOpen,
    onClose: onStartClose,
  } = useDisclosure();

  //view results
  const {
    isOpen: isEndOpen,
    onOpen: onEndOpen,
    onClose: onEndClose,
  } = useDisclosure();

  //open upload file form
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();

  const handleSizeClick1 = (newSize) => {
    setSize(newSize);
    onAddOpen();
  };

  const handleSizeClick2 = (newSize) => {
    setSize(newSize);
    onVoteOpen();
  };

  const handleSizeClick3 = (newSize) => {
    setSize(newSize);
    onStartOpen();
  };

  const handleSizeClick4 = (newSize) => {
    setSize(newSize);
    onEndOpen();
  };

  const handleSizeClick5 = (newSize) => {
    setSize(newSize);
    onUploadOpen();
  };

  const onLoad = async () => {
    const daoId = router.query.daoId;
    if (!daoId) {
      console.log("DAO doesn't exist");
      return;
    }

    if (account.isConnected) {
      console.log("Account connected");
      console.log(`Chain ID: ${account.chainId}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideInstance;

      // Select the appropriate contract address based on the chain ID
      switch (account.chainId) {
        case 545:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 2442:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 974399131:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 11155111:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        default:
      }

      try {
        console.log("UserSide Instance:", userSideInstance);

        const tempDaoInfo = await userSideInstance.daoIdtoDao(daoId);
        setDaoInfo(tempDaoInfo);
        const tempDaoMembers = await userSideInstance.getAllDaoMembers(daoId);
        console.log(tempDaoMembers);
        setTotalMembers(tempDaoMembers.length);
        const tempDaoProposals = await userSideInstance.getAllDaoProposals(
          daoId
        );
        console.log(tempDaoProposals);
        const membershipSignal = await userSideInstance.checkMembership(
          daoId,
          account.address
        );
        setIsMember(membershipSignal);
        console.log("Membership signal: " + membershipSignal);
        setLoading(false);
        console.log("Dao Status: " + tempDaoInfo.isPrivate);
        const tempAdminId = await tempDaoInfo.creator;
        const tempAdminInfo = await userSideInstance.userIdtoUser(tempAdminId);
        console.log(tempAdminInfo);
        setAdminInfo(tempAdminInfo);
        loadAllProposals(daoId);
      } catch (error) {
        console.error("Error loading DAO information:", error);
        setLoading(false);
        toast({
          title: "Error",
          description:
            "An error occurred while loading DAO information. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to load DAO information",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const authorizeContract = async () => {
    if (account.isConnected) {
      console.log("Account connected");
      console.log(`Chain ID: ${chainId}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideInstance;

      // Select the appropriate contract address based on the chain ID
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
      }

      try {
        console.log("UserSide Instance:", userSideInstance);
        const accounts = await provider.listAccounts();
        const propInfo = await userSideInstance.proposalIdtoProposal(
          proposalForVote
        );
        const govTokenAdd = propInfo.votingTokenAddress;
        const minThreshold = propInfo.votingThreshold;

        const govTokenContract = new ethers.Contract(
          govTokenAdd,
          GovernanceTokenAbi,
          signer
        );
        const tokenSymbol = await govTokenContract.symbol();
        console.log("Token Symbol:", tokenSymbol);

        setSubmitSt(true);
        const tx1 = await govTokenContract.approve(
          userSideInstance.address,
          minThreshold,
          { gasLimit: 300000 }
        );
        console.log("Approval Transaction sent:", tx1.hash);
        await tx1.wait(1);
        setSubmitSt(false);

        toast({
          title: "Approval Successful",
          description: `Your vote will be counted soon.`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });

        setSubmitSt(true);
        let tx2;

        if (currentProposalType === 2) {
          // Quadratic voting
          tx2 = await userSideInstance.qvVoting(
            proposalForVote,
            tokenAmount,
            account.address,
            userResponse,
            { gasLimit: 500000 }
          );
        } else {
          // Standard voting
          tx2 = await userSideInstance.voteForProposal(
            proposalForVote,
            userResponse,
            account.address,
            { gasLimit: 500000 }
          );
        }

        console.log("Voting Transaction sent:", tx2.hash);
        await tx2.wait(1);
        setSubmitSt(false);

        toast({
          title: "Vote Counted",
          description: `Your vote has been successfully counted.`,
          status: "success",
          duration: 10000,
          isClosable: true,
          position: "top-right",
        });

        onVoteClose();
      } catch (error) {
        console.error("Error in authorizing contract or voting:", error);
        setSubmitSt(false);
        toast({
          title: "Error",
          description:
            "An error occurred during the voting process. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }
    } else {
      toast({
        title: "Connect Wallet",
        description:
          "Please connect your wallet to authorize the contract and vote",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
      }
    };

    if (router) {
      updateChainId().then(() => {
        onLoad();
      });
    }
  }, [account, router]);

  console.log(proposalArray);

  const loadAllProposals = async (daoId) => {
    if (account.isConnected && daoId) {
      console.log("Loading proposals for DAO:", daoId);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideContract;

      // Select the appropriate contract address based on the chain ID
      switch (chainId) {
        case 545:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 2442:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 974399131:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 11155111:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
      }

      try {
        const tempProposalArray = await userSideContract.getAllDaoProposals(
          daoId
        );
        console.log("Proposal IDs:", tempProposalArray);

        const proposalPromises = tempProposalArray.map(async (proposalId) => {
          const tempProposalInfo = await userSideContract.proposalIdtoProposal(
            proposalId
          );
          console.log("Proposal Info:", tempProposalInfo);

          const governanceTokenContract = new ethers.Contract(
            tempProposalInfo.votingTokenAddress,
            GovernanceTokenAbi,
            signer
          );

          const [tokenSymbol, tokenName] = await Promise.all([
            governanceTokenContract.symbol(),
            governanceTokenContract.name(),
          ]);

          console.log("Token Symbol:", tokenSymbol);
          console.log("Token Name:", tokenName);

          return {
            proposalInfo: tempProposalInfo,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
          };
        });

        const proposalDetails = await Promise.all(proposalPromises);
        setProposalArray(proposalDetails);
        setPropSignal(true);
      } catch (error) {
        console.error("Error loading proposals:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while loading proposals. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      console.log("Wallet not connected or DAO ID not provided");
    }
  };

  const addProposal = async () => {
    if (account.isConnected) {
      console.log("Account connected");
      console.log(`Chain ID: ${chainId}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideContract;

      // Select the appropriate contract address based on the chain ID
      switch (chainId) {
        case 545:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 2442:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 974399131:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 11155111:
          userSideContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
      }

      try {
        console.log("Proposal Details:", {
          proposalType,
          title,
          description,
          votingthreshold,
          daoId: daoInfo.daoId.toString(),
          tokenAddress,
          address,
          startDate,
          endTime,
          passingThreshold,
          voteOnce,
        });

        setSubmitSt(true);
        const tx = await userSideContract.createProposal(
          proposalType,
          `${title}|${description}`,
          votingthreshold,
          daoInfo.daoId,
          tokenAddress,
          address,
          startDate,
          endTime,
          passingThreshold,
          voteOnce
        );

        console.log("Transaction sent:", tx.hash);
        await tx.wait(1);
        setSubmitSt(false);

        toast({
          title: "Proposal Created",
          description: "Your proposal has been successfully created",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        onAddClose();
      } catch (error) {
        console.error("Error creating proposal:", error);
        setSubmitSt(false);
        toast({
          title: "Error",
          description:
            "An error occurred while creating the proposal. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to create a proposal",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  let now1 = new Date();
  let timestamp1 = now1.getTime();
  let currentTimestamp = timestamp1 / 1000;

  const filteringDaos = (beginningTime, endingTime) => {
    var now = new Date();
    var timestamp = now.getTime();
    var secondsSinceEpoch = timestamp / 1000;
    if (secondsSinceEpoch < Number(beginningTime)) {
      //to be happening in future
      return -1;
    }
    if (secondsSinceEpoch > Number(endingTime)) {
      //to have happened in past
      return 1;
    }
    return 0;
  };

  const getVotingResults = async (_proposalId) => {
    if (account.isConnected) {
      console.log("Account connected");
      console.log(`Chain ID: ${chainId}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let userSideInstance;
      switch (chainId) {
        case 545:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 2442:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 974399131:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
        case 11155111:
          userSideInstance = new ethers.Contract(
            process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
            UserSideAbi,
            signer
          );
          break;
      }

      try {
        const propInfo = await userSideInstance.proposalIdtoProposal(
          _proposalId
        );
        const proposalType = Number(propInfo.proposalType);
        setCurrentProposalType(proposalType);

        // Check if proposal has ended
        const currentTime = Math.floor(Date.now() / 1000);
        const hasEnded = currentTime > Number(propInfo.endingTime);

        if (hasEnded) {
          try {
            setSubmitSt(true);
            // Attempt to finalize the proposal
            const tx = await userSideInstance.finalizeProposal(_proposalId, {
              gasLimit: 500000,
            });
            await tx.wait();
            setSubmitSt(false);

            toast({
              title: "Proposal Finalized",
              description: "The proposal has been successfully finalized.",
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
          } catch (error) {
            // If error contains "already finalized", continue silently
            // Otherwise show the error
            if (!error.message.includes("already finalized")) {
              console.error("Error finalizing proposal:", error);
              toast({
                title: "Error",
                description:
                  "Failed to finalize the proposal. It may already be finalized.",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-right",
              });
            }
          }
        }

        // Get votes arrays
        const [yesArray, noArray, abstainArray] = await Promise.all([
          userSideInstance.getAllYesVotes(_proposalId),
          userSideInstance.getAllNoVotes(_proposalId),
          userSideInstance.getAllAbstainVotes(_proposalId),
        ]);

        setYesVotes(yesArray);
        setNoVotes(noArray);
        setAbstainVotes(abstainArray);

        if (proposalType === 2) {
          // For quadratic voting, use contract's result
          const result = await userSideInstance.proposalResults(_proposalId);
          setFinalVerdict(
            result ? "Proposal has Passed!" : "Proposal has been reverted"
          );
        } else {
          // For standard voting, calculate based on votes and threshold
          const totalVotes = yesArray.length + noArray.length;
          if (totalVotes === 0) {
            setFinalVerdict("No votes cast");
            return;
          }

          const yesPercentage = (yesArray.length / totalVotes) * 100;
          const passingThreshold = Number(propInfo.passingThreshold);

          setFinalVerdict(
            yesPercentage >= passingThreshold
              ? "Proposal has Passed!"
              : "Proposal has been reverted"
          );
        }
      } catch (error) {
        console.error("Error getting voting results:", error);
        setSubmitSt(false);
        toast({
          title: "Error",
          description:
            "An error occurred while fetching voting results. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to view voting results",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Center>Loading...</Center>;
  }

  if (!isMember) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <NotAllowedIcon boxSize={"50px"} color={"red.500"} />
        <Heading as="h2" size="xl" mt={6} mb={2}>
          This DAO is Private
        </Heading>
        <Text color={"gray.500"}>You are not a member is DAO.</Text>
      </Box>
    );
  }

  console.log(voteOnce);

  return (
    <div>
      <Center>
        <Flex flexDir={"row"} justifyContent={"center"} alignItems={"center"}>
          {" "}
          <DaoDetails
            daoInfo={daoInfo}
            totalMembers={totalMembers}
            adminInfo={adminInfo}
            isMember={isMember}
            address={address}
            handleSizeClick1={handleSizeClick1}
            handleSizeClick3={handleSizeClick3}
            submitSt={submitSt}
          />
          {isMember && (
            <>
              <FileShare
                handleSizeClick5={handleSizeClick5}
                isUploadOpen={isUploadOpen}
                onUploadClose={onUploadClose}
                docName={docName}
                setDocName={setDocName}
                docDesc={docDesc}
                setDocDesc={setDocDesc}
                profileImage={profileImage}
                inputRef={inputRef}
                changeHandler={changeHandler}
                uploadIPFS={uploadFile}
                handleSubmit={handleSubmit}
                daoInfo={daoInfo}
                submitSt={submitSt}
              />
            </>
          )}
        </Flex>
      </Center>
      <Divider mt={12} mb={12} />
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
        }}
        gap={4}
      >
        <GridItem colSpan={3}>
          <VStack alignItems="flex-start" spacing="20px">
            <Center>
              <chakra.h2 fontSize="3xl" fontWeight="700" ml={2}>
                All proposals
              </chakra.h2>
            </Center>
          </VStack>
        </GridItem>
      </Grid>
      <ProposalTab
        propSignal={propSignal}
        proposalArray={proposalArray}
        isMember={isMember}
        currentTimestamp={currentTimestamp}
        setProposalForVote={setProposalForVote}
        handleSizeClick2={handleSizeClick2}
        handleSizeClick4={handleSizeClick4}
        getVotingResults={getVotingResults}
        loadAllProposals={loadAllProposals}
        filteringDaos={filteringDaos}
        submitSt={submitSt}
        setCurrentProposalType={setCurrentProposalType}
      />

      <ProposalModal
        setTitle={setTitle}
        setDescription={setDescription}
        setVotingThreshold={setVotingThreshold}
        setPassingThreshold={setPassingThreshold}
        setProposalType={setProposalType}
        setTokenAddress={setTokenAddress}
        setStartDate={setStartDate}
        setEndTime={setEndTime}
        setvoteOnce={setvoteOnce}
        addProposal={addProposal}
        isAddOpen={isAddOpen}
        onAddClose={onAddClose}
        submitSt={submitSt}
      />
      <VoteModal
        isVoteOpen={isVoteOpen}
        onVoteClose={onVoteClose}
        proposalForVote={proposalForVote}
        authorizeContract={authorizeContract}
        setUserResponse={setUserResponse}
        userResponse={userResponse}
        submitSt={submitSt}
        proposalType={currentProposalType}
        tokenAmount={tokenAmount}
        setTokenAmount={setTokenAmount}
      />
      <InviteModal
        isStartOpen={isStartOpen}
        onStartClose={onStartClose}
        setInviteAddress={setInviteAddress}
        inviteAddress={inviteAddress}
        inviteMember={inviteMembertoDao}
        submitSt={submitSt}
      />
      <VoteResults
        isEndOpen={isEndOpen}
        onEndClose={onEndClose}
        yesVotes={yesVotes}
        noVotes={noVotes}
        abstainVotes={abstainVotes}
        finalVerdict={finalVerdict}
        submitSt={submitSt}
        proposalType={currentProposalType}
      />
    </div>
  );
};

export default DaoPage;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck comment
import React from "react";
import { ethers } from "ethers";
import usersideabi from "../../utils/abis/usersideabi.json";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";

const index = () => {
  const account = useAccount();
  const [chainId, setChainId] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const updateChainId = async () => {
      if (account) {
        setChainId(account.chainId);
      }
    };

    updateChainId();
  }, [account]);

  const handleSubmit = async (e) => {
    if (account.isConnected) {
      console.log("account connected");
      console.log(`chainId is: ${chainId}`);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract;
      // flow === 545
      //polygonZkEvmCardona === 2442
      // skaleCalypsoTestnet === 974399131
      //sepolia === 11155111
      if (chainId === 545) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_FLOW_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 2442) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_CARDONA_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 974399131) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
          usersideabi,
          signer
        );
      } else if (chainId === 11155111) {
        contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_SEPOLIA_ADDRESS,
          usersideabi,
          signer
        );
      }
      const accounts = await provider.listAccounts();
      const userRes = await contract.userIdtoUser(BigInt(1));
      console.log(userRes);
    } else {
      console.log("no account connected");
      toast({
        title: "No Account Connected",
        description: "Please connect your wallet.",
        status: "error",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    }
    // if (window.ethereum._state.accounts.length !== 0) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const signer = provider.getSigner();
    //   const contract = new ethers.Contract(
    //     process.env.NEXT_PUBLIC_USERSIDE_SKALE_ADDRESS,
    //     usersideabi,
    //     signer
    //   );
    //   const accounts = await provider.listAccounts();
    //   const userRes = await contract.userIdtoUser(BigInt(1));
    //   console.log(userRes);
    // }
  };
  return (
    <div>
      <button
        onClick={() => {
          handleSubmit();
        }}
      >
        Test Btn
      </button>
    </div>
  );
};

export default index;

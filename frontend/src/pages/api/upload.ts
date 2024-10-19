import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    console.log("f this");
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } else {
    console.log(req.body);
  }
  console.log("Request received");
  return res.status(200).json({ message: "success" });
  // try {
  //   const storageResponse = await fetch(
  //     "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=1",
  //     {
  //       method: "PUT",
  //       body: buffer,
  //     }
  //   );
  //   console.log(storageResponse, "storageResponse");
  //   // Handle the storage response
  //   if (!storageResponse.ok) {
  //     console.error(
  //       "Failed to upload file to storage:",
  //       storageResponse.statusText
  //     );
  //     return res
  //       .status(storageResponse.status)
  //       .json({ error: "Failed to upload file to storage" });
  //   }

  //   const result = await storageResponse.json();
  //   console.log(result);

  //   // Return the blob ID in the response
  //   return res.status(200).json({ blobId: result.blobId });
  // } catch (error) {
  //   console.error("Error during storage upload:", error);
  //   return res.status(500).json({ error: "Error during storage upload" });
  // }
  // req.on("error", (err) => {
  //   console.error("Error during file upload:", err);
  //   return res.status(500).json({ error: "Error during file upload" });
  // });
};

export default handler;

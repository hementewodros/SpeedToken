import { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";

const tokenAddress = "0x6e2b6b2636419cfadd5c098e3814c826c60d3506";
const tokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)",
];

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false); // <- Loading state

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected");

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new Contract(tokenAddress, tokenABI, signer);

    setToken(contract);
    setAccount(accounts[0]);
  };

  const getBalance = async () => {
    if (!token || !account) return;

    const bal = await token.balanceOf(account);
    const decimals = await token.decimals();

    setBalance(formatUnits(bal, decimals));
  };

  const sendTokens = async () => {
    if (!token || !receiver || !amount) return;

    try {
      setLoading(true); // Start loading
      const decimals = await token.decimals();
      const tx = await token.transfer(receiver, parseUnits(amount, decimals));
      await tx.wait();

      alert("Transfer complete!");
      getBalance();
      setAmount("");
      setReceiver("");
    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    if (account && token) {
      getBalance();
    }
  }, [account, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center px-4 py-10 font-sans">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700">🚀 SpeedToken (SPD)</h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="bg-indigo-600 text-white font-semibold px-4 py-3 rounded-2xl w-full transition hover:bg-indigo-700"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 break-all">
              <span className="font-semibold">Connected:</span> {account}
            </div>
            <div className="text-lg font-bold text-green-700">
              Balance: {balance} SPD
            </div>

            <input
              type="text"
              className="w-full border-2 border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Recipient Address"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              disabled={loading}
            />

            <input
              type="number"
              className="w-full border-2 border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Amount to Send"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />

            <button
              onClick={sendTokens}
              disabled={loading}
              className={`${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              } text-white font-semibold px-4 py-3 rounded-2xl w-full transition`}
            >
              {loading ? "Sending..." : "Send SPD"}
            </button>

            <button
              onClick={getBalance}
              className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-2xl w-full transition hover:bg-yellow-600"
            >
              Refresh Balance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

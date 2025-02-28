"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';
import { motion } from 'framer-motion'; // For animations

export const Appbar = () => {
    const { publicKey, signMessage } = useWallet();
    const [balance, setBalance] = useState(0);
    const [walletSelected, setWalletSelected] = useState(false); // State for wallet selection

    async function signAndSend() {
        if (!publicKey) {
            return;
        }
        const message = new TextEncoder().encode("Sign into mechanical turks as a worker");
        const signature = await signMessage?.(message);
        console.log(signature)
        console.log(publicKey) // sending the signinUrl to backend to verify
        const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
            signature,
            publicKey: publicKey?.toString()
        });

        setBalance(response.data.amount)

        localStorage.setItem("token", response.data.token);
    }

    useEffect(() => {
        signAndSend()
    }, [publicKey]);

    return (
        <div className="flex justify-between border-b pb-2 pt-2 bg-black">
            {/* Logo and App Name */}
            <motion.div
                className="flex items-center pl-4"
                whileHover={{ scale: 1.05 }}
            >
                {/* Placeholder for Logo */}
                <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-2">
                    D
                </div>
                <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                    DeFi-Tasker
                </span>
            </motion.div>

            {/* Buttons */}
            <div className="text-xl pr-4 flex items-center">
                <button
                    onClick={() => {
                        axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
                            headers: {
                                "Authorization": localStorage.getItem("token")
                            }
                        })
                    }}
                    className="m-2 mr-4 text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5"
                >
                    Pay me out ({balance}) SOL
                </button>

                {/* Wallet Selection Logic */}
                <div className="hidden md:flex text-lg">
                    {walletSelected || publicKey ? (
                        <WalletDisconnectButton className="bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-full text-sm px-5 py-2.5" />
                    ) : (
                        <div
                            className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-black hover:border-purple-400 hover:border transition"
                            onClick={() => setWalletSelected(true)}
                        >
                            Select Wallet
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
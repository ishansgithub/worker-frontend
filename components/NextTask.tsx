"use client";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Task {
    id: number;
    amount: number;
    title: string;
    options: {
        id: number;
        image_url: string;
        task_id: number;
    }[];
}

// Continuous wave animation for text
const waveAnimation = {
    initial: { y: 0 },
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 1.5,
            repeat: Infinity, // Continuous animation
            ease: "easeInOut",
        },
    },
};

// CSR
export const NextTask = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${BACKEND_URL}/v1/worker/nextTask`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((res) => {
                setCurrentTask(res.data.task);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setCurrentTask(null);
            });
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex justify-center flex-col bg-black text-white">
                <motion.div
                    className="w-full flex justify-center text-2xl"
                    variants={waveAnimation}
                    initial="initial"
                    animate="animate"
                >
                    Loading...
                </motion.div>
            </div>
        );
    }

    if (!currentTask) {
        return (
            <div className="h-screen flex justify-center flex-col bg-black text-white">
                <motion.div
                    className="w-full flex justify-center text-2xl text-center"
                    variants={waveAnimation}
                    initial="initial"
                    animate="animate"
                >
                    Please check back in some time,  
                    <br />Currently No Pending Tasks...
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-black text-white min-h-screen">
            <motion.div
                className="text-2xl pt-20 flex justify-center"
                variants={waveAnimation}
                initial="initial"
                animate="animate"
            >
                {currentTask.title}
                <div className="pl-4">{submitting && "Submitting..."}</div>
            </motion.div>
            <div className="flex justify-center pt-8">
                {currentTask.options.map((option) => (
                    <Option
                        key={option.id}
                        onSelect={async () => {
                            setSubmitting(true);
                            try {
                                const response = await axios.post(
                                    `${BACKEND_URL}/v1/worker/submission`,
                                    {
                                        taskId: currentTask.id.toString(),
                                        selection: option.id.toString(),
                                    },
                                    {
                                        headers: {
                                            Authorization: localStorage.getItem("token"),
                                        },
                                    }
                                );

                                const nextTask = response.data.nextTask;
                                setCurrentTask(nextTask || null);
                            } catch (e) {
                                console.error(e);
                            }
                            setSubmitting(false);
                        }}
                        imageUrl={option.image_url}
                    />
                ))}
            </div>
        </div>
    );
};

function Option({ imageUrl, onSelect }: { imageUrl: string; onSelect: () => void }) {
    return (
        <div>
            <img onClick={onSelect} className="p-2 w-96 rounded-md cursor-pointer hover:opacity-75 transition-opacity duration-300" src={imageUrl} alt="Task Option" />
        </div>
    );
}

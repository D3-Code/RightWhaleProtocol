"use client";

import { motion } from "framer-motion";

const allocations = [
    { label: "BURN", value: 30, color: "bg-red-500" },
    { label: "AUTO-LP", value: 30, color: "bg-blue-500" },
    { label: "REVSHARE", value: 30, color: "bg-orange-500" },
    { label: "DEV OPS", value: 10, color: "bg-zinc-500" },
];

export const Allocations = () => {
    return (
        <div className="flex flex-col gap-5">
            {allocations.map((item, index) => (
                <div key={item.label} className="group cursor-pointer">
                    <div className="flex justify-between text-[10px] font-mono-tech mb-1 uppercase tracking-wider">
                        <span className="text-zinc-400 group-hover:text-white transition-colors">
                            [{index + 1}] {item.label}
                        </span>
                        <span className="text-primary font-bold">{item.value}.00%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="relative h-3 w-full bg-zinc-900 border border-zinc-700/50 overflow-hidden skew-x-[-10deg]">
                        {/* Grid Lines in background */}
                        <div className="absolute inset-0 z-0 opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]"></div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1.5, delay: index * 0.2, type: "spring" }}
                            className={`relative z-10 h-full ${item.color} shadow-[0_0_10px_rgba(255,107,0,0.3)]`}
                        />
                    </div>
                </div>
            ))}

            <div className="mt-4 pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono-tech text-center">
                TOTAL ALLOCATION: 100.00%
            </div>
        </div>
    );
};

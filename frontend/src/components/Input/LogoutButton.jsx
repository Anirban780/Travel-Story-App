import React from 'react'

const LogoutButton = ({ onClick, buttonText }) => {
    return (
        <>
            <button
                onClick={onClick}
                className="relative inline-flex items-center justify-center w-20 h-8 px-2 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-gray-800 rounded-lg group"
            >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-red-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                <span className="relative">{buttonText}</span>
            </button>

        </>
    );
};

export default LogoutButton
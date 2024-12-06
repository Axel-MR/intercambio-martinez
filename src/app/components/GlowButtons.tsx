import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCandyCane } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono

const GlowButton = () => {
  const [isActive, setIsActive] = useState(false);

  const glowVariants = {
    inactive: {
      opacity: 0,
      boxShadow: '0 0 0 rgba(66, 153, 225, 0)'
    },
    active: {
      opacity: 1,
      boxShadow: '0 0 20px rgba(66, 153, 225, 0.6)'
    }
  };

  const buttonVariants = {
    inactive: {
      scale: 1
    },
    active: {
      scale: 1.05
    }
  };

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <motion.div
      className="relative p-8"
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
    >
      <motion.div
        variants={glowVariants}
        className="absolute inset-0 rounded-lg"
        style={{ zIndex: 0 }}
      />
      <motion.button
        variants={buttonVariants}
        className="bg-blue-400 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-600 focus:outline-none relative z-10 flex items-center gap-2" // Asegúrate de usar flex y gap
        onClick={handleClick}
      >
        <Link href="/lista-de-deseos" className="flex justify-center items-center w-full h-full">
          Lista de Deseos
          <FontAwesomeIcon icon={faCandyCane} className="text-white ml-2" /> {/* Ícono a la derecha del texto */}
        </Link>
      </motion.button>
    </motion.div>
  );
};

export default GlowButton;

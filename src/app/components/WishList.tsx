"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';


interface WishListProps {
  titulo: string;
  sorteoId: string;
}

export default function WishList({ titulo, sorteoId }: WishListProps) {
  const [texto, setTexto] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const formatTextoConLinks = (texto: string) => {
    const lines = texto.split('\n');
    
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return '<br>';
      }

      const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      
      let processedLine = line.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
      });

      if (index < lines.length - 1) {
        processedLine += '<br>';
      }
      
      return processedLine;
    }).join('');
  };

  useEffect(() => {
    const fetchTexto = async () => {
      try {
        const docRef = doc(db, 'configuracion', sorteoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTexto(docSnap.data().texto || '');
        } else {
          console.log('No se encontró el documento, creándolo...');
          await setDoc(docRef, { texto: '' });
          setTexto('');
        }
      } catch (error) {
        console.error('Error al obtener el texto desde Firestore:', error);
      }
    };

    if (sorteoId) {
      fetchTexto();
    }
  }, [sorteoId]);

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  const guardarTexto = async () => {
    try {
      const docRef = doc(db, 'configuracion', sorteoId);
      await setDoc(docRef, { texto });
      setIsEditable(false);
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Error al guardar el texto en Firestore:', error);
    }
  };

  return (
    <div className="space-y-8 w-full mx-auto">
      {showNotification && (
        <div className="fixed top-4 right-4 bg-[#d06522] text-white p-2 rounded-md shadow-md z-50">
          ¡Actualizado!
        </div>
      )}

      <h2 className="font-markazi text-3xl text-black text-center relative">
        {/* Aplicamos el estilo text-glow */}
        <span className="absolute inset-0 text-black text-shadow">{titulo}</span>
        <span className="text-glow">{titulo}</span> {/* Título con estilo glow */}
      </h2>

      <div className="gradient-anim rounded-xl p-4 text-white w-full max-w-2xl mx-auto">
        {isEditable ? (
          <div className="relative">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const cursorPosition = e.currentTarget.selectionStart;
                  const textBeforeCursor = texto.substring(0, cursorPosition);
                  const textAfterCursor = texto.substring(cursorPosition);
                  setTexto(textBeforeCursor + '\n' + textAfterCursor);
                }
              }}
              className="w-full rounded-md border border-gray-300 p-2 bg-white text-black resize-none max-h-[400px] h-[400px] overflow-y-auto whitespace-pre-wrap font-mono animate-typewriter text-xl"
            />
          </div>
        ) : (
          <div
            className="w-full rounded-md p-2 bg-white text-black overflow-y-auto overflow-x-auto max-h-[400px] h-[400px] whitespace-pre-wrap font-mono text-xl"
            dangerouslySetInnerHTML={{ __html: formatTextoConLinks(texto) }}
          />
        )}
        <div className="flex justify-between mt-4">
          {isEditable ? (
            <button 
              onClick={guardarTexto}
              className="px-4 py-2 bg-white text-black rounded-md font-bold flex items-center hover:bg-gray-200 transition-colors"
            >
              Guardar
              <FontAwesomeIcon icon={faFloppyDisk} className="ml-2 text-[#5b2d22] text-xl" />
            </button>
          ) : (
            <button 
              onClick={toggleEditable}
              className="px-4 py-2 bg-white text-[#63c2e2] rounded-md font-bold flex items-center hover:bg-gray-200 transition-colors"
            >
              Editar
              <FontAwesomeIcon icon={faPenToSquare} className="ml-2 text-[#63c2e2] text-xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

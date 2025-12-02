"use client";

import React, { useState, useEffect } from 'react';
import { Save, Edit3, Mail, Sparkles } from 'lucide-react';
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
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const formatTextoConLinks = (texto: string) => {
    const lines = texto.split('\n');
    
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return '<br>';
      }

      const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      
      let processedLine = line.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:text-red-700 underline decoration-wavy">${url}</a>`;
      });

      if (index < lines.length - 1) {
        processedLine += '<br>';
      }
      
      return processedLine;
    }).join('');
  };

  // Efecto de máquina de escribir
  useEffect(() => {
    if (!isEditable && texto) {
      setIsTyping(true);
      setDisplayedText('');
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= texto.length) {
          setDisplayedText(texto.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 30); // Velocidad de escritura

      return () => clearInterval(typingInterval);
    }
  }, [texto, isEditable]);

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-green-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Notificación */}
        {showNotification && (
          <div className="fixed top-20 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-right">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">¡Carta guardada!</span>
          </div>
        )}

        {/* Título con decoración navideña */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Mail className="w-8 h-8 text-red-600 animate-pulse" />
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
              {titulo}
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-sm text-gray-600 font-medium italic">
            Escribe tu lista de deseos
          </p>
        </div>

        {/* Carta / Papel vintage */}
        <div className="relative">
          {/* Efectos de sombra del papel */}
          <div className="absolute inset-0 bg-amber-100 rounded-lg transform rotate-1 opacity-30"></div>
          <div className="absolute inset-0 bg-amber-50 rounded-lg transform -rotate-1 opacity-30"></div>
          
          {/* Papel principal */}
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-2xl border-4 border-red-200 overflow-hidden">
            {/* Decoración superior */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-red-500 via-green-500 to-red-500 opacity-20"></div>
            <div className="absolute top-2 right-4 w-16 h-16 border-4 border-red-600 rounded-sm opacity-20 transform rotate-12">
              <div className="w-full h-full flex items-center justify-center text-2xl">★</div>
            </div>
            
            {/* Líneas de papel vintage */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="border-b border-gray-400" style={{ marginTop: '2rem' }}></div>
              ))}
            </div>

            <div className="relative p-8 sm:p-10">
              {/* Fecha y dirección decorativa */}
              <div className="mb-6 text-right text-sm text-gray-600 italic font-serif">
                <div>Diciembre 2025</div>
              </div>

              {/* Saludo */}
              <div className="mb-4 text-lg text-gray-700 font-serif italic">
                Para mi amigo secreto,
              </div>

              {/* Contenido de la carta */}
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
                    placeholder="Escribe aquí tus deseos navideños..."
                    className="w-full rounded-lg border-2 border-red-200 p-4 bg-white/80 backdrop-blur-sm text-gray-800 resize-none min-h-[400px] overflow-y-auto whitespace-pre-wrap font-serif text-lg leading-relaxed focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="w-full rounded-lg p-4 bg-transparent text-gray-800 min-h-[400px] overflow-y-auto whitespace-pre-wrap font-serif text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatTextoConLinks(displayedText) }}
                  />
                  {/* Cursor parpadeante mientras escribe */}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-6 bg-gray-800 animate-pulse ml-1"></span>
                  )}
                </div>
              )}

              {/* Despedida */}
              <div className="mt-6 text-right text-gray-700 font-serif italic space-y-2">
                <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                  Muchas gracias ;)
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-center gap-4 mt-8 pt-6 border-t-2 border-red-200">
                {isEditable ? (
                  <button 
                    onClick={guardarTexto}
                    className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      Guardar Carta
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ) : (
                  <button 
                    onClick={toggleEditable}
                    className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Edit3 className="w-5 h-5" />
                      Editar Carta
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                )}
              </div>
            </div>

            {/* Decoración de estampillas/sellos en las esquinas */}
            <div className="absolute bottom-4 left-4 text-4xl opacity-20">★</div>
            <div className="absolute bottom-4 right-4 text-4xl opacity-20">♦</div>
          </div>
        </div>

        {/* Decoración flotante */}
        <div className="fixed top-32 left-10 text-6xl opacity-5 animate-pulse pointer-events-none hidden sm:block">
          ★
        </div>
        <div className="fixed bottom-32 right-20 text-5xl opacity-5 animate-pulse pointer-events-none hidden sm:block" style={{ animationDelay: '1s' }}>
          ♦
        </div>
      </div>
    </div>
  );
}
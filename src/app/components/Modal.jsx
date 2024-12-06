const Modal = ({ children, onClose }) => {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-0 flex justify-center items-center z-50">
         <div className="bg-blue-100 text-black rounded-lg p-6 max-w-sm w-full">
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-lg font-bold text-gray-00"
          >
            X
          </button>
          {children}
        </div>
      </div>
    );
  };
  
  export default Modal;
  
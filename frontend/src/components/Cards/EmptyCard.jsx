import React from 'react'

const EmptyCard = ({ imgSrc, message }) => {
  return (
    <div className='flex flex-col items-center justify-center mt-20 mx-auto'>
        <div className='bg-cyan-200/60 px-3 py-3 rounded-full h-50 w-50'>
            <img src={imgSrc} alt="No Notes" className='w-24 mx-2 my-2'/>
            </div>
        

        <p className='w-1/2 text-sm font-bold text-slate-700 text-center leading-7 mt-5'>
            {message}
        </p>
    </div>
  )
}

export default EmptyCard